import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  const isVercel = process.env.VERCEL === '1';

  return {
    server: {
      host: "::",
      port: 8080,
    },
    build: {
      outDir: isVercel ? ".vercel/output/static" : "dist/spa",
      emptyOutDir: true,
      rollupOptions: {
        output: {
          assetFileNames: 'assets/[name]-[hash][extname]',
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js'
        }
      }
    },
    plugins: [
      tailwindcss(), 
      react(), 
      !isProduction && expressPlugin()
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./client"),
        "@shared": path.resolve(__dirname, "./shared"),
      },
    },
    publicDir: isVercel ? false : 'public', // Disable public dir in Vercel to prevent duplication
  };
});

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development
    configureServer(server) {
      const app = createServer();
      server.middlewares.use(app);
    },
  };
}