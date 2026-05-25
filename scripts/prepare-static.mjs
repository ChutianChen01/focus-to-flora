import { copyFileSync, cpSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const dist = join(root, 'dist');
const appHtml = join(dist, 'app.html');
const distIndex = join(dist, 'index.html');
const rootAssets = join(root, 'assets');

if (existsSync(appHtml)) {
  copyFileSync(appHtml, distIndex);
}

rmSync(rootAssets, { recursive: true, force: true });
cpSync(join(dist, 'assets'), rootAssets, { recursive: true });
copyFileSync(distIndex, join(root, 'index.html'));
