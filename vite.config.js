import { defineConfig } from "vite";

// During `npm run dev`, requests to /api go to the Express backend (npm run dev in backend/).
export default defineConfig({
  server: {
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
