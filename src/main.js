import '@fontsource-variable/dm-sans';
import '@fontsource-variable/space-grotesk';
import '@fontsource-variable/manrope';
import '@fontsource/ibm-plex-mono/400.css';
import './style.css';
import './enhancements.css';
import './readability.css';
import './content.css';
import {projects, expertise} from './data.js';
import {initThemes} from './themes.js';
import {initContact} from './contact.js';
import {projectVisual, renderExpertise} from './project-renderer.js';

const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>Array.from(root.querySelectorAll(selector));
const escapeHtml=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
let motionPaused=reducedMotion.matches,scene=null;
document.body.dataset.intro=motionPaused?'ready':'waiting';
const themeManager=initThemes(color=>scene?.setAccent(color));

let filter='all',expanded=false;
function renderProjects(){
  const list=projects.filter(p=>filter==='all'||p.category.includes(filter));
  const visible=expanded||filter!=='all'?list:list.slice(0,6);
  const visibleIds=new Set(visible.map(p=>p.id));
  $$('.project-card').forEach(card=>{card.hidden=!visibleIds.has(card.id.replace('project-',''))});
  $('#work-count').textContent=`SHOWING ${String(visible.length).padStart(2,'0')} OF ${String(list.length).padStart(2,'0')}`;
  $('[data-filter="all"] span').textContent=projects.length;
  $('#show-more').hidden=filter!=='all';
  $('#show-more').innerHTML=expanded?'Show selected work <span>↑</span>':'More from the archive <span>↓</span>';

}
$$('[data-filter]').forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.filter;$$('[data-filter]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button))});renderProjects()}));
$('#show-more').addEventListener('click',()=>{expanded=!expanded;renderProjects();if(!expanded)$('#work').scrollIntoView({behavior:motionPaused?'instant':'smooth'})});
renderProjects();
$$('.project-card-button').forEach(button=>button.addEventListener('click',()=>openProject(button.dataset.project)));
$$('[data-project-notes]').forEach(summary=>summary.addEventListener('click',event=>{event.preventDefault();openProject(summary.dataset.projectNotes)}));

$('#expertise-list').innerHTML=renderExpertise(expertise);

let lastFocus=null;
function openDialog(dialog){lastFocus=document.activeElement;dialog.showModal();document.body.classList.add('modal-open')}
function closeDialog(dialog){dialog.close()}
$$('dialog').forEach(dialog=>{ $('.dialog-close',dialog).addEventListener('click',()=>closeDialog(dialog));dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)closeDialog(dialog)}});dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');lastFocus?.focus({preventScroll:true})})});
function openProject(id){
  const p=projects.find(item=>item.id===id);if(!p)return;
  $('#project-detail').innerHTML=`<div class="project-detail-visual">${projectVisual(p,'detail-')}</div><div class="project-detail-body"><p class="project-detail-label">${p.label}</p><h2 id="project-dialog-title">${p.title}</h2><p>${p.description}</p><div class="skill-chips">${p.tags.map(t=>`<span>${t}</span>`).join('')}</div><div class="project-detail-columns"><div><h3>The work</h3><ul>${p.features.map(t=>`<li>${t}</li>`).join('')}</ul></div><div><h3>The building blocks</h3><ul>${p.architecture.map(t=>`<li>${t}</li>`).join('')}</ul></div></div><div class="detail-action">${p.url?`<a class="button button-primary" href="${p.url}" target="_blank" rel="noopener noreferrer">Visit live website <span>↗</span></a>`:`<a class="button button-outline" href="mailto:hi@saikatchowdhury.com?subject=${encodeURIComponent(`Tell me about ${p.title}`)}">Let’s talk about this project <span>↗</span></a>`}${p.repo?`<a class="text-link" href="${p.repo}" target="_blank" rel="noopener noreferrer">View source on GitHub ↗</a>`:''}</div></div>`;
  $('#project-dialog').setAttribute('aria-labelledby','project-dialog-title');openDialog($('#project-dialog'));
}


function openProjectAnchor(){
  const id=location.hash.replace('#project-','');
  if(location.hash.startsWith('#project-')&&projects.some(p=>p.id===id)){
    if($('#project-dialog').open)$('#project-dialog').close();
    openProject(id);
  }
}
window.addEventListener('hashchange',openProjectAnchor);
openProjectAnchor();

