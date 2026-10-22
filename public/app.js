'use strict';
document.querySelectorAll('[data-package]').forEach(a=>a.addEventListener('click',()=>{document.querySelector('#format').value=a.dataset.package;}));
document.querySelector('#inquiry-form').addEventListener('submit',async e=>{
 e.preventDefault(); const form=e.currentTarget; if(!form.reportValidity()) return;
 const button=form.querySelector('button[type="submit"]'); const status=document.querySelector('#form-status');
 const values=Object.fromEntries(new FormData(form));
 button.disabled=true; button.textContent='Sending…'; status.textContent=''; status.dataset.state='pending';
 try {
  const response=await fetch('/api/inquiry',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(values)});
  let result;
  try {result=await response.json();} catch {throw new Error('Our inquiry service is temporarily unavailable. Please try again or call (307) 429-2064.');}
  if(!response.ok||!result.ok) throw new Error(result.error||'Your inquiry could not be sent. Please try again or call (307) 429-2064.');
  status.textContent='Thank you. Your inquiry has been sent to our team. We look forward to learning about your district.';
  status.dataset.state='success'; form.reset();
 } catch(error) {
  status.textContent=error.message==='Failed to fetch'?'We could not connect. Please try again or call (307) 429-2064.':error.message;
  status.dataset.state='error';
 } finally {button.disabled=false;button.innerHTML='Send inquiry <span aria-hidden="true">↗</span>';}
});
