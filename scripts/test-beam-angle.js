const sharp = require('sharp');
const path = require('path');

const src = '/Users/blacklink.com.br/.gemini/antigravity/brain/b9ff108e-3882-4b47-a186-e6d80bb1ce76/.user_uploaded/media_1792095092284.jpg';
const OUTPUT_DIR = path.join(__dirname, '../public/launch-pack');

async function testAngle() {
  const textSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Cobre 'MERCADO' ao lado do 'O' mantido -->
  <rect x="250" y="60" width="605" height="155" fill="#0D0D10" />

  <!-- Cobre todo o restante do cartaz anterior até a base da folha -->
  <rect x="165" y="215" width="695" height="755" fill="#0D0D10" />

  <!-- 'PREÇO' alinhado ao 'O' original sob o prisma -->
  <text x="555" y="196" text-anchor="middle" font-family="'Impact', 'Arial Black', -apple-system, sans-serif" font-weight="900" font-size="124" fill="#FFFFFF" letter-spacing="-2">PREÇO</text>

  <!-- Demais linhas monumentais -->
  <g transform="translate(165, 0)">
    <text x="347" y="325" text-anchor="middle" font-family="'Impact', 'Arial Black', -apple-system, sans-serif" font-weight="900" font-size="106" fill="#FFFFFF" letter-spacing="-2">É DEFINIDO</text>
    <text x="347" y="440" text-anchor="middle" font-family="'Impact', 'Arial Black', -apple-system, sans-serif" font-weight="900" font-size="106" fill="#FFFFFF" letter-spacing="-2">PELA PERCEPÇÃO.</text>
    <text x="347" y="565" text-anchor="middle" font-family="'Impact', 'Arial Black', -apple-system, sans-serif" font-weight="900" font-size="106" fill="#FFFFFF" letter-spacing="-2">QUEM É COMUM</text>
    <text x="347" y="680" text-anchor="middle" font-family="'Impact', 'Arial Black', -apple-system, sans-serif" font-weight="900" font-size="106" fill="#FFFFFF" letter-spacing="-2">DÁ DESCONTO.</text>
    <text x="347" y="795" text-anchor="middle" font-family="'Impact', 'Arial Black', -apple-system, sans-serif" font-weight="900" font-size="106" fill="#FFFFFF" letter-spacing="-2">QUEM DITA É REI.</text>

    <!-- Rodapé Oficial Limpo -->
    <rect x="300" y="910" width="400" height="40" fill="#0D0D10" />
    <text x="685" y="938" text-anchor="end" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="11" fill="rgba(255,255,255,0.4)" letter-spacing="1.5">BLACK LINK MANIFESTO 02 // blklnk.com</text>
  </g>
</svg>`;

  // Ângulo de ~56 graus centrado no prisma (130, 150)
  const beamSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="rainbowGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000000"/>
      <stop offset="18%" stop-color="#FF3B30"/>
      <stop offset="32%" stop-color="#FF9500"/>
      <stop offset="46%" stop-color="#FFCC00"/>
      <stop offset="60%" stop-color="#34C759"/>
      <stop offset="74%" stop-color="#00C7BE"/>
      <stop offset="86%" stop-color="#007AFF"/>
      <stop offset="96%" stop-color="#5856D6"/>
      <stop offset="100%" stop-color="#000000"/>
    </linearGradient>
    <filter id="softGlow">
      <feGaussianBlur stdDeviation="10"/>
    </filter>
  </defs>

  <rect width="1024" height="1024" fill="#000000" />

  <!-- Traçado que passa exatamente pelo prisma (x: 130, y: 150) descendo até (x: 620, y: 950) -->
  <g transform="translate(130, 150) rotate(58)" filter="url(#softGlow)" opacity="0.95">
    <rect x="-100" y="-22" width="1200" height="44" fill="url(#rainbowGrad)" />
    <rect x="-100" y="-6" width="1200" height="12" fill="rgba(255,255,255,0.6)" />
  </g>
</svg>`;

  const beamBuffer = await sharp(Buffer.from(beamSvg)).png().toBuffer();

  const step1 = await sharp(src)
    .composite([{ input: Buffer.from(textSvg) }])
    .toBuffer();

  await sharp(step1)
    .composite([{ input: beamBuffer, blend: 'screen' }])
    .resize(1080, 1080, { fit: 'cover' })
    .jpeg({ quality: 98 })
    .toFile(path.join(OUTPUT_DIR, "manifesto-02-final.jpg"));

  console.log("manifesto-02-final.jpg criado!");
}

testAngle().catch(console.error);