// A local command palette. No model calls, API keys, or personal data leave this page.
const commands=[...projects.map(p=>({title:p.title,detail:p.tags.join(' · '),icon:p.category.includes('ai')?'⌘':'↗',keywords:[p.subtitle,p.description,...p.category].join(' '),run:()=>openProject(p.id)})),...expertise.map((e,i)=>({title:e.title,detail:e.skills.join(' · '),keywords:e.skills.join(' '),icon:'✳',run:()=>{const row=$$('.expertise-row')[i];row.open=true;row.scrollIntoView({behavior:motionPaused?'instant':'smooth',block:'center'});$('summary',row).focus({preventScroll:true})}})),{title:'Start a conversation',detail:'hi@saikatchowdhury.com',keywords:'email contact hire availability',icon:'↗',run:()=>$('#contact').scrollIntoView({behavior:motionPaused?'instant':'smooth'})},{title:'About Saikat',detail:'Developer, team lead, and founder',keywords:'about founder experience wonder web studio',icon:'+',run:()=>$('#about').scrollIntoView({behavior:motionPaused?'instant':'smooth'})}];
let matchingCommands=[],selectedResult=0;
function updateSearch(){
  const query=$('#search-input').value.toLowerCase().trim();
  matchingCommands=commands.filter(c=>`${c.title} ${c.detail} ${c.keywords}`.toLowerCase().includes(query)).slice(0,query?14:6);selectedResult=0;
  $('#search-results').innerHTML=matchingCommands.length?matchingCommands.map((c,i)=>`<button class="search-result ${i===0?'selected':''}" data-result="${i}"><span class="result-icon">${c.icon}</span><span class="result-copy"><strong>${escapeHtml(c.title)}</strong><small>${escapeHtml(c.detail)}</small></span><span class="result-arrow">↗</span></button>`).join(''):'<p class="search-empty">No matches yet. Try “MCP”, “React”, or “contact”.</p>';
  $$('.search-result').forEach(button=>button.addEventListener('click',()=>runResult(Number(button.dataset.result))));
}
function runResult(index){const command=matchingCommands[index];if(!command)return;closeDialog($('#search-dialog'));requestAnimationFrame(()=>command.run())}
function openSearch(){updateSearch();openDialog($('#search-dialog'));$('#search-input').focus()}
$('.search-trigger').addEventListener('click',openSearch);
$('#search-input').addEventListener('input',updateSearch);
$('#search-dialog').addEventListener('keydown',event=>{if(!matchingCommands.length)return;if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();selectedResult=(selectedResult+(event.key==='ArrowDown'?1:-1)+matchingCommands.length)%matchingCommands.length;$$('.search-result').forEach((b,i)=>b.classList.toggle('selected',i===selectedResult));$$('.search-result')[selectedResult].scrollIntoView({block:'nearest'})}if(event.key==='Enter'&&event.target===$('#search-input')){event.preventDefault();runResult(selectedResult)}});
document.addEventListener('keydown',event=>{if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){event.preventDefault();if($('#search-dialog').open)closeDialog($('#search-dialog'));else if(!document.querySelector('dialog[open]'))openSearch()}});
$('#search-dialog').setAttribute('aria-label','Search portfolio');

const menuButton=$('.menu-toggle');
function closeMenu(){menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Open menu');$('#mobile-nav').hidden=true}
menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Close menu':'Open menu');$('#mobile-nav').hidden=!open});
$$('#mobile-nav a').forEach(a=>a.addEventListener('click',closeMenu));document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
window.matchMedia('(min-width:801px)').addEventListener('change',event=>{if(event.matches)closeMenu()});

let toastTimeout;
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>$('#toast').classList.remove('visible'),3500)}
$('#copy-email').addEventListener('click',async()=>{try{await navigator.clipboard.writeText('hi@saikatchowdhury.com');toast('Email copied. Let’s make something great.')}catch{toast('Email: hi@saikatchowdhury.com')}});
initContact(openDialog);
const localTime=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Dhaka',hour:'2-digit',minute:'2-digit',hour12:false});
function updateTime(){$$('[data-local-time]').forEach(el=>el.textContent=`${localTime.format(new Date())} BST`)}updateTime();setInterval(updateTime,30000);$('#year').textContent=new Intl.DateTimeFormat('en',{timeZone:'Asia/Dhaka',year:'numeric'}).format(new Date());

