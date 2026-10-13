/* Dependency-free behavior checks. This is a DOM harness, not a browser test. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
class Element {
  constructor(tag, doc) { this.tagName = tag; this.doc = doc; this.children = []; this.attrs = {}; this.listeners = {}; this.textContent = ''; this.hidden = false; this.dataset = {}; this.className = ''; this.value = ''; this.parent = null; }
  get classList() { return {contains: c => this.className.split(' ').includes(c), add: c => { if (!this.className.split(' ').includes(c)) this.className += ' ' + c; }, remove: c => { this.className = this.className.split(' ').filter(x => x !== c).join(' '); }, toggle: (c, state) => { const on = state ?? !this.className.split(' ').includes(c); on ? this.classList.add(c) : this.classList.remove(c); return on; }}; }
  setAttribute(k,v) { this.attrs[k] = String(v); if (k === 'class') this.className = v; if (k.startsWith('data-')) this.dataset[k.slice(5)] = v; if (k === 'hidden') this.hidden = true; }
  getAttribute(k) { return this.attrs[k] ?? null; }
  append(...items) { items.forEach(x => { x.parent = this; this.children.push(x); }); }
  replaceChildren(...items) { this.children.forEach(x => x.parent = null); this.children = []; this.append(...items); }
  addEventListener(type, handler) { (this.listeners[type] ??= []).push(handler); }
  async dispatch(type, extra = {}) { const event = {target:this,currentTarget:this,preventDefault(){},...extra}; for (const fn of this.listeners[type] || []) await fn(event); }
  click() { return this.dispatch('click'); }
  focus() { this.doc.activeElement = this; }
  select() { this.selected = true; }
  pause() { this.paused = true; }
  showModal() { this.open = true; }
  close() { this.open = false; this.dispatch('close'); }
  remove() { if (this.parent) this.parent.children = this.parent.children.filter(x => x !== this); }
  matches(sel) { const attr = sel.match(/\[([\w-]+)(?:=['"]?([^'"\]]+)['"]?)?\]/); if (attr && (this.getAttribute(attr[1]) === null || (attr[2] && this.getAttribute(attr[1]) !== attr[2]))) return false; sel = sel.replace(/\[[^\]]*\]/g, ''); const id = sel.match(/#([\w-]+)/); if (id && this.attrs.id !== id[1]) return false; for (const c of sel.matchAll(/\.([\w-]+)/g)) if (!this.classList.contains(c[1])) return false; const tag = sel.match(/^[\w-]+/); return !tag || tag[0] === this.tagName; }
  descendants() { return this.children.flatMap(x => [x, ...x.descendants()]); }
  querySelectorAll(sel) { if (sel.includes(',')) return [...new Set(sel.split(',').flatMap(s => this.querySelectorAll(s.trim())))]; if (sel.includes(' > ')) { const [left,right] = sel.split(' > '); return this.querySelectorAll(left).flatMap(x => x.children.filter(y => y.matches(right))); } if (sel.includes(' ')) { const [left,...parts] = sel.split(' '); return this.querySelectorAll(left).flatMap(x => x.querySelectorAll(parts.join(' '))); } return this.descendants().filter(x => x.matches(sel)); }
  querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
  closest(sel) { if (this.matches(sel)) return this; return this.parent?.closest(sel) || null; }
}
async function environment(customize = () => {}, standalone = false) {
  const document = new Element('document'); document.doc = document;
  document.createElement = tag => new Element(tag, document);
  const stack = [document];
  const html = fs.readFileSync(path.join(root,'index.html'),'utf8').replace(/<!--[\s\S]*?-->/g,'');
  for (const match of html.matchAll(/<\/?[a-z][^>]*>/gi)) {
    const raw = match[0]; if (raw.startsWith('</')) { if (stack.length > 1) stack.pop(); continue; }
    const tag = raw.match(/^<([\w-]+)/)[1]; const el = document.createElement(tag);
    for (const a of raw.matchAll(/([\w-]+)(?:="([^"]*)")?/g)) { if (a.index === 1) continue; el.setAttribute(a[1],a[2] ?? ''); }
    stack.at(-1).append(el); if (!['meta','link','img','input','br','hr','source'].includes(tag)) stack.push(el);
  }
  document.body = document.querySelector('body');
  class FakeData { constructor(form) { this.form=form; } get(name) { return this.form.querySelector(`[name="${name}"]`)?.value || ''; } }
  const clipboard = {last:'',async writeText(text){this.last=text;}};
  const context = vm.createContext({document,window:{},location:{href:'https://markieodasco.github.io/'},URL,Blob,FormData:FakeData,navigator:{clipboard},matchMedia:()=>({matches:true}),setTimeout:()=>0,console});
  const inline = standalone ? [...fs.readFileSync(path.join(root,'START-HERE.html'),'utf8').matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]) : null;
  if (standalone) assert.equal(inline.length,3,'Standalone preview must embed data, parser, and application scripts');
  vm.runInContext(standalone ? inline[0] : fs.readFileSync(path.join(root,'config-data.js'),'utf8'), context);
  vm.runInContext(standalone ? inline[1] : fs.readFileSync(path.join(root,'portfolio-config.js'),'utf8'), context);
  await context.window.PORTFOLIO_READY;
  customize(context.window.PORTFOLIO);
  await vm.runInContext(standalone ? inline[2] : fs.readFileSync(path.join(root,'app.js'),'utf8'), context);
  return {document,context,$:s=>document.querySelector(s),clipboard};
}
(async()=>{
  const a = await environment();
  assert.equal(a.$('#project-grid').children.length,a.context.window.PORTFOLIO.projects.length);
  assert.equal(a.$('#email-link').hidden,false);
  assert.equal(a.$('#email-link').href,'mailto:markieodasco0702@gmail.com');
  assert.equal(a.$('#whatsapp-link').href,'https://wa.me/639957585817');
  assert.equal(a.$('#discord-handle').value,'dassouuu.');
  await a.$('#copy-discord').click(); assert.equal(a.clipboard.last,'dassouuu.');
  assert.equal(a.$('#send-brief').hidden,true);
  for (const type of ['ugc','product','animation']) {
    await a.$(`[data-filter="${type}"]`).click();
    assert.equal(a.$('#project-grid').children.length,a.context.window.PORTFOLIO.projects.filter(p=>p.category===type).length);
    assert.equal(a.$(`[data-filter="${type}"]`).getAttribute('aria-pressed'),'true');
    assert.equal(a.$('[data-filter="all"]').getAttribute('aria-pressed'),'false');
  }
  await a.$('[data-filter="all"]').click();
  const first = a.$('.project-poster'); await first.click();
  assert.equal(a.$('#project-dialog').open,true);
  assert.equal(a.$('#dialog-title').textContent,'Clean Nutra — Gym-led UGC');
  assert(a.$('#dialog-media').querySelector('video').src.endsWith('clean-nutra-01.mp4'));
  await a.$('.dialog-close').click();
  assert.equal(a.$('#project-dialog').open,false);
  assert.equal(a.document.activeElement,first);
  await a.$('.menu-toggle').click(); assert.equal(a.$('.menu-toggle').getAttribute('aria-expanded'),'true');
  await a.document.dispatch('keydown',{key:'Escape'}); assert.equal(a.$('.menu-toggle').getAttribute('aria-expanded'),'false');
  a.$('#client-name').value='Test Visitor'; a.$('#client-email').value='visitor@example.com'; a.$('#project-type').value='Product Ad'; a.$('#project-details').value='A new product film for our launch.';
  await a.$('#brief-form').dispatch('submit');
  assert.equal(a.$('#brief-result').hidden,false);
  assert(a.$('#brief-output').value.includes('visitor@example.com'));
  assert(a.$('#brief-output').value.includes('Product Ad'));
  await a.$('#copy-brief').click(); assert.equal(a.clipboard.last,a.$('#brief-output').value);
  a.context.navigator.clipboard = undefined; await a.$('#copy-brief').click(); assert.equal(a.$('#brief-output').selected,true);
  await a.$('#download-brief').click(); assert(a.$('#form-status').textContent.includes('downloaded'));
  const b = await environment(c => {c.name='Actual Name'; c.email='owner@example.com'; c.projects[0].placeholder=false; c.projects[0].video='assets/videos/example.mp4';});
  assert.equal(b.document.title,'Actual Name — AI Video Specialist');
  assert.equal(b.$('#email-link').hidden,false); assert.equal(b.$('#email-link').href,'mailto:owner@example.com');
  await b.$('.project-poster').click(); const video=b.$('#dialog-media').querySelector('video');
  assert.equal(video.controls,true); assert.equal(video.src,'assets/videos/example.mp4');
  // Native Escape causes the dialog's close event, without clicking Close.
  b.$('#project-dialog').close(); assert.equal(video.paused,true);
  b.$('#client-name').value='Visitor'; b.$('#client-email').value='visitor@example.com'; b.$('#project-type').value='AI UGC Ad'; b.$('#project-details').value='Please create a video.';
  await b.$('#brief-form').dispatch('submit'); assert.equal(b.$('#send-brief').hidden,false); assert(b.$('#send-brief').href.startsWith('mailto:owner@example.com?subject='));
  const c=await environment(cfg=>{cfg.discord='';cfg.whatsapp='';cfg.projects[0].title='<img src=x onerror=alert(1)>'; cfg.email='invalid'; cfg.projects[0].video='javascript:alert(1)';});
  await c.$('.project-poster').click(); assert.equal(c.$('#dialog-title').textContent,'<img src=x onerror=alert(1)>'); assert.equal(c.$('#dialog-title').children.length,0); assert.equal(c.$('#dialog-media').querySelector('video'),null); assert.equal(c.$('#email-link').hidden,true);
  const preview=await environment(()=>{},true);
  assert.equal(preview.$('#project-grid').children.length,preview.context.window.PORTFOLIO.projects.length);
  for(const image of preview.$('#project-grid').querySelectorAll('img')) assert(image.src.startsWith('data:image/jpeg;base64,'),'Preview posters must use extracted thumbnails');
  await preview.$('.project-poster').click();
  assert(preview.$('#dialog-media').querySelector('video').poster.startsWith('data:image/jpeg;base64,'));
  assert.equal(preview.$('#dialog-media').querySelector('video').src,'assets/videos/clean-nutra-01.mp4');
  await preview.$('.dialog-close').click();
  await preview.$('[data-filter="product"]').click();
  assert.equal(preview.$('#project-grid').children.length,2);
  console.log('PASS: integrated real projects; contact links/Discord copy; gallery/filters; modal/focus; menu/Escape; brief generation/copy/download; configured email; video setup/pause; safe text/URLs; standalone inline scripts and embedded gallery/modal artwork. DOM harness only; no visual or playback verification.');
})().catch(err=>{console.error(err);process.exitCode=1;});
