import {readFileSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {site} from '../src/seo-data.js';
import {projects, expertise} from '../src/data.js';
import {faqs} from '../src/faq-data.js';
import {renderProjectCard, renderExpertise} from '../src/project-renderer.js';

const root=fileURLToPath(new URL('../',import.meta.url));
const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const absolute=path=>new URL(path,site.url).href;
const personId=absolute('#person');
const websiteId=absolute('#website');

export function structuredData(){
  // All claims match the visible profile and expertise content. No invented ratings.
  const serviceRows=[
    {index:1,name:'Full-stack web development'},
    {index:2,name:'Custom WordPress plugin development'},
    {index:0,name:'AI engineering and custom MCP development'},
    {index:3,name:'Automation and marketing technology'}
  ];
  return {
    '@context':'https://schema.org',
    '@graph':[
      {'@type':'Person','@id':personId,name:site.name,url:site.url,image:absolute(site.image),jobTitle:'Full-stack web developer, team lead and AI architect',description:site.description,email:site.email,sameAs:[site.linkedin,site.github],address:{'@type':'PostalAddress',addressLocality:'Chattogram',addressCountry:'BD'},alumniOf:{'@type':'CollegeOrUniversity',name:'Premier University'},knowsAbout:expertise.flatMap(item=>item.skills)},
      {'@type':'WebSite','@id':websiteId,url:site.url,name:site.name,description:site.description,inLanguage:'en',publisher:{'@id':personId}},
      {'@type':'ProfilePage','@id':absolute('#webpage'),url:site.url,name:site.title,description:site.description,inLanguage:'en',isPartOf:{'@id':websiteId},mainEntity:{'@id':personId},primaryImageOfPage:{'@type':'ImageObject',url:absolute(site.image),caption:'Saikat Chowdhury'},about:serviceRows.map(row=>({'@id':absolute(`#service-${row.index+1}`)}))},
      ...serviceRows.map(row=>({'@type':'Service','@id':absolute(`#service-${row.index+1}`),name:row.name,serviceType:row.name,description:expertise[row.index].description,url:absolute(`#expertise-${row.index+1}`),provider:{'@id':personId}})),
      {'@type':'ItemList','@id':absolute('#portfolio'),name:'Selected work by Saikat Chowdhury',url:absolute('#work'),numberOfItems:projects.length,itemListElement:projects.map((p,i)=>({'@type':'ListItem',position:i+1,item:{'@id':absolute(`#project-${p.id}`)}}))},
      ...projects.map(p=>({'@type':'CreativeWork','@id':absolute(`#project-${p.id}`),name:p.title,url:absolute(`#project-${p.id}`),description:p.description,creator:{'@id':personId},isPartOf:{'@id':absolute('#webpage')},keywords:p.tags,...(p.image?{image:absolute(p.image)}:{})}))
    ]
  };
}

function metadata(){
  return `<title>${escape(site.title)}</title>
    <meta name="description" content="${escape(site.description)}" />
    <meta name="author" content="${escape(site.name)}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <link rel="canonical" href="${site.url}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${escape(site.name)}" />
    <meta property="og:title" content="${escape(site.title)}" />
    <meta property="og:description" content="${escape(site.description)}" />
    <meta property="og:url" content="${site.url}" />
    <meta property="og:image" content="${absolute(site.image)}" />
    <meta property="og:image:width" content="1440" />
    <meta property="og:image:height" content="1440" />
    <meta property="og:image:alt" content="Portrait of Saikat Chowdhury" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escape(site.title)}" />
    <meta name="twitter:description" content="${escape(site.description)}" />
    <meta name="twitter:image" content="${absolute(site.image)}" />
    <meta name="twitter:image:alt" content="Portrait of Saikat Chowdhury" />
    <script type="application/ld+json">${JSON.stringify(structuredData()).replace(/</g,'\\u003c')}</script>`;
}

function replaceBlock(html,name,content){
  const expression=new RegExp(`<!-- ${name}:start -->[\\s\\S]*?<!-- ${name}:end -->`);
  if(!expression.test(html))throw new Error(`Missing generated block: ${name}`);
  return html.replace(expression,()=>`<!-- ${name}:start -->\n${content}\n<!-- ${name}:end -->`);
}
function writeIfChanged(path,content){
  let previous;try{previous=readFileSync(path,'utf8')}catch{}
  if(previous!==content)writeFileSync(path,content);
}

export function generateSeo(){
  const entry=resolve(root,'index.html');
  let html=readFileSync(entry,'utf8');
  html=replaceBlock(html,'seo',metadata());
  html=replaceBlock(html,'projects',projects.map((p,i)=>renderProjectCard(p,i,projects)).join('\n'));
  html=replaceBlock(html,'expertise',renderExpertise(expertise));
  html=replaceBlock(html,'faq',faqs.map((f,i)=>`<details class="faq-item" ${i===0?'open':''}><summary>${escape(f.question)}<span aria-hidden="true">+</span></summary><p>${escape(f.answer)}</p></details>`).join('\n'));
  html=html.replace(/(data-filter="all"[^>]*>All work <span>)\d+/,`$1${projects.length}`).replace(/(id="work-count"[^>]*>)SHOWING \d+ OF \d+/,`$1SHOWING ${projects.length} OF ${projects.length}`);
  writeIfChanged(entry,html);
  // A one-page portfolio has one canonical sitemap URL; sections are not pages.
  writeIfChanged(resolve(root,'public/sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${escape(site.url)}</loc></url>\n</urlset>\n`);
  writeIfChanged(resolve(root,'public/robots.txt'),`User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${absolute('/sitemap.xml')}\n`);
  // Optional plain-text guide for consumers that support it; not a Google ranking signal.
  writeIfChanged(resolve(root,'public/llms.txt'),`# ${site.name}\n\n> ${site.description}\n\nCanonical portfolio: ${site.url}\nContact: ${site.email}\nLocation: Chattogram (Chittagong), Bangladesh; GMT+6.\n\n## Services\n\n${expertise.map(e=>`- ${e.title}: ${e.description}`).join('\n')}\n\n## Projects\n\n${projects.map(p=>`- [${p.title}](${absolute(`#project-${p.id}`)}): ${p.description}`).join('\n')}\n\n## Questions and answers\n\n${faqs.map(f=>`### ${f.question}\n\n${f.answer}`).join('\n\n')}\n\n## Links\n\n- [Sitemap](${absolute('/sitemap.xml')})\n- [CV](${absolute('/downloads/saikat-chowdhury-cv.pdf')})\n- [LinkedIn](${site.linkedin})\n- [GitHub](${site.github})\n`);
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  generateSeo();console.log('Generated metadata, schema, static portfolio content, robots.txt, and the one-page sitemap.');
}
