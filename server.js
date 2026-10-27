import {existsSync} from 'node:fs';
import {createApp} from './server/app.js';

// Hostinger supplies environment variables. Local start also supports the private file.
if(existsSync('.env.local'))process.loadEnvFile('.env.local');
const port=Number(process.env.PORT||3000);
if(!Number.isInteger(port)||port<1||port>65535)throw new Error('Invalid PORT');
const app=createApp();
const server=app.listen(port,process.env.HOST||'0.0.0.0',()=>console.log(`Portfolio server listening on port ${port}`));
server.requestTimeout=45000;
server.headersTimeout=10000;
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>server.close(()=>process.exit(0)));
