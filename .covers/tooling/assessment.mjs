// SPEC-TOOL-021/R1-R4: bounded assessment helpers; no implicit writes, network or execution.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import YAML from 'yaml';
import {safePath} from './core.mjs';

const readJSON=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const relative=(root,file)=>path.relative(root,file).replaceAll('\\','/');
const sha256=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const exact=value=>typeof value==='string'&&value.trim()&&!/^(?:file|link|workspace|git|https?):/i.test(value)&&!/[<>=*^~|]/.test(value);
const directNames=manifest=>new Set(['dependencies','devDependencies','optionalDependencies','peerDependencies'].flatMap(k=>Object.keys(manifest?.[k]||{})));
const classification=resolved=>typeof resolved==='string'&&/^https:\/\/registry\.npmjs\.org\//i.test(resolved)?'public-candidate':'unknown';

function npmInventory(root,file){
 const lock=readJSON(file);if(![2,3].includes(lock.lockfileVersion)||!lock.packages||typeof lock.packages!=='object')throw new Error('Unsupported or malformed package-lock.json; require lockfileVersion 2 or 3 packages data');
 const direct=directNames(lock.packages['']||{}),records=[];
 for(const [location,item] of Object.entries(lock.packages)){
  if(!location||!item||typeof item!=='object')continue;
  const marker='node_modules/';const at=location.lastIndexOf(marker);if(at<0)continue;
  const name=location.slice(at+marker.length);if(!name||!exact(item.version))throw new Error(`Non-exact package-lock record: ${location}`);
  records.push({ecosystem:'npm',name,version:item.version,direct:direct.has(name),classification:classification(item.resolved),source:relative(root,file)});
 }
 return records;
}
function pnpmKey(key){
 let value=String(key).replace(/^\//,'').replace(/\(.+$/,'');const split=value.lastIndexOf('@');
 if(split<=0)return null;const name=value.slice(0,split),version=value.slice(split+1);return name&&exact(version)?{name,version}:null;
}
function pnpmInventory(root,file){
 const lock=YAML.parse(fs.readFileSync(file,'utf8'),{maxAliasCount:0,uniqueKeys:true});if(!lock||typeof lock!=='object'||!lock.packages||typeof lock.packages!=='object')throw new Error('Unsupported or malformed pnpm-lock.yaml; require packages data');
 const direct=new Set();const importer=lock.importers?.['.']||{};
 for(const kind of ['dependencies','devDependencies','optionalDependencies'])for(const [name,value] of Object.entries(importer[kind]||{})){
  const raw=typeof value==='string'?value:value?.version;const version=typeof raw==='string'?raw.replace(/\(.+$/,''):'';if(exact(version))direct.add(`${name}@${version}`);
 }
 const records=[];for(const [key,item] of Object.entries(lock.packages)){const parsed=pnpmKey(key);if(!parsed)throw new Error(`Non-exact pnpm package record: ${key}`);records.push({ecosystem:'npm',...parsed,direct:direct.has(`${parsed.name}@${parsed.version}`),classification:classification(item?.resolution?.tarball),source:relative(root,file)});}
 return records;
}
function normalizePackages(records){
 const byKey=new Map();for(const item of records){const key=`${item.ecosystem}\0${item.name}\0${item.version}`;const prior=byKey.get(key);byKey.set(key,prior?{...prior,direct:prior.direct||item.direct,classification:prior.classification==='public-candidate'||item.classification==='public-candidate'?'public-candidate':'unknown'}:item);}
 return [...byKey.values()].sort((a,b)=>a.name.localeCompare(b.name)||a.version.localeCompare(b.version));
}
export function inventoryDependencies(root){
 const npm=safePath(root,'package-lock.json'),pnpm=safePath(root,'pnpm-lock.yaml');let file,packages;
 if(fs.existsSync(npm)){file=npm;packages=npmInventory(root,file);}else if(fs.existsSync(pnpm)){file=pnpm;packages=pnpmInventory(root,file);}else throw new Error('Supported lockfile required: package-lock.json v2/v3 or pnpm-lock.yaml with packages data');
 const normalized=normalizePackages(packages);return {schema_version:1,lockfile:relative(root,file),ecosystems:['npm'],packageCount:normalized.length,packages:normalized,limitations:['Classification is conservative metadata evidence, not proof that a package is public, private, safe or reachable.']};
}

const triage=`# Dependency advisory triage\n\nRecord provider/date, package-version count, query errors, affected records and distinct advisory IDs. For every match assess authoritative ranges, withdrawal, prerequisites, platform, runtime/build/development role, reachability and containment. A match is not automatically exploitable; no match is not security clearance.\n\n| Package/version | Advisory IDs | Role and path | Preconditions/reachability | Disposition and covering spec |\n|---|---|---|---|---|\n| Pending | Pending | Pending | Pending | Pending |\n\nDo not auto-upgrade. Keep sensitive detail access-controlled and retain only a sanitized shared summary.\n`;
export function scaffoldDependencyReview(root,outputDir){
 const inventory=inventoryDependencies(root),dir=safePath(root,outputDir);if(fs.existsSync(dir))throw new Error(`Output already exists: ${outputDir}`);fs.mkdirSync(dir,{recursive:true});
 const authorization={schema_version:1,provider:'osv',endpoint:'https://api.osv.dev/v1/querybatch',approved:false,approved_by:'',packages:inventory.packages.filter(p=>p.classification==='public-candidate').map(({ecosystem,name,version})=>({ecosystem,name,version,classification:'public'})),note:'Review every record. Remove private/unknown packages and set approved only with actual disclosure authority.'};
 fs.writeFileSync(path.join(dir,'inventory.json'),JSON.stringify(inventory,null,2)+'\n',{flag:'wx'});fs.writeFileSync(path.join(dir,'authorization.json'),JSON.stringify(authorization,null,2)+'\n',{flag:'wx'});fs.writeFileSync(path.join(dir,'triage.md'),triage,{flag:'wx'});
 return {inventory:`${outputDir}/inventory.json`,authorization:`${outputDir}/authorization.json`,triage:`${outputDir}/triage.md`,packageCount:inventory.packageCount};
}
export async function queryAdvisories(inventory,authorization,{fetcher=globalThis.fetch}={}){
 if(!inventory||inventory.schema_version!==1||!Array.isArray(inventory.packages))throw new Error('Invalid dependency inventory');
 if(!authorization||authorization.approved!==true||typeof authorization.approved_by!=='string'||!authorization.approved_by.trim())throw new Error('External advisory query is not approved');
 if(authorization.provider!=='osv'||authorization.endpoint!=='https://api.osv.dev/v1/querybatch')throw new Error('Unsupported advisory provider or endpoint');
 if(!Array.isArray(authorization.packages)||!authorization.packages.length)throw new Error('No authorized public packages');
 const inventoryKeys=new Set(inventory.packages.map(p=>`${p.ecosystem}\0${p.name}\0${p.version}`)),seen=new Set();
 for(const item of authorization.packages){const key=`${item?.ecosystem}\0${item?.name}\0${item?.version}`;if(item?.classification!=='public')throw new Error('Every disclosed package must be explicitly classified public');if(!inventoryKeys.has(key))throw new Error(`Authorized package is absent from inventory: ${item?.name}@${item?.version}`);if(seen.has(key))throw new Error(`Duplicate authorized package: ${item.name}@${item.version}`);seen.add(key);}
 // SPEC-TOOL-028/R3: disclosure approval covers this endpoint, never a redirect target.
 const queries=authorization.packages.map(p=>({package:{ecosystem:p.ecosystem,name:p.name},version:p.version}));const response=await fetcher(authorization.endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({queries}),redirect:'error',signal:AbortSignal.timeout(30000)});if(response?.redirected)throw new Error('Advisory provider redirect is not authorized');if(!response?.ok)throw new Error(`Advisory provider request failed: ${response?.status??'unknown'}`);
 const body=await response.json();if(!Array.isArray(body?.results)||body.results.length!==queries.length)throw new Error('Advisory provider returned an invalid result count');
 // SPEC-TOOL-028/R1-R2: preserve valid findings without treating partial evidence as complete.
 const findings=[],queryErrors=[];
 body.results.forEach((result,index)=>{
  const requested=authorization.packages[index],error=detail=>queryErrors.push({package:requested,error:detail});
  if(!result||typeof result!=='object'||Array.isArray(result)){error('Malformed advisory result: expected an object');return;}
  if(Object.hasOwn(result,'error'))error(`Provider query error: ${JSON.stringify(result.error)}`);
  const ids=[];
  if(Object.hasOwn(result,'vulns')){
   if(!Array.isArray(result.vulns))error('Malformed advisory result: vulns must be an array');
   else for(const vuln of result.vulns){
    if(!vuln||typeof vuln!=='object'||Array.isArray(vuln)||typeof vuln.id!=='string'||!vuln.id.trim())error('Malformed vulnerability record: expected a nonblank string id');
    else ids.push(vuln.id);
   }
  }
  if(Object.hasOwn(result,'next_page_token')){
   if(typeof result.next_page_token!=='string')error('Malformed advisory result: next_page_token must be a string');
   else if(result.next_page_token.length)error('Advisory pagination remains incomplete; additional pages were not requested');
  }
  if(ids.length)findings.push({...requested,advisoryIds:[...new Set(ids)].sort()});
 });
 return {schema_version:1,provider:authorization.provider,endpoint:authorization.endpoint,approved_by:authorization.approved_by,outcome:queryErrors.length?'incomplete':'complete',packageVersionCount:queries.length,affectedPackageVersionCount:findings.length,uniqueAdvisoryIds:[...new Set(findings.flatMap(f=>f.advisoryIds))].sort(),queryErrors,findings,limitations:'Completeness covers only the authorized query subset. Version matches require authoritative detail and reachability review; absence is not security clearance.'};
}

const asList=value=>Array.isArray(value)?value:value===undefined?[]:[value];
const finding=(service,check,status,detail)=>({service,check,status,detail});
function portLoopback(port){if(typeof port==='object'&&port)return ['127.0.0.1','::1','localhost'].includes(String(port.host_ip||''));if(typeof port!=='string')return false;const fields=port.split(':');return fields.length>=3&&['127.0.0.1','[::1]','localhost'].includes(fields[0]);}
export function dockerPreflight(root,composePath){
 const file=safePath(root,composePath);const doc=YAML.parse(fs.readFileSync(file,'utf8'),{maxAliasCount:100,uniqueKeys:true,merge:true});if(!doc||typeof doc!=='object'||!doc.services||typeof doc.services!=='object')throw new Error('Compose file requires a services object');
 const networks=doc.networks||{},findings=[],services=[];
 for(const [name,service] of Object.entries(doc.services)){
  if(!service||typeof service!=='object')throw new Error(`Invalid Compose service: ${name}`);services.push(name);const user=service.user===undefined?'':String(service.user);findings.push(finding(name,'non-root',!user?'unknown':/^(?:0(?::|$)|root(?::|$))/i.test(user)?'fail':'pass',user||'user not declared'));
  findings.push(finding(name,'read-only',service.read_only===true?'pass':service.read_only===false?'fail':'unknown',`read_only=${String(service.read_only)}`));
  const drops=asList(service.cap_drop).map(String);findings.push(finding(name,'cap-drop',drops.some(x=>x.toUpperCase()==='ALL')?'pass':drops.length?'fail':'unknown',drops.join(', ')||'cap_drop not declared'));
  const security=asList(service.security_opt).map(String);findings.push(finding(name,'no-new-privileges',security.some(x=>/^no-new-privileges(?::true)?$/i.test(x))?'pass':security.length?'fail':'unknown',security.join(', ')||'security_opt not declared'));
  const volumes=asList(service.volumes);findings.push(finding(name,'mounts',volumes.length?'review':'pass',volumes.length?`${volumes.length} mount(s) require review`:'no mounts declared'));
  findings.push(finding(name,'privileged',service.privileged===true?'fail':service.privileged===false?'pass':'unknown',`privileged=${String(service.privileged)}`));
  const networkMode=service.network_mode===undefined?'':String(service.network_mode);findings.push(finding(name,'network-mode',networkMode==='host'?'fail':networkMode?'review':'pass',networkMode||'default Compose networking'));
  const hostNamespaces=[['pid',service.pid],['ipc',service.ipc]].filter(([,value])=>String(value||'').toLowerCase()==='host').map(([key])=>key);findings.push(finding(name,'host-namespaces',hostNamespaces.length?'fail':'pass',hostNamespaces.length?`host ${hostNamespaces.join(', ')}`:'no host pid/ipc namespace declared'));
  const devices=asList(service.devices);findings.push(finding(name,'devices',devices.length?'review':'pass',devices.length?`${devices.length} device mapping(s) require review`:'no devices declared'));
  const ports=asList(service.ports);findings.push(finding(name,'port-loopback',ports.length&&ports.some(p=>!portLoopback(p))?'fail':'pass',ports.length?`${ports.length} published port(s)`:'no published ports'));
  const refs=asList(service.networks instanceof Object&&!Array.isArray(service.networks)?Object.keys(service.networks):service.networks);const internal=refs.filter(ref=>networks?.[ref]?.internal===true);findings.push(finding(name,'internal-network',!refs.length?'unknown':internal.length===refs.length?'pass':internal.length?'review':'fail',refs.join(', ')||'networks not declared'));
  findings.push(finding(name,'healthcheck',service.healthcheck&&service.healthcheck.disable!==true?'pass':'unknown',service.healthcheck?'declared':'not declared'));
 }
 return {schema_version:1,compose:composePath,services:services.sort(),findings,dynamicChecks:['Start only with separate authorization and verify actual filesystem writes under read-only operation.','Inspect effective port bindings and mounts from the running engine, not configuration alone.','Probe application and browser egress harmlessly inside the enforced runtime boundary.','Verify health, non-root identity, capabilities, security options, resource limits, startup/shutdown and recovery.'],limitation:'Static Compose review only; this command does not contact Docker, start services or prove isolation.'};
}

function verificationConfig(root,configPath,profile){
 const config=readJSON(safePath(root,configPath));if(config.schema_version!==1||!config.profiles||!Array.isArray(config.profiles[profile]))throw new Error(`Invalid verification config/profile: ${profile}`);
 const commands=config.profiles[profile].map(item=>{if(!item||typeof item.id!=='string'||!item.id||typeof item.command!=='string'||!item.command||/[\r\n]/.test(item.command)||!Array.isArray(item.args)||item.args.some(a=>typeof a!=='string')||item.cwd!==undefined&&typeof item.cwd!=='string')throw new Error(`Invalid verification command in ${profile}`);if(item.cwd)safePath(root,item.cwd);return {id:item.id,command:item.command,args:item.args,cwd:item.cwd||'.',required:item.required!==false,timeout_ms:Number.isInteger(item.timeout_ms)&&item.timeout_ms>0?item.timeout_ms:300000};});
 // SPEC-TOOL-030/R2: reject the whole selected profile before plan or run can proceed.
 if(process.platform==='win32')for(const item of commands)if(/\.(?:cmd|bat)$/i.test(item.command))throw new Error(`Windows batch launcher is unsupported with shell:false (${profile}/${item.id}): ${item.command}. Use a reviewed native executable or node.exe with a reviewed absolute JavaScript entrypoint such as npm-cli.js; npm still uses its own script shell. See methodology/assessment-tooling.md.`);
 if(new Set(commands.map(c=>c.id)).size!==commands.length)throw new Error(`Duplicate verification command ID in ${profile}`);return commands;
}
export function verificationPlan(root,configPath,profile){return {schema_version:1,profile,executed:false,commands:verificationConfig(root,configPath,profile),note:'Plan only. Inspect commands and use explicit --run to execute without a shell.'};}
const bounded=value=>String(value||'').slice(0,20000);
export function runVerification(root,configPath,profile){
 const commands=verificationConfig(root,configPath,profile),results=[];let requiredFailure=false;
 // SPEC-TOOL-028/R4: empty plans are valid; running one supplies no verification evidence.
 if(!commands.length)return {schema_version:1,profile,executed:false,outcome:'incomplete',results,reason:'No verification commands configured; add reviewed commands before running this profile.',limitation:'No checks were executed; this is not verification or release approval.'};
 for(const command of commands){const start=Date.now(),run=spawnSync(command.command,command.args,{cwd:safePath(root,command.cwd==='.'?'':command.cwd),encoding:'utf8',shell:false,windowsHide:true,timeout:command.timeout_ms,maxBuffer:1024*1024});const result={id:command.id,command:command.command,args:command.args,cwd:command.cwd,required:command.required,exitCode:run.status,signal:run.signal||null,durationMs:Date.now()-start,stdout:bounded(run.stdout),stderr:bounded(run.stderr),error:run.error?.message||null};results.push(result);if(command.required&&(run.status!==0||run.error)){requiredFailure=true;break;}}
 const optionalFailure=results.some((r,i)=>!commands[i].required&&(r.exitCode!==0||r.error));return {schema_version:1,profile,executed:true,outcome:requiredFailure?'failed':optionalFailure?'passed-with-warnings':'passed',results,limitation:'Execution of reviewed local commands is not semantic proof or release approval.'};
}

export function closeoutReceipt(root,manifestPath){
 const manifest=readJSON(safePath(root,manifestPath));if(manifest.schema_version!==1||typeof manifest.spec!=='string'||!manifest.spec||typeof manifest.revision!=='string'||!manifest.revision||typeof manifest.scope!=='string'||!manifest.scope||!Array.isArray(manifest.checks)||!Array.isArray(manifest.limitations)||!Array.isArray(manifest.residual_risks))throw new Error('Invalid closeout manifest');
 const context=manifest.context===undefined?{}:manifest.context;if(!context||typeof context!=='object'||Array.isArray(context))throw new Error('Invalid closeout context');
 const checks=manifest.checks.map(check=>{if(!check||typeof check.id!=='string'||!check.id||!['passed','failed','blocked','not-run'].includes(check.outcome)||!Array.isArray(check.evidence)||!check.evidence.length)throw new Error('Invalid closeout check');const evidence=check.evidence.map(ref=>{let file;try{file=safePath(root,ref);}catch{throw new Error(`Unsafe evidence path: ${ref}`);}if(!fs.existsSync(file)||!fs.statSync(file).isFile())throw new Error(`Missing evidence: ${ref}`);return {path:ref,sha256:sha256(file),bytes:fs.statSync(file).size};});return {id:check.id,outcome:check.outcome,evidence};});
 // SPEC-TOOL-028/R4: no checks cannot pass by vacuous truth.
 const outcome=checks.length&&checks.every(c=>c.outcome==='passed')?'passed':checks.some(c=>c.outcome==='failed')?'failed':'incomplete';return {schema_version:1,spec:manifest.spec,revision:manifest.revision,scope:manifest.scope,context,outcome,checks,limitations:manifest.limitations,residual_risks:manifest.residual_risks,limitation:'Evidence aggregation and hashing do not execute checks, validate claims or grant release approval.'};
}

export function writeJson(root,relativePath,value){const file=safePath(root,relativePath);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n',{flag:'wx'});return relativePath;}
