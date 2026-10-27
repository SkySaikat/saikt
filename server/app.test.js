import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createApp} from './app.js';
import {RECIPIENT} from './contact.js';
import {submitInquiry} from '../src/contact-api.js';

test('production server serves the portfolio and delivers through the same browser API contract',async t=>{
  const root=await mkdtemp(join(tmpdir(),'portfolio-test-'));
  await writeFile(join(root,'index.html'),'<!doctype html><h1>Portfolio</h1>');
  await writeFile(join(root,'.env'),'private');
  const messages=[];
  const sender={from:RECIPIENT,send:async mail=>{messages.push(mail);return {accepted:[RECIPIENT]}}};
  const server=createApp({sender,staticRoot:root,env:{SITE_ORIGIN:'https://saikatchowdhury.com'}}).listen(0,'127.0.0.1');
  await new Promise(resolve=>server.once('listening',resolve));
  t.after(async()=>{await new Promise(resolve=>server.close(resolve));await rm(root,{recursive:true,force:true})});
  const base=`http://127.0.0.1:${server.address().port}`;
  const home=await fetch(base);assert.equal(home.status,200);assert.match(await home.text(),/Portfolio/);
  const status=await fetch(`${base}/api/contact/status`);assert.deepEqual(await status.json(),{available:true});assert.equal(status.headers.get('cache-control'),'no-store');
  for(const path of ['/not-a-page','/.env','/server/contact.js'])assert.equal((await fetch(base+path)).status,404);
  const missingApi=await fetch(`${base}/api/missing`);assert.equal(missingApi.status,404);assert.match(missingApi.headers.get('content-type'),/application\/json/);
  const fetcher=(path,options)=>fetch(base+path,{...options,headers:{...options.headers,Origin:'https://saikatchowdhury.com'}});
  const inquiry={name:'Local Test',email:'visitor@example.com',service:'Website or web application',budget:'',message:'This is an integration test using a fake SMTP transport.',website:''};
  assert.deepEqual(await submitInquiry(inquiry,{fetcher}),{ok:true});assert.equal(messages.length,1);assert.equal(messages[0].to,RECIPIENT);assert.equal(messages[0].replyTo.address,inquiry.email);
  await assert.rejects(()=>submitInquiry({...inquiry,message:'short'},{fetcher}),/20 to 5,000/);
  const forbidden=await fetch(`${base}/api/contact`,{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://evil.example'},body:JSON.stringify(inquiry)});
  assert.equal(forbidden.status,403);assert.equal(messages.length,1);
});

test('HTML error pages, invalid JSON and network errors produce useful form errors',async()=>{
  for(const response of [new Response('<!DOCTYPE html><title>404</title>',{status:404,headers:{'Content-Type':'text/html'}}),new Response('<!DOCTYPE html>',{headers:{'Content-Type':'text/html'}}),new Response('{bad json',{headers:{'Content-Type':'application/json'}}),Response.json(null),Response.json({ok:false}),Response.json({ok:true},{status:500})]){
    await assert.rejects(()=>submitInquiry({}, {fetcher:async()=>response}),error=>{
      assert.doesNotMatch(error.message,/Unexpected token|JSON/);
      assert.match(error.message,/hi@saikatchowdhury.com/);return true;
    });
  }
  await assert.rejects(()=>submitInquiry({}, {fetcher:async()=>{throw new TypeError('Failed to fetch')}}),/Check your connection/);
});

test('missing runtime SMTP configuration returns JSON and never claims delivery',async t=>{
  const server=createApp({sender:null}).listen(0,'127.0.0.1');
  await new Promise(resolve=>server.once('listening',resolve));
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  const base=`http://127.0.0.1:${server.address().port}`;
  assert.deepEqual(await (await fetch(`${base}/api/contact/status`)).json(),{available:false});
  await assert.rejects(()=>submitInquiry({}, {fetcher:(path,opts)=>fetch(base+path,opts)}),/has not been sent/);
});
