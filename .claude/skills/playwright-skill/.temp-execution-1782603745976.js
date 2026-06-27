const { chromium } = require('playwright');
const URL='http://localhost:3000';
(async()=>{
  const b=await chromium.launch({headless:true});
  const ctx=await b.newContext();
  // force French locale cookie
  await ctx.addCookies([{name:'amethyste_locale',value:'fr',url:URL}]);
  const p=await ctx.newPage();
  for (const w of [1152,1280,1366,1440,1536]){
    await p.setViewportSize({width:w,height:200});
    await p.goto(URL,{waitUntil:'networkidle'});
    await p.waitForTimeout(400);
    await p.screenshot({path:`/tmp/fr-${w}.png`,clip:{x:0,y:36,width:w,height:90}});
  }
  console.log('done');await b.close();
})();
