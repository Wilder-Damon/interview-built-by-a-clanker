#!/usr/bin/env node
// SPEC-TOOL-030/R3: optional fresh local catalog evidence; never starts a model turn.
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {safePath, relativeSafe, readJSON, hash} from './adoption.mjs';

const normalized = value => {
  const result = path.resolve(value);
  return process.platform === 'win32' ? result.toLowerCase() : result;
};

// SPEC-TOOL-032/R3: fixed hints, never child-controlled report text or inferred causes.
const diagnosticCategories = [
  {code:'cli-argument-mismatch', help:'Inspect the installed native CLI help for supported app-server arguments.',
    patterns:['unexpected argument','unrecognized option','unknown option','unknown argument']},
  {code:'protocol-mismatch', help:'Check the observed protocol phase against the installed app-server protocol.',
    patterns:['protocol version mismatch','unsupported protocol','method not found']},
  {code:'home-access-failure', help:'Check developer-home access through supported tooling in the intended account.',
    patterns:['failed to access codex home','failed to read codex home','failed to create codex home','failed to determine codex home','could not access codex home','unable to access codex home']},
  {code:'permission-denied', help:'Check the intended account and applicable access policy through supported tooling.',
    patterns:['permission denied','access is denied','eacces','eperm']},
  {code:'config-parse-failure', help:'Check configuration syntax through supported tooling without sharing private values.',
    patterns:['failed to parse config','error parsing config','config parse error','toml parse error','invalid toml']}
];
const unknownDiagnostic = {code:'unknown', help:'No known diagnostic signature was observed; retain phase, exit and byte counts without inferring a cause.'};

// Exported for deterministic stream-partition tests; pipes may coalesce writes.
export function createDiagnosticClassifier(maxBytes = 16384) {
  if (!Number.isInteger(maxBytes) || maxBytes < 1 || maxBytes > 4 * 1024 * 1024) throw new Error('Invalid diagnostic byte limit');
  const limit = Math.min(maxBytes, 16384), matched = new Set();
  let tail = '', inspected = 0, truncated = false, finished = false;
  return {
    inspect(chunk) {
      if (finished) return;
      const length = Math.min(chunk.length, limit - inspected);
      truncated ||= chunk.length > length;
      // Latin-1 gives a byte-for-character window for these ASCII signatures.
      // Only 128 bytes persist between scans; no whole stderr chunk is decoded.
      for (let offset = 0; offset < length; offset += 256) {
        const window = tail + chunk.toString('latin1', offset, Math.min(offset + 256, length)).toLowerCase();
        for (const category of diagnosticCategories) {
          if (category.patterns.some(pattern => window.includes(pattern))) matched.add(category.code);
        }
        tail = window.slice(-128);
      }
      inspected += length;
    },
    finish({failed = false, protocolMismatch = false} = {}) {
      tail = ''; finished = true;
      if (protocolMismatch) matched.add('protocol-mismatch');
      const categories = diagnosticCategories.filter(item => matched.has(item.code)).map(({code,help}) => ({code,help}));
      if (failed && !categories.length) categories.push({...unknownDiagnostic});
      return {categories, stderrInspectedBytes:inspected, stderrInspectionTruncated:truncated};
    }
  };
}

export function expectedSkills(target) {
  safePath(target);
  if (!fs.statSync(target).isDirectory()) throw new Error('Target must be an existing directory');
  const manifest = readJSON(safePath(target, '.covers/adoption.json'));
  if (!manifest || manifest.schema_version !== 1 || !manifest.files || typeof manifest.files !== 'object' || Array.isArray(manifest.files)) {
    throw new Error('Invalid adoption manifest: expected schema_version 1 and files map');
  }
  const expected = [];
  for (const [relative, digest] of Object.entries(manifest.files)) {
    // Validate every declared path, even one that is not a skill expectation.
    if (!relativeSafe(relative)) throw new Error('Unsafe manifest path');
    safePath(target, relative);
    if (typeof digest !== 'string' || !/^[a-f0-9]{64}$/i.test(digest)) throw new Error('Invalid manifest SHA256');
    if (!relative.startsWith('.agents/skills/')) continue;
    if (!relative.endsWith('/SKILL.md')) continue;
    const match = /^\.agents\/skills\/(covers(?:-[a-z0-9]+)*)\/SKILL\.md$/.exec(relative);
    if (!match) throw new Error(`Invalid COVERS skill path: ${relative}`);
    const file = safePath(target, relative);
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) throw new Error(`Missing regular skill file: ${relative}`);
    if (hash(fs.readFileSync(file)) !== digest.toLowerCase()) throw new Error(`Skill hash mismatch: ${relative}; audit the pinned adoption before discovery`);
    expected.push({name:match[1], path:file});
  }
  if (!expected.length) throw new Error('No adopted COVERS SKILL.md expectations; complete and audit adoption first');
  return expected.sort((a,b) => a.name.localeCompare(b.name));
}

