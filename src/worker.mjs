import {EmailMessage} from 'cloudflare:email';
import {handleInquiry} from './contact.mjs';
const policy={
 'X-Content-Type-Options':'nosniff',
 'Referrer-Policy':'strict-origin-when-cross-origin',
 'X-Frame-Options':'DENY',
 'Permissions-Policy':'camera=(), microphone=(), geolocation=()',
 'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-src https://www.erstrategies.org; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
};
export default {async fetch(request,env){
 const url=new URL(request.url);let response;
 if(url.pathname==='/api/inquiry'){
  response=await handleInquiry(request,env,async message=>{
   const encoded=btoa(String.fromCharCode(...new TextEncoder().encode(message.text))).match(/.{1,76}/g).join('\r\n');
   const raw=`From: SGO Launch <${message.from}>\r\nTo: ${message.to}\r\nReply-To: ${message.replyTo}\r\nSubject: ${message.subject}\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n${encoded}\r\n`;
   await env.CONTACT_EMAIL.send(new EmailMessage(message.from,message.to,raw));
  });
 }else if(url.pathname.startsWith('/api/')) response=new Response('Not found',{status:404});
 else if(!['GET','HEAD'].includes(request.method))response=new Response('Method not allowed',{status:405});
 else response=await env.ASSETS.fetch(request);
 response=new Response(response.body,response);for(const[k,v]of Object.entries(policy))response.headers.set(k,v);
 return response;
}};
