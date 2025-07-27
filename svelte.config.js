// Tauri doesn't have a Node.js server to do proper SSR
// so we will use adapter-static to prerender the app (SSG)
// See: https://v2.tauri.app/start/frontend/sveltekit/ for more info
/* import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";


const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
  },
};
export default config; */
import adapter from '@sveltejs/adapter-static';

const config = {
  kit: {
    adapter: adapter({
      fallback: 'index.html',
      strict: false
    }),
    alias: {
      'lib': 'src/lib'
    },
    prerender: {
      entries: []
    }
  }
};

export default config;
