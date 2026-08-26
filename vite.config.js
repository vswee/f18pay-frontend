import { defineConfig } from "vite";
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import git from 'git-rev-sync'

const resolveGitHash = () => {
  try {
    return git.tag() || git.short() || process.env.VITE_APP_GIT_HASH || '';
  } catch {
    return process.env.VITE_APP_GIT_HASH || '';
  }
};

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
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': [
            'vue',
            'vue-router',
            'pinia',
            'chart.js',
            'vue-chartjs',
          ],
        },
      },
    },
  },
  server: {
    port: 3001,
  },
  define: {
    'process.env.VITE_APP_GIT_HASH': JSON.stringify(resolveGitHash()),
  },
});
