import {readFile,readdir} from 'node:fs/promises';
import {join} from 'node:path';
import assert from 'node:assert/strict';
const base=process.env.VITE_BASE_PATH||'/family-wealth-empire/';
const html=await readFile('dist/index.html','utf8');
assert(html.includes(`src="${base}assets/`),'Entry script must use the project base path');
assert(!html.includes('src="/assets/'),'Root asset paths would break project Pages');
const worker=await readFile('dist/sw.js','utf8');assert(worker.includes(`const BASE=${JSON.stringify(base)}`),'Worker must cache only its project path');
async function walk(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const path=join(dir,entry.name);if(entry.isDirectory())await walk(path);else{
 assert(!/^\.env/.test(entry.name),'Environment files must not be published');
 if(!/\.(?:js|html|css|json)$/.test(path))continue;
 const body=await readFile(path,'utf8');assert(!/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(body),'Private key detected');assert(!/sb_secret_[A-Za-z0-9_-]{10,}/.test(body),'Server secret detected');
 for(const candidate of body.matchAll(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g)){let payload;try{payload=JSON.parse(Buffer.from(candidate[0].split('.')[1],'base64url').toString());}catch{continue;}assert(payload.role!=='service_role','service_role token detected');}
}}}
await walk('dist');console.log('Pages paths, scoped worker and published-file secret checks passed.');
