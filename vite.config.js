import {defineConfig,loadEnv} from 'vite';
import {createContactMiddleware} from './server/contact.js';

export default defineConfig(({mode})=>{
  const env={...loadEnv(mode,process.cwd(),''),...process.env};
  return {
    plugins:[{
      name:'portfolio-contact',
      configureServer(server){server.middlewares.use(createContactMiddleware({env}))},
      configurePreviewServer(server){server.middlewares.use(createContactMiddleware({env}))}
    }]
  };
});
