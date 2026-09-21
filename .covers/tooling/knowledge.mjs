// SPEC-TOOL-008/R3: read-only metadata/freshness checks, never source execution.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import YAML from 'yaml';
import {safePath} from './core.mjs';

const nonempty=v=>typeof v==='string'&&v.trim().length>0;
const id=v=>typeof v==='string'&&/^[A-Z][A-Z0-9-]+$/.test(v);
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
export function checkKnowledge(root){
 const report={present:false,analysisComplete:false,pages:0,errors:[],stale:[],warnings:[],limitation:'Declared metadata, index and local source-byte freshness only; prose links, semantic truth, external freshness and approval authority require review.'};
 const error=message=>report.errors.push(message);
 const changed=new Set(),pages=new Map(),identities=new Map();
 try{
  root=path.resolve(root);
  if(!fs.statSync(safePath(root)).isDirectory())throw new Error('Target must be an existing directory');
  const wiki=safePath(root,'wiki');
  if(!fs.existsSync(wiki))return report;
  report.present=true;
  const read=p=>{const file=safePath(root,p),stat=fs.statSync(file);if(!stat.isFile()||stat.size>2*1024*1024)throw new Error(`Not a file or exceeds 2 MiB: ${p}`);return fs.readFileSync(file);};
  const manifest=JSON.parse(read('wiki/sources.json'));
  if(manifest.schema_version!==1||!Array.isArray(manifest.sources))throw new Error('Invalid source manifest schema');
  if(manifest.sources.length>5000)throw new Error('Source limit 5000 exceeded; split scope');
  const index=read('wiki/index.md').toString();read('wiki/log.md');read('wiki/AGENTS.md');
  const sources=new Map();
  for(const s of manifest.sources){
   if(!s||!id(s.id)||sources.has(s.id)){error('Invalid or duplicate source ID');continue;}
   sources.set(s.id,s);
   if(!nonempty(s.revision))error(`${s.id}: missing reviewed revision`);
   if(s.kind==='local'){
    if(!/^[a-f0-9]{64}$/.test(s.sha256??''))error(`${s.id}: invalid SHA256`);
    try{
     if(!nonempty(s.path))throw new Error('Missing source path');
     if(/(^|\/)(\.env(?:\.[^/]*)?|\.ssh|\.npmrc|\.netrc|\.git-credentials|credentials)(\/|$)|\.(pem|key|p12|pfx)$/i.test(s.path))throw new Error('Sensitive source path refused');
     const actual=hash(read(s.path));
     identities.set(s.id,`sha256:${actual}`);
     if(actual!==s.sha256)changed.add(s.id);
    }catch(e){error(`${s.id}: ${e.message}`);}
   }else if(s.kind==='external'){
    if(nonempty(s.revision))identities.set(s.id,`revision:${s.revision}`);
    if(!nonempty(s.locator))error(`${s.id}: missing external locator`);
    if(typeof s.locator==='string'&&s.locator!==s.locator.trim())error(`${s.id}: external locator padding refused`);
    if(typeof s.locator==='string'&&/^https?:/i.test(s.locator)){
     try{const url=new URL(s.locator);if(url.username||url.password||[...url.searchParams.keys()].some(k=>/token|api.?key|secret|password|signature|credential|auth/i.test(k)))error(`${s.id}: credential-bearing locator refused`);}catch{error(`${s.id}: invalid external URL`);}
    }
    report.warnings.push(`${s.id}: external freshness unverified; no fetch performed`);
   }else error(`${s.id}: invalid source kind`);
  }
  const paths=[];
  function walk(relative,depth=0,found=paths){
   if(depth>20)throw new Error('Page nesting limit exceeded');
   const dir=safePath(root,relative);
   if(!fs.existsSync(dir))return;
   for(const name of fs.readdirSync(dir).sort()){
    const rel=`${relative}/${name}`,stat=fs.lstatSync(safePath(root,rel));
    if(stat.isDirectory())walk(rel,depth+1,found);
    else if(name.endsWith('.md')){found.push(rel);if(found.length>5000)throw new Error('Markdown file limit 5000 exceeded; split scope');}
   }
  }
  walk('wiki/pages');
  for(const p of paths){
   try{
   const front=read(p).toString().match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
   if(!front){error(`${p}: missing frontmatter`);continue;}
   const data=YAML.parse(front[1],{maxAliasCount:0,uniqueKeys:true});
   if(!data||typeof data.id!=='string'||!/^KN-[A-Z0-9]+(?:-[A-Z0-9]+)*$/.test(data.id)){error(`${p}: invalid page ID (expected scalar KN-...)`);continue;}
   if(pages.has(data.id)){error(`Duplicate page ID: ${data.id}`);continue;}
   pages.set(data.id,{...data,path:p});
   if(!nonempty(data.title)||!['overview','domain','evidence','decision'].includes(data.kind))error(`${data.id}: invalid title/kind`);
   if(!['draft','reviewed'].includes(data.review_state))error(`${data.id}: invalid review_state`);
   if(data.review_state==='reviewed'&&!nonempty(data.reviewed_by))error(`${data.id}: reviewed_by required (identity not verified)`);
   for(const field of ['sources','related','specs','invariants'])if(!Array.isArray(data[field])||data[field].some(v=>!id(v))||new Set(data[field]).size!==data[field].length)error(`${data.id}: invalid ${field} IDs`);
   if(!data.sources?.length)error(`${data.id}: at least one source required`);
   if(!index.includes(`](${p.slice(5)})`))error(`${data.id}: missing index link to ${p.slice(5)}`);
   }catch(e){error(`${p}: ${e.message}`);}
  }
  report.pages=pages.size;
  const specIds=new Set(),invariantIds=new Set();
  if([...pages.values()].some(p=>p.specs?.length)){
   const specPaths=[];
   for(const dir of ['specs/1_active','specs/2_completed','specs/history'])walk(dir,0,specPaths);
   for(const p of specPaths){
    try{
     const front=read(p).toString().match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
     if(!front)throw new Error('Missing spec frontmatter');
     const data=YAML.parse(front[1],{maxAliasCount:0,uniqueKeys:true});
     if(!id(data?.id))throw new Error('Invalid spec ID');
     specIds.add(data.id);
    }catch(e){error(`${p}: ${e.message}`);}
   }
  }
  if([...pages.values()].some(p=>p.invariants?.length)&&fs.existsSync(safePath(root,'specs/invariants.json'))){
   const catalog=JSON.parse(read('specs/invariants.json'));
   if(!Array.isArray(catalog.invariants))throw new Error('Invalid invariant catalog');
   for(const i of catalog.invariants)invariantIds.add(i.id);
  }
  const incoming=new Set();
  for(const p of pages.values()){
   for(const [field,known] of [['sources',sources],['related',pages],['specs',specIds],['invariants',invariantIds]]){
    if(!Array.isArray(p[field]))continue;
    for(const ref of p[field]){if(!known.has(ref))error(`${p.id}: unknown ${field} reference ${ref}`);if(field==='related'&&ref!==p.id)incoming.add(ref);}
   }
  }
  for(const p of pages.values())if(pages.size>1&&!incoming.has(p.id))report.warnings.push(`${p.id}: no inbound related-page reference (index alone is navigational)`);
  // Check declared index page links for removed/renamed targets; not a Markdown parser.
  for(const [,rel] of index.matchAll(/\]\((pages\/[^)#]+\.md)\)/g))if(!paths.includes(`wiki/${rel}`))error(`Dangling index link: ${rel}`);
 }catch(e){error(e.message);}
 report.pages=pages.size;
 // SPEC-TOOL-014/R1-R2: a catalog refresh never reviews a dependent page.
 const obligations=new Map([...changed].map(source=>[source,[]]));
 for(const p of pages.values()){
  const revisions=p.source_revisions;
  if(revisions!==undefined && (!revisions||typeof revisions!=='object'||Array.isArray(revisions))){error(`${p.id}: invalid source_revisions mapping`);}
  const entries=revisions&&typeof revisions==='object'&&!Array.isArray(revisions)?revisions:{};
  for(const [source,revision] of Object.entries(entries)){
   if(!Array.isArray(p.sources)||!p.sources.includes(source)||!nonempty(revision)||!(/^(sha256:[a-f0-9]{64}|revision:.+)$/s.test(revision)))error(`${p.id}: invalid source_revisions entry ${source}`);
  }
  for(const source of Array.isArray(p.sources)?p.sources.filter(id):[]){
   if(!identities.has(source)||entries[source]!==identities.get(source)){
    if(!obligations.has(source))obligations.set(source,[]);
    obligations.get(source).push(p.id);
   }
  }
 }
 for(const [source,affected] of [...obligations].sort(([a],[b])=>a.localeCompare(b)))report.stale.push({source,pages:affected.sort()});
 report.analysisComplete=report.errors.length===0;
 return report;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2);
 if(args.length!==2||args[0]!=='--target'||!args[1]||args[1].startsWith('--')){console.error('Usage: node tooling/knowledge.mjs --target PATH');process.exitCode=1;}
 else{const report=checkKnowledge(args[1]);console.log(JSON.stringify(report,null,2));process.exitCode=report.errors.length||report.stale.length?1:0;}
}
