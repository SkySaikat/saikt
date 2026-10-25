import {createSmtpSender} from '../server/contact.js';

try{process.loadEnvFile('.env.local')}catch{}
const sender=createSmtpSender(process.env);
if(!sender){console.error('SMTP is not configured. Set SMTP_PASS in .env.local.');process.exitCode=1}
else{
  try{await sender.verify();console.log('Hostinger SMTP authentication succeeded. No email was sent.')}
  catch{console.error('SMTP verification failed. Check the host, port, username, and mailbox password.');process.exitCode=1}
  finally{sender.close()}
}
