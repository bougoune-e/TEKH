import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.resolve(__dirname, '../public');
const source = path.join(publicDir, 'swap.jpeg');

async function ensurePublicDir() {
  await mkdir(publicDir, { recursive: true });
}

async function makeIcon({ size, out, fit = 'contain', background = { r: 0, g: 0, b: 0, alpha: 0 } }) {
  await sharp(source)
    .resize(size, size, { fit, background })
    .png()
    .toFile(path.join(publicDir, out));
  console.log(`Created ${out}`);
}

async function run() {
  try {
    await ensurePublicDir();
    await makeIcon({ size: 192, out: 'pwa-192x192.png' });
    await makeIcon({ size: 512, out: 'pwa-512x512.png' });
    await makeIcon({ size: 180, out: 'apple-touch-icon.png', fit: 'cover', background: { r: 15, g: 23, b: 42, alpha: 1 } });
    console.log('All icons generated successfully.');
  } catch (e) {
    console.error('Icon generation failed:', e);
    process.exit(1);
  }
}

run();
