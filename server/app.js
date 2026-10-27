import express from 'express';
import {fileURLToPath} from 'node:url';
import {createContactMiddleware} from './contact.js';

const dist=fileURLToPath(new URL('../dist/',import.meta.url));

export function createApp({env=process.env,sender,staticRoot=dist}={}){
  const app=express();
  app.disable('x-powered-by');
  // Enable only when the hosting proxy topology is known. Never trust arbitrary hops.
  if(env.TRUST_PROXY_HOPS){
    const hops=Number(env.TRUST_PROXY_HOPS);
    if(!Number.isInteger(hops)||hops<1||hops>5)throw new Error('Invalid TRUST_PROXY_HOPS');
    app.set('trust proxy',hops);
  }
  app.use((req,res,next)=>{
    res.setHeader('X-Content-Type-Options','nosniff');
    next();
  });
  // Read the raw stream in the shared handler, with its own small body limit.
  app.use(createContactMiddleware({env,sender,getClientIp:req=>req.ip}));
  app.use('/api',(req,res)=>res.status(404).set('Cache-Control','no-store').json({error:'This endpoint does not exist.'}));
  app.use(express.static(staticRoot,{
    dotfiles:'deny',index:'index.html',redirect:false,
    setHeaders(res,path){
      res.setHeader('Cache-Control',/\/assets\/.*-[\w-]{8,}\./.test(path)?'public, max-age=31536000, immutable':'public, max-age=0, must-revalidate');
    }
  }));
  app.use((req,res)=>res.status(404).type('html').send('<!doctype html><html lang="en"><meta charset="utf-8"><title>Page not found | Saikat Chowdhury</title><h1>Page not found</h1><p><a href="/">Return to Saikat’s portfolio</a></p></html>'));
  app.use((error,req,res,next)=>{
    if(res.headersSent)return next(error);
    console.error('portfolio_request_failed');
    res.status(500).set('Cache-Control','no-store').json({error:'Something went wrong. Please try again later.'});
  });
  return app;
}
