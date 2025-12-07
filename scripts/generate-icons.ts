import sharp from 'sharp';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const publicDir = join(process.cwd(), 'public');
const iconSvgPath = join(process.cwd(), 'src', 'app', 'icon.svg');

async function generateIcons() {
  if (!existsSync(iconSvgPath)) {
    console.error('❌ Fichier icon.svg introuvable:', iconSvgPath);
    process.exit(1);
  }

  const svgBuffer = readFileSync(iconSvgPath);

  const sizes = [
    { size: 192, name: 'icon-192.png' },
    { size: 512, name: 'icon-512.png' },
    { size: 180, name: 'apple-touch-icon.png' },
  ];

  console.log('🎨 Génération des icônes PWA...\n');

  for (const { size, name } of sizes) {
    try {
      await sharp(svgBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .png()
        .toFile(join(publicDir, name));

      console.log(`✅ ${name} (${size}x${size}) créé`);
    } catch (error) {
      console.error(`❌ Erreur lors de la création de ${name}:`, error);
    }
  }

  console.log('\n✨ Toutes les icônes ont été générées avec succès!');
}

generateIcons().catch(console.error);

