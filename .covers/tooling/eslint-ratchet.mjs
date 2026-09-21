#!/usr/bin/env node
// SPEC-TOOL-027/R1-R4: optional project-native lint gate; never installs or autofixes.
import fs from 'node:fs';
import { glob } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { hash, relativeSafe, safePath } from './adoption.mjs';

const self = fileURLToPath(import.meta.url);
const object = x => x !== null && typeof x === 'object' && !Array.isArray(x);
const text = x => typeof x === 'string' && x.length > 0;
const digest = x => typeof x === 'string' && /^[a-f0-9]{64}$/.test(x);
const requireThat = (condition, message) => { if (!condition) throw new Error(message); };
const unique = values => new Set(values).size === values.length;
// Code-point ordering is independent of the host locale (snapshot format v1).
const canonical = value => JSON.stringify(value, (key, item) => object(item)
  ? Object.fromEntries(Object.keys(item).sort().map(k => [k, item[k]])) : item);
const validPath = name => relativeSafe(name) && !/[\x00-\x1f\x7f]/.test(name)
  && name.split('/').every(part => !/[. ]$/.test(part) && !/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(part));
function exact(value, fields, label) {
  requireThat(object(value) && canonical(Object.keys(value).sort()) === canonical([...fields].sort()), `Invalid ${label} schema fields`);
}
function bytes(root, name) {
  requireThat(validPath(name), `Unsafe relative path: ${name}`);
  const p = safePath(root, name);
  requireThat(fs.statSync(p).isFile(), `Not a regular file: ${name}`);
  return fs.readFileSync(p);
}
const file = (root, name) => bytes(root, name).toString('utf8');
function paths(values, label) {
  requireThat(Array.isArray(values) && values.length > 0 && values.every(validPath) && unique(values)
    && unique(values.map(p => p.toLowerCase())), `Invalid ${label}`);
}
function identityOf(d) { return { path: d.path, rule: d.rule, severity: d.severity, message: d.message, context: d.context }; }

export function validateSnapshot(s) {
  exact(s, ['schemaVersion', 'identity', 'files', 'effectiveRules', 'diagnostics'], 'snapshot');
  requireThat(object(s) && s.schemaVersion === 1, 'Invalid snapshot schema');
  paths(s.files, 'snapshot files');
  requireThat(unique(s.files.map(p => p.toLowerCase())), 'Case-aliased snapshot files');
  const i = s.identity;
  exact(i, ['settings', 'adapter', 'eslint', 'inputs'], 'identity');
  requireThat(digest(i.settings) && digest(i.adapter) && /^(9|10)\.\d+\.\d+(?:-[\w.-]+)?$/.test(i.eslint) && object(i.inputs), 'Invalid identity');
  paths(Object.keys(i.inputs), 'identity inputs');
  requireThat(Object.values(i.inputs).every(digest), 'Invalid input hashes');
  requireThat(object(s.effectiveRules) && canonical(Object.keys(s.effectiveRules).sort()) === canonical([...s.files].sort()) && Object.values(s.effectiveRules).every(digest), 'Invalid effective rules');
  requireThat(Array.isArray(s.diagnostics), 'Invalid diagnostics');
  const keys = new Set();
  let total = 0;
  for (const d of s.diagnostics) {
    exact(d, ['path', 'rule', 'severity', 'message', 'context', 'fingerprint', 'count'], 'diagnostic');
    requireThat(object(d) && s.files.includes(d.path) && text(d.rule) && text(d.message) && text(d.context) && [1, 2].includes(d.severity) && Number.isSafeInteger(d.count) && d.count > 0, 'Invalid diagnostic');
    requireThat(digest(d.fingerprint) && d.fingerprint === hash(canonical(identityOf(d))) && !keys.has(d.fingerprint), 'Invalid or duplicate fingerprint');
    keys.add(d.fingerprint);
    total += d.count;
    requireThat(Number.isSafeInteger(total), 'Impossible total diagnostic count');
  }
  return s;
}

