import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'wordoken-library-assets',
      enforce: 'pre',
      async buildStart() {
        this.emitFile({ type: 'asset', fileName: 'styles.css.d.ts', source: 'export {};\n' });
        for (const font of ['montserrat', 'black-han-sans']) {
          this.emitFile({
            type: 'asset',
            fileName: `licenses/${font}.txt`,
            source: await readFile(`node_modules/@fontsource/${font}/LICENSE`),
          });
        }
      },
      // Vite library mode otherwise embeds the entire sprite atlases in JavaScript.
      // Emit originals unchanged so browsers can cache them independently.
      async load(id) {
        if (!/\.(png|svg)$/.test(id)) return null;
        const reference = this.emitFile({
          type: 'asset',
          name: basename(id),
          source: await readFile(id),
        });
        return `export default import.meta.ROLLUP_FILE_URL_${reference};`;
      },
      resolveFileUrl({ fileName }) {
        // Package-relative, not site-root-relative; host bundlers can rebase it.
        return `/* @__PURE__ */ new URL(${JSON.stringify(`./${fileName}`)}, import.meta.url).href`;
      },
    },
  ],
  publicDir: false,
  build: {
    outDir: 'dist',
    lib: { entry: 'src/library.ts', formats: ['es'], fileName: 'index', cssFileName: 'styles' },
    rolldownOptions: { external: ['react', 'react-dom', 'react/jsx-runtime'] },
  },
});
