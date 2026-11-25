import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { products, site } from '../src/site-data.mjs';
import { categories } from '../src/categories.mjs';
import { decorate, breadcrumbs, origin } from '../src/seo.mjs';
const root = new URL('../dist/', import.meta.url);
async function files(dir) { let result=[]; for(const e of await readdir(dir,{withFileTypes:true})) { const path=new URL(e.name+(e.isDirectory()?'/':''),dir); result.push(...(e.isDirectory()?await files(path):[path])); } return result; }
test('All candidate identities remain distinct and excluded model is absent',()=>{assert.equal(products.length,59); assert.equal(new Set(products.map(p=>p.id)).size,products.length); for(const id of ['s12','s11','s19','s16','s20','gb01','gb03','mg-ii']) assert.ok(products.some(p=>p.id===id)); for (const id of ['tt-sk027','x2pro','a8-pro','s12-2','s11-1','digital-display-rgb','f4pro','s9','x10']) assert.ok(!products.some(p=>p.id===id));});
test('Every internal page and asset link resolves in the build',async()=>{for(const f of (await files(root)).filter(f=>! /\.(png|jpe?g|webp|avif)$/i.test(f.pathname))){if(!f.pathname.endsWith('.html'))continue;const html=await readFile(f,'utf8');for(const match of html.matchAll(/(?:href|src)="([^"#]+)"/g)){if(match[1] === 'mailto:speakerb2b@outlook.com' || match[1].startsWith(origin+'/')) continue;const url=new URL(match[1],'https://local.test');assert.equal(url.origin,'https://local.test');const path=decodeURIComponent(url.pathname);await stat(new URL('.'+path+(path.endsWith('/')?'index.html':''),root));}assert.match(html, /name="viewport"/);assert.match(html, f.pathname.endsWith('/inquiry/index.html') || f.pathname.endsWith('/404.html') ? /noindex,nofollow/ : /content="index,follow"/);assert.match(html, /lang="en"/);}});
test('Draft contains no old-site content, claims or hidden verification metadata',async()=>{for(const f of (await files(root)).filter(f=>! /\.(png|jpe?g|webp|avif)$/i.test(f.pathname))){const s=await readFile(f,'utf8');assert.doesNotMatch(s,/Manike|TaoTronics|MIEVHub|productLink|free shipping|in stock|guaranteed|google-analytics|gtag\(/i);}await assert.rejects(stat(new URL('verification.json',root)));});
test('Enquiry creates a local brief with one consistent productUrl field',async()=>{const js=await readFile(new URL('inquiry.js',root),'utf8');const html=await readFile(new URL('inquiry/index.html',root),'utf8');assert.match(js,/preventDefault/);assert.match(html,/name="productUrl"/);assert.doesNotMatch(js,/fetch\(|XMLHttpRequest|sendBeacon|localStorage/);assert.doesNotMatch(html,/<form[^>]+action=/);assert.match(js,/Nothing has been sent/);});
test('All pages have unique SEO metadata, one H1, and descriptive breadcrumbs',async()=>{const titles=new Set(),descriptions=new Set();let pages=0;for(const f of (await files(root)).filter(f=>! /\.(png|jpe?g|webp|avif)$/i.test(f.pathname))){if(!f.pathname.endsWith('.html'))continue;const html=await readFile(f,'utf8');const title=html.match(/<title>(.*?)<\/title>/)[1];const description=html.match(/name="description" content="([^"]+)"/)[1];assert.ok(!titles.has(title),title);assert.ok(!descriptions.has(description),description);titles.add(title);descriptions.add(description);assert.equal([...html.matchAll(/<h1[ >]/g)].length,1);assert.ok(description.length>60&&description.length<220);if(!f.pathname.endsWith('/404.html')) assert.match(html,/<link rel="canonical"/);if(f.pathname!==new URL('index.html',root).pathname)assert.match(html,/aria-label="Breadcrumb"/);pages++;}assert.equal(pages,products.length+12);});
test('Production sitemap and robots allow public discovery',async()=>{const sitemap=await readFile(new URL('sitemap.xml',root),'utf8');const routes=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(x=>x[1]);assert.equal(routes.length,products.length+10);assert.equal(new Set(routes).size,routes.length);for(const route of routes){assert.ok(route.startsWith(origin+'/'));const path=new URL(route).pathname;await stat(new URL('.'+path+'index.html',root));}assert.match(await readFile(new URL('robots.txt',root),'utf8'),/Allow: \/\n/);assert.doesNotMatch(await readFile(new URL('_headers',root),'utf8'),/X-Robots-Tag: noindex/);});
test('Production SEO switch changes only metadata and preserves enquiry noindex',()=>{const template='<head><title>x</title><meta name="description" content="x"><meta name="robots" content="noindex,nofollow"></head><main id="main"></main>';const publicHtml=decorate(template,'/products/s16/',false);assert.match(publicHtml,/content="index,follow"/);assert.match(publicHtml,/rel="canonical" href="https:\/\/speakerb2b.com\/products\/s16\/"/);assert.match(decorate(template,'/inquiry/',false),/content="noindex,nofollow"/);assert.deepEqual(breadcrumbs('/products/s16/').map(x=>x.name),['Home','Products','S16']);assert.doesNotMatch(publicHtml,/"@type":"(?:Product|Review|AggregateRating|Offer)"/);});
test('Frontend stays small and independent of external assets',async()=>{assert.ok((await stat(new URL('inquiry.js',root))).size<10000);assert.ok((await stat(new URL('styles.css',root))).size<30000);const css=await readFile(new URL('styles.css',root),'utf8');assert.doesNotMatch(css,/@import|https?:\/\//);});

test('Contact page and enquiry provide the authorised email address',async()=>{
 const contact=await readFile(new URL('contact/index.html',root),'utf8');
 const inquiry=await readFile(new URL('inquiry/index.html',root),'utf8');
 const js=await readFile(new URL('inquiry.js',root),'utf8');
 assert.match(contact,/mailto:speakerb2b@outlook\.com/);
 assert.match(inquiry,/id="email-brief"/);
 assert.match(js,/mailto:speakerb2b@outlook\.com\?subject=/);
 assert.match(js,/encodeURIComponent\(text\)/);
 assert.match(inquiry,/only after you press Send/);
});

test('S19 is the only public identity for the confirmed shared model',async()=>{
 assert.equal(products.filter(p=>p.name==='S19').length,1);
 for(const f of (await files(root)).filter(f=>! /\.(png|jpe?g|webp|avif)$/i.test(f.pathname))) assert.doesNotMatch(await readFile(f,'utf8'),/x2pro|a8[ -]?pro/i);
 await assert.rejects(stat(new URL('products/x2pro/index.html',root)));
 const html=await readFile(new URL('products/s19/index.html',root),'utf8');
 assert.match(html,/<h1>S19<\/h1>/);
 assert.match(html,/product=s19/);
 assert.match(await readFile(new URL('inquiry/index.html',root),'utf8'),/<option value="s19">S19<\/option>/);
});

test('GB01 and GB03 use the supplied quotation values', async()=>{
 for (const [id, price, configuration] of [['gb01','USD 7.00 / unit','10W×1'],['gb03','USD 11.00 / unit','10W×2']]) {
  const product=products.find(p=>p.id===id);
  assert.equal(product.referencePrice,price);
  assert.equal(product.specifications.find(([label])=>label==='Driver configuration (quotation)')[1],configuration);
  const html=await readFile(new URL(`products/${id}/index.html`,root),'utf8');
  assert.ok(html.includes(price));
  assert.ok(html.includes(configuration));
  assert.match(html,/Wholesale reference price/);
 }
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

test('Every imported catalog model has a matching page, specifications and image when supplied',async()=>{
 const catalog=(await import('../src/catalog-products.json', {with:{type:'json'}})).default;
 assert.equal(catalog.length,53);
 for(const product of catalog) {
  const html=await readFile(new URL(`products/${product.id}/index.html`,root),'utf8');
  for(const [label,value] of product.specifications) { assert.ok(html.includes(label)); assert.ok(html.includes(value.replaceAll('&','&amp;'))); }
  if(product.referencePrice) assert.ok(html.includes(product.referencePrice));
  else assert.match(html,/Available on enquiry/);
  if(product.image) { assert.ok(html.includes(product.image.src)); await stat(new URL('.'+product.image.src,root)); }
  else assert.match(html,/PRODUCT IMAGE PENDING/);
 }
});

test('Existing MG II and S12 galleries retain their image links',async()=>{
 for(const id of ['mg-ii','s12']){
  const html=await readFile(new URL(`products/${id}/index.html`,root),'utf8');
  const product=products.find(p=>p.id===id);
  assert.equal([...html.matchAll(/class="gallery-image-link"/g)].length,product.gallery.length);
  assert.equal([...html.matchAll(/loading="eager"/g)].length,1);
 }
});

test('S12 uses only the newly confirmed power and unit price',async()=>{
 const html=await readFile(new URL('products/s12/index.html',root),'utf8');
 assert.match(html,/<h1>S12 Bluetooth 5.4 12W Speaker<\/h1>/);
 assert.match(html,/USD 7.00 \/ unit/);assert.doesNotMatch(html,/15W/);
 assert.equal(products.find(p=>p.id==='s12').image.src,'/images/s12/s12-main.jpg');assert.equal(products.find(p=>p.id==='s12').gallery.length,6);
});

test('S12 facts include user-confirmed playback conditions',async()=>{
 const html=await readFile(new URL('products/s12/index.html',root),'utf8');
 for(const text of ['Bluetooth 5.4','IPX7','two compatible speakers','RGB','32GB','Up to 12 hours','Up to 12 hours at 30% volume with the lights off','3–4 hours','DC 5V','11.3cm','8cm','380g']) assert.ok(html.includes(text),text);
 assert.doesNotMatch(html,/Bluetooth 6\.0|test conditions pending|conditions remain unconfirmed|Type-C|FAT32|MP3 only|mAh|5V 1A|5V 2A/i);
});


test('Browsing categories link to known models and display an honest empty state', async()=>{
 assert.deepEqual(categories.map(c=>c.id), ['silicone-speakers','portable-bluetooth','computer-speakers']);
 for (const category of categories) {
  assert.equal(new Set(category.models).size, category.models.length);
  const html = await readFile(new URL(`products/type/${category.id}/index.html`,root),'utf8');
  for (const id of category.models) {
   assert.ok(products.some(product=>product.id===id), id);
   assert.ok(html.includes(`href="/products/${id}/"`), id);
  }
  if (!category.models.length) assert.match(html,/Models coming soon/);
 }
});


test('Removed models have no product pages or enquiry options',async()=>{
 const inquiry=await readFile(new URL('inquiry/index.html',root),'utf8');
 for(const id of ['f4pro','s9','x10']) {
  await assert.rejects(stat(new URL(`products/${id}/index.html`,root)), {code:'ENOENT'});
  assert.ok(!inquiry.includes(`value="${id}"`));
 }
});

test('Catalog search and sorting work together and keep unpriced models last', async()=>{
 const {runInNewContext} = await import('node:vm');
 const callbacks = {};
 const search = {value:'', addEventListener: (_, fn) => callbacks.search = fn};
 const sort = {value:'featured', disabled:true, addEventListener: (_, fn) => callbacks.sort = fn};
 const status = {textContent:''};
 const cards = [
  {dataset:{productName:'gb10', price:'6.70'}},
  {dataset:{productName:'gb01', price:'7.00'}},
  {dataset:{productName:'s16', price:''}}
 ];
 const grid = {querySelectorAll: () => cards, append: (...items) => {grid.order = items;}};
 const elements = {'#inquiry-form':null,'#product-search':search,'.product-grid':grid,'#search-status':status,'#product-sort':sort};
 runInNewContext(await readFile(new URL('inquiry.js',root),'utf8'), {document:{querySelector: selector=>elements[selector]},location:{search:''},URLSearchParams});
 assert.equal(sort.disabled,false);
 sort.value='price-desc'; callbacks.sort();
 assert.deepEqual(grid.order.map(card=>card.dataset.productName),['gb01','gb10','s16']);
 search.value='gb'; callbacks.search();
 assert.equal(status.textContent,'2 matching models');
 assert.equal(cards[2].hidden,true);
 search.value='xyz'; callbacks.search();
 assert.equal(status.textContent,'0 matching models');
 sort.value='featured'; search.value=''; callbacks.sort();
 assert.deepEqual(grid.order.map(card=>card.dataset.productName),['gb10','gb01','s16']);
});


test('Models without a price invite enquiries for price and specifications', async()=>{
 const unpriced = products.filter(p=>!p.wholesalePrice && !p.referencePrice);
 const listing = await readFile(new URL('products/index.html',root),'utf8');
 for (const product of unpriced) {
  const html = await readFile(new URL(`products/${product.id}/index.html`,root),'utf8');
  assert.match(html,/Available on enquiry/);
  assert.match(html,/Confirmed specifications<\/dt><dd>Please enquire/);
  assert.ok(listing.includes(`data-product-name="${product.name.toLowerCase()}"`));
  assert.ok(html.includes(`product=${product.id}`));
 }
 assert.equal(unpriced.length,11);
});


test('Wholesale terms appear accurately on the site',async()=>{
 const wholesale=await readFile(new URL('services/wholesale/index.html',root),'utf8');
 for(const text of ['2,000 units','7 days','Customized to your requirements','100% payment before shipping','15 days']) assert.ok(wholesale.includes(text),text);
 assert.ok(wholesale.includes('FOB, EXW, DDP, DAP and CIF'));
 for(const id of ['s16','gb01']) { const html=await readFile(new URL(`products/${id}/index.html`,root),'utf8');assert.ok(html.includes('2,000 units'));assert.doesNotMatch(html,/Minimum quantities have not been confirmed/); }
});


test('Public website contains no unfinished contact placeholders or preview banner',async()=>{
 for(const f of (await files(root)).filter(f=>f.pathname.endsWith('.html'))){
  const html=await readFile(f,'utf8');
  assert.doesNotMatch(html,/WORKING PREVIEW|Not configured yet|Awaiting confirmation|on this draft|THE PLANNED ENQUIRY PROCESS/);
  assert.match(html,/mailto:speakerb2b@outlook\.com/);
 }
});
