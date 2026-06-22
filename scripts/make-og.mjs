// One-off generator for the social share image (public/og.png, 1200x630).
// Run with: node scripts/make-og.mjs
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const out = join(__dirname, '..', 'public', 'og.png');

const accent = '#a3e635'; // lime, approx of oklch(0.87 0.17 132)
const bg = '#14171c';

// Concentric rings echoing the site's ripple-cursor motif.
let rings = '';
for (let i = 0; i < 7; i++) {
  const r = 70 + i * 78;
  rings += `<circle cx="980" cy="315" r="${r}" fill="none" stroke="${accent}" stroke-width="1.2" opacity="${0.30 - i * 0.035}"/>`;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${bg}"/>
  ${rings}
  <circle cx="980" cy="315" r="7" fill="${accent}"/>
  <text x="90" y="120" font-family="monospace" font-size="26" fill="#a8b0bd" letter-spacing="1">anon://operator</text>
  <text x="86" y="330" font-family="Helvetica, Arial, sans-serif" font-weight="700" font-size="150" fill="#f4f6f8" letter-spacing="-5">Alp Senel</text>
  <text x="92" y="400" font-family="monospace" font-size="30" fill="${accent}" letter-spacing="1">Web Developer &amp; Designer</text>
  <text x="92" y="545" font-family="monospace" font-size="22" fill="#6b7280" letter-spacing="1">no name · no face · only the work</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(out);
console.log('wrote', out);
