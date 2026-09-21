#!/usr/bin/env node
// SPEC-TOOL-032/R4: optional reviewed context, not a task runner or an installer.
// Config shape is scaffolding/command-context.json. Empty fields deliberately
// fail validation: adapt to an existing native runtime and reviewed probe scripts.
// parentProbe must resolve/query the real manager; nestedProbe must do so THROUGH
// the project's representative task runner. Printing expected JSON is not evidence.
// For a runtime + CLI manager, the reviewed probes bind the resolved shim/entrypoint
// to the actual version invocation. No sample path, version or manager is assumed.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const usage = 'Usage: node tooling/command-context.mjs --target PATH --config PROJECT_RELATIVE_JSON [--run]';
const limitations = [
  'Identity probes are reviewed programs: each must actually resolve and query the manager. The nested probe must exercise a representative task-runner lookup.',
  'A probe that prints configured expectations instead of actual lookup/version observations is not evidence. Review runtime/CLI/shim mappings and disable any automatic acquisition in the reviewed commands.',
  'Only the observed parent and representative nested identity are checked; other descendants, changed files and later environment changes cannot be proven.',
  'Package scripts may internally use a shell. Review their scripts and any explicitly configured native shell with fixed trusted arguments; no parameter interpolation is performed here.',
  'Timeout and output limits bound each direct child, not its process tree. Descendant cleanup and network isolation are not provided.',
  'Each child is limited to 60 seconds: this helper is for fast tasks. Full builds can use the existing verify helper with their reviewed verification configuration.',
  'PATH is prepended only in a copied child environment. No downloads, installs, persistent environment changes or automatic shell fallback are performed by this helper.'
];
const fail = message => { throw new Error(message); };
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = value => typeof value === 'string' && value.length > 0 && !/[\x00-\x1f\x7f]/.test(value);
const samePath = (a, b) => process.platform === 'win32' ? a.toLowerCase() === b.toLowerCase() : a === b;
const safeErrorCode = error => ['ENOENT', 'EACCES', 'EPERM', 'ENOEXEC', 'E2BIG', 'ENOTDIR', 'ENOMEM', 'EINVAL', 'ENAMETOOLONG'].includes(error.code) ? error.code : 'UNKNOWN';

function keys(value, allowed, label) {
  if (!object(value) || Object.keys(value).some(key => !allowed.includes(key))) fail(`Invalid ${label} fields`);
}

// Reject lexical escapes and symlink/junction redirection, including in the target.
function projectPath(target, relative, kind) {
  if (!text(relative) || relative.includes('\\') || relative.includes(':') || path.isAbsolute(relative) ||
      relative.split('/').some(part => part === '..' || part === '' || (part === '.' && relative !== '.'))) fail('Invalid project-relative path');
  const result = path.resolve(target, relative);
  try {
    let current = result;
    for (;;) {
      if (fs.lstatSync(current).isSymbolicLink()) fail('Project path redirection refused');
      const parent = path.dirname(current);
      if (parent === current) break;
      current = parent;
    }
    const stat = fs.statSync(result);
    if (kind === 'directory' ? !stat.isDirectory() : !stat.isFile()) fail('Invalid project path kind');
    if (!samePath(fs.realpathSync(result), result)) fail('Project path redirection refused');
    return result;
  } catch { fail('Project path must exist with the required kind and without redirection'); }
}

