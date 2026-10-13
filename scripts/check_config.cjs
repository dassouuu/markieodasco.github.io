/* Validate the editable config, generated snapshot, and referenced media files. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
(async()=>{
 const context=vm.createContext({window:{},location:{protocol:'file:'}});
 vm.runInContext(fs.readFileSync(path.join(root,'config-data.js'),'utf8'),context);
 assert.equal(context.window.PORTFOLIO_TEXT,fs.readFileSync(path.join(root,'portfolio.ini'),'utf8').replace(/^\uFEFF/,''),'Snapshot is outdated: regenerate it before packaging');
 vm.runInContext(fs.readFileSync(path.join(root,'portfolio-config.js'),'utf8'),context);
 await context.window.PORTFOLIO_READY;
 assert.equal(context.window.PORTFOLIO_CONFIG_ERROR,undefined);
 for(const project of context.window.PORTFOLIO.projects){
   assert(fs.existsSync(path.join(root,project.poster)),`Missing thumbnail: ${project.poster}`);
   if(project.video) assert(fs.existsSync(path.join(root,project.video)),`Missing video: ${project.video}`);
 }
 console.log(`PASS: portfolio.ini matches its generated snapshot; ${context.window.PORTFOLIO.projects.length} enabled projects; all configured media files exist.`);
})().catch(e=>{console.error(e.message);process.exitCode=1;});
