import { defineConfig, loadEnv } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiHost = (process.env.API_HOST || env.API_HOST || 'http://127.0.0.1:3333').replace(
    /\/$/,
    ''
  );
  const host = process.env.HOST || env.HOST || '127.0.0.1';
  const port = Number(process.env.PORT || env.PORT) || 5173;
  const previewPort = Number(process.env.PREVIEW_PORT || env.PREVIEW_PORT) || 4173;

  return {
    plugins: [svelte()],
    define: {
      'import.meta.env.API_HOST': JSON.stringify(apiHost)
    },
    server: {
      host,
      port
    },
    preview: {
      host,
      port: previewPort
    }
  };
});
