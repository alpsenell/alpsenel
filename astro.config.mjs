import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';

// https://astro.build/config
export default defineConfig({
  site: 'https://alpsenel.com',
  output: 'hybrid',
  adapter: vercel(),
  server: { port: 4178 },
});
