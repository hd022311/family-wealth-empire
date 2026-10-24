import {defineConfig} from '@playwright/test';
const external=process.env.PAGES_TEST_URL, base=process.env.VITE_BASE_PATH||'/';
export default defineConfig({testDir:'./e2e',outputDir:'test-results-layout',testMatch:'**/layout.spec.ts',workers:1,timeout:60000,
 use:{baseURL:external||`http://127.0.0.1:4175${base}`,launchOptions:{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,args:['--no-sandbox']}},
 webServer:external?undefined:{env:{VITE_BASE_PATH:base},command:'npm run preview -- --host 127.0.0.1 --port 4175',port:4175,reuseExistingServer:false},
 projects:[{name:'desktop-900',use:{viewport:{width:1440,height:900}}},{name:'laptop-768',use:{viewport:{width:1366,height:768}}},{name:'tablet',use:{viewport:{width:820,height:1180},isMobile:true,hasTouch:true}},{name:'mobile',use:{viewport:{width:390,height:844},isMobile:true,hasTouch:true}}],
 reporter:[['list'],['html',{outputFolder:'layout-report',open:'never'}]]});
