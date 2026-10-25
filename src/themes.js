export const themes = [
  {id:'purple',name:'Purple',color:'#b6abff'},
  {id:'orange',name:'Orange',color:'#ff884d'},
  {id:'yellow',name:'Yellow',color:'#f5e04b'},
  {id:'amber',name:'Golden amber',color:'#ffb347'},
  {id:'cyan',name:'Electric cyan',color:'#51d8ef'},
  {id:'lime',name:'Lime',color:'#b4ef57'},
  {id:'pink',name:'Hot pink',color:'#ff80b5'},
  {id:'coral',name:'Coral',color:'#ff746c'}
];
const defaultTheme=themes.find(theme=>theme.id==='amber');

export function initThemes(onChange) {
  const trigger=document.querySelector('#theme-trigger');
  const panel=document.querySelector('#theme-panel');
  const choices=document.querySelector('#theme-options');
  let selected=defaultTheme;
  choices.innerHTML=themes.map(theme=>`<button class="theme-swatch" type="button" data-theme="${theme.id}" style="--swatch:${theme.color}" aria-label="${theme.name}" aria-pressed="false"><span class="swatch-color"><span aria-hidden="true">✓</span></span><span>${theme.name}</span></button>`).join('');

  function apply(id,announce=false){
    selected=themes.find(theme=>theme.id===id)||defaultTheme;
    document.documentElement.style.setProperty('--accent',selected.color);
    document.documentElement.dataset.theme=selected.id;
    document.querySelectorAll('[data-theme]').forEach(button=>{if(button.tagName==='BUTTON')button.setAttribute('aria-pressed',String(button.dataset.theme===selected.id))});
    trigger.setAttribute('aria-label',`Change accent color, currently ${selected.name}`);
    document.querySelector('#theme-current').textContent=selected.name;
    if(announce)document.querySelector('#theme-announcement').textContent=`${selected.name} theme selected.`;
    try{localStorage.setItem('saikat-accent',selected.id)}catch{/* Storage can be disabled. The theme still works. */}
    onChange(selected.color);
  }
  function close(restoreFocus=false){panel.hidden=true;trigger.setAttribute('aria-expanded','false');if(restoreFocus)trigger.focus()}
  trigger.addEventListener('click',()=>{const open=panel.hidden;panel.hidden=!open;trigger.setAttribute('aria-expanded',String(open));if(open)choices.querySelector('[aria-pressed="true"]').focus()});
  choices.addEventListener('click',event=>{const button=event.target.closest('button[data-theme]');if(button)apply(button.dataset.theme,true)});
  panel.addEventListener('keydown',event=>{
    if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close(true);return}
    const buttons=[...choices.querySelectorAll('button')];const index=buttons.indexOf(document.activeElement);
    if(index<0)return;
    const delta={ArrowRight:1,ArrowLeft:-1,ArrowDown:4,ArrowUp:-4}[event.key];
    if(delta!==undefined){event.preventDefault();buttons[(index+delta+buttons.length)%buttons.length].focus()}
    if(event.key==='Home'||event.key==='End'){event.preventDefault();buttons[event.key==='Home'?0:buttons.length-1].focus()}
  });
  document.addEventListener('pointerdown',event=>{if(!panel.hidden&&!panel.contains(event.target)&&!trigger.contains(event.target))close()});
  document.addEventListener('focusin',event=>{if(!panel.hidden&&!panel.contains(event.target)&&!trigger.contains(event.target))close()});
  let saved;try{saved=localStorage.getItem('saikat-accent')}catch{}
  apply(saved||defaultTheme.id);
  return {get color(){return selected.color},close};
}
