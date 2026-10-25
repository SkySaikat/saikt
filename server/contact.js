import nodemailer from 'nodemailer';

export const RECIPIENT='hi@saikatchowdhury.com';
const SERVICES=new Set(['Website or web application','AI solution or MCP server','Automation or custom plugin','Technical leadership','Something else']);
const BUDGETS=new Set(['','Under $1,000','$1,000 to $5,000','$5,000 to $10,000','$10,000+']);
const EMAIL=/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const SINGLE_LINE=/[\r\n\u0000]/;
const MAX_BYTES=24000;

export function validateInquiry(input){
  if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Please complete the contact form.');
  const text=(key)=>typeof input[key]==='string'?input[key].trim():'';
  const data={name:text('name'),email:text('email'),service:text('service'),budget:text('budget'),message:text('message'),website:text('website')};
  if(data.website)return {spam:true};
  if(data.name.length<2||data.name.length>100||SINGLE_LINE.test(data.name))throw new Error('Please enter a name between 2 and 100 characters.');
  if(data.email.length>254||!EMAIL.test(data.email)||SINGLE_LINE.test(data.email))throw new Error('Please enter a valid email address.');
  if(!SERVICES.has(data.service))throw new Error('Please choose a project type.');
  if(!BUDGETS.has(data.budget))throw new Error('Please choose one of the budget options.');
  if(data.message.length<20||data.message.length>5000||data.message.includes('\u0000'))throw new Error('Please describe your idea in 20 to 5,000 characters.');
  return data;
}

export function createSmtpSender(env){
  const user=env.SMTP_USER?.trim();const password=env.SMTP_PASS;
  const port=Number(env.SMTP_PORT||465);
  if(!env.SMTP_HOST||!user||!password||!EMAIL.test(user)||![465,587].includes(port))return null;
  const transporter=nodemailer.createTransport({
    host:env.SMTP_HOST,port,secure:port===465,requireTLS:port===587,
    auth:{user,pass:password},tls:{minVersion:'TLSv1.2'},
    connectionTimeout:10000,greetingTimeout:10000,socketTimeout:20000,
    disableFileAccess:true,disableUrlAccess:true
  });
  return {
    from:user,
    send:message=>transporter.sendMail(message),
    verify:()=>transporter.verify(),
    close:()=>transporter.close()
  };
}

export function composeMessage(data,from){
  return {
    from:{name:'Saikat Portfolio',address:from},
    to:RECIPIENT,
    replyTo:{name:data.name,address:data.email},
    subject:`Portfolio inquiry: ${data.service}`,
    text:[
      'A new message from your portfolio.',
      `Name: ${data.name}`,`Email: ${data.email}`,`Project: ${data.service}`,
      `Budget: ${data.budget||'Let’s discuss'}`,'',data.message
    ].join('\n'),
    disableFileAccess:true,disableUrlAccess:true
  };
}

function json(res,status,data,extraHeaders={}){
  res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...extraHeaders});
  res.end(JSON.stringify(data));
}
async function readJson(req){
  let bytes=0;const chunks=[];
  for await(const chunk of req){bytes+=Buffer.byteLength(chunk);if(bytes>MAX_BYTES){const error=new Error('Your message is too long.');error.status=413;throw error}chunks.push(chunk)}
  try{return JSON.parse(Buffer.concat(chunks.map(chunk=>Buffer.from(chunk))).toString('utf8'))}
  catch{throw new Error('Please submit a valid contact form.')}
}

// SMTP details never enter the browser. This handler works in dev and preview.
export function createContactMiddleware({env={},sender=createSmtpSender(env),now=Date.now}={}){
  const attempts=new Map();
  return async function contact(req,res,next){
    const path=req.url?.split('?')[0];
    if(path!=='/api/contact'&&path!=='/api/contact/status'){next();return}
    if(path==='/api/contact/status'&&req.method==='GET'){json(res,200,{available:Boolean(sender)});return}
    if(path!=='/api/contact'||req.method!=='POST'){json(res,405,{error:'Method not allowed.'},{Allow:path.endsWith('/status')?'GET':'POST'});return}
    // Same-origin JSON only. Do not trust arbitrary forwarding headers for identity.
    const origin=req.headers.origin;
    if(origin){
      try{const url=new URL(origin);if(!['http:','https:'].includes(url.protocol)||url.host!==req.headers.host)throw new Error()}
      catch{json(res,403,{error:'Please send your message from this website.'});return}
    }
    if(req.headers['sec-fetch-site']==='cross-site'){json(res,403,{error:'Please send your message from this website.'});return}
    if(!req.headers['content-type']?.toLowerCase().startsWith('application/json')){json(res,415,{error:'Please submit the contact form as JSON.'});return}
    if(Number(req.headers['content-length'])>MAX_BYTES){json(res,413,{error:'Your message is too long.'});return}
    if(!sender){json(res,503,{error:'The form is temporarily unavailable. Please email hi@saikatchowdhury.com directly. Your message has not been sent.'});return}
    const time=now();
    for(const [key,entry] of attempts)if(entry.until<=time)attempts.delete(key);
    const ip=req.socket.remoteAddress||'unknown';const entry=attempts.get(ip)||{count:0,until:time+15*60*1000};
    if(entry.count>=5){json(res,429,{error:'Please wait a little before sending another message, or email me directly.'},{'Retry-After':String(Math.ceil((entry.until-time)/1000))});return}
    entry.count++;attempts.set(ip,entry);
    let data;
    try{data=validateInquiry(await readJson(req))}catch(error){json(res,error.status||400,{error:error.message});return}
    if(data.spam){json(res,400,{error:'Please leave the company website field empty.'});return}
    try{
      const result=await sender.send(composeMessage(data,sender.from));
      const accepted=(result.accepted||[]).map(address=>String(typeof address==='string'?address:address.address).toLowerCase());
      if(!accepted.includes(RECIPIENT))throw new Error('Recipient not accepted');
      json(res,200,{ok:true});
    }catch{
      // Do not return SMTP errors, credentials, or message content to visitors/logs.
      json(res,502,{error:'Your message could not be sent right now. Please try again later or email hi@saikatchowdhury.com directly.'});
    }
  };
}
