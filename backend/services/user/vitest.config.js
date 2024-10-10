// vitest.config.js
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    transformMode: {
      web: [/\.js$/],
    },
  },
});