function readJson(file, label) {
  try {
    if (fs.statSync(file).size > 1024 * 1024) fail('Input too large');
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch { fail(`Invalid or unreadable ${label} JSON (maximum 1 MiB)`); }
}

function command(value, label) {
  keys(value, ['executable', 'args'], label);
  if (!text(value.executable) || !path.isAbsolute(value.executable) || /\.(cmd|bat)$/i.test(value.executable) ||
      !Array.isArray(value.args) || value.args.length > 256 || value.args.some(arg => typeof arg !== 'string' || /\x00/.test(arg) || arg.length > 32768)) {
    fail(`Invalid ${label}: use an absolute native executable and a string argument array, never a direct .cmd/.bat record`);
  }
  let executable;
  try {
    executable = fs.realpathSync(value.executable);
    if (!fs.statSync(executable).isFile()) fail('Not a file');
    fs.accessSync(executable, fs.constants.X_OK);
    const buffer = Buffer.alloc(4), fd = fs.openSync(executable, 'r');
    try { fs.readSync(fd, buffer, 0, 4, 0); } finally { fs.closeSync(fd); }
    // Reject script records instead of relying on execvp's script fallback.
    // Runtime + reviewed script arguments are supported; shebang records are not.
    const magic = buffer.toString('hex');
    const native = process.platform === 'win32'
      ? /\.exe$/i.test(executable) && magic.startsWith('4d5a')
      : ['7f454c46', 'feedface', 'feedfacf', 'cefaedfe', 'cffaedfe', 'cafebabe', 'bebafeca', 'cafebabf', 'bfbafeca'].includes(magic);
    if (!native) fail('Not native');
  } catch { fail(`Invalid ${label}: existing native executable required; no script or shell fallback`); }
  return {executable, args:[...value.args]};
}

function packagePins(target, cwd, manager) {
  let current = cwd;
  for (;;) {
    const file = path.join(current, 'package.json');
    let exists = true;
    try { fs.lstatSync(file); }
    catch (error) { if (error.code === 'ENOENT') exists = false; else fail('Cannot inspect package manifest'); }
    if (exists) {
      const relative = path.relative(target, file).split(path.sep).join('/');
      const manifest = readJson(projectPath(target, relative, 'file'), 'package manifest');
      if (!object(manifest)) fail('Invalid package manifest object');
      if (Object.hasOwn(manifest, 'packageManager')) {
        const pin = typeof manifest.packageManager === 'string' && /^([a-z][a-z0-9-]*)@(.+)$/.exec(manifest.packageManager);
        const version = pin && pin[2].replace(/\+sha(?:224|256|384|512)\.[a-f0-9]+$/i, '');
        if (!pin || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(version) ||
            pin[1] !== manager.name || version !== manager.expectedVersion) fail('packageManager must declare the reviewed manager name and exact expected version');
      }
    }
    if (samePath(current, target)) break;
    current = path.dirname(current);
  }
}

function plan(target, configFile) {
  if (!text(target)) fail('Target must be an existing project directory');
  target = projectPath(path.resolve(target), '.', 'directory');
  const config = readJson(projectPath(target, configFile, 'file'), 'command context');
  keys(config, ['$comment', 'schema_version', 'cwd', 'shimDirectory', 'manager', 'parentProbe', 'nestedProbe', 'task', 'timeoutMs', 'maxBytes'], 'command context');
  if (config.$comment !== undefined && typeof config.$comment !== 'string') fail('Invalid command context comment');
  if (config.schema_version !== 1) fail('Expected command-context schema_version 1');
  const cwd = projectPath(target, config.cwd, 'directory');
  if (config.shimDirectory === '.') fail('Use a dedicated project shim directory');
  const shimDirectory = projectPath(target, config.shimDirectory, 'directory');
  if (shimDirectory.includes(path.delimiter)) fail('Shim directory must not contain a PATH delimiter');
  keys(config.manager, ['name', 'path', 'expectedVersion'], 'manager');
  const manager = config.manager;
  if (!/^[a-z][a-z0-9-]{0,63}$/.test(manager.name || '') || !text(manager.expectedVersion) || manager.expectedVersion.trim() !== manager.expectedVersion || manager.expectedVersion.length > 128) fail('Invalid manager name or expectedVersion');
  const managerPath = projectPath(target, manager.path, 'file');
  const names = process.platform === 'win32' ? [manager.name + '.exe', manager.name + '.cmd', manager.name + '.bat'] : [manager.name];
  if (!samePath(path.dirname(managerPath), shimDirectory) || !names.some(name => samePath(name, path.basename(managerPath)))) fail('Manager path must name its launcher directly in the reviewed shim directory');
  const timeoutMs = config.timeoutMs === undefined ? 15000 : config.timeoutMs;
  const maxBytes = config.maxBytes === undefined ? 65536 : config.maxBytes;
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 60000) fail('timeoutMs must be an integer between 1 and 60000 per child');
  if (!Number.isInteger(maxBytes) || maxBytes < 1 || maxBytes > 4 * 1024 * 1024) fail('maxBytes must be an integer between 1 and 4194304 per child');
  packagePins(target, cwd, manager);
  return {schema_version:1, target, cwd, shimDirectory, manager:{...manager, path:managerPath},
    commands:{parent:command(config.parentProbe, 'parentProbe'), nested:command(config.nestedProbe, 'nestedProbe'), task:command(config.task, 'task')},
    timeoutMs, maxBytes, limitations};
}

function childEnvironment(shimDirectory) {
  const env = {...process.env};
  // Windows environment keys are case-insensitive; Node otherwise sorts duplicates.
  const pathKeys = Object.keys(env).filter(key => process.platform === 'win32' ? key.toUpperCase() === 'PATH' : key === 'PATH');
  if (pathKeys.length > 1) fail('Ambiguous inherited PATH keys; resolve the process environment before running');
  const inherited = pathKeys.length ? env[pathKeys[0]] : '';
  for (const key of pathKeys) delete env[key];
  env.PATH = shimDirectory + (inherited ? path.delimiter + inherited : '');
  return env;
}