const glow=$('#cursor-glow'),dot=$('#cursor-dot'),portrait=$('.portrait-wrap'),hero=$('#hero-visual');
const pointer={x:-1000,y:-1000},smooth={x:-1000,y:-1000};let cursorFrame=0,heroVisible=true;
function cursorLoop(){cursorFrame=0;if(motionPaused||document.hidden)return;smooth.x+=(pointer.x-smooth.x)*.11;smooth.y+=(pointer.y-smooth.y)*.11;glow.style.transform=`translate(${smooth.x-240}px,${smooth.y-240}px)`;const size=dot.classList.contains('active')?32:8;dot.style.transform=`translate(${smooth.x-size/2}px,${smooth.y-size/2}px)`;if(heroVisible&&pointer.x>0){const rect=hero.getBoundingClientRect();const x=Math.max(-1,Math.min(1,(smooth.x-rect.left-rect.width/2)/rect.width));const y=Math.max(-1,Math.min(1,(smooth.y-rect.top-rect.height/2)/rect.height));portrait.style.transform=`perspective(1000px) rotateY(${-12+x*12}deg) rotateX(${-y*8}deg) rotateZ(${6+x*3}deg)`}if(Math.abs(pointer.x-smooth.x)>.1||Math.abs(pointer.y-smooth.y)>.1)cursorFrame=requestAnimationFrame(cursorLoop)}
function startCursor(){if(!cursorFrame&&!motionPaused&&window.matchMedia('(pointer:fine)').matches)cursorFrame=requestAnimationFrame(cursorLoop)}
window.addEventListener('pointermove',event=>{pointer.x=event.clientX;pointer.y=event.clientY;startCursor()},{passive:true});
document.addEventListener('pointerover',event=>{dot.classList.toggle('active',Boolean(event.target.closest('a,button,summary,input,textarea')));startCursor()});
$$('.glass').forEach(card=>card.addEventListener('pointermove',event=>{if(motionPaused)return;const rect=card.getBoundingClientRect();card.style.setProperty('--card-x',`${event.clientX-rect.left}px`);card.style.setProperty('--card-y',`${event.clientY-rect.top}px`)}));
new IntersectionObserver(([entry])=>{heroVisible=entry.isIntersecting},{threshold:0}).observe(hero);
function applyMotion(){document.body.classList.toggle('motion-off',motionPaused);document.documentElement.style.scrollBehavior=motionPaused?'auto':'';if(motionPaused)document.body.dataset.intro='ready';$('#motion-toggle').setAttribute('aria-pressed',String(motionPaused));$('#motion-toggle').setAttribute('aria-label',motionPaused?'Enable animations':'Pause animations');$('#motion-toggle').innerHTML=motionPaused?'<span>▷</span> MOTION OFF':'<span>Ⅱ</span> MOTION ON';scene?.setPaused(motionPaused);if(motionPaused){if(cursorFrame)cancelAnimationFrame(cursorFrame);cursorFrame=0;portrait.style.transform=''}else startCursor()}
$('#motion-toggle').addEventListener('click',()=>{motionPaused=!motionPaused;applyMotion()});reducedMotion.addEventListener('change',event=>{motionPaused=event.matches;applyMotion()});applyMotion();

let completed=0,introFinished=false;
function finishIntro(){
  if(introFinished)return;introFinished=true;
  $('#load-progress').textContent='100%';$('.loader-track i').style.width='100%';
  $('#preloader').classList.add('complete');
  document.body.dataset.intro=motionPaused?'ready':'entering';
  setTimeout(()=>{document.body.dataset.intro='ready'},2100);
}
function progress(){completed++;if(introFinished)return;const amount=Math.round(completed/3*100);$('#load-progress').textContent=`${String(amount).padStart(2,'0')}%`;$('.loader-track i').style.width=`${amount}%`;if(completed>=3)setTimeout(finishIntro,170)}
const portraitImage=$('.portrait-frame img');if(portraitImage.complete)progress();else{portraitImage.addEventListener('load',progress,{once:true});portraitImage.addEventListener('error',progress,{once:true})}
document.fonts.ready.then(progress);
import('./scene.js').then(({createHeroScene})=>{scene=createHeroScene($('#hero-canvas'),hero,motionPaused);scene.setAccent(themeManager.color)}).catch(error=>{console.warn('3D enhancement unavailable; portrait remains visible.',error)}).finally(progress);
// Fail open if a font or optional visual asset is delayed.
setTimeout(finishIntro,2300);
if(import.meta.hot)import.meta.hot.dispose(()=>scene?.dispose());
