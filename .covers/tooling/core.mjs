import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import YAML from 'yaml';
import {VERSION,canonical,relativeSafe,safePath,walk,readJSON,adopt,audit} from './adoption.mjs';
export {VERSION,safePath,adopt,audit};
const states = ['draft','ready','in_progress','blocked','complete','verified_local','superseded'];
const terminalStates = ['complete','verified_local'];
const fileActions = ['add','modify','delete','rename'];
const fileStates = ['planned','changed','not_changed'];
// SPEC-TOOL-032/R1: parser messages can quote secrets, including duplicate keys.
function parseMetadata(front, file) {
  const lineCounter=new YAML.LineCounter();
  const doc=YAML.parseDocument(front,{lineCounter,prettyErrors:false,uniqueKeys:true,logLevel:'silent'});
  const failure=(offset,reason)=>{
    const {line,col}=lineCounter.linePos(offset??0);
    return new Error(`Invalid YAML: ${file}, line ${line+1}, column ${col}: ${reason}`);
  };
  if(doc.errors.length)throw failure(doc.errors[0].pos?.[0],'check YAML syntax and unique mapping keys');
  // IR032-R12-01: collection-key conversion otherwise logs private YAML outside
  // the sanitized error path. Reject it before conversion and silence the library.
  YAML.visit(doc,{
    Alias(_key,node){throw failure(node.range?.[0],'YAML aliases are not permitted; use explicit values');},
    Pair(_key,node){if(YAML.isCollection(node.key))throw failure(node.key.range?.[0],'mapping keys must be scalar values; collection keys are not supported');}
  });
  try {return doc.toJS({maxAliasCount:0});}
  catch {throw failure(0,'use a plain YAML metadata mapping without aliases');}
}
export function readSpecs(root) {
  return walk(root, 'specs').filter(p => /^specs\/(1_active|2_completed|history)\/.*\.md$/.test(p)).map(p => {
    let content;
    try {content=fs.readFileSync(safePath(root,p), 'utf8');}
    catch {throw new Error(`Cannot read spec file: ${p}; check file access and non-symlink path`);}
    const front = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    if (!front) throw new Error(`Missing frontmatter: ${p}`);
    const data = parseMetadata(front[1],p);
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error(`Invalid metadata: ${p}`);
    return { ...data, path:p };
  });
}
function cycle(records, field, errors) {
  const byId = new Map(records.map(r => [r.id, r]));
  const visiting = new Set(), visited = new Set();
  for (const record of records) {
    const stack = [{id:record.id,exit:false}];
    while(stack.length){
      const {id,exit}=stack.pop();
      if(exit){visiting.delete(id);visited.add(id);continue;}
      if(visiting.has(id)){errors.push(`${field} cycle: ${id}`);continue;}
      if(visited.has(id)||!byId.has(id))continue;
      visiting.add(id);stack.push({id,exit:true});
      const value=byId.get(id)[field];
      for(const ref of Array.isArray(value)?value:value?[value]:[])stack.push({id:ref,exit:false});
    }
  }
}
export function inspect(root, compareRegistry = true) {
  const errors = [];
  let specs, invariants;
  try {
    specs = readSpecs(root);
    const catalog = readJSON(safePath(root,'specs/invariants.json'));
    if (catalog.schema_version !== 1 || !Array.isArray(catalog.invariants)) throw new Error('Invalid invariant catalog');
    invariants = catalog.invariants;
  } catch (e) { return { errors:[e.message], specs:[] }; }
  const ids = new Set();
  const decisionRefs = new Set(specs.flatMap(s=>Array.isArray(s.key_decisions)?s.key_decisions.filter(Boolean).map(d=>`${s.id}/${d.id}`):[]));
  for (const s of specs) {
    if (typeof s.id !== 'string' || !/^SPEC-[A-Z0-9-]+$/.test(s.id) || ids.has(s.id)) errors.push(`Invalid or duplicate spec ID: ${s.id}`);
    ids.add(s.id);
    if (typeof s.description !== 'string' || !s.description.trim() || /[\r\n]/.test(s.description)) errors.push(`Invalid description: ${s.id}`);
    if (!states.includes(s.status)) errors.push(`Invalid status: ${s.path}, field status; permitted values: ${states.join(', ')}`);
    // SPEC-TOOL-019/R3: authoring preference is not an authorship prohibition.
    if(s.sdd_mode!==undefined&&!['spec-led','spec-as-source','spec-anchored'].includes(s.sdd_mode))errors.push(`Invalid SDD mode: ${s.id}`);
    if (typeof s.domain !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s.domain)) errors.push(`Invalid domain: ${s.id}`);
    if (!Object.hasOwn(s,'parent') || (s.parent !== null && typeof s.parent !== 'string')) errors.push(`Invalid parent: ${s.id}`);
    const historical = s.path.startsWith('specs/history/');
    if (s.status !== 'superseded' && ((s.path.startsWith('specs/2_completed/') || historical) !== terminalStates.includes(s.status))) errors.push(`Status/folder mismatch: ${s.path}; complete and verified_local belong in 2_completed or domain history`);
    // Local history stays readable after Git adoption; context is checked at readiness.
    if(s.status==='verified_local'&&(s.verification?.scope!=='local'||s.verification?.integration!=='unavailable'))errors.push(`Invalid local verification: ${s.path}; require verification.scope: local and verification.integration: unavailable`);
    if (historical && (s.path.split('/')[2] !== s.domain || s.path.split('/').length !== 4)) errors.push(`History domain/path mismatch: ${s.id}`);
    for (const key of ['depends_on','invariants','files','key_decisions']) if (!Array.isArray(s[key])) errors.push(`Missing array ${key}: ${s.id}`);
    if (s.requirements !== undefined && !Array.isArray(s.requirements)) errors.push(`Invalid requirements list: ${s.id}`);
    const requirementIds = new Set();
    for (const r of Array.isArray(s.requirements) ? s.requirements : []) {
      if (!r || !['id','source','summary'].every(key => typeof r[key] === 'string' && r[key].trim()) || requirementIds.has(r.id)) errors.push(`Invalid/duplicate requirement source: ${s.id}`);
      if (r) requirementIds.add(r.id);
    }
    const decisions = new Set();
    for (const d of Array.isArray(s.key_decisions) ? s.key_decisions : []) {
      if (!d || typeof d.id !== 'string' || !/^D[1-9][0-9]*$/.test(d.id) || decisions.has(d.id) || typeof d.decision !== 'string' || !d.decision.trim() || typeof d.rationale !== 'string' || !d.rationale.trim()) errors.push(`Invalid/duplicate key decision: ${s.id}`);
      if (d) decisions.add(d.id);
      if (d?.supersedes !== undefined && (typeof d.supersedes !== 'string' || d.supersedes === `${s.id}/${d.id}` || !decisionRefs.has(d.supersedes))) errors.push(`Unresolved/self superseded decision: ${s.id}`);
    }
    if(!Array.isArray(s.files))errors.push(`Invalid file record list: ${s.path}, field files; require an array of {path, action, state} records`);
    for (const [i,f] of (Array.isArray(s.files) ? s.files : []).entries()) {
      const field=`${s.path}, files[${i}]`;
      if(!f||typeof f!=='object'||Array.isArray(f)){errors.push(`Invalid file record: ${field}; require {path, action, state}`);continue;}
      if(typeof f.path!=='string'||!relativeSafe(f.path.replace(/\/$/,'')))errors.push(`Invalid file record: ${field}.path; use a repository-relative path without traversal`);
      else {try {safePath(root,f.path.replace(/\/$/,''));}catch {errors.push(`Invalid file record: ${field}.path; Symlink or inaccessible/non-directory ancestor refused`);}}
      if(!fileActions.includes(f.action))errors.push(`Invalid file record: ${field}.action; permitted values: ${fileActions.join(', ')}`);
      if(!fileStates.includes(f.state))errors.push(`Invalid file record: ${field}.state; permitted values: ${fileStates.join(', ')}`);
      // SPEC-TOOL-013/R2: path spelling never grants a different operation.
      if (typeof f.path === 'string' && /[*?\[\]{}]/.test(f.path)) errors.push(`Wildcard file record: ${field}.path; use an exact path or trailing-slash directory scope`);
      if (f?.action === 'rename') {
        if (!relativeSafe(f.from) || /[*?\[\]{}]/.test(f.from) || typeof f.path!=='string' || f.path.endsWith('/') || f.from === f.path) errors.push(`Invalid rename source/destination: ${field}.from/path; require distinct exact repository-relative files`);
        else { try { safePath(root,f.from); } catch { errors.push(`Invalid file record: ${field}.from; Symlink or inaccessible/non-directory ancestor refused`); } }
      } else if (Object.hasOwn(f,'from')) errors.push(`from is valid only for rename: ${field}.from`);
    }
  }
  const invariantIds = new Set();
  for (const inv of invariants) {
    if (!inv || typeof inv.id !== 'string' || !/^INV-[A-Z0-9-]+$/.test(inv.id) || invariantIds.has(inv.id)) { errors.push('Invalid or duplicate invariant ID'); continue; }
    invariantIds.add(inv.id);
    if (!['candidate','accepted','deprecated','rejected'].includes(inv.status) || typeof inv.statement !== 'string' || !inv.statement.trim()) errors.push(`Invalid invariant: ${inv.id}`);
    if (!ids.has(inv.introduced_by)) errors.push(`Unknown introducing spec: ${inv.id}`);
    if (inv.status === 'accepted' && (!Array.isArray(inv.checks) || !inv.checks.length)) errors.push(`No checks for accepted invariant: ${inv.id}`);
    for (const check of Array.isArray(inv.checks) ? inv.checks : []) {
      if (!check || typeof check !== 'object' || Array.isArray(check)) { errors.push(`Invalid invariant check: ${inv.id}`); continue; }
      if (typeof check.name !== 'string' || !check.name.trim()) errors.push(`Unnamed check: ${inv.id}`);
      if (check.path) { try { if (!fs.existsSync(safePath(root,check.path))) errors.push(`Missing check file: ${inv.id}`); } catch(e) { errors.push(e.message); } }
      else if (check.kind !== 'manual') errors.push(`Check needs path or manual kind: ${inv.id}`);
    }
  }
  for (const s of specs) {
    if(s.amends !== undefined && !Array.isArray(s.amends)) errors.push(`Invalid amends list: ${s.id}`);
    for (const ref of [s.parent, ...(Array.isArray(s.depends_on) ? s.depends_on : []), ...(Array.isArray(s.amends) ? s.amends : [])].filter(Boolean)) if (typeof ref !== 'string' || !ids.has(ref) || ref === s.id) errors.push(`Unresolved/self spec reference: ${s.id} -> ${ref}`);
    for (const ref of Array.isArray(s.invariants) ? s.invariants : []) if (!invariantIds.has(ref)) errors.push(`Unknown invariant: ${s.id} -> ${ref}`);
  }
  cycle(specs,'parent',errors); cycle(specs,'depends_on',errors); cycle(specs,'amends',errors);
  cycle(specs.flatMap(s => Array.isArray(s.key_decisions) ? s.key_decisions.filter(Boolean).map(d=>({id:`${s.id}/${d.id}`,supersedes:d.supersedes})) : []),'supersedes',errors);
  const registry = {schema_version:1,specs:[...specs].sort((a,b)=>a.id.localeCompare(b.id))};
  if (compareRegistry) {
    try { if (canonical(readJSON(safePath(root,'specs/spec-registry.json'))) !== canonical(registry)) errors.push('Registry differs from spec frontmatter; review then run index'); }
    catch(e) { errors.push(`Registry: ${e.message}`); }
  }
  return {errors,specs,registry};
}
export function index(root) {
  const report = inspect(root,false);
  if (report.errors.length) throw new Error(report.errors.join('\n'));
  fs.writeFileSync(safePath(root,'specs/spec-registry.json'), JSON.stringify(report.registry,null,2)+'\n');
  return report.registry;
}
export function archive(root, id) {
  const report=inspect(root);
  if(report.errors.length)throw new Error(report.errors.join('\n'));
  const spec=report.specs.find(s=>s.id===id);
  if(!spec || !terminalStates.includes(spec.status) || !spec.path.startsWith('specs/2_completed/'))throw new Error('Archive requires a complete or verified_local spec in 2_completed');
  const destination=`specs/history/${spec.domain}/${path.basename(spec.path)}`;
  const dest=safePath(root,destination),original=safePath(root,spec.path);
  if(fs.existsSync(dest))throw new Error('Archive destination exists');
  fs.mkdirSync(path.dirname(dest),{recursive:true});
  // Copy exclusively before unlink: never replace an existing historical record.
  fs.copyFileSync(original,dest,fs.constants.COPYFILE_EXCL);
  fs.unlinkSync(original);
  index(root);
  return {id,from:spec.path,to:destination,note:'Permanent record and status preserved; review path-based links and retain the move plus registry together.'};
}
export function search(root, {query='',domain,status,limit=50,offset=0}={}) {
  if(!Number.isInteger(limit)||limit<1||limit>200||!Number.isInteger(offset)||offset<0)throw new Error('Use limit 1–200 and nonnegative integer offset');
  const registry=readJSON(safePath(root,'specs/spec-registry.json'));
  if(registry.schema_version!==1||!Array.isArray(registry.specs))throw new Error('Invalid registry; validate and rebuild index');
  const words=query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const matches=registry.specs.filter(s=>{
    if(domain&&s.domain!==domain || status&&s.status!==status)return false;
    const text=JSON.stringify([s.id,s.description,s.domain,s.key_decisions,s.invariants,s.requirements]).toLowerCase();
    return words.every(word=>text.includes(word));
  }).sort((a,b)=>a.id.localeCompare(b.id));
  return {total:matches.length,offset,limit,items:matches.slice(offset,offset+limit).map(({id,path,description,domain,status})=>({id,path,description,domain,status})),note:'Registry snapshot only; validate freshness and read the full spec before execution.'};
}

