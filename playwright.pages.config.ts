import {defineConfig} from '@playwright/test';
const external=process.env.PAGES_TEST_URL;
export default defineConfig({
 testDir:'./e2e/pages',workers:1,timeout:60000,
 use:{baseURL:external||'http://127.0.0.1:4175/family-wealth-empire/',launchOptions:{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,args:['--no-sandbox']}},
 webServer:external?undefined:{env:{VITE_BASE_PATH:'/family-wealth-empire/'},command:'npm run preview -- --host 127.0.0.1 --port 4175',port:4175,reuseExistingServer:false},
 projects:[{name:'desktop',use:{viewport:{width:1440,height:1000}}},{name:'tablet',use:{viewport:{width:820,height:1180},isMobile:true,hasTouch:true}},{name:'mobile',use:{viewport:{width:390,height:844},isMobile:true,hasTouch:true}}],
 reporter:[['list'],['html',{outputFolder:'pages-report',open:'never'}]],
});
