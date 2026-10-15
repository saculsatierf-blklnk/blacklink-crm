const sharp = require('sharp');
const path = require('path');

const src = '/Users/blacklink.com.br/.gemini/antigravity/brain/b9ff108e-3882-4b47-a186-e6d80bb1ce76/.user_uploaded/media_1792095092284.jpg';
const OUTPUT_DIR = path.join(__dirname, '../public/launch-pack');

async function testScreenBeam() {
  // 1. Imagem base com o texto novo em branco sobre o cartaz negro
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

    <!-- Rodapé Oficial Limpo sem vazar o anterior -->
    <rect x="300" y="910" width="400" height="40" fill="#0D0D10" />
    <text x="685" y="938" text-anchor="end" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="11" fill="rgba(255,255,255,0.4)" letter-spacing="1.5">BLACK LINK MANIFESTO 02 // blklnk.com</text>
  </g>
</svg>`;

  // 2. SVG do feixe de arco-íris sobre fundo preto para blend 'screen'
  const beamSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="rainbowGrad" x1="0" y1="0" x2="1" y2="0.86">
      <stop offset="0%" stop-color="#000000"/>
      <stop offset="20%" stop-color="#FF3B30"/>
      <stop offset="35%" stop-color="#FF9500"/>
      <stop offset="48%" stop-color="#FFCC00"/>
      <stop offset="60%" stop-color="#34C759"/>
      <stop offset="72%" stop-color="#00C7BE"/>
      <stop offset="84%" stop-color="#007AFF"/>
      <stop offset="95%" stop-color="#5856D6"/>
      <stop offset="100%" stop-color="#000000"/>
    </linearGradient>
    <filter id="softGlow">
      <feGaussianBlur stdDeviation="14"/>
    </filter>
  </defs>

  <rect width="1024" height="1024" fill="#000000" />

  <g transform="rotate(33 150 80)" filter="url(#softGlow)" opacity="0.95">
    <rect x="0" y="32" width="1300" height="50" fill="url(#rainbowGrad)" />
    <rect x="0" y="48" width="1300" height="16" fill="rgba(255,255,255,0.55)" />
  </g>
</svg>`;

  const beamBuffer = await sharp(Buffer.from(beamSvg)).png().toBuffer();

  // Composição em camadas
  const step1 = await sharp(src)
    .composite([{ input: Buffer.from(textSvg) }])
    .toBuffer();

  const final = await sharp(step1)
    .composite([{ input: beamBuffer, blend: 'screen' }])
    .resize(1080, 1080, { fit: 'cover' })
    .jpeg({ quality: 98 })
    .toFile(path.join(OUTPUT_DIR, "manifesto-02-screen.jpg"));

  console.log("manifesto-02-screen.jpg criado com blend screen!");
}

testScreenBeam().catch(console.error);