// SPEC-TOOL-032/R2: prove absence conservatively without executing Git or altering
// inherited context. All GIT_* overrides are unsupported, including empty values.
function noGitContext(root) {
  if(Object.keys(process.env).some(key=>/^GIT_/i.test(key)))return 'No-Git context unavailable: inherited GIT_* environment overrides; review the environment without discarding its configuration';
  try {
    const ancestors=[];
    for(let current=path.resolve(root);;current=path.dirname(current)){
      ancestors.push(current);if(path.dirname(current)===current)break;
    }
    // Inspect parents first so no lstat/readdir follows a redirected ancestor.
    for(const current of ancestors.reverse()){
      const stat=fs.lstatSync(current);
      if(stat.isSymbolicLink()||!stat.isDirectory())return 'No-Git context unavailable: target or ancestor is redirected or not a directory';
      // Probe only repository markers; enumerating unrelated ancestor contents
      // is unnecessary and can require broader access than inspecting these paths.
      const has=name=>{
        try {fs.lstatSync(path.join(current,name));return true;}
        catch(e){if(e.code!=='ENOENT')throw e;return false;}
      };
      if(has('.git'))return 'No-Git context unavailable: target or ancestor has a .git marker';
      // IR032-R12-02: commondir may locate objects/refs elsewhere; its presence
      // with HEAD is enough to reject local closure without following the pointer.
      if(has('HEAD')&&(has('commondir')||has('objects')||has('refs')||has('packed-refs')||has('config')))return 'No-Git context unavailable: target or ancestor resembles a bare repository';
    }
    return null;
  } catch {return 'No-Git context unavailable: filesystem inspection failed; check target and ancestor access';}
}

