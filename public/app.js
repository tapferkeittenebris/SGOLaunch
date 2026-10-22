'use strict';
const money=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0});
let mode='remote';
const fields={filing:document.querySelector('#filing'),days:document.querySelector('#days'),travel:document.querySelector('#travel')};
function amount(el,max){return Math.max(0,Math.min(max,Number(el.value)||0));}
function updateEstimate(){
 const filing=amount(fields.filing,1000000),days=Math.floor(amount(fields.days,30)),travel=amount(fields.travel,1000000);
 const onsite=mode==='in-person';
 document.querySelector('#total').textContent=money.format(5600+filing+(onsite?days*1000+travel:0));
 document.querySelector('#breakdown').textContent=`$5,000 setup + $600 IRS fee + ${money.format(filing)} state incorporation fees`+(onsite?` + ${money.format(days*1000)} for ${days} travel ${days===1?'day':'days'} + ${money.format(travel)} estimated travel costs`:'');
 document.querySelector('#travel-inputs').hidden=!onsite;
 document.querySelectorAll('[data-mode]').forEach(b=>{let selected=b.dataset.mode===mode;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected));});
}
Object.values(fields).forEach(input=>{input.addEventListener('input',updateEstimate);input.addEventListener('change',()=>{input.value=String(input.id==='days'?Math.floor(amount(input,30)):Math.round(amount(input,1000000)));updateEstimate();});});
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.mode;updateEstimate();}));
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
updateEstimate();
