#!/usr/bin/env node
// SPEC-TOOL-032/R5: assess supplied reporter challenges; never execute or alter source/reports.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {safePath, relativeSafe, hash} from './adoption.mjs';

const metrics = ['lines', 'statements', 'functions', 'branches'];
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const keys = (value, allowed) => object(value) && Object.keys(value).every(key => allowed.includes(key));
function json(root, relative) {
  if (!relativeSafe(relative)) throw new Error('Expected a safe repository-relative JSON path');
  const file = safePath(root, relative);
  if (!fs.statSync(file).isFile()) throw new Error(`Expected a regular JSON file: ${relative}`);
  const bytes = fs.readFileSync(file);
  try { return {value: JSON.parse(bytes), sha256: hash(bytes)}; }
  catch { throw new Error(`Invalid JSON: ${relative}`); }
}
function counts(value, label) {
  if (value === undefined) return null;
  if (!object(value) || !Number.isSafeInteger(value.total) || !Number.isSafeInteger(value.covered) ||
      value.total < 0 || value.covered < 0 || value.covered > value.total ||
      (value.pct !== undefined && (!Number.isFinite(value.pct) || value.pct < 0 || value.pct > 100))) {
    throw new Error(`Malformed coverage counts: ${label}`);
  }
  // Preserve the displayed percent separately; use counts for threshold arithmetic.
  return {covered: value.covered, total: value.total, reportedPercent: value.pct ?? null};
}

export function assessCoverageCapability(root, configPath) {
  root = path.resolve(root);
  safePath(root);
  const input = json(root, configPath), config = input.value;
  if (!keys(config, ['schema_version', 'summary', 'challenges', 'thresholds']) || config.schema_version !== 1 ||
      !Array.isArray(config.challenges) || !config.challenges.length ||
      !keys(config.thresholds, metrics) || !Object.keys(config.thresholds).length ||
      Object.values(config.thresholds).some(n => !Number.isFinite(n) || n < 0 || n > 100)) {
    throw new Error('Invalid coverage capability configuration');
  }
  const source = json(root, config.summary), summary = source.value;
  if (!object(summary) || !object(summary.total)) throw new Error('Coverage summary requires total and per-file records');
  const files = new Map();
  for (const [name, record] of Object.entries(summary)) {
    if (name === 'total') continue;
    const absolute = path.isAbsolute(name) ? path.resolve(name) : path.resolve(root, name);
    const relative = path.relative(root, absolute).split(path.sep).join('/');
    if (!relativeSafe(relative)) throw new Error('Coverage summary contains an out-of-root path');
    const key = process.platform === 'win32' ? relative.toLowerCase() : relative;
    if (files.has(key)) throw new Error('Duplicate coverage summary file identity');
    if (!object(record)) throw new Error('Malformed per-file coverage record');
    for (const metric of metrics) counts(record[metric], metric);
    files.set(key, record);
  }
  const seen = new Set();
  const challenges = config.challenges.map(challenge => {
    if (!keys(challenge, ['path', 'unexecuted', 'metrics']) || !relativeSafe(challenge.path) ||
        challenge.unexecuted !== true || !keys(challenge.metrics, metrics) ||
        metrics.some(metric => !['present', 'absent'].includes(challenge.metrics[metric]))) {
      throw new Error('Each challenge requires a safe path, unexecuted true and explicit present/absent expectations for all four metrics');
    }
    const file = safePath(root, challenge.path);
    if (!fs.statSync(file).isFile()) throw new Error('Expected a regular challenge source file');
    const key = process.platform === 'win32' ? challenge.path.toLowerCase() : challenge.path;
    if (seen.has(key)) throw new Error('Duplicate coverage challenge');
    seen.add(key);
    const record = files.get(key);
    return {path: challenge.path, sourceSha256: hash(fs.readFileSync(file)), declaredUnexecuted: true,
      metrics: Object.fromEntries(metrics.map(metric => {
        const raw = counts(record?.[metric], metric), expectation = challenge.metrics[metric];
        let status, reason;
        if (!raw) { status = 'unknown'; reason = record ? 'missing_metric' : 'missing_file'; }
        else if (expectation === 'absent') {
          status = raw.total === 0 ? 'not_applicable' : 'inconsistent';
          reason = raw.total === 0 ? 'reviewed_absence' : 'unexpected_population';
        } else if (raw.total === 0) { status = 'unknown'; reason = 'expected_population_missing'; }
        else if (raw.covered !== 0) { status = 'inconsistent'; reason = 'declared_unexecuted_but_covered'; }
        else { status = 'supported'; reason = 'unexecuted_population_reported'; }
        return [metric, {expectation, raw, status, reason}];
      }))};
  });
  const assessment = Object.fromEntries(metrics.map(metric => {
    const raw = counts(summary.total[metric], `total.${metric}`), threshold = config.thresholds[metric] ?? null;
    // R5-REV-01: challenge consistency alone cannot validate contradictory totals.
    const population = [...files.values()].map(file => counts(file[metric], metric));
    let aggregateConsistency = {status:'unknown', perFileCounts:null};
    if (raw && population.length && population.every(Boolean)) {
      const perFileCounts = population.reduce((sum, item) => ({covered:sum.covered+item.covered,total:sum.total+item.total}), {covered:0,total:0});
      if (!Number.isSafeInteger(perFileCounts.covered) || !Number.isSafeInteger(perFileCounts.total)) throw new Error('Unsafe coverage population sum');
      aggregateConsistency = {status:raw.covered===perFileCounts.covered && raw.total===perFileCounts.total ? 'consistent' : 'inconsistent',perFileCounts};
    }
    const observations = challenges.map(challenge => challenge.metrics[metric]);
    const capability = observations.some(x => ['unknown', 'inconsistent'].includes(x.status)) ||
      !observations.some(x => x.status === 'supported') ? 'unknown' : 'supported_for_challenges';
    const percent = raw && raw.total > 0 ? 100 * raw.covered / raw.total : null;
    const attainment = threshold === null ? 'not_requested' : capability === 'unknown' || percent === null || aggregateConsistency.status !== 'consistent' ? 'unknown' :
      percent >= threshold ? 'reported_met' : 'reported_below_target';
    return [metric, {raw, threshold, percent, capability, aggregateConsistency, attainment}];
  }));
  const requested = Object.values(assessment).filter(m => m.threshold !== null);
  const outcome = requested.some(m => m.attainment === 'unknown') ? 'incomplete' :
    requested.some(m => m.attainment === 'reported_below_target') ? 'failed' : 'passed';
  return {schema_version: 1, outcome, config: {path: configPath, sha256: input.sha256},
    summary: {path: config.summary, sha256: source.sha256}, challenges, metrics: assessment,
    limitation: 'Supplied expectations and non-execution are declarations for independent review. This checks report consistency, not actual execution, complete owned-source inventory, source-map fidelity, freshness, or correctness. Unrequested reporter metrics are not certified.'};
}

export function main(args) {
  const options = {};
  while (args.length) {
    const key = args.shift(), value = args.shift();
    if (!['--target', '--config'].includes(key) || Object.hasOwn(options, key) || !value || value.startsWith('--')) {
      throw new Error('Usage: coverage-capability.mjs --target PATH --config RELATIVE_JSON');
    }
    options[key] = value;
  }
  if (!options['--target'] || !options['--config']) throw new Error('Explicit --target and --config are required');
  const report = assessCoverageCapability(options['--target'], options['--config']);
  console.log(JSON.stringify(report, null, 2));
  return report.outcome === 'passed' ? 0 : 1;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { process.exitCode = main(process.argv.slice(2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
