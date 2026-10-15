const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OUTPUT_DIR = path.join(__dirname, '../public/launch-pack');
const BRAIN_DIR = '/Users/blacklink.com.br/.gemini/antigravity/brain/b9ff108e-3882-4b47-a186-e6d80bb1ce76';
const BRAND_DIR = path.join(__dirname, '../public/brand');
const UPLOADED_PRISM = path.join(BRAIN_DIR, '.user_uploaded/media_1792095092284.jpg');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function escapeXml(unsafe) {
  return String(unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function buildAllPieces() {
  console.log("=== COMPILANDO GRADE DEFINITIVA (ZERO NÚMEROS FICTÍCIOS // 100% PORTUGUÊS) ===");

  // 1. PEÇA #01 — O MANIFESTO DO PRISMA ORIGINAL (O Criativo que o usuário enviou e achou lindo)
  console.log("Renderizando Peça #01 (Manifesto do Prisma 01)...");
  await sharp(UPLOADED_PRISM)
    .resize(1080, 1080, { fit: 'cover' })
    .jpeg({ quality: 98 })
    .toFile(path.join(OUTPUT_DIR, "museum-01.jpg"));
  fs.copyFileSync(path.join(OUTPUT_DIR, "museum-01.jpg"), path.join(BRAIN_DIR, "museum-01.jpg"));

  // 2. PEÇA #02 — SOFTWARE REAL: BLACK LINK CRM (100% em Português)
  console.log("Renderizando Peça #02 (CRM em Português Puro)...");
  fs.copyFileSync(path.join(OUTPUT_DIR, "museum-02-clean.jpg"), path.join(OUTPUT_DIR, "museum-02.jpg"));
  fs.copyFileSync(path.join(OUTPUT_DIR, "museum-02.jpg"), path.join(BRAIN_DIR, "museum-02.jpg"));

  // 3. PEÇA #03 — ARTE ESCULTURAL: ELOS ENTRELAÇADOS
  console.log("Renderizando Peça #03 (Elos de Vidro)...");
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
    .jpeg({ quality: 96 })
    .toFile(path.join(OUTPUT_DIR, "museum-03.jpg"));
  fs.copyFileSync(path.join(OUTPUT_DIR, "museum-03.jpg"), path.join(BRAIN_DIR, "museum-03.jpg"));

  // 4. PEÇA #04 — TEORIA ESTRATÉGICA: ECOSSISTEMAS VENCEM CURSOS
  console.log("Renderizando Peça #04 (Placa Monolítica)...");
  const svg04 = `
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
    <text x="44" y="62" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="800" font-size="36" fill="#FFFFFF" letter-spacing="-0.5">ECOSSISTEMAS VENCEM CURSOS.</text>
    <text x="44" y="104" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="500" font-size="18" fill="rgba(255,255,255,0.85)">A era do infoproduto genérico chegou ao fim.</text>
    <text x="44" y="132" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="500" font-size="18" fill="rgba(255,255,255,0.55)">Grandes marcas retêm clientes com software, comunidade e status.</text>
    <text x="44" y="166" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="10" fill="rgba(255,255,255,0.4)" letter-spacing="2">RETENÇÃO E VALOR // blklnk.com</text>
  </g>
</svg>`;
  await sharp(path.join(BRAND_DIR, "glass-04-slab.jpg"))
    .resize(1080, 1080, { fit: 'cover' })
    .composite([{ input: Buffer.from(svg04) }])
    .jpeg({ quality: 96 })
    .toFile(path.join(OUTPUT_DIR, "museum-04.jpg"));
  fs.copyFileSync(path.join(OUTPUT_DIR, "museum-04.jpg"), path.join(BRAIN_DIR, "museum-04.jpg"));

  // 5. PEÇA #05 — O EMBLEMA MONOLÍTICO OFICIAL (O Autêntico Elo da Marca no Centro)
  console.log("Renderizando Peça #05 (O Emblema Monolítico Oficial)...");
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
  <g transform="translate(290, 960)">
    <rect width="500" height="38" rx="19" fill="rgba(8, 8, 12, 0.88)" stroke="rgba(255,255,255,0.18)" stroke-width="1" />
    <text x="250" y="24" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="11" fill="#FFFFFF" letter-spacing="2.5">ECOSSISTEMAS DIGITAIS SOBERANOS // 2026</text>
  </g>
</svg>`;
  await sharp(path.join(BRAND_DIR, "glass-05-helix.jpg"))
    .resize(1080, 1080, { fit: 'cover' })
    .composite([{ input: Buffer.from(svg05) }])
    .jpeg({ quality: 96 })
    .toFile(path.join(OUTPUT_DIR, "museum-05.jpg"));
  fs.copyFileSync(path.join(OUTPUT_DIR, "museum-05.jpg"), path.join(BRAIN_DIR, "museum-05.jpg"));

  // 6. PEÇA #06 — AUTONOMIA: ENGENHARIA DA AUSÊNCIA (Fita de Möbius)
  console.log("Renderizando Peça #06 (Fita de Möbius)...");
  const svg06 = `
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
    <text x="44" y="62" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="800" font-size="36" fill="#FFFFFF" letter-spacing="-0.5">ENGENHARIA DA AUSÊNCIA.</text>
    <text x="44" y="104" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="500" font-size="18" fill="rgba(255,255,255,0.85)">Se sua empresa para quando você viaja, você tem um emprego.</text>
    <text x="44" y="132" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="500" font-size="18" fill="rgba(255,255,255,0.55)">Codificamos sua esteira para que ela escale sem a sua presença.</text>
    <text x="44" y="166" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="10" fill="rgba(255,255,255,0.4)" letter-spacing="2">SOBERANIA OPERACIONAL // blklnk.com</text>
  </g>
</svg>`;
  await sharp(path.join(BRAIN_DIR, "glass_ribbon_blank_1792091324665.jpg"))
    .resize(1080, 1080, { fit: 'cover' })
    .composite([{ input: Buffer.from(svg06) }])
    .jpeg({ quality: 96 })
    .toFile(path.join(OUTPUT_DIR, "museum-06.jpg"));
  fs.copyFileSync(path.join(OUTPUT_DIR, "museum-06.jpg"), path.join(BRAIN_DIR, "museum-06.jpg"));

  // 7. PEÇA #07 — O SEGUNDO MANIFESTO DO PRISMA (Substitui os números fictícios pelo modelo solicitado!)
  console.log("Renderizando Peça #07 (Segundo Manifesto do Prisma: 'O Preço é Definido pela Percepção')...");
  fs.copyFileSync(path.join(OUTPUT_DIR, "manifesto-02-final.jpg"), path.join(OUTPUT_DIR, "museum-07.jpg"));
  fs.copyFileSync(path.join(OUTPUT_DIR, "museum-07.jpg"), path.join(BRAIN_DIR, "museum-07.jpg"));

  // 8. PEÇA #08 — SEGURANÇA MÁXIMA: INFRAESTRUTURA INTOCÁVEL (Cubo Isométrico em Ardósia)
  console.log("Renderizando Peça #08 (Cubo Monolítico)...");
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
    .jpeg({ quality: 96 })
    .toFile(path.join(OUTPUT_DIR, "museum-08.jpg"));
  fs.copyFileSync(path.join(OUTPUT_DIR, "museum-08.jpg"), path.join(BRAIN_DIR, "museum-08.jpg"));

  // 9. PEÇA #09 — CONVITE EXCLUSIVO: ACESSO CORPORATIVO 2026
  console.log("Renderizando Peça #09 (Cartão de Cristal VIP)...");
  const svg09 = `
<svg width="1080" height="1080" viewBox="0 0 1080 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(540, 520)">
    <text x="0" y="0" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="800" font-size="28" fill="#FFFFFF" letter-spacing="6">BLACK LINK</text>
    <text x="0" y="32" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="600" font-size="12" fill="rgba(255,255,255,0.65)" letter-spacing="3">ACESSO CORPORATIVO 2026</text>
    <text x="0" y="70" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="11" fill="rgba(255,255,255,0.4)" letter-spacing="2">blklnk.com // CONSTRUA SEU ECOSSISTEMA</text>
  </g>
  <g transform="translate(54, 54)">
    <rect width="180" height="36" rx="18" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
    <text x="90" y="23" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="11" fill="#FFFFFF" letter-spacing="2">BLACK LINK</text>
  </g>
  <g transform="translate(896, 54)">
    <rect width="130" height="36" rx="18" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
    <text x="65" y="23" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="11" fill="rgba(255,255,255,0.8)" letter-spacing="1.5">blklnk.com</text>
  </g>
</svg>`;
  await sharp(path.join(BRAIN_DIR, "access_card_blank_1792091220745.jpg"))
    .resize(1080, 1080, { fit: 'cover' })
    .composite([{ input: Buffer.from(svg09) }])
    .jpeg({ quality: 96 })
    .toFile(path.join(OUTPUT_DIR, "museum-09.jpg"));
  fs.copyFileSync(path.join(OUTPUT_DIR, "museum-09.jpg"), path.join(BRAIN_DIR, "museum-09.jpg"));

  console.log("=== TODAS AS 9 PEÇAS COMPILADAS E SINCRONIZADAS COM SUCESSO! ===");
}

buildAllPieces().catch(console.error);