// SPEC-TOOL-013/R4, SPEC-TOOL-032/R2: metadata is not execution or approval evidence.
export function readiness(root, selected, {phase='execute', report=inspect(root),requireIntegratedPrerequisites=false}={}) {
  const errors=[...report.errors], byId=new Map(report.specs.map(s=>[s.id,s]));
  const validPhase=['execute','complete','local'].includes(phase);
  if (!validPhase) errors.push('Readiness phase must be execute, complete or local');
  if (!Array.isArray(selected) || !selected.length || selected.some(id=>typeof id!=='string'||!id) || new Set(selected).size!==selected.length) {
    return {phase,selected:[],errors:[...errors,'Explicit unique spec IDs are required'],eligible:[]};
  }
  const evidence = s => {
    const v=s.verification;
    if (!v || v.outcome!=='passed' || typeof v.revision!=='string' || !v.revision.trim() || !Array.isArray(v.evidence) || !v.evidence.length) {
      errors.push(`Missing completion evidence: ${s.id}`); return;
    }
    for(const ref of v.evidence) {
      try { if(!relativeSafe(ref) || !fs.statSync(safePath(root,ref)).isFile()) throw new Error('not a local evidence file'); }
      catch { errors.push(`Invalid completion evidence reference: ${s.id} -> ${ref}`); }
    }
  };
  const acceptance = s => {
    const seen=new Set();
    if(!Array.isArray(s.acceptance)||!s.acceptance.length) {errors.push(`Missing acceptance criteria: ${s.id}`);return;}
    for(const a of s.acceptance){
      if(!a || typeof a.id!=='string'||!a.id.trim() || seen.has(a.id) || typeof a.description!=='string'||!a.description.trim())errors.push(`Invalid acceptance criterion: ${s.id}`);
      if(a)seen.add(a.id);
    }
  };
  let contextChecked=false,contextError;
  const localContext=()=>{
    if(!contextChecked){contextError=noGitContext(root);contextChecked=true;}
    if(contextError)errors.push(contextError);
  };
  const localEvidence=s=>{
    if(s.verification?.scope!=='local'||s.verification?.integration!=='unavailable')errors.push(`Missing local verification declaration: ${s.id}; require verification.scope: local and verification.integration: unavailable`);
    evidence(s);
  };
  const integratedEvidence=s=>{
    evidence(s);
    if(s.verification?.scope==='local'||s.verification?.integration==='unavailable')errors.push(`Local-only evidence cannot establish integrated completion: ${s.id}; use a new integration/amendment record`);
  };
  const eligible=[];
  for(const id of selected){
    const before=errors.length, s=byId.get(id);
    if(!s){errors.push(`Unknown selected spec: ${id}`);continue;}
    if(!['ready','in_progress',...(phase==='complete'?['complete']:phase==='local'?['verified_local']:[])].includes(s.status))errors.push(`Selected spec is not executable: ${id} (${states.includes(s.status)?s.status:'invalid status; see validation'})`);
    acceptance(s);
    if(phase==='complete')integratedEvidence(s);
    if(phase==='local'){localContext();localEvidence(s);}
    const stack=[...(Array.isArray(s.depends_on)?s.depends_on:[])],visited=new Set();
    while(stack.length){
      const depId=stack.pop();if(visited.has(depId))continue;visited.add(depId);
      const dep=byId.get(depId);
      const localDependency=dep?.status==='verified_local'&&phase!=='complete'&&!requireIntegratedPrerequisites;
      if(!dep || (dep.status!=='complete'&&!localDependency)){errors.push(`Prerequisite not complete: ${id} -> ${depId}. Use depends_on only when completion is required; use amends for lineage or parent for coordination.`);continue;}
      acceptance(dep);
      if(localDependency){localContext();localEvidence(dep);}else integratedEvidence(dep);
      stack.push(...(Array.isArray(dep.depends_on)?dep.depends_on:[]));
    }
    if(validPhase&&errors.length===before)eligible.push(id);
  }
  return {phase,selected,eligible:report.errors.length?[]:eligible,errors,limitation:'Checks declared criteria, prerequisite states and evidence references only; never executes commands or verifies approval, semantic truth or evidence freshness.'};
}

