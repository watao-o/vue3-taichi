import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  sourcemap: {
    server: true,
    client: true,
  },
  build: {
    transpile: ["vuetify"],
  },
  modules: [
    (_options, nuxt) => {
      nuxt.hooks.hook("vite:extendConfig", (config) => {
        if (!config.plugins) {
          config.plugins = [];
        }
        config.plugins.push(vuetify({ autoImport: true }) as any);
      });
    },
    "@nuxt/eslint",
    "@pinia/nuxt",
    "@nuxtjs/tailwindcss",
    "@nuxtjs/ngrok",
  ],
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
    server: {
      allowedHosts: ["parenteral-inarguably-semaj.ngrok-free.dev"],
    },
  },
  ngrok: {
    authtoken_from_env: true,
  },
  app: {
    head: {
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      ],
    },
  },
});