export function compare(baseline, current) {
  validateSnapshot(baseline); validateSnapshot(current);
  requireThat(canonical(baseline.identity) === canonical(current.identity), 'Incompatible baseline identity; review configuration/tool/lockfile changes');
  for (const p of baseline.files) {
    requireThat(current.files.includes(p), `Measured file removed: ${p}; review scope before recapture`);
    requireThat(baseline.effectiveRules[p] === current.effectiveRules[p], `Effective rules changed: ${p}`);
  }
  const old = new Map(baseline.diagnostics.map(d => [d.fingerprint, d]));
  const now = new Map(current.diagnostics.map(d => [d.fingerprint, d]));
  const added = current.diagnostics.flatMap(d => d.count > (old.get(d.fingerprint)?.count ?? 0) ? [{ ...d, count: d.count - (old.get(d.fingerprint)?.count ?? 0) }] : []);
  const resolved = baseline.diagnostics.flatMap(d => d.count > (now.get(d.fingerprint)?.count ?? 0) ? [{ ...d, count: d.count - (now.get(d.fingerprint)?.count ?? 0) }] : []);
  return { added, resolved };
}

export async function analyze(root, settingsPath) {
  requireThat(Number(process.versions.node.split('.')[0]) >= 22, 'Requires Node >=22 and a runtime supported by the installed ESLint');
  root = path.resolve(root);
  safePath(root);
  const raw = bytes(root, settingsPath), settings = JSON.parse(raw.toString('utf8'));
  requireThat(object(settings) && settings.schemaVersion === 1, 'Invalid settings schema');
  requireThat(Object.keys(settings).every(k => ['schemaVersion', 'targets', 'config', 'identityFiles', 'lockfile'].includes(k)), 'Unknown setting');
  paths(settings.targets, 'targets'); paths(settings.identityFiles, 'identityFiles');
  requireThat(settings.targets.every(p => !p.startsWith('!')), 'Negative targets unsupported; use narrower reviewed positive targets');
  requireThat(validPath(settings.config) && validPath(settings.lockfile) && settings.identityFiles.includes(settings.config) && settings.identityFiles.includes(settings.lockfile), 'Declare config and lockfile in identityFiles');
  const inputs = Object.fromEntries(settings.identityFiles.map(p => [p, hash(bytes(root, p))]));
  // Dependency links are permitted; measured source/metadata links are not. Do
  // not accidentally select an ancestor/global ESLint when the project lacks it.
  const installed = path.join(root, 'node_modules/eslint');
  requireThat(fs.existsSync(path.join(installed, 'package.json')), 'Missing project-local ESLint installation');
  const requireProject = createRequire(path.join(root, 'package.json'));
  const resolved = requireProject.resolve('eslint');
  requireThat(validPath(path.relative(fs.realpathSync(installed), resolved).split(path.sep).join('/')), 'ESLint resolved outside project-local installation');
  const { ESLint } = requireProject('eslint');
  requireThat(typeof ESLint === 'function' && /^(9|10)\./.test(ESLint.version), 'Requires project-local ESLint 9 or 10');
  // noInlineConfig disables directives while retaining warnings about attempts.
  // allowInlineConfig:false would also silence those warnings in ESLint 9/10.
  const engine = new ESLint({ cwd: root, overrideConfigFile: safePath(root, settings.config), fix: false, cache: false, errorOnUnmatchedPattern: true,
    overrideConfig: { linterOptions: { noInlineConfig: true, reportUnusedDisableDirectives: 'error' } } });
  const measured = new Map(), rules = Object.create(null), sourceHashes = new Map(), physicalFiles = new Map();
  for (const pattern of settings.targets) {
    // Enumerate independently: ESLint glob ignores must not shrink measurement.
    // Validate a literal ancestor before glob traverses it, and every visited path.
    const parts = pattern.split('/'), magic = parts.findIndex(p => /[*?\[\]{}()]/.test(p));
    const prefix = parts.slice(0, magic < 0 ? parts.length : magic).join('/');
    if (prefix) safePath(root, prefix);
    const expected = [];
    for await (const entry of glob(pattern, { cwd: root, exclude: entry => {
      safePath(root, entry.split(path.sep).join('/')); return false;
    } })) {
      const p = entry.split(path.sep).join('/');
      const content = bytes(root, p), stat = fs.statSync(safePath(root, p), { bigint: true });
      const physical = `${stat.dev}:${stat.ino}`;
      requireThat(!physicalFiles.has(physical) || physicalFiles.get(physical) === p, `File alias: ${p}`);
      physicalFiles.set(physical, p);
      requireThat(!sourceHashes.has(p) || sourceHashes.get(p) === hash(content), `Source changed during scan: ${p}`);
      sourceHashes.set(p, hash(content)); expected.push(p);
      requireThat(!(await engine.isPathIgnored(safePath(root, p))), `Ignored/configless file is not measured: ${p}`);
    }
    requireThat(expected.length > 0, `Empty lint target: ${pattern}`);
    const results = await engine.lintFiles(expected.map(p => safePath(root, p)));
    requireThat(Array.isArray(results) && results.length > 0, `Empty lint target: ${pattern}`);
    const returned = new Set();
    for (const result of results) {
      requireThat(object(result) && text(result.filePath) && path.isAbsolute(result.filePath) && Array.isArray(result.messages), 'Malformed analyzer result');
      const p = path.relative(root, result.filePath).split(path.sep).join('/');
      requireThat(validPath(p) && expected.includes(p) && !returned.has(p), 'Analyzer scope mismatch or duplicate file');
      returned.add(p);
      const source = file(root, p).replaceAll('\r\n', '\n');
      for (const k of ['fatalErrorCount', 'errorCount', 'warningCount', 'fixableErrorCount', 'fixableWarningCount']) requireThat(Number.isSafeInteger(result[k]) && result[k] >= 0, `Malformed analyzer count: ${p}`);
      requireThat(Array.isArray(result.suppressedMessages) && !result.fatalErrorCount && !result.suppressedMessages.length, `Fatal/suppressed diagnostics: ${p}`);
      requireThat(result.errorCount === result.messages.filter(m => m?.severity === 2).length && result.warningCount === result.messages.filter(m => m?.severity === 1).length
        && result.fixableErrorCount <= result.errorCount && result.fixableWarningCount <= result.warningCount, `Inconsistent diagnostic counts: ${p}`);
      requireThat(result.source === undefined || (typeof result.source === 'string' && result.source.replaceAll('\r\n', '\n') === source), `Analyzer source differs: ${p}`);
      requireThat(!(await engine.isPathIgnored(result.filePath)), `Ignored file is not measured: ${p}`);
      const config = await engine.calculateConfigForFile(result.filePath);
      requireThat(object(config?.rules) && Object.values(config.rules).some(r => [1, 2, 'warn', 'error'].includes(Array.isArray(r) ? r[0] : r)), `No enabled rules: ${p}`);
      const ruleHash = hash(canonical(config.rules));
      const diagnostics = result.messages.map(m => {
        requireThat(object(m) && !m.fatal && text(m.ruleId) && text(m.message) && [1, 2].includes(m.severity), `Fatal/configuration message: ${p}`);
        const lines = source.split('\n'), end = m.endLine ?? m.line;
        requireThat(Number.isSafeInteger(m.line) && Number.isSafeInteger(end) && m.line >= 1 && end >= m.line && end <= lines.length, `Invalid source location: ${p}`);
        requireThat(Number.isSafeInteger(m.column) && m.column >= 1 && m.column <= lines[m.line - 1].length + 1
          && (m.endColumn === undefined || (Number.isSafeInteger(m.endColumn) && m.endColumn >= 1 && m.endColumn <= lines[end - 1].length + 1 && (end > m.line || m.endColumn >= m.column))), `Invalid source column: ${p}`);
        const d = { path: p, rule: m.ruleId, severity: m.severity, message: m.message, context: lines.slice(m.line - 1, end).join('\n') };
        requireThat(text(d.context), `Missing source context: ${p}`);
        return { ...d, fingerprint: hash(canonical(d)), count: 1 };
      });
      if (measured.has(p)) requireThat(canonical(measured.get(p)) === canonical(diagnostics) && rules[p] === ruleHash, `Inconsistent overlapping scan/rules: ${p}`);
      rules[p] = ruleHash;
      measured.set(p, diagnostics);
    }
    requireThat(returned.size === expected.length, `Analyzer omitted selected scope: ${pattern}`);
  }
  // Configuration changed during a scan cannot silently acquire the old identity.
  requireThat(bytes(root, settingsPath).equals(raw) && settings.identityFiles.every(p => hash(bytes(root, p)) === inputs[p]), 'Inputs changed during scan');
  requireThat([...sourceHashes].every(([p, value]) => hash(bytes(root, p)) === value), 'Source changed during scan');
  const grouped = new Map();
  for (const d of [...measured.values()].flat()) {
    if (grouped.has(d.fingerprint)) grouped.get(d.fingerprint).count++;
    else grouped.set(d.fingerprint, { ...d });
  }
  return validateSnapshot({ schemaVersion: 1, identity: { settings: hash(raw), inputs, eslint: ESLint.version, adapter: hash(fs.readFileSync(self)) }, files: [...measured.keys()].sort(), effectiveRules: rules, diagnostics: [...grouped.values()].sort((a, b) => a.fingerprint.localeCompare(b.fingerprint)) });
}

