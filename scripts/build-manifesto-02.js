const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OUTPUT_DIR = path.join(__dirname, '../public/launch-pack');
const SRC_PRISM = '/Users/blacklink.com.br/.gemini/antigravity/brain/b9ff108e-3882-4b47-a186-e6d80bb1ce76/.user_uploaded/media_1792095092284.jpg';

async function buildManifesto02() {
  console.log("=== COMPONDO MANIFESTO 02 (ESTILO PRISMA ÓPTICO) ===");

  // Extrai o prisma isolado
  const prismCrop = await sharp(SRC_PRISM)
    .extract({ left: 60, top: 15, width: 220, height: 190 })
    .toBuffer();

  // SVG com o fundo negro de ardósia, papel preto fosco, tipografia monumental suíça e espectro de arco-íris
  const svg = `
<svg width="1080" height="1080" viewBox="0 0 1080 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Gradiente do Espectro de Arco-Íris Caústico -->
    <linearGradient id="rainbowGrad" x1="0" y1="0" x2="1" y2="0.8">
      <stop offset="0%" stop-color="#FF3B30" stop-opacity="0.0"/>
      <stop offset="25%" stop-color="#FF9500" stop-opacity="0.45"/>
      <stop offset="40%" stop-color="#FFCC00" stop-opacity="0.65"/>
      <stop offset="55%" stop-color="#34C759" stop-opacity="0.75"/>
      <stop offset="70%" stop-color="#00C7BE" stop-opacity="0.75"/>
      <stop offset="85%" stop-color="#007AFF" stop-opacity="0.65"/>
      <stop offset="95%" stop-color="#5856D6" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#AF52DE" stop-opacity="0.0"/>
    </linearGradient>

    <!-- Filtro de Difusão Suave do Feixe -->
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="16" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>

    <!-- Sombra do Cartaz Negro -->
    <filter id="posterShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="25" stdDeviation="35" flood-color="#000000" flood-opacity="0.95"/>
    </filter>
  </defs>

  <!-- Fundo de Ardósia Grafite Mineral -->
  <rect width="1080" height="1080" fill="#0A0A0C" />

  <!-- Cartaz Negro Fosco Central -->
  <g filter="url(#posterShadow)">
    <rect x="150" y="60" width="780" height="960" rx="4" fill="#0C0C0E" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
  </g>

  <!-- Tipografia Monumental Suíça (Grotesca Condensada Pura) -->
  <g transform="translate(180, 80)">
    <!-- Linha 1 -->
    <text x="390" y="160" text-anchor="middle" font-family="'Impact', 'Arial Black', -apple-system, sans-serif" font-weight="900" font-size="114" fill="#FFFFFF" letter-spacing="-2">QUEM DEFINE</text>
    <!-- Linha 2 -->
    <text x="390" y="275" text-anchor="middle" font-family="'Impact', 'Arial Black', -apple-system, sans-serif" font-weight="900" font-size="114" fill="#FFFFFF" letter-spacing="-2">A PERCEPÇÃO</text>
    <!-- Linha 3 -->
    <text x="390" y="390" text-anchor="middle" font-family="'Impact', 'Arial Black', -apple-system, sans-serif" font-weight="900" font-size="114" fill="#FFFFFF" letter-spacing="-2">DITA O PREÇO.</text>
    <!-- Linha 4 -->
    <text x="390" y="530" text-anchor="middle" font-family="'Impact', 'Arial Black', -apple-system, sans-serif" font-weight="900" font-size="114" fill="#FFFFFF" letter-spacing="-2">QUEM USA</text>
    <!-- Linha 5 -->
    <text x="390" y="645" text-anchor="middle" font-family="'Impact', 'Arial Black', -apple-system, sans-serif" font-weight="900" font-size="114" fill="#FFFFFF" letter-spacing="-2">O COMUM</text>
    <!-- Linha 6 -->
    <text x="390" y="760" text-anchor="middle" font-family="'Impact', 'Arial Black', -apple-system, sans-serif" font-weight="900" font-size="114" fill="#FFFFFF" letter-spacing="-2">DÁ DESCONTO.</text>

    <!-- Rodapé Discreto em Microtipografia -->
    <text x="730" y="915" text-anchor="end" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="12" fill="rgba(255,255,255,0.45)" letter-spacing="2">BLACK LINK MANIFESTO 02 // blklnk.com</text>
  </g>

  <!-- Feixe de Luz Espectral em Arco-Íris Refratado pelo Prisma -->
  <g transform="rotate(32 160 80)" filter="url(#softGlow)" opacity="0.85">
    <!-- Feixe difuso -->
    <rect x="0" y="40" width="1300" height="42" fill="url(#rainbowGrad)" />
    <!-- Núcleo de alta intensidade branca e caustics -->
    <rect x="0" y="55" width="1300" height="12" fill="rgba(255,255,255,0.4)" />
  </g>
</svg>`;

  // Composição: Renderiza o cartaz com a tipografia e o feixe, e depois adiciona o prisma no canto superior esquerdo
  const basePoster = await sharp(Buffer.from(svg))
    .composite([
      {
        input: prismCrop,
        top: 25,
        left: 70
      }
    ])
    .jpeg({ quality: 98 })
    .toFile(path.join(OUTPUT_DIR, "manifesto-02.jpg"));

  console.log("manifesto-02.jpg composto com sucesso!");
}

buildManifesto02().catch(console.error);
