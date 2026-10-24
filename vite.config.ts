import {defineConfig} from 'vite';
export default defineConfig({
 base:process.env.VITE_BASE_PATH||'/',
 preview:{host:'0.0.0.0',port:4173,strictPort:true},
 build:{rollupOptions:{output:{manualChunks:{phaser:['phaser'],react:['react','react-dom/client']}}}},
 plugins:[{
  name:'offline-app-shell',
  configResolved(config){thisBase=config.base;},
  generateBundle(_options,bundle){
   const base=thisBase,files=[base,...Object.keys(bundle).map(k=>base+k)];
   const prefix='fwe-scope-'+encodeURIComponent(base)+'-',version=Object.keys(bundle).filter(k=>k.endsWith('.js')).join('|');
   this.emitFile({type:'asset',fileName:'.nojekyll',source:''});
   this.emitFile({type:'asset',fileName:'sw.js',source:`const BASE=${JSON.stringify(base)};const PREFIX=${JSON.stringify(prefix)};const CACHE=PREFIX+${JSON.stringify(version)};const FILES=${JSON.stringify(files)};self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==self.location.origin||!u.pathname.startsWith(BASE))return;if(e.request.mode==='navigate'){if(u.pathname!==BASE&&u.pathname!==BASE+'index.html')return;e.respondWith(fetch(e.request).catch(()=>caches.open(CACHE).then(c=>c.match(BASE))));return;}e.respondWith(caches.open(CACHE).then(c=>c.match(e.request,{ignoreVary:true})).then(cached=>cached||fetch(e.request)));});`});
  }
 }]
});
let thisBase='/';
