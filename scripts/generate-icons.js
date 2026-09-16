import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Master SVG (Standalone and vector icon)
const masterSvg = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="45%" stop-color="#0d9488"/>
      <stop offset="100%" stop-color="#083344"/>
    </linearGradient>
    <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f43f5e"/>
      <stop offset="100%" stop-color="#be123c"/>
    </linearGradient>
    <filter id="glowHeart" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="12" flood-color="#f43f5e" flood-opacity="0.8"/>
    </filter>
    <filter id="glowEcg" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="10" flood-color="#fbbf24" flood-opacity="0.95"/>
    </filter>
  </defs>

  <!-- Squircle rounded background -->
  <rect x="16" y="16" width="480" height="480" rx="110" fill="url(#bgGrad)" stroke="#67e8f9" stroke-width="12" stroke-opacity="0.75"/>
  
  <!-- Subtle lighting reflections -->
  <path d="M40 120 C 80 40, 160 30, 260 30 C 180 50, 80 100, 40 180 Z" fill="#ffffff" fill-opacity="0.12"/>
  
  <!-- Center Heart (scaled to 512 space) -->
  <!-- Heart scaled by ~18x: original viewBox 24x24, centered at (256, 256) -->
  <g transform="translate(256, 256) scale(15.5) translate(-12, -12)">
    <path 
      d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" 
      fill="url(#heartGrad)" 
      stroke="#fda4af" 
      stroke-width="1.2" 
      stroke-linecap="round" 
      stroke-linejoin="round"
      filter="url(#glowHeart)"
    />
    <path 
      d="M2 12h4l1.5-3.5 2.5 7.5 2.5-10 2 6 1.5-2h6" 
      stroke="#fef08a" 
      stroke-width="1.8" 
      stroke-linecap="round" 
      stroke-linejoin="round"
      filter="url(#glowEcg)"
    />
  </g>
</svg>`;

// 2. Full-bleed Maskable SVG (for Android adaptive icons with 15% safe margin)
const maskableSvg = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradMask" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="45%" stop-color="#0d9488"/>
      <stop offset="100%" stop-color="#083344"/>
    </linearGradient>
    <linearGradient id="heartGradMask" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f43f5e"/>
      <stop offset="100%" stop-color="#be123c"/>
    </linearGradient>
    <filter id="glowHeartMask" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="10" flood-color="#f43f5e" flood-opacity="0.8"/>
    </filter>
    <filter id="glowEcgMask" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#fbbf24" flood-opacity="0.95"/>
    </filter>
  </defs>

  <!-- Full-bleed background -->
  <rect width="512" height="512" fill="url(#bgGradMask)"/>
  
  <!-- Subtle lighting reflections -->
  <path d="M0 120 C 80 40, 160 30, 260 30 C 180 50, 80 100, 0 200 Z" fill="#ffffff" fill-opacity="0.12"/>
  
  <!-- Inside 80% safe zone (center scaled to 12.5x) -->
  <g transform="translate(256, 256) scale(12.8) translate(-12, -12)">
    <path 
      d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" 
      fill="url(#heartGradMask)" 
      stroke="#fda4af" 
      stroke-width="1.3" 
      stroke-linecap="round" 
      stroke-linejoin="round"
      filter="url(#glowHeartMask)"
    />
    <path 
      d="M2 12h4l1.5-3.5 2.5 7.5 2.5-10 2 6 1.5-2h6" 
      stroke="#fef08a" 
      stroke-width="1.9" 
      stroke-linecap="round" 
      stroke-linejoin="round"
      filter="url(#glowEcgMask)"
    />
  </g>
</svg>`;

async function run() {
  console.log('Writing public/icon.svg...');
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), masterSvg);

  const svgBuffer = Buffer.from(masterSvg);
  const maskableBuffer = Buffer.from(maskableSvg);

  console.log('Rendering 512x512 PNG...');
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));

  console.log('Rendering 192x192 PNG...');
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));

  console.log('Rendering 180x180 Apple Touch Icon PNG...');
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  console.log('Rendering 512x512 Maskable Icon PNG...');
  await sharp(maskableBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));

  console.log('Rendering 48x48 Favicon PNG...');
  await sharp(svgBuffer)
    .resize(48, 48)
    .png()
    .toFile(path.join(publicDir, 'favicon-48x48.png'));

  console.log('Rendering 32x32 Favicon PNG...');
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));

  console.log('All icons generated successfully!');
}

run().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
