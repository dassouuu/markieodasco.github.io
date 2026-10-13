const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');const source=fs.readFileSync(path.join(root,'portfolio-config.js'),'utf8');
const base='[profile]\nname=Markie\nemail=\nabout=Human ideas = creative possibilities.\nskills=Direction | Editing\ntools=Your real tools\n\n';
const block='[project:skincare-ad]\ntitle=Skincare “first frame”\ncategory=ugc\ndescription=A real project description.\nvideo=skincare-ad.mp4\nthumbnail=skincare-ad.jpg\nplaceholder=no\ntags=9:16 | AI UGC\n';
function configContext(text,extra={}){const ctx=vm.createContext({window:{PORTFOLIO_TEXT:text},location:{protocol:'file:'},...extra});vm.runInContext(source,ctx);return ctx;}
(async()=>{
 const ctx=configContext(base+block);await ctx.window.PORTFOLIO_READY;
 assert.equal(ctx.window.PORTFOLIO_CONFIG_ERROR,undefined);
 const parse=ctx.window.PortfolioConfig.parse;
 let c=parse('\uFEFF'+(base+block).replaceAll('\n','\r\n'));
 assert.equal(c.projects[0].video,'assets/videos/skincare-ad.mp4');assert.equal(c.projects[0].poster,'assets/thumbnails/skincare-ad.jpg');assert.equal(c.projects[0].label,'AI UGC AD');assert.equal(c.about,'Human ideas = creative possibilities.');assert.equal(c.skills.join(','),'Direction,Editing');
 c=parse(base+'[project:my-second-ad]\ntitle=Second ad\ncategory=product\n');
 assert.equal(c.projects[0].video,'assets/videos/my-second-ad.mp4');assert.equal(c.projects[0].poster,'assets/thumbnails/my-second-ad.jpg');
 assert.equal(parse(base+block+'\n[project:second]\ntitle=Second\ncategory=animation\n').projects.length,2);
 assert.equal(parse(base+block.replace('placeholder=no','placeholder=no\nenabled=no')).projects.length,0);
 assert.equal(parse(base+block.replace('video=skincare-ad.mp4','video=').replace('placeholder=no','placeholder=yes')).projects[0].video,'');
 const bad=[base+block+block,base+block.replace('category=ugc','category=other'),base+block.replace('thumbnail=skincare-ad.jpg','thumbnail=../secret.jpg'),base+block.replace('placeholder=no','placeholder=true'),base+block.replace('title=Skincare “first frame”','titel=Test'),base+block.replace('video=skincare-ad.mp4','video=javascript:alert(1)'),base+block+'title=Duplicate',base+block.replace('title=Skincare “first frame”','title=')];
 for(const text of bad) assert.throws(()=>parse(text),/portfolio.ini line/);
 const hosted=configContext(base,{location:{protocol:'https:'},fetch:async(url,opts)=>{assert.equal(url,'portfolio.ini');assert.equal(opts.cache,'no-store');return {ok:true,text:async()=>base+block};}});await hosted.window.PORTFOLIO_READY;
 assert.equal(hosted.window.PORTFOLIO.projects.length,1,'Hosted site should use INI instead of stale generated data');
 const missing=configContext(base,{location:{protocol:'https:'},fetch:async()=>({ok:false})});await missing.window.PORTFOLIO_READY;
 assert(missing.window.PORTFOLIO_CONFIG_ERROR.includes('could not load'));
 console.log('PASS: plain configuration; CRLF/BOM/Unicode; paths/defaults; new projects; hidden projects; comments/equals; invalid keys/categories/filenames/flags/duplicates; hosted INI loading and missing-config reporting.');
})().catch(e=>{console.error(e);process.exitCode=1;});