// SPEC-TOOL-013/R1-R3: compare layers independently; cancellation cannot hide index changes.
export function drift(root, base, {specs=[],mode='local',policy='enforce'}={}) {
  if (typeof base !== 'string' || !base || base.startsWith('-')) throw new Error('A non-option Git base ref is required');
  if(!['local','branch','index','worktree'].includes(mode))throw new Error('Drift mode must be local, branch, index or worktree');
  if(!['enforce','report'].includes(policy))throw new Error('Drift policy must be enforce or report');
  const git = args => execFileSync('git',['-C',root,...args],{encoding:'utf8',maxBuffer:10*1024*1024});
  const mergeBase=git(['merge-base','HEAD',base]).trim();
  const changes=[];
  function diff(layer,args){
    const fields=git(['diff','--name-status','-z','--find-renames',...args,'--']).split('\0').filter(Boolean);
    for(let i=0;i<fields.length;){
      const status=fields[i++],from=fields[i++];
      if(status.startsWith('R')||status.startsWith('C'))changes.push({layer,status,action:status.startsWith('R')?'rename':'unsupported',from,path:fields[i++]});
      else changes.push({layer,status,action:({A:'add',M:'modify',D:'delete'})[status]??'unsupported',path:from});
    }
  }
  if(mode==='local'||mode==='branch')diff('branch',[mergeBase,'HEAD']);
  if(mode==='local'||mode==='index')diff('index',['--cached','HEAD']);
  if(mode==='local'||mode==='worktree'){
    diff('worktree',[]);
    for(const p of git(['ls-files','--others','--exclude-standard','-z']).split('\0').filter(Boolean))changes.push({layer:'worktree',status:'?',action:'add',path:p});
  }
  // SPEC-TOOL-019/R2: a plain quick note needs no formal catalog; partial formal setups still fail.
  let report;
  try {
    const minimal=policy==='report'&&!readSpecs(root).length&&!['specs/invariants.json','specs/spec-registry.json'].some(p=>fs.existsSync(safePath(root,p)));
    report=minimal?{specs:[],errors:[]}:inspect(root);
  } catch(e){report={specs:[],errors:[e.message]};}
  const metadata=p=>p.startsWith('specs/');
  const metadataOnly=changes.every(c=>metadata(c.path)&&(!c.from||metadata(c.from)));
  // Git drift always requires integrated prerequisites, even if metadata was
  // supplied to readiness or Git itself discovers externally located metadata.
  const ready=(metadataOnly||policy==='report')&&Array.isArray(specs)&&!specs.length?{eligible:[],errors:report.errors}:readiness(root,specs,{report,requireIntegratedPrerequisites:true});
  const errors=[...ready.errors];
  const warnings=policy==='report'&&!specs.length?['No formal specs selected: changes are visible but quick-note intent and semantic compliance are not checked.']:[];
  const active=report.specs.filter(s=>ready.eligible.includes(s.id));
  const mismatched=new Set();
  for(const layer of ['branch','index']){
    if(!changes.some(c=>c.layer===layer&&(!metadata(c.path)||(c.from&&!metadata(c.from)))))continue;
    const pending=git(['diff','--name-only','-z',...(layer==='branch'?['HEAD']:[]),'--','specs/'])+
      git(['ls-files','--others','--exclude-standard','-z','--','specs/']);
    if(pending){mismatched.add(layer);(policy==='report'?warnings:errors).push(`Spec metadata snapshot mismatch for ${layer}; review/stage or commit metadata before checking that snapshot`);}
  }
  const pathMatch=(p,scope)=>scope===p || (scope.endsWith('/')&&p.startsWith(scope));
  const available=active.flatMap(s=>s.files).filter(f=>f&&typeof f.path==='string'&&f.state!=='not_changed');
  const matches=(p,action)=>available.some(f=>f.action===action&&pathMatch(p,f.path));
  const uncovered=changes.filter(c=>{
    if(metadata(c.path)&&(!c.from||metadata(c.from)))return false;
    if(mismatched.has(c.layer))return true;
    if(c.action==='rename')return !available.some(f=>f.action==='rename'&&f.path===c.path&&f.from===c.from) &&
      !(matches(c.from,'delete')&&matches(c.path,'add'));
    return !matches(c.path,c.action);
  });
  const changed=[...new Set(changes.flatMap(c=>c.from?[c.from,c.path]:[c.path]))].sort();
  const unmapped=[...new Set(uncovered.flatMap(c=>c.from?[c.from,c.path]:[c.path]))].sort();
  const outcome=errors.length?'incomplete':unmapped.length?'unmapped':'mapped';
  return {mergeBase,mode,policy,outcome,warnings,metadataOnly,selected:specs,changes,changed,uncovered,unmapped,errors,limitation:'Typed path accountability for selected specs only. Specs metadata requires review. Run behavioral acceptance separately; this is not semantic compliance or hosted enforcement.'};
}
