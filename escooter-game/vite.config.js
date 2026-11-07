import { defineConfig } from 'vite';

// `vite build --mode single` produces one self-contained JS bundle (no lazy chunks),
// used by scripts/build-single-html.mjs to create a single playable HTML file.
export default defineConfig(({ mode }) => ({
  base: './',
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1200,
    outDir: mode === 'single' ? 'dist-single' : 'dist',
    rollupOptions: mode === 'single' ? { output: { inlineDynamicImports: true } } : {},
  },
}));
