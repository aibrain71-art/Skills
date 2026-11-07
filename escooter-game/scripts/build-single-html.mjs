// Builds dist-single/scooter-rush.html: the whole game in one HTML file
// (handy for sharing or opening directly on a phone).
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const dir = 'dist-single';
const assets = join(dir, 'assets');
const files = readdirSync(assets);
const js = readFileSync(join(assets, files.find((f) => f.endsWith('.js'))), 'utf8').replace(/<\/script/gi, '<\\/script');
const css = readFileSync(join(assets, files.find((f) => f.endsWith('.css'))), 'utf8');
let html = readFileSync(join(dir, 'index.html'), 'utf8');
html = html.replace(/<script type="module"[^>]*><\/script>\s*/g, '').replace(/<link rel="stylesheet"[^>]*>\s*/g, '');
html = html.replace('</head>', () => `<style>${css}</style>\n</head>`).replace('</body>', () => `<script type="module">${js}</script>\n</body>`);
writeFileSync(join(dir, 'scooter-rush.html'), html);
console.log('wrote', join(dir, 'scooter-rush.html'), (html.length / 1024).toFixed(0) + ' KB');
