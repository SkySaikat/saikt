import test from 'node:test';
import assert from 'node:assert/strict';
import {Readable} from 'node:stream';
import {createContactMiddleware,validateInquiry,RECIPIENT} from './contact.js';

const valid={name:'Portfolio QA',email:'visitor@example.com',service:'Website or web application',budget:'$1,000 to $5,000',message:'This is a local automated test. No email is delivered.',website:''};
function fakeSender(options={}){
  const messages=[];
  return {messages,from:RECIPIENT,send:async message=>{messages.push(message);if(options.fail)throw new Error('Private SMTP credentials must not be exposed');return {accepted:options.reject?[]:[RECIPIENT]}}};
}
async function request(handler,{body=valid,method='POST',path='/api/contact',headers={},raw}={}){
  const req=Readable.from([Buffer.from(raw??JSON.stringify(body))]);
  Object.assign(req,{url:path,method,headers:{host:'127.0.0.1:5173',origin:'http://127.0.0.1:5173','content-type':'application/json',...headers},socket:{remoteAddress:'127.0.0.1'}});
  let code,responseHeaders,data;
  const res={writeHead(status,values){code=status;responseHeaders=values},end(value){data=JSON.parse(value)}};
  await handler(req,res,()=>{throw new Error('Unexpected route fallthrough')});
  return {code,headers:responseHeaders,data};
}

test('a valid submission reaches only the fixed owner address with a safe Reply-To',async()=>{
  const sender=fakeSender();const handler=createContactMiddleware({sender});
  const response=await request(handler,{body:{...valid,to:'attacker@example.com',from:'attacker@example.com'}});
  assert.equal(response.code,200);assert.equal(response.data.ok,true);
  assert.equal(sender.messages.length,1);const mail=sender.messages[0];
  assert.equal(mail.to,RECIPIENT);assert.equal(mail.from.address,RECIPIENT);assert.equal(mail.replyTo.address,valid.email);
  assert.match(mail.text,/Budget: \$1,000 to \$5,000/);assert.equal(mail.html,undefined);
});
test('validation rejects header injection, malformed addresses, missing fields, and invalid options',()=>{
  for(const patch of [{name:'Alex\r\nBcc: evil@example.com'},{email:'alex@example.com\nBcc:evil@example.com'},{email:'not-an-email'},{message:'short'},{service:'invalid'},{budget:'invalid'},{message:'x'.repeat(5001)}]){
    assert.throws(()=>validateInquiry({...valid,...patch}));
  }
});
test('cross-origin requests and honeypot submissions never send',async()=>{
  const sender=fakeSender();const handler=createContactMiddleware({sender});
  assert.equal((await request(handler,{headers:{origin:'https://evil.example'}})).code,403);
  assert.equal((await request(handler,{body:{...valid,website:'https://spam.example'}})).code,400);
  assert.equal(sender.messages.length,0);
});
test('malformed and oversized requests are rejected before SMTP',async()=>{
  const sender=fakeSender();const handler=createContactMiddleware({sender});
  assert.equal((await request(handler,{raw:'{not json'})).code,400);
  assert.equal((await request(handler,{raw:'x'.repeat(25000)})).code,413);
  assert.equal((await request(handler,{headers:{'content-type':'text/plain'}})).code,415);
  assert.equal(sender.messages.length,0);
});
test('missing SMTP settings report unavailable, never a false success',async()=>{
  const handler=createContactMiddleware({sender:null});
  assert.deepEqual((await request(handler,{method:'GET',path:'/api/contact/status'})).data,{available:false});
  const response=await request(handler);assert.equal(response.code,503);assert.match(response.data.error,/has not been sent/);
});
test('delivery failures and rejected recipients return useful errors without private details',async()=>{
  for(const options of [{fail:true},{reject:true}]){
    const result=await request(createContactMiddleware({sender:fakeSender(options)}));
    assert.equal(result.code,502);assert.doesNotMatch(result.data.error,/Private SMTP/);
    assert.equal(result.data.ok,undefined);
  }
});
test('repeated submissions are limited and the window expires',async()=>{
  const sender=fakeSender();let time=1000;const handler=createContactMiddleware({sender,now:()=>time});
  for(let i=0;i<5;i++)assert.equal((await request(handler)).code,200);
  const limited=await request(handler);assert.equal(limited.code,429);assert.equal(limited.headers['Retry-After'],'900');
  time+=15*60*1000+1;assert.equal((await request(handler)).code,200);assert.equal(sender.messages.length,6);
});
