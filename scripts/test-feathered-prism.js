const sharp = require('sharp');
const path = require('path');

const src = '/Users/blacklink.com.br/.gemini/antigravity/brain/b9ff108e-3882-4b47-a186-e6d80bb1ce76/.user_uploaded/media_1792095092284.jpg';

async function testFeather() {
  // Vamos extrair 300x300 do canto superior esquerdo
  const crop = await sharp(src)
    .extract({ left: 40, top: 0, width: 280, height: 260 })
    .toBuffer();

  // Criamos uma máscara que mantém o prisma e desvanece qualquer borda
  const maskSvg = `
<svg width="280" height="260" viewBox="0 0 280 260">
  <defs>
    <radialGradient id="fadeGrad" cx="45%" cy="45%" r="50%">
      <stop offset="60%" stop-color="#fff" stop-opacity="1"/>
      <stop offset="90%" stop-color="#fff" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="280" height="260" fill="url(#fadeGrad)"/>
</svg>`;

  const mask = await sharp(Buffer.from(maskSvg)).png().toBuffer();

  // Aplica a máscara como canal alpha
  const maskedPrism = await sharp(crop)
    .ensureAlpha()
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toFile('/Users/blacklink.com.br/blacklink.com.br/blacklink-crm/public/launch-pack/prism-feathered.png');

  console.log('Prism feathered created!');
}

testFeather();
