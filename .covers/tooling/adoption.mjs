// SPEC-TOOL-024/R4-R5: dependency-free, non-overwriting toolkit adoption.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const moduleRoot=fileURLToPath(new URL('../',import.meta.url));
export const readJSON=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const packagePath=path.join(moduleRoot,'package.json');
// Some read-only CI fixtures intentionally distribute only tooling modules.
// Commands that do not adopt a project must remain importable in that shape.
export const VERSION=fs.existsSync(packagePath)?readJSON(packagePath).version:null;
export const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
export const canonical=value=>JSON.stringify(value,function(key,val){return val&&typeof val==='object'&&!Array.isArray(val)?Object.fromEntries(Object.entries(val).sort(([a],[b])=>a.localeCompare(b))):val;});
export const relativeSafe=p=>typeof p==='string'&&p.length>0&&!p.includes('\\')&&!p.includes(':')&&!p.startsWith('/')&&!p.split('/').some(s=>s==='..'||s==='.'||s==='');

export function safePath(root,relative=''){
 if(relative&&!relativeSafe(relative))throw new Error(`Unsafe relative path: ${relative}`);
 const result=path.resolve(root,relative);let current=path.parse(result).root;
 for(const component of result.slice(current.length).split(path.sep).filter(Boolean)){
  current=path.join(current,component);
  if(fs.existsSync(current)||(()=>{try{fs.lstatSync(current);return true;}catch{return false;}})()){
   if(fs.lstatSync(current).isSymbolicLink())throw new Error(`Symlink refused: ${current}`);
   if(current!==result&&!fs.statSync(current).isDirectory())throw new Error(`Non-directory ancestor: ${current}`);
  }
 }
 return result;
}

export function walk(root,relative=''){
 const dir=safePath(root,relative);if(!fs.existsSync(dir))return [];
 return fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name)).flatMap(entry=>{
  const rel=relative?`${relative}/${entry.name}`:entry.name;safePath(root,rel);
  return entry.isDirectory()?walk(root,rel):[rel];
 });
}

function sourceIdentity(source){
 const unknown={commit:null,dirty:null};
 const git=args=>execFileSync('git',['-C',source,...args],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
 try{
  if(fs.realpathSync.native(git(['rev-parse','--show-toplevel']))!==fs.realpathSync.native(source))return unknown;
  const commit=git(['rev-parse','HEAD']);if(!/^[a-f0-9]{40,64}$/.test(commit))return unknown;
  return {commit,dirty:git(['status','--porcelain','--untracked-files=normal']).length>0};
 }catch{return unknown;}
}

export function adopt(source,target,apply=false){
 if(!VERSION)throw new Error('COVERS package.json is required for adoption');
 safePath(source);safePath(target);
 if(!fs.statSync(target).isDirectory())throw new Error('Target must be an existing directory');
 const payload=new Map();
 for(const group of ['methodology','tooling','scaffolding','skills']){
  const entries=walk(source,group);if(!entries.length)throw new Error(`Missing toolkit sources: ${group}; use the COVERS distribution`);
  for(const p of entries)payload.set(p.startsWith('skills/')?`.agents/${p}`:`.covers/${p}`,fs.readFileSync(safePath(source,p)));
 }
 const runtimePackage=readJSON(safePath(source,'package.json'));runtimePackage.scripts={covers:'node tooling/cli.mjs'};
 payload.set('.covers/package.json',Buffer.from(JSON.stringify(runtimePackage,null,2)+'\n'));
 payload.set('.covers/package-lock.json',fs.readFileSync(safePath(source,'package-lock.json')));
 const manifest={schema_version:1,version:VERSION,source:sourceIdentity(source),files:Object.fromEntries([...payload].map(([p,data])=>[p,hash(data)]))};
 payload.set('.covers/adoption.json',Buffer.from(JSON.stringify(manifest,null,2)+'\n'));
 const plan=[...payload].map(([p,data])=>{const dest=safePath(target,p);return {path:p,status:!fs.existsSync(dest)?'create':fs.statSync(dest).isFile()&&hash(fs.readFileSync(dest))===hash(data)?'unchanged':'conflict'};});
 if(apply&&plan.some(p=>p.status==='conflict'))throw new Error(`Adoption blocked by conflicts:\n${plan.filter(p=>p.status==='conflict').map(p=>p.path).join('\n')}`);
 if(apply){
  const pending=plan.filter(p=>p.status==='create').map(p=>p.path),created=[];
  for(const relative of pending){
   try{
    const dest=safePath(target,relative);
    fs.mkdirSync(path.dirname(dest),{recursive:true});
    fs.writeFileSync(safePath(target,relative),payload.get(relative),{flag:'wx'});
    created.push(relative);
   }catch(error){
    // SPEC-TOOL-030/R1: created means completed copies from this call only.
    // failed.path is the planned destination, including parent-directory refusal;
    // pending includes that possibly partial file. Preserve bytes; never retry.
    // Missing filesystem error codes are represented explicitly as null.
    return {version:VERSION,applied:false,outcome:'partial',created,pending:pending.slice(created.length),
     failed:{path:relative,code:error.code??null,message:error.message},plan,
     next:'Inspect and preserve any bytes at the failed path; partial bytes remain a conflict and require explicit authorization for relocation/recovery. For refusal before creation, resolve the actual permission boundary with authorization, then re-preview the same-source snapshot before an explicit retry. No automatic retry, rollback or deletion was performed.'};
   }
  }
 }
 return {version:VERSION,applied:apply,plan,next:'Read .covers/methodology/setup.md. Record Full or Lite intent before project-specific setup edits; reconcile AGENTS.md/specs and verify project-local skill discovery in a new Codex session.'};
}

export function audit(root){
 const manifest=readJSON(safePath(root,'.covers/adoption.json'));
 if(manifest.schema_version!==1||!manifest.files||typeof manifest.files!=='object'||Array.isArray(manifest.files))throw new Error('Invalid adoption manifest');
 return Object.entries(manifest.files).map(([p,expected])=>{const file=safePath(root,p);return {path:p,status:!fs.existsSync(file)?'missing':hash(fs.readFileSync(file))===expected?'unchanged':'modified'};});
}