// Both probes emit exactly {"path":"absolute resolved launcher","version":"exact version"}.
// Only a matched identity is retained; raw stdout/stderr never reaches a run report.
function invoke(record, context, env, identityRequired) {
  return new Promise(resolve => {
    let child;
    try {
      child = spawn(record.executable, record.args, {cwd:context.cwd, env, shell:false, windowsHide:true, stdio:['ignore', 'pipe', 'pipe']});
    } catch (error) {
      resolve({passed:false, reason:'launch-failed', process:{pid:null, exitCode:null, signal:null, errorCode:safeErrorCode(error), closed:true},
        diagnostics:{stdoutBytes:0, stderrBytes:0, rawOutputRetained:false}});
      return;
    }
    let stdoutBytes = 0, stderrBytes = 0, output = [], reason = null, errorCode = null;
    let done = false, cleanupTimer, observedExit = null, observedSignal = null;
    const finish = (exitCode, signal, closed) => {
      if (done) return;
      done = true;
      clearTimeout(timer); clearTimeout(cleanupTimer);
      child.stdout.destroy(); child.stderr.destroy();
      if (!closed) child.unref();
      let identity;
      if (!reason && exitCode === 0 && identityRequired && closed) {
        try {
          const value = JSON.parse(Buffer.concat(output).toString('utf8'));
          if (!object(value) || Object.keys(value).length !== 2 || !text(value.path) || !path.isAbsolute(value.path) ||
              !samePath(value.path, context.manager.path) || value.version !== context.manager.expectedVersion) throw new Error();
          projectPath(context.target, path.relative(context.target, value.path).split(path.sep).join('/'), 'file');
          identity = {path:context.manager.path, version:context.manager.expectedVersion};
        } catch { reason = 'identity-mismatch-or-malformed'; }
      }
      output = [];
      resolve({passed:!reason && closed && exitCode === 0, reason:reason || (!closed ? 'cleanup-unverified' : exitCode === 0 ? (identityRequired ? 'verified' : 'exited-zero') : 'child-failed'),
        ...(identity ? {identity} : {}), process:{pid:child.pid ?? null, exitCode, signal:signal || null, errorCode, closed},
        diagnostics:{stdoutBytes, stderrBytes, rawOutputRetained:false}});
    };
    const stop = why => {
      if (reason || done) return;
      reason = why;
      try { child.kill('SIGKILL'); } catch { /* The bounded cleanup result remains explicit. */ }
      cleanupTimer = setTimeout(() => finish(observedExit, observedSignal, false), 500);
    };
    const timer = setTimeout(() => stop('timeout'), context.timeoutMs);
    child.on('error', error => {
      errorCode = safeErrorCode(error);
      reason = 'launch-failed';
    });
    child.on('exit', (code, signal) => { observedExit = code; observedSignal = signal; });
    child.on('close', (code, signal) => finish(code, signal, true));
    child.stdout.on('data', chunk => {
      stdoutBytes += chunk.length;
      if (stdoutBytes + stderrBytes > context.maxBytes) stop('output-limit');
      else if (identityRequired && !reason) output.push(chunk);
    });
    child.stderr.on('data', chunk => {
      stderrBytes += chunk.length;
      if (stdoutBytes + stderrBytes > context.maxBytes) stop('output-limit');
    });
  });
}

function failureExit(check) {
  if (check.reason === 'timeout') return 124;
  if (check.reason === 'output-limit') return 125;
  if (check.process.exitCode > 0) return check.process.exitCode;
  if (check.process.signal) return 128 + (os.constants.signals[check.process.signal] || 0);
  return 1;
}

export async function commandContext(target, configFile, {run = false} = {}) {
  if (typeof run !== 'boolean') fail('run must be an explicit boolean');
  const context = plan(target, configFile);
  if (!run) return {...context, outcome:'planned', executed:false, exitCode:0};
  const env = childEnvironment(context.shimDirectory);
  const report = {schema_version:1, outcome:'passed', executed:false, exitCode:0, target:context.target, cwd:context.cwd, manager:context.manager, checks:{}, limitations};
  for (const phase of ['parent', 'nested', 'task']) {
    // A probe must not silently change the configured plan or declared pin before
    // execution. This does not claim immutable executable/script contents.
    if (JSON.stringify(plan(target, configFile)) !== JSON.stringify(context)) fail('Reviewed command context changed during verification');
    if (phase === 'task') report.executed = true;
    const check = await invoke(context.commands[phase], context, env, phase !== 'task');
    report.checks[phase] = check;
    if (!check.passed) return {...report, outcome:'failed', failedPhase:phase, exitCode:failureExit(check)};
  }
  return report;
}

export async function main(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index++) {
    const key = argv[index];
    if (!['--target', '--config', '--run'].includes(key) || Object.hasOwn(options, key)) fail(usage);
    if (key === '--run') options[key] = true;
    else {
      const value = argv[++index];
      if (!value || value.startsWith('--')) fail(usage);
      options[key] = value;
    }
  }
  if (!options['--target'] || !options['--config']) fail(usage);
  const report = await commandContext(options['--target'], options['--config'], {run:options['--run'] === true});
  console.log(JSON.stringify(report, null, 2));
  return report.exitCode;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { process.exitCode = await main(process.argv.slice(2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
