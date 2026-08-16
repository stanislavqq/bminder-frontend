/// <reference types="svelte" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly API_HOST: string;
}

interface AppConfig {
  apiHost?: string;
}

interface Window {
  __APP_CONFIG__?: AppConfig;
}
