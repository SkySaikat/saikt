import {defineConfig,loadEnv} from 'vite';
import {createContactMiddleware} from './server/contact.js';
import {generateSeo} from './scripts/generate-seo.js';

export default defineConfig(({mode})=>{
  generateSeo();
  const env={...loadEnv(mode,process.cwd(),''),...process.env};
  return {
    appType:'mpa',
    plugins:[{
      name:'portfolio-contact',
      configureServer(server){server.middlewares.use(createContactMiddleware({env}))},
      configurePreviewServer(server){server.middlewares.use(createContactMiddleware({env}))}
    }]
  };
});
