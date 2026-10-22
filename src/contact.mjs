const json=(body,status=200,extra={})=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...extra}});
const normalize=(value,max)=>typeof value==='string'?value.trim().slice(0,max):'';
export async function handleInquiry(request,env,send){
 if(request.method!=='POST') return json({ok:false,error:'Use the inquiry form to send a message.'},405,{'allow':'POST'});
 const url=new URL(request.url),origin=request.headers.get('origin');
 if(!origin||origin!==url.origin) return json({ok:false,error:'Please send your inquiry from this website.'},403);
 if(!request.headers.get('content-type')?.includes('application/json')) return json({ok:false,error:'Unsupported request format.'},415);
 const length=Number(request.headers.get('content-length')||0); if(length>14000)return json({ok:false,error:'Your message is too long.'},413);
 let input;try{const raw=await request.text();if(raw.length>14000)return json({ok:false,error:'Your message is too long.'},413);input=JSON.parse(raw);}catch{return json({ok:false,error:'Please check your message and try again.'},400);}
 if(!input||typeof input!=='object'||Array.isArray(input))return json({ok:false,error:'Please complete the form.'},400);
 if(input.website) return json({ok:true});
 const fields={name:normalize(input.name,120),email:normalize(input.email,254),organization:normalize(input.organization,200),state:normalize(input.state,80),format:normalize(input.format,30),message:normalize(input.message,5000)};
 if(!fields.name||!fields.organization||!fields.state||!['remote','in-person','exploring'].includes(fields.format)||! /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?\.[A-Za-z]{2,}$/.test(fields.email)||/[\r\n]/.test(fields.email))return json({ok:false,error:'Please provide your name, valid email, organization, state, and preferred format.'},400);
 if(env.CONTACT_RATE_LIMIT){const {success}=await env.CONTACT_RATE_LIMIT.limit({key:request.headers.get('cf-connecting-ip')||'unknown'});if(!success)return json({ok:false,error:'Too many inquiries. Please wait a minute or call (307) 429-2064.'},429,{'retry-after':'60'});}
 if(!env.CONTACT_EMAIL||!env.CONTACT_TO||!env.CONTACT_FROM)return json({ok:false,error:'Our inquiry service is temporarily unavailable. Please call (307) 429-2064.'},503);
 const id=crypto.randomUUID();const subject='SGO Launch website inquiry';
 const text=`New SGO Launch inquiry\nReference: ${id}\nReceived: ${new Date().toISOString()}\n\nName: ${fields.name}\nEmail: ${fields.email}\nOrganization: ${fields.organization}\nState: ${fields.state}\nInterested in: ${fields.format}\n\nGoals, questions, and timing:\n${fields.message||'(Not provided)'}\n`;
 try {await send({from:env.CONTACT_FROM,to:env.CONTACT_TO,replyTo:fields.email,subject,text});return json({ok:true,reference:id});}
 catch {return json({ok:false,error:'Your message could not be sent. Please try again or call (307) 429-2064.'},502);}
}
