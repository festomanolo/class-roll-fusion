import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      external: [
        // Exclude server-side packages from browser bundle
        'googleapis',
        '@google-cloud/local-auth',
        // Exclude Capacitor plugins that are only available on native
        '@capacitor/local-notifications',
      ],
    },
  },
  optimizeDeps: {
    exclude: [
      'googleapis',
      '@google-cloud/local-auth',
      '@capacitor/local-notifications',
    ],
  },
}));
