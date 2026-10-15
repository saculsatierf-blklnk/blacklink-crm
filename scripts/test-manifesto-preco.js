const sharp = require('sharp');
const path = require('path');

const src = '/Users/blacklink.com.br/.gemini/antigravity/brain/b9ff108e-3882-4b47-a186-e6d80bb1ce76/.user_uploaded/media_1792095092284.jpg';
const OUTPUT_DIR = path.join(__dirname, '../public/launch-pack');

async function testManifestoPreco() {
  const overlaySvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="rainbowBeam" x1="0" y1="0" x2="1" y2="0.88">
      <stop offset="0%" stop-color="#FF3B30" stop-opacity="0.0"/>
      <stop offset="25%" stop-color="#FF9500" stop-opacity="0.5"/>
      <stop offset="40%" stop-color="#FFCC00" stop-opacity="0.75"/>
      <stop offset="55%" stop-color="#34C759" stop-opacity="0.85"/>
      <stop offset="70%" stop-color="#00C7BE" stop-opacity="0.85"/>
      <stop offset="85%" stop-color="#007AFF" stop-opacity="0.75"/>
      <stop offset="95%" stop-color="#5856D6" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#AF52DE" stop-opacity="0.0"/>
    </linearGradient>
    <filter id="beamGlow">
      <feGaussianBlur stdDeviation="10" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Cobre "MERCADO" à direita do "O" na primeira linha -->
  <rect x="250" y="60" width="600" height="155" fill="#0C0C0E" />

  <!-- Cobre todo o resto do cartaz de y=215 para baixo -->
  <rect x="165" y="215" width="695" height="745" fill="#0C0C0E" />

  <!-- Palavra 'PREÇO' ao lado do 'O' mantido sob o prisma -->
  <!-- 'O' termina em x ~245. Colocamos 'PREÇO' alinhado com o mesmo estilo -->
  <text x="555" y="196" text-anchor="middle" font-family="'Impact', 'Arial Black', -apple-system, sans-serif" font-weight="900" font-size="124" fill="#FFFFFF" letter-spacing="-2">PREÇO</text>

  <!-- Tipografia das linhas seguintes -->
  <g transform="translate(165, 0)">
    <text x="347" y="325" text-anchor="middle" font-family="'Impact', 'Arial Black', -apple-system, sans-serif" font-weight="900" font-size="106" fill="#FFFFFF" letter-spacing="-2">É DEFINIDO</text>
    <text x="347" y="440" text-anchor="middle" font-family="'Impact', 'Arial Black', -apple-system, sans-serif" font-weight="900" font-size="106" fill="#FFFFFF" letter-spacing="-2">PELA PERCEPÇÃO.</text>
    <text x="347" y="565" text-anchor="middle" font-family="'Impact', 'Arial Black', -apple-system, sans-serif" font-weight="900" font-size="106" fill="#FFFFFF" letter-spacing="-2">QUEM É COMUM</text>
    <text x="347" y="680" text-anchor="middle" font-family="'Impact', 'Arial Black', -apple-system, sans-serif" font-weight="900" font-size="106" fill="#FFFFFF" letter-spacing="-2">DÁ DESCONTO.</text>
    <text x="347" y="795" text-anchor="middle" font-family="'Impact', 'Arial Black', -apple-system, sans-serif" font-weight="900" font-size="106" fill="#FFFFFF" letter-spacing="-2">QUEM DITA É REI.</text>

    <!-- Rodapé Oficial Limpo -->
    <text x="685" y="935" text-anchor="end" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="11" fill="rgba(255,255,255,0.4)" letter-spacing="1.5">BLACK LINK MANIFESTO 02 // blklnk.com</text>
  </g>

  <!-- Feixe de Arco-Íris Refratado pelo Prisma -->
  <g transform="rotate(34 165 90)" filter="url(#beamGlow)" opacity="0.92">
    <rect x="0" y="38" width="1200" height="42" fill="url(#rainbowBeam)" />
    <rect x="0" y="52" width="1200" height="12" fill="rgba(255,255,255,0.45)" />
  </g>
</svg>`;

  await sharp(src)
    .composite([{ input: Buffer.from(overlaySvg) }])
    .jpeg({ quality: 98 })
    .toFile(path.join(OUTPUT_DIR, "manifesto-02-preco.jpg"));

  console.log("manifesto-02-preco.jpg gerado!");
}

testManifestoPreco().catch(console.error);