export function capture(root, output, snapshot) {
  validateSnapshot(snapshot);
  requireThat(validPath(output), 'Unsafe capture output path');
  const target = safePath(root, output);
  requireThat(path.extname(target) === '.json', 'Capture output must be a JSON file');
  // Existing parent required. wx also protects against a concurrent capture winner.
  fs.writeFileSync(target, JSON.stringify(snapshot, null, 2) + '\n', { flag: 'wx' });
}

export async function main(argv) {
  const [mode, ...args] = argv, opts = {};
  requireThat(['report', 'capture', 'check'].includes(mode), 'Usage: eslint-ratchet.mjs report|capture|check --root PATH --settings FILE [--baseline FILE | --output FILE]');
  while (args.length) {
    const key = args.shift(), value = args.shift();
    requireThat(['--root', '--settings', '--baseline', '--output'].includes(key) && !Object.hasOwn(opts, key) && text(value) && !value.startsWith('--'), 'Invalid/duplicate argument');
    opts[key] = value;
  }
  requireThat(text(opts['--root']) && relativeSafe(opts['--settings']), 'Explicit root and relative settings required');
  requireThat(mode === 'check' ? relativeSafe(opts['--baseline']) && !opts['--output'] : mode === 'capture' ? relativeSafe(opts['--output']) && !opts['--baseline'] : !opts['--output'] && !opts['--baseline'], 'Mode arguments mismatch');
  const root = path.resolve(opts['--root']);
  const baseline = mode === 'check' ? validateSnapshot(JSON.parse(file(root, opts['--baseline']))) : null;
  const current = await analyze(root, opts['--settings']);
  if (mode === 'capture') { capture(root, opts['--output'], current); return { exit: 0, candidate: opts['--output'], snapshot: current }; }
  if (mode === 'report') return { exit: current.diagnostics.length ? 1 : 0, snapshot: current };
  const delta = compare(baseline, current);
  return { exit: delta.added.length ? 1 : 0, ...delta, snapshot: current };
}

if (process.argv[1] && path.resolve(process.argv[1]) === self) {
  try { const result = await main(process.argv.slice(2)); console.log(JSON.stringify(result, null, 2)); process.exitCode = result.exit; }
  catch (error) { console.error(JSON.stringify({ exit: 2, error: error.message })); process.exitCode = 2; }
}
