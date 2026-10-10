import { products, site } from './site-data.mjs';
import { categories } from './categories.mjs';

export const origin = `https://${site.intendedDomain}`;
export const previewMode = process.env.SITE_MODE !== 'production';
const xml = text => String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const routes = {
  '/': ['Wholesale Bluetooth Speakers & Custom Branding', 'Explore SpeakerB2B speaker models for wholesale sourcing and custom branding enquiries. Browse the catalog and prepare a brief for your business.'],
  '/products/': ['Wholesale Speaker Models', 'Browse eight speaker model candidates, compare styles and prepare a model-specific wholesale or branding enquiry. Product details remain under review.'],
  '/services/': ['Wholesale Sourcing & Custom Speaker Enquiries', 'Choose a wholesale sourcing or OEM/ODM enquiry path. Understand what to include in your quantity, branding, destination and timing requirements.'],
  '/services/wholesale/': ['Wholesale Speakers & Stock Enquiries', 'Plan a wholesale speaker order: shortlist models, outline quantities and request current stock and quotation details before making a purchase decision.'],
  '/services/oem-odm/': ['OEM / ODM Speaker Project Enquiries', 'Prepare a custom speaker branding or development brief. Outline logo, packaging, design and sample requirements for project-specific feasibility review.'],
  '/about/': ['About SpeakerB2B', 'Learn about SpeakerB2B, a speaker wholesale sourcing and customization enquiry project built around clear product shortlists and business requirements.'],
  '/contact/': ['Contact SpeakerB2B', 'Prepare a speaker sourcing enquiry for SpeakerB2B. Contact channels are awaiting configuration; the preview brief builder does not send messages.'],
  '/inquiry/': ['Prepare Your Speaker Sourcing Brief', 'Build a local enquiry brief with your model, order quantity, market and customization requirements. Nothing is sent by this preview form.'],
  '/404.html': ['Page Not Found', 'This SpeakerB2B page could not be found. Return to the speaker catalog to continue exploring model candidates and sourcing services.']
};
export function metadata(path) {
  const product = products.find(p => path === `/products/${p.id}/`);
  const category = categories.find(c => path === `/products/type/${c.id}/`);
  if (product?.id === 's12') return {title: `S12 Bluetooth 5.4 12W Speaker — Wholesale | ${site.name}`, description: 'Explore the S12 Bluetooth 5.4 speaker with 12W output, RGB lighting, TWS pairing and TF card playback. Wholesale Price: USD 7.00 / unit.', label: product.name};
  if (product?.id === 'mg-ii') return {title: `MG II Bluetooth 6.0 24W Speaker — Wholesale | ${site.name}`, description: 'Explore MG II with Bluetooth 6.0, a Single Full-Range Driver, 24W rated output, DSP and three EQ modes. Wholesale Price: USD 21.60 / unit.', label: product.name};
  if (product?.id === 'gb03') return {title: `GB03 Bluetooth 6.0 Speaker — Wholesale | ${site.name}`, description: 'GB03 Bluetooth 6.0 speaker with DSP and BASS+3.0. Up to 24 hours at 30% volume; actual playback varies with use. Wholesale Price: USD 13.20 / unit.', label: product.name};
  if (product?.id === 'gb01') return {title: `GB01 Bluetooth 6.0 Speaker — Wholesale | ${site.name}`, description: 'Explore the GB01 Bluetooth 6.0 speaker with a 10W full-range driver, DSP and three lighting modes. Wholesale Price: USD 7.80 / unit.', label: product.name};
  if (product) return { title: `${product.name} Speaker — Wholesale Enquiries | ${site.name}`, description: `Explore the ${product.name} speaker candidate for your business sourcing shortlist. Prepare a model-specific brief; pricing and specifications require confirmation.`, label:product.name };
  if (category) return { title:`${category.name} Speakers | ${site.name}`, description:category.description, label:category.name };
  const [title,description] = routes[path] || ['Speaker Sourcing', 'Explore the SpeakerB2B model catalog and sourcing enquiry options.'];
  return {title: title.includes(site.name)?title:`${title} | ${site.name}`,description,label:({'/products/':'Products','/services/':'Services','/services/wholesale/':'Wholesale','/services/oem-odm/':'OEM / ODM','/about/':'About Us','/contact/':'Contact','/inquiry/':'Enquiry','/404.html':'Page not found'})[path]||'Home'};
}
export function breadcrumbs(path) {
  if(path==='/') return [];
  const items=[{name:'Home',path:'/'}];
  if(path.startsWith('/products/') && path!=='/products/')items.push({name:'Products',path:'/products/'});
  if(path.startsWith('/services/') && path!=='/services/')items.push({name:'Services',path:'/services/'});
  items.push({name:metadata(path).label,path});
  return items;
}
export function decorate(html,path,preview=previewMode) {
  const meta=metadata(path);
  const noindex=preview || ['/404.html','/inquiry/'].includes(path);
  // Keep parent-section styling without incorrectly announcing it as this page.
  html=html.replace(/<a[^>]*aria-current="page"[^>]*>/g,tag => {
    const href=tag.match(/href="([^"]+)"/)?.[1];
    return href===path ? tag : tag.replace('aria-current="page"','class="section-active"');
  });
  html=html.replace(/<title>.*?<\/title>/,`<title>${xml(meta.title)}</title>`)
    .replace(/<meta name="description"[^>]*>/,`<meta name="description" content="${xml(meta.description)}">`)
    .replace(/<meta name="robots"[^>]*>/,`<meta name="robots" content="${noindex?'noindex,nofollow':'index,follow'}">`);
  const tags=`<meta property="og:type" content="website"><meta property="og:title" content="${xml(meta.title)}"><meta property="og:description" content="${xml(meta.description)}">${!preview && path!=='/404.html'?`<link rel="canonical" href="${origin}${path}"><meta property="og:url" content="${origin}${path}">`:''}`;
  html=html.replace('</head>',tags+'</head>');
  const crumbs=breadcrumbs(path);
  if(crumbs.length){
    const nav=`<nav class="breadcrumbs" aria-label="Breadcrumb"><ol>${crumbs.map((c,i)=>`<li>${i===crumbs.length-1?`<span aria-current="page">${xml(c.name)}</span>`:`<a href="${c.path}">${xml(c.name)}</a>`}</li>`).join('')}</ol></nav>`;
    html=html.replace(/<main id="main"[^>]*>/,tag=>`${tag}${nav}`);
    const schema={'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:crumbs.map((c,i)=>({'@type':'ListItem',position:i+1,name:c.name,item:origin+c.path}))};
    html=html.replace('</head>',`<script type="application/ld+json">${JSON.stringify(schema).replace(/</g,'\\u003c')}</script></head>`);
  }
  return html;
}
export function sitemap(paths){return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.filter(p=>!['/404.html','/inquiry/'].includes(p)).map(p=>`<url><loc>${xml(origin+p)}</loc></url>`).join('')}</urlset>\n`;}
