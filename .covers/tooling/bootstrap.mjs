#!/usr/bin/env node
// SPEC-TOOL-024/R3-R5: clean-install entry point; intentionally no third-party imports.
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {adopt} from './adoption.mjs';

const args=process.argv.slice(2),options={};
try{
 while(args.length){const key=args.shift();if(!['--target','--apply'].includes(key)||Object.hasOwn(options,key))throw new Error(`Unknown/duplicate option: ${key}`);options[key]=key==='--apply'?true:args.shift();if(options[key]===undefined||String(options[key]).startsWith('--'))throw new Error(`Missing value: ${key}`);}
 if(!options['--target'])throw new Error('bootstrap requires --target PATH');
 const source=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
 const result=adopt(source,path.resolve(options['--target']),!!options['--apply']);
 // SPEC-TOOL-030/R1: preserve the partial receipt for humans and automation.
 if(result.outcome==='partial')process.exitCode=1;
 console.log(JSON.stringify(result,null,2));
}catch(error){console.error(error.message);process.exitCode=1;}
