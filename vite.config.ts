import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  build: {
    target: "es2022",
    // Babylon's tightly coupled ESM graph is intentionally kept together to avoid
    // circular vendor chunks. The limit reflects that known engine payload.
    chunkSizeWarningLimit: 1_800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const babylonMarker = "/node_modules/@babylonjs/core/";
          const normalizedId = id.replaceAll("\\", "/");
          if (normalizedId.includes(babylonMarker)) {
            return "babylon-runtime";
          }
          if (
            normalizedId.includes("/node_modules/react/") ||
            normalizedId.includes("/node_modules/react-dom/") ||
            normalizedId.includes("/node_modules/zustand/")
          ) {
            return "react-runtime";
          }
        },
      },
    },
  },
  test: {
    environment: "node",
  },
});
