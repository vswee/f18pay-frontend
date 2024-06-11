/* eslint-disable no-undef */
import { defineConfig } from "vite";
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue' // vue 3
// import { createVuePlugin as vue } from "vite-plugin-vue2";
import git from 'git-rev-sync'
 // https://vitejs.dev/config/
 export default defineConfig({
   plugins: [
    vue(),
   ],
   resolve: {
     alias: {
       '@': fileURLToPath(new URL('./src', import.meta.url)),
     },
   },
   build: {
    commonjsOptions: {
       esmExternals: true,
       transformMixedEsModules: true,
    },
    optimizeDeps: {
      include: ['snapshot'], // Specify dependencies to include in the optimized bundle
      // exclude: ['vue'], // Specify dependencies to exclude from optimization
    },
  },
  
     server: {
      port: 3001,
    },
 });

process.env.VITE_APP_GIT_HASH = git.tag()
