// import { defineConfig } from "vite";
//
// // During `npm run dev`, requests to /api go to the Express backend (npm run dev in backend/).
// export default defineConfig({
//   server: {
//     proxy: {
//       "/api": "http://localhost:3000",
//     },
//   },
// });

import { defineConfig } from "vite";

// During `npm run dev`, requests to /api go to the Express backend (npm run dev in backend/).
export default defineConfig({
  server: {
    host: true, // listen on all interfaces (IPv4 and IPv6)
allowedHosts: [".trycloudflare.com"],
proxy: {
  "/api": "http://localhost:3000",
},
  },
});
