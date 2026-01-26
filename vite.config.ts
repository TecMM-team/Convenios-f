import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  ssr: {
    noExternal: [
      "@mui/x-data-grid",
    ],
  },
  server: {
    fs: {
      allow: ['..']
    }
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Ignorar warnings específicos de Chrome DevTools
        if (warning.code === 'UNRESOLVED_IMPORT' && 
            warning.message.includes('.well-known')) {
          return;
        }
        warn(warning);
      }
    }
  }
});
