import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { products, site } from '../src/site-data.mjs';
import { decorate, breadcrumbs, origin } from '../src/seo.mjs';
const root = new URL('../dist/', import.meta.url);
async function files(dir) { let result=[]; for(const e of await readdir(dir,{withFileTypes:true})) { const path=new URL(e.name+(e.isDirectory()?'/':''),dir); result.push(...(e.isDirectory()?await files(path):[path])); } return result; }
test('All candidate identities remain distinct and excluded model is absent',()=>{assert.equal(products.length,8); assert.equal(new Set(products.map(p=>p.id)).size,8); for(const id of ['s12','s11','s19','s16','s20','gb01','gb03','mg-ii']) assert.ok(products.some(p=>p.id===id)); for (const id of ['tt-sk027','x2pro','a8-pro','s12-2','s11-1','digital-display-rgb']) assert.ok(!products.some(p=>p.id===id));});
test('Every internal page and asset link resolves in the build',async()=>{for(const f of (await files(root)).filter(f=>! /\.(png|jpe?g|webp|avif)$/i.test(f.pathname))){if(!f.pathname.endsWith('.html'))continue;const html=await readFile(f,'utf8');for(const match of html.matchAll(/(?:href|src)="([^"#]+)"/g)){const url=new URL(match[1],'https://local.test');assert.equal(url.origin,'https://local.test');const path=decodeURIComponent(url.pathname);await stat(new URL('.'+path+(path.endsWith('/')?'index.html':''),root));}assert.match(html, /name="viewport"/);assert.match(html,/noindex,nofollow/);assert.match(html, /lang="en"/);}});
test('Draft contains no old-site content, claims or hidden verification metadata',async()=>{for(const f of (await files(root)).filter(f=>! /\.(png|jpe?g|webp|avif)$/i.test(f.pathname))){const s=await readFile(f,'utf8');assert.doesNotMatch(s,/Manike|TaoTronics|MIEVHub|productLink|20W|15W|12W|free shipping|in stock|guaranteed|google-analytics|gtag\(/i);}await assert.rejects(stat(new URL('verification.json',root)));});
test('Enquiry creates a local brief with one consistent productUrl field',async()=>{const js=await readFile(new URL('inquiry.js',root),'utf8');const html=await readFile(new URL('inquiry/index.html',root),'utf8');assert.match(js,/preventDefault/);assert.match(html,/name="productUrl"/);assert.doesNotMatch(js,/fetch\(|XMLHttpRequest|sendBeacon|localStorage/);assert.doesNotMatch(html,/<form[^>]+action=/);assert.match(js,/Nothing has been sent/);});
test('All pages have unique SEO metadata, one H1, and descriptive breadcrumbs',async()=>{const titles=new Set(),descriptions=new Set();let pages=0;for(const f of (await files(root)).filter(f=>! /\.(png|jpe?g|webp|avif)$/i.test(f.pathname))){if(!f.pathname.endsWith('.html'))continue;const html=await readFile(f,'utf8');const title=html.match(/<title>(.*?)<\/title>/)[1];const description=html.match(/name="description" content="([^"]+)"/)[1];assert.ok(!titles.has(title),title);assert.ok(!descriptions.has(description),description);titles.add(title);descriptions.add(description);assert.equal([...html.matchAll(/<h1[ >]/g)].length,1);assert.ok(description.length>60&&description.length<220);assert.doesNotMatch(html,/<link rel="canonical"/);if(f.pathname!==new URL('index.html',root).pathname)assert.match(html,/aria-label="Breadcrumb"/);pages++;}assert.equal(pages,20);});
test('Sitemap lists real canonical routes and draft robots block indexing',async()=>{const sitemap=await readFile(new URL('sitemap.xml',root),'utf8');const routes=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(x=>x[1]);assert.equal(routes.length,18);assert.equal(new Set(routes).size,routes.length);for(const route of routes){assert.ok(route.startsWith(origin+'/'));const path=new URL(route).pathname;await stat(new URL('.'+path+'index.html',root));}assert.match(await readFile(new URL('robots.txt',root),'utf8'),/Disallow: \/\n/);assert.match(await readFile(new URL('_headers',root),'utf8'),/X-Robots-Tag: noindex/);});
test('Production SEO switch changes only metadata and preserves enquiry noindex',()=>{const template='<head><title>x</title><meta name="description" content="x"><meta name="robots" content="noindex,nofollow"></head><main id="main"></main>';const publicHtml=decorate(template,'/products/s16/',false);assert.match(publicHtml,/content="index,follow"/);assert.match(publicHtml,/rel="canonical" href="https:\/\/speakerb2b.com\/products\/s16\/"/);assert.match(decorate(template,'/inquiry/',false),/content="noindex,nofollow"/);assert.deepEqual(breadcrumbs('/products/s16/').map(x=>x.name),['Home','Products','S16']);assert.doesNotMatch(publicHtml,/"@type":"(?:Product|Review|AggregateRating|Offer)"/);});
test('Frontend stays small and independent of external assets',async()=>{assert.ok((await stat(new URL('inquiry.js',root))).size<10000);assert.ok((await stat(new URL('styles.css',root))).size<30000);const css=await readFile(new URL('styles.css',root),'utf8');assert.doesNotMatch(css,/@import|https?:\/\//);});

test('Contact delivery remains disabled and no email address is published',async()=>{assert.equal(site.inquiryEnabled,false);for(const f of (await files(root)).filter(f=>! /\.(png|jpe?g|webp|avif)$/i.test(f.pathname))){assert.doesNotMatch(await readFile(f,'utf8'),/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|mailto:|formaction=/i);}});

test('S19 is the only public identity for the confirmed shared model',async()=>{
 assert.equal(products.filter(p=>p.name==='S19').length,1);
 for(const f of (await files(root)).filter(f=>! /\.(png|jpe?g|webp|avif)$/i.test(f.pathname))) assert.doesNotMatch(await readFile(f,'utf8'),/x2pro|a8[ -]?pro/i);
 await assert.rejects(stat(new URL('products/x2pro/index.html',root)));
 const html=await readFile(new URL('products/s19/index.html',root),'utf8');
 assert.match(html,/<h1>S19<\/h1>/);
 assert.match(html,/product=s19/);
 assert.match(await readFile(new URL('inquiry/index.html',root),'utf8'),/<option value="s19">S19<\/option>/);
});

test('GB01 image-derived claims keep conditions and stay model-specific',async()=>{
 const gb=products.find(p=>p.id==='gb01');
 assert.equal(gb.image.src,'/images/gb01/gb01-main.png');assert.equal(gb.gallery.length,8);
 const html=await readFile(new URL('products/gb01/index.html',root),'utf8');
 for(const text of ['10W','IPX6','Not for immersion','30% volume with lights off','two compatible speakers','FAT32','MP3 only, not WAV or FLAC','5V 1A/2A','remain unconfirmed']) assert.ok(html.includes(text),text);
 for(const p of products.filter(p=>!['gb01','gb03','mg-ii'].includes(p.id))) assert.equal(p.specifications,undefined);
 assert.doesNotMatch(html,/GB MINI/);
});

test('GB01 uses confirmed Bluetooth and unit price without inferred sales terms',async()=>{
 const html=await readFile(new URL('products/gb01/index.html',root),'utf8');
 assert.match(html,/<h1>GB01 Bluetooth 6.0 Speaker<\/h1>/);
 assert.match(html,/<dt>Wholesale Price<\/dt><dd>USD 7.80 \/ unit<\/dd>/);
 assert.match(html,/<dt>Bluetooth version<\/dt><dd>Bluetooth 6.0<\/dd>/);
 assert.doesNotMatch(html,/Bluetooth version, dimensions|EXW|FOB|starting at|from USD|tiered pricing/i);
 assert.match(html,/Order quantity<\/dt><dd>To be confirmed/);
 assert.match(html,/Supplier-provided product image/);
 for (const p of products.filter(p=>!['gb01','gb03','mg-ii'].includes(p.id))) assert.equal(p.wholesalePrice,undefined);
});

test('GB03 retains sourced limitations without copying GB01 specifications',async()=>{
 const gb=products.find(p=>p.id==='gb03');assert.equal(gb.image.src,'/images/gb03/gb03-main.png');assert.equal(gb.image.width,1200);assert.equal(gb.image.height,1200);assert.equal(gb.gallery.length,8);
 const html=await readFile(new URL('products/gb03/index.html',root),'utf8');
 for(const text of ['USD 13.20 / unit','30W','RMS or peak rating is not specified','DSP','BASS+3.0','IPX7','two compatible speakers','Bluetooth 6.0','Up to 24 hours at 30% volume','Actual playback varies with volume and use','Black.','Carrying strap.']) assert.ok(html.includes(text),text);
 assert.doesNotMatch(html,/60W|lights off|lights on|audio source|test conditions remain unconfirmed|Bluetooth version, frequency|FAT32|5V 1A|EXW|FOB|from USD|starting at/i);
 assert.match(html,/Supplier-provided product image/);
 assert.match(html,/Order quantity<\/dt><dd>To be confirmed/);
});

test('MG II preserves image conditions and separate water-use instructions',async()=>{
 const html=await readFile(new URL('products/mg-ii/index.html',root),'utf8');
 for(const value of ['USD 21.60 / unit','24W rated output','Bluetooth 6.0','Single Full-Range Driver','Movie, Music and Party','17+ hours','30% volume with lights off','two MG II speakers','Cream product image labels the two-speaker setup as 48W','not a professional rescue device','IP67 as stated','not for immersion in water','Do not immerse']) assert.ok(html.includes(value),value);
 assert.doesNotMatch(html,/dual.driver|driver count.*(?:awaiting|unconfirmed)|EXW|FOB|starting at/i);
 assert.equal(products.find(p=>p.id==='mg-ii').gallery.length,16);
});

test('MG II colours remain within one product at the existing unit price',async()=>{
 const mg=products.filter(p=>p.id==='mg-ii');assert.equal(mg.length,1);
 assert.deepEqual(mg[0].colours,['Cream','Black & Brass']);
 assert.equal(mg[0].wholesalePrice,'USD 21.60 / unit');
 const html=await readFile(new URL('products/mg-ii/index.html',root),'utf8');
 assert.match(html,/Cream; Black &amp; Brass/);
 for(const f of (await files(root)).filter(f=>! /\.(png|jpe?g|webp|avif)$/i.test(f.pathname))) assert.doesNotMatch(await readFile(f,'utf8'),/Black Copper/i);
});

test('Three photographed products map 32 images to the correct models and colours',async()=>{
 const photographed=products.filter(p=>p.image);assert.deepEqual(photographed.map(p=>p.id).sort(),['gb01','gb03','mg-ii']);
 assert.equal(products.filter(p=>!p.image).length,5);
 const mg=products.find(p=>p.id==='mg-ii');
 assert.equal(mg.gallery.filter(i=>i.colour==='Cream').length,9);assert.equal(mg.gallery.filter(i=>i.colour==='Black & Brass').length,7);assert.equal(photographed.reduce((sum,p)=>sum+p.gallery.length,0),32);
 for(const p of photographed){const html=await readFile(new URL(`products/${p.id}/index.html`,root),'utf8');for(const i of p.gallery?.length?p.gallery:[p.image]) {assert.ok(html.includes(i.src));assert.ok(html.includes(`width="${i.width}" height="${i.height}"`));}}
 const css=await readFile(new URL('styles.css',root),'utf8');assert.match(css,/object-fit:contain/);
});

test('Gallery links open originals and only the first image loads eagerly',async()=>{
 for(const id of ['gb01','gb03','mg-ii']){
  const html=await readFile(new URL(`products/${id}/index.html`,root),'utf8');
  const p=products.find(p=>p.id===id);
  assert.equal([...html.matchAll(/class="gallery-image-link"/g)].length,p.gallery.length);
  assert.equal([...html.matchAll(/loading="eager"/g)].length,1);
  assert.equal([...html.matchAll(/loading="lazy"/g)].length,p.gallery.length-1);
 }
});
