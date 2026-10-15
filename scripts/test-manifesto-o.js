const sharp = require('sharp');
const path = require('path');

const src = '/Users/blacklink.com.br/.gemini/antigravity/brain/b9ff108e-3882-4b47-a186-e6d80bb1ce76/.user_uploaded/media_1792095092284.jpg';
const OUTPUT_DIR = path.join(__dirname, '../public/launch-pack');

async function testManifestoO() {
  // Vamos inspecionar a área abaixo da primeira linha
  // Em media_1792095092284.jpg:
  // Linha 1 é "O MERCADO"
  // A partir de y = 220, é o resto do texto!
  
  const metadata = await sharp(src).metadata();
  console.log('Original dimensions:', metadata.width, metadata.height);

  // SVG com fundo preto fosco que cobre de y=220 para baixo, mantendo o prisma e o topo perfeito!
  // E desenhando a continuação do manifesto com o feixe de arco-íris sobreposto!
  const overlaySvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="rainbowBeam" x1="0" y1="0" x2="1" y2="0.9">
      <stop offset="0%" stop-color="#FF3B30" stop-opacity="0.0"/>
      <stop offset="25%" stop-color="#FF9500" stop-opacity="0.5"/>
      <stop offset="40%" stop-color="#FFCC00" stop-opacity="0.7"/>
      <stop offset="55%" stop-color="#34C759" stop-opacity="0.8"/>
      <stop offset="70%" stop-color="#00C7BE" stop-opacity="0.8"/>
      <stop offset="85%" stop-color="#007AFF" stop-opacity="0.7"/>
      <stop offset="95%" stop-color="#5856D6" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#AF52DE" stop-opacity="0.0"/>
    </linearGradient>
    <filter id="beamGlow">
      <feGaussianBlur stdDeviation="12" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Retângulo preto fosco que cobre suavemente o texto anterior a partir de y=215 -->
  <!-- Mantém o contorno do cartaz negro (x: 164 a 860) -->
  <rect x="165" y="215" width="695" height="745" fill="#0C0C0E" />

  <!-- Tipografia Monumental em Grotesca Condensada Suíça -->
  <g transform="translate(165, 0)">
    <text x="347" y="325" text-anchor="middle" font-family="'Impact', 'Arial Black', -apple-system, sans-serif" font-weight="900" font-size="108" fill="#FFFFFF" letter-spacing="-2">AMADORISMO</text>
    <text x="347" y="440" text-anchor="middle" font-family="'Impact', 'Arial Black', -apple-system, sans-serif" font-weight="900" font-size="108" fill="#FFFFFF" letter-spacing="-2">VISUAL CUSTA</text>
    <text x="347" y="555" text-anchor="middle" font-family="'Impact', 'Arial Black', -apple-system, sans-serif" font-weight="900" font-size="108" fill="#FFFFFF" letter-spacing="-2">MAIS CARO</text>
    <text x="347" y="670" text-anchor="middle" font-family="'Impact', 'Arial Black', -apple-system, sans-serif" font-weight="900" font-size="108" fill="#FFFFFF" letter-spacing="-2">DO QUE QUALQUER</text>
    <text x="347" y="785" text-anchor="middle" font-family="'Impact', 'Arial Black', -apple-system, sans-serif" font-weight="900" font-size="108" fill="#FFFFFF" letter-spacing="-2">TECNOLOGIA.</text>

    <!-- Rodapé Oficial -->
    <text x="680" y="935" text-anchor="end" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="11" fill="rgba(255,255,255,0.4)" letter-spacing="1.5">BLACK LINK MANIFESTO 02 // blklnk.com</text>
  </g>

  <!-- Continuação Perfeita do Feixe de Arco-Íris que vem do Prisma -->
  <g transform="rotate(34 165 90)" filter="url(#beamGlow)" opacity="0.9">
    <rect x="0" y="38" width="1200" height="42" fill="url(#rainbowBeam)" />
    <rect x="0" y="52" width="1200" height="12" fill="rgba(255,255,255,0.45)" />
  </g>
</svg>`;

  await sharp(src)
    .composite([{ input: Buffer.from(overlaySvg) }])
    .jpeg({ quality: 98 })
    .toFile(path.join(OUTPUT_DIR, "manifesto-02-test.jpg"));

  console.log("manifesto-02-test.jpg gerado!");
}

testManifestoO().catch(console.error);
