import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: "Context AI",
    description: "Context AI",
    version: "1.0.0",
    permissions: [
      "storage",
      "tabs"
    ],
  },
  runner: {
    startUrls: [
      "https://google.com",
    ],
  },
});
