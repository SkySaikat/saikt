const escapeHtml=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function networkArt(project){
  const color='currentColor';
  return `<div class="network-art ${project.theme==='callrail'?'callrail-art':''}" aria-label="${escapeHtml(project.title)} architecture illustration"><svg viewBox="0 0 500 300" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="line-${project.id}"><stop stop-color="${color}" stop-opacity=".1"/><stop offset=".5" stop-color="${color}" stop-opacity=".8"/><stop offset="1" stop-color="${color}" stop-opacity=".2"/></linearGradient></defs><path d="M100 90 H175 Q190 90 190 120 V150 H250 M400 90 H325 Q310 90 310 120 V150 H250 M100 235 H170 Q190 235 190 205 V150 H250 M400 235 H330 Q310 235 310 205 V150 H250" fill="none" stroke="url(#line-${project.id})" stroke-width="1.2"/><circle cx="190" cy="150" r="3" fill="${color}"/><circle cx="310" cy="150" r="3" fill="${color}"/></svg><div class="network-node core"><b>⌘</b><span>MCP SERVER</span></div>${project.nodes.map((label,i)=>`<div class="network-node node-${'abcd'[i]}"><b>${project.glyphs[i]}</b><span>${label}</span></div>`).join('')}<span class="network-bottom">SYSTEM ARCHITECTURE / CONCEPT VIEW</span></div>`;
}

export function renderProjectCard(project,index,allProjects,{fallback=false}={}) {
  const p=project;
  return `<article class="project-card" style="animation-delay:${Math.min(index,5)*35}ms"><button class="project-card-button" data-project="${p.id}" aria-label="View ${escapeHtml(p.title)} project details"><div class="project-image ${p.imageClass||''}">${projectVisual(p)}<span class="project-type">${escapeHtml(p.label)}</span><span class="project-open" aria-hidden="true">↗</span></div><div class="project-heading"><h3>${escapeHtml(p.title)}</h3><span class="card-index">${String(allProjects.indexOf(p)+1).padStart(2,'0')} / ${String(allProjects.length).padStart(2,'0')}</span></div><p class="project-subtitle">${escapeHtml(p.subtitle)}</p><div class="project-tags">${p.tags.map(t=>`<span>${escapeHtml(t)}</span>`).join('')}</div></button>${fallback?`<noscript><details class="project-fallback"><summary>Read about ${escapeHtml(p.title)}</summary><p>${escapeHtml(p.description)}</p><ul>${p.features.map(t=>`<li>${escapeHtml(t)}</li>`).join('')}</ul>${p.url?`<a href="${escapeHtml(p.url)}" target="_blank" rel="noopener noreferrer">Visit the project website ↗</a>`:''}</details></noscript>`:''}</article>`;
}

export function renderExpertise(items) {
  return items.map((item,i)=>`<details id="expertise-${i+1}" class="expertise-row" ${i===0?'open':''}><summary><span class="expertise-number">0${i+1}</span><h3>${escapeHtml(item.title)}</h3><span class="expand-icon" aria-hidden="true">+</span></summary><div class="expertise-content"><p>${escapeHtml(item.description)}</p><div class="skill-chips">${item.skills.map(s=>`<span>${escapeHtml(s)}</span>`).join('')}</div></div></details>`).join('');
}
export function projectVisual(project){
  if(project.type==='network')return networkArt(project);
  if(project.type==='plugin')return `<div class="plugin-art"><span class="plugin-symbol">${project.symbol}</span><strong>${project.artTitle}</strong><div class="plugin-flow">${project.flow.map((s,i)=>`${i?'<i>→</i>':''}<span>${s}</span>`).join('')}</div><span class="concept-caption">WORKFLOW / CONCEPT VIEW</span></div>`;
  return `<img src="${project.image}" alt="${escapeHtml(project.title)} website preview" loading="lazy" width="720" height="440"><span class="image-overlay"></span>`;
}