export function assessCatalog(target, expected, result) {
  if (!Array.isArray(expected) || !expected.length) throw new Error('Nonempty skill expectations required');
  if (!Array.isArray(result?.data)) throw new Error('Malformed skills/list result');
  const entries = result.data.filter(entry => typeof entry?.cwd === 'string' && path.isAbsolute(entry.cwd) && normalized(entry.cwd) === normalized(target));
  if (entries.length !== 1) throw new Error('Expected exactly one catalog entry for the selected target');
  const entry = entries[0];
  if (!Array.isArray(entry.errors) || entry.errors.length || !Array.isArray(entry.skills)) {
    throw new Error('Target skill catalog has errors or malformed collections');
  }
  const skills = expected.map(wanted => {
    const matches = entry.skills.filter(skill => skill?.name === wanted.name && typeof skill.path === 'string' && path.isAbsolute(skill.path) && normalized(skill.path) === normalized(wanted.path));
    return {...wanted, enabled:matches.length === 1 && matches[0].enabled === true && matches[0].scope === 'repo'};
  });
  return {verified:skills.every(skill => skill.enabled), skills};
}

export async function probeSkillDiscovery(target, {command, args = [], timeoutMs = 15000, maxBytes = 1024 * 1024} = {}) {
  target = path.resolve(target);
  const manifestHash = () => hash(fs.readFileSync(safePath(target, '.covers/adoption.json')));
  const initialManifestHash = manifestHash();
  const expected = expectedSkills(target);
  const verifySnapshot = () => {
    if (manifestHash() !== initialManifestHash || JSON.stringify(expectedSkills(target)) !== JSON.stringify(expected) || manifestHash() !== initialManifestHash) {
      throw new Error('Adopted skill snapshot changed');
    }
  };
  verifySnapshot();
  if (typeof command !== 'string' || !path.isAbsolute(command) || /\.(cmd|bat)$/i.test(command) || !fs.statSync(command).isFile()) {
    throw new Error('Use an inspected absolute native Codex executable, not a .cmd/.bat launcher');
  }
  if (!Array.isArray(args) || args.some(arg => typeof arg !== 'string')) throw new Error('Invalid executable arguments');
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 60000) throw new Error('timeout-ms must be between 1 and 60000');
  if (!Number.isInteger(maxBytes) || maxBytes < 1 || maxBytes > 4 * 1024 * 1024) throw new Error('Invalid output limit');
  const base = {schema_version:1, target, expected, scope:'fresh-process-catalog', helperHealth:'unverified', currentSessionActivation:'unverified', startupNetwork:'not-assessed'};
  return new Promise(resolve => {
    const child = spawn(command, [...args, 'app-server', '--stdio'], {cwd:target, shell:false, windowsHide:true, stdio:['pipe','pipe','pipe']});
    const classifier = createDiagnosticClassifier(maxBytes);
    let phase = 'initialize', failedPhase = null, protocolMismatch = false, buffer = '', stdoutBytes = 0, stderrBytes = 0;
    const terminationSignals = new Set();
    let outcome = null, finished = false, killTimer, cleanupTimer;
    const complete = (code, signal, closed) => {
      if (finished) return;
      // SPEC-TOOL-032/R3, R3-IR-01: a cleanup attempt is not termination evidence.
      // Only an accepted request followed by its matching signal can explain an
      // owned shutdown. A nonzero exit code remains failure even after kill(true).
      const forced = closed && code === null && terminationSignals.has(signal);
      if (outcome?.verified) {
        if (buffer.trim()) {
          protocolMismatch = true;
          outcome = {verified:false, reason:'Incomplete trailing protocol response'};
        } else {
          try {verifySnapshot();} catch {
            outcome = {verified:false, reason:'Adopted skill snapshot changed; re-audit before discovery'};
          }
        }
      }
      outcome ||= {verified:false, reason:'App-server exited before catalog verification'};
      if (outcome.verified && !forced && code !== 0) outcome = {...outcome, verified:false, reason:'App-server failed after returning its catalog'};
      if (!closed) outcome = {...outcome, verified:false, reason:'Owned app-server cleanup could not be verified'};
      if (!outcome.verified) failedPhase ??= phase;
      finished = true;
      clearTimeout(timer); clearTimeout(killTimer); clearTimeout(cleanupTimer);
      child.stdin.destroy(); child.stdout.destroy(); child.stderr.destroy();
      if (!closed) child.unref();
      buffer = '';
      resolve({...base, ...outcome,
        diagnostics:{phase, failedPhase, stdoutBytes, stderrBytes, rawOutputRetained:false,
          ...classifier.finish({failed:!outcome.verified, protocolMismatch})},
        process:{pid:child.pid ?? null, closed, forced, exitCode:code, signal:signal || null}});
    };
    const finish = value => {
      if (finished) return;
      if (!value.verified) failedPhase ??= phase;
      if (outcome) {
        // Catalog success is provisional until streams close and bytes are rechecked.
        if (outcome.verified && !value.verified) outcome = value;
        return;
      }
      outcome = value;
      clearTimeout(timer);
      child.stdin.end();
      // Give stdio EOF a chance to close the owned process, then bound cleanup.
      const killOwned = signal => {
        try {if (child.kill(signal)) terminationSignals.add(signal);} catch { /* No accepted termination request. */ }
      };
      killTimer = setTimeout(() => killOwned('SIGTERM'), 500);
      cleanupTimer = setTimeout(() => {
        killOwned('SIGKILL');
        cleanupTimer = setTimeout(() => complete(null, null, false), 500);
      }, 1500);
    };
    const fail = (reason, protocol = false) => {
      if (finished) return;
      protocolMismatch ||= protocol;
      finish({verified:false, reason});
    };
    const send = message => {
      if (!outcome && !finished) child.stdin.write(JSON.stringify(message) + '\n');
    };
    const timer = setTimeout(() => fail('Fresh catalog timed out; inspect CLI access and compatibility through supported tooling'), timeoutMs);
    child.on('error', () => fail('App-server launch failed'));
    child.stdin.on('error', () => fail('App-server input closed before verification'));
    child.on('close', (code, signal) => complete(code, signal, true));
    child.stderr.on('data', chunk => {
      if (finished) return;
      stderrBytes += chunk.length;
      classifier.inspect(chunk);
      if (stderrBytes > maxBytes) fail('App-server stderr exceeded the bounded output limit');
    });
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', chunk => {
      stdoutBytes += Buffer.byteLength(chunk);
      if (stdoutBytes > maxBytes) return fail('App-server stdout exceeded the bounded output limit');
      if (outcome?.verified === false || finished) return;
      buffer += chunk;
      let newline;
      while ((newline = buffer.indexOf('\n')) !== -1 && outcome?.verified !== false) {
        const line = buffer.slice(0, newline).trim(); buffer = buffer.slice(newline + 1);
        if (!line) continue;
        let message;
        try {message = JSON.parse(line);} catch {fail('Malformed app-server JSON response', true); break;}
        if (!message || typeof message !== 'object' || Array.isArray(message)) {fail('Malformed app-server message', true); break;}
        if (!Object.hasOwn(message,'id') && typeof message.method === 'string') continue;
        if (phase === 'closing') {fail('Unexpected protocol response after catalog completion', true); break;}
        const expectedId = phase === 'initialize' ? 1 : 2;
        if (message.id !== expectedId) {fail('Unexpected app-server response or server request', true); break;}
        if (message.error) {
          // Only standard request/method/parameter errors establish a protocol hint.
          // Arbitrary server failures do not reveal their cause, and text stays private.
          fail(`App-server rejected ${phase}`, [-32600,-32601,-32602].includes(message.error.code)); break;
        }
        if (!Object.hasOwn(message,'result')) {fail('Malformed app-server response', true); break;}
        if (phase === 'initialize') {
          if (!message.result || typeof message.result !== 'object' || Array.isArray(message.result)) {fail('Malformed initialize result', true); break;}
          phase = 'skills/list';
          send({method:'initialized', params:{}});
          send({id:2, method:'skills/list', params:{cwds:[target], forceReload:true}});
        } else {
          try {
            const result = assessCatalog(target, expected, message.result);
            finish({...result, reason:result.verified ? 'Exact enabled adopted skill paths observed in a fresh process' : 'Missing, disabled or duplicate adopted skills in the target catalog'});
            phase = 'closing';
          } catch {fail('Target skill catalog has errors or is malformed');}
        }
      }
    });
    send({id:1, method:'initialize', params:{clientInfo:{name:'covers_skill_discovery', version:'1.0.0'}}});
  });
}

export async function main(argv) {
  const options = {};
  while (argv.length) {
    const key = argv.shift();
    if (!['--target','--codex','--timeout-ms'].includes(key) || Object.hasOwn(options,key)) throw new Error(`Unknown/duplicate option: ${key}`);
    const value = argv.shift();
    if (!value || value.startsWith('--')) throw new Error(`Missing value: ${key}`);
    options[key] = value;
  }
  if (!options['--target'] || !options['--codex']) throw new Error('Usage: node tooling/skill-discovery.mjs --target PATH --codex ABSOLUTE_EXECUTABLE [--timeout-ms 15000]');
  const report = await probeSkillDiscovery(options['--target'], {command:options['--codex'], timeoutMs:options['--timeout-ms'] === undefined ? 15000 : Number(options['--timeout-ms'])});
  console.log(JSON.stringify(report, null, 2));
  return report.verified ? 0 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {process.exitCode = await main(process.argv.slice(2));}
  catch (error) {console.error(error.message); process.exitCode = 1;}
}
