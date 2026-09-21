#!/usr/bin/env node
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {adopt,audit,inspect,index,drift,archive,search,readiness,safePath} from './core.mjs';
import {inventoryDependencies,scaffoldDependencyReview,queryAdvisories,dockerPreflight,verificationPlan,runVerification,closeoutReceipt,writeJson} from './assessment.mjs';
const args=process.argv.slice(2), command=args.shift();
const allowed=new Set(['--target','--base','--apply','--spec','--mode','--policy','--phase','--query','--domain','--status','--limit','--offset','--output','--provider','--authorization','--compose','--profile','--config','--run','--manifest']);
const options={};
try {
  while(args.length){const key=args.shift();if(!allowed.has(key)||Object.hasOwn(options,key))throw new Error(`Unknown/duplicate option: ${key}`);options[key]=['--apply','--run'].includes(key)?true:args.shift();if(options[key]===undefined||String(options[key]).startsWith('--'))throw new Error(`Missing value: ${key}`);}
  if(options['--apply']&&command!=='init')throw new Error('--apply is only valid with init');
  if(options['--run']&&command!=='verify')throw new Error('--run is only valid with verify');
  if(options['--base']&&command!=='drift')throw new Error('--base is only valid with drift');
  if(options['--spec']&&!['archive','drift','readiness'].includes(command))throw new Error('--spec is only valid with archive, drift or readiness');
  if(options['--mode']&&command!=='drift')throw new Error('--mode is only valid with drift');
  if(options['--policy']&&command!=='drift')throw new Error('--policy is only valid with drift');
  if(options['--phase']&&command!=='readiness')throw new Error('--phase is only valid with readiness');
  if(command!=='search'&&['--query','--domain','--status','--limit','--offset'].some(k=>Object.hasOwn(options,k)))throw new Error('Search options are only valid with search');
  const commandOptions={deps:['--output','--provider','--authorization'], 'docker-preflight':['--compose'],verify:['--profile','--config','--output'],receipt:['--manifest','--output']};
  for(const key of ['--output','--provider','--authorization','--compose','--profile','--config','--manifest'])if(Object.hasOwn(options,key)&&!commandOptions[command]?.includes(key))throw new Error(`${key} is not valid with ${command}`);
  const target=path.resolve(options['--target']||process.cwd());
  let result;
  switch(command){
    // SPEC-TOOL-030/R1: print partial adoption progress and propagate failure.
    case 'init': if(!options['--target'])throw new Error('init requires --target');result=adopt(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),target,!!options['--apply']);if(result.outcome==='partial')process.exitCode=1;break;
    case 'validate':{const report=inspect(target);result={specCount:report.specs.length,errors:report.errors};if(result.errors.length)process.exitCode=1;break;}
    case 'index':result={specCount:index(target).specs.length,indexed:true};break;
    case 'search':result=search(target,{query:options['--query'],domain:options['--domain'],status:options['--status'],limit:options['--limit']===undefined?50:Number(options['--limit']),offset:options['--offset']===undefined?0:Number(options['--offset'])});break;
    case 'archive':result=archive(target,options['--spec']);break;
    case 'audit':result=audit(target);if(result.some(r=>r.status!=='unchanged'))process.exitCode=1;break;
    case 'readiness':result=readiness(target,options['--spec']?.split(','),{phase:options['--phase']});if(result.errors.length)process.exitCode=1;break;
    case 'drift':result=drift(target,options['--base'],{specs:options['--spec']?.split(','),mode:options['--mode'],policy:options['--policy']});if(result.errors.length||(result.policy==='enforce'&&result.unmapped.length))process.exitCode=1;break;
    case 'deps':{
      const scaffold=options['--output']?scaffoldDependencyReview(target,options['--output']):null,inventory=scaffold?JSON.parse(fs.readFileSync(path.join(target,scaffold.inventory),'utf8')):inventoryDependencies(target);
      // SPEC-TOOL-028/R1: emit partial reports, but propagate incompleteness to automation.
      if(options['--provider']){if(options['--provider']!=='osv'||!options['--authorization'])throw new Error('deps --provider osv requires --authorization PATH');const authorization=JSON.parse(fs.readFileSync(safePath(target,options['--authorization']),'utf8'));const advisory=await queryAdvisories(inventory,authorization);if(options['--output'])writeJson(target,`${options['--output']}/osv-report.json`,advisory);result={...scaffold,advisory};if(advisory.outcome!=='complete')process.exitCode=1;}else result=scaffold?{...scaffold,lockfile:inventory.lockfile}:inventory;
      break;
    }
    case 'docker-preflight':if(!options['--compose'])throw new Error('docker-preflight requires --compose PATH');result=dockerPreflight(target,options['--compose']);break;
    // SPEC-TOOL-028/R4: plan-only stays successful; empty explicit execution does not.
    case 'verify':{const config=options['--config']||'.covers/verification.json',profile=options['--profile']||'fast';result=options['--run']?runVerification(target,config,profile):verificationPlan(target,config,profile);if(options['--output'])writeJson(target,options['--output'],result);if(result.outcome==='failed'||result.outcome==='incomplete')process.exitCode=1;break;}
    case 'receipt':if(!options['--manifest'])throw new Error('receipt requires --manifest PATH');result=closeoutReceipt(target,options['--manifest']);if(options['--output'])writeJson(target,options['--output'],result);if(result.outcome!=='passed')process.exitCode=1;break;
    default:throw new Error('Usage: node tooling/cli.mjs init --target PATH [--apply] | validate | index | audit | search | archive --spec ID | readiness --spec ID[,ID] [--phase execute|complete|local] | drift --base REF [--spec ID[,ID]] [--mode local|branch|index|worktree] [--policy enforce|report] | deps [--output DIR] [--provider osv --authorization PATH] | docker-preflight --compose PATH | verify [--profile fast|full] [--config PATH] [--run] [--output PATH] | receipt --manifest PATH [--output PATH] [--target PATH]');
  }
  console.log(JSON.stringify(result,null,2));
} catch(e){console.error(e.message);process.exitCode=1;}
