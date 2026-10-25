export function initContact(openDialog){
  const dialog=document.querySelector('#contact-dialog');
  const form=document.querySelector('#contact-form');
  const submit=form.querySelector('[type="submit"]');
  const feedback=document.querySelector('#contact-feedback');
  const availability=document.querySelector('#contact-availability');
  const success=document.querySelector('#contact-success');
  let pending=false;

  function showFeedback(message,isError=false){feedback.textContent=message;feedback.classList.toggle('is-error',isError);feedback.hidden=!message}
  async function checkAvailability(){
    try{const response=await fetch('/api/contact/status',{cache:'no-store'});const data=await response.json();availability.hidden=response.ok&&data.available===true;}
    catch{availability.hidden=false}
  }
  function open(){openDialog(dialog);checkAvailability()}
  document.querySelectorAll('[data-contact-open]').forEach(button=>button.addEventListener('click',event=>{event.preventDefault();document.querySelector('#mobile-nav').hidden=true;const menu=document.querySelector('.menu-toggle');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open menu');open()}));
  form.addEventListener('input',()=>{if(!pending)showFeedback('')});
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(pending||!form.reportValidity())return;
    pending=true;submit.disabled=true;form.setAttribute('aria-busy','true');submit.innerHTML='Sending your message <span class="sending-spinner" aria-hidden="true"></span>';showFeedback('');
    try{
      const values=Object.fromEntries(new FormData(form));
      const response=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(values),signal:AbortSignal.timeout(35000)});
      const data=await response.json();
      if(!response.ok||data.ok!==true)throw new Error(data.error||'Your message could not be sent. Please try again or email me directly.');
      form.hidden=true;availability.hidden=true;success.hidden=false;success.focus();form.reset();
    }catch(error){showFeedback(error.name==='TimeoutError'?'Delivery is taking longer than expected. Please wait before trying again, or email me directly.':error.message||'Something went wrong. Your message is still here. Please try again.',true)}
    finally{pending=false;submit.disabled=false;form.removeAttribute('aria-busy');submit.innerHTML='Send message <span>↗</span>'}
  });
  document.querySelector('#contact-another').addEventListener('click',()=>{success.hidden=true;form.hidden=false;showFeedback('');form.elements.name.focus()});
  return {open};
}
