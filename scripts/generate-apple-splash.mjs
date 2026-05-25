// Génère les apple-touch-startup-image pour les iPhones courants.
// Le splash = logo centré (~28% de la plus petite dimension) sur fond #F8FAFB.
// Tailles à régénérer si logoBrain/icon-512 changent : `node scripts/generate-apple-splash.mjs`

import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const SOURCE_LOGO = resolve(root, 'public/icon-512.png');
const OUT_DIR = resolve(root, 'public/splash');
const BG = { r: 248, g: 250, b: 251, alpha: 1 }; // #F8FAFB
const LOGO_RATIO = 0.28; // proportion de la plus petite dimension

// Portrait uniquement (manifest = portrait-primary).
// Couvre les iPhones des ~7 dernières années.
const SPLASHES = [
  { name: 'iphone-1320x2868', w: 1320, h: 2868 }, // 16 Pro Max
  { name: 'iphone-1206x2622', w: 1206, h: 2622 }, // 16 Pro
  { name: 'iphone-1290x2796', w: 1290, h: 2796 }, // 16, 15 Plus, 14 Plus
  { name: 'iphone-1284x2778', w: 1284, h: 2778 }, // 13 Pro Max, 12 Pro Max
  { name: 'iphone-1179x2556', w: 1179, h: 2556 }, // 15, 15 Pro, 14, 14 Pro
  { name: 'iphone-1170x2532', w: 1170, h: 2532 }, // 13, 13 Pro, 12, 12 Pro
  { name: 'iphone-1242x2688', w: 1242, h: 2688 }, // 11 Pro Max, XS Max
  { name: 'iphone-1125x2436', w: 1125, h: 2436 }, // 13 mini, 12 mini, 11 Pro, XS, X
  { name: 'iphone-1242x2208', w: 1242, h: 2208 }, // 8 Plus, 7 Plus, 6s Plus
  { name: 'iphone-828x1792',  w: 828,  h: 1792 }, // 11, XR
  { name: 'iphone-750x1334',  w: 750,  h: 1334 }, // SE 3/2, 8, 7, 6s, 6
];

await mkdir(OUT_DIR, { recursive: true });

for (const { name, w, h } of SPLASHES) {
  const logoSize = Math.round(Math.min(w, h) * LOGO_RATIO);
  const logo = await sharp(SOURCE_LOGO)
    .resize(logoSize, logoSize, { fit: 'contain', background: BG })
    .toBuffer();

  const left = Math.round((w - logoSize) / 2);
  const top = Math.round((h - logoSize) / 2);

  await sharp({
    create: { width: w, height: h, channels: 4, background: BG },
  })
    .composite([{ input: logo, left, top }])
    .png()
    .toFile(resolve(OUT_DIR, `${name}.png`));

  console.log(`✓ ${name}.png (${w}×${h}, logo ${logoSize}px)`);
}

console.log(`\n${SPLASHES.length} splashes générés dans public/splash/`);
