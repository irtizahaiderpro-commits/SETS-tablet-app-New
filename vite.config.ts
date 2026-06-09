import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/SETS-tablet-app-New/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
