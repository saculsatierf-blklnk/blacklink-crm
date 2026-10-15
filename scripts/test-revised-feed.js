const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OUTPUT_DIR = path.join(__dirname, '../public/launch-pack');
const BRAIN_DIR = '/Users/blacklink.com.br/.gemini/antigravity/brain/b9ff108e-3882-4b47-a186-e6d80bb1ce76';
const BRAND_DIR = path.join(__dirname, '../public/brand');

async function testRevisedPieces() {
  console.log("=== TESTANDO NOVAS PEÇAS 03, 05 E 08 ===");

  // Peça 03: Dois elos entrelaçados (glass-07-torus.jpg)
  const svg03 = `
<svg width="1080" height="1080" viewBox="0 0 1080 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(54, 54)">
    <rect width="180" height="36" rx="18" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
    <text x="90" y="23" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="11" fill="#FFFFFF" letter-spacing="2">BLACK LINK</text>
  </g>
  <g transform="translate(896, 54)">
    <rect width="130" height="36" rx="18" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
    <text x="65" y="23" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="11" fill="rgba(255,255,255,0.8)" letter-spacing="1.5">blklnk.com</text>
  </g>
  <g transform="translate(54, 820)">
    <rect width="972" height="190" rx="20" fill="rgba(7, 7, 10, 0.78)" stroke="rgba(255,255,255,0.14)" stroke-width="1" />
    <text x="44" y="62" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="800" font-size="36" fill="#FFFFFF" letter-spacing="-0.5">PRECIFICAÇÃO É PERCEPÇÃO.</text>
    <text x="44" y="104" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="500" font-size="18" fill="rgba(255,255,255,0.85)">Quem constrói autoridade visual define as regras do mercado.</text>
    <text x="44" y="132" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="500" font-size="18" fill="rgba(255,255,255,0.55)">Operações que utilizam ferramentas comuns são forçadas a dar desconto.</text>
    <text x="44" y="166" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="10" fill="rgba(255,255,255,0.4)" letter-spacing="2">ARQUITETURA DE VALOR // blklnk.com</text>
  </g>
</svg>`;

  await sharp(path.join(BRAND_DIR, "glass-07-torus.jpg"))
    .resize(1080, 1080, { fit: 'cover' })
    .composite([{ input: Buffer.from(svg03) }])
    .jpeg({ quality: 95 })
    .toFile(path.join(OUTPUT_DIR, "museum-03-test.jpg"));
  console.log("museum-03-test.jpg gerado!");

  // Peça 05: Monograma Oficial em Vidro Fosco (glass-05-helix.jpg)
  const svg05 = `
<svg width="1080" height="1080" viewBox="0 0 1080 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(54, 54)">
    <rect width="180" height="36" rx="18" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
    <text x="90" y="23" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="11" fill="#FFFFFF" letter-spacing="2">BLACK LINK</text>
  </g>
  <g transform="translate(896, 54)">
    <rect width="130" height="36" rx="18" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
    <text x="65" y="23" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="11" fill="rgba(255,255,255,0.8)" letter-spacing="1.5">blklnk.com</text>
  </g>
  <g transform="translate(54, 980)">
    <text x="486" y="20" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="11" fill="rgba(255,255,255,0.6)" letter-spacing="3">ECOSSISTEMAS DIGITAIS SOBERANOS // FUNDAÇÃO 2026</text>
  </g>
</svg>`;

  await sharp(path.join(BRAND_DIR, "glass-05-helix.jpg"))
    .resize(1080, 1080, { fit: 'cover' })
    .composite([{ input: Buffer.from(svg05) }])
    .jpeg({ quality: 95 })
    .toFile(path.join(OUTPUT_DIR, "museum-05-test.jpg"));
  console.log("museum-05-test.jpg gerado!");

  // Peça 08: Cubo Isométrico Monolítico (glass-06-cube.jpg)
  const svg08 = `
<svg width="1080" height="1080" viewBox="0 0 1080 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(54, 54)">
    <rect width="180" height="36" rx="18" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
    <text x="90" y="23" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="11" fill="#FFFFFF" letter-spacing="2">BLACK LINK</text>
  </g>
  <g transform="translate(896, 54)">
    <rect width="130" height="36" rx="18" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
    <text x="65" y="23" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="11" fill="rgba(255,255,255,0.8)" letter-spacing="1.5">blklnk.com</text>
  </g>
  <g transform="translate(54, 820)">
    <rect width="972" height="190" rx="20" fill="rgba(7, 7, 10, 0.78)" stroke="rgba(255,255,255,0.14)" stroke-width="1" />
    <text x="44" y="62" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="800" font-size="36" fill="#FFFFFF" letter-spacing="-0.5">INFRAESTRUTURA INTOCÁVEL.</text>
    <text x="44" y="104" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="500" font-size="18" fill="rgba(255,255,255,0.85)">Sistemas proprietários construídos para operações de alta escala.</text>
    <text x="44" y="132" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="500" font-size="18" fill="rgba(255,255,255,0.55)">Bancos de dados distribuídos e tecnologia de padrão corporativo.</text>
    <text x="44" y="166" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="10" fill="rgba(255,255,255,0.4)" letter-spacing="2">SEGURANÇA CORPORATIVA // blklnk.com</text>
  </g>
</svg>`;

  await sharp(path.join(BRAND_DIR, "glass-06-cube.jpg"))
    .resize(1080, 1080, { fit: 'cover' })
    .composite([{ input: Buffer.from(svg08) }])
    .jpeg({ quality: 95 })
    .toFile(path.join(OUTPUT_DIR, "museum-08-test.jpg"));
  console.log("museum-08-test.jpg gerado!");
}

testRevisedPieces().catch(console.error);
