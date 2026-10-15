const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OUTPUT_DIR = path.join(__dirname, '../public/launch-pack');
const BRAIN_DIR = '/Users/blacklink.com.br/.gemini/antigravity/brain/b9ff108e-3882-4b47-a186-e6d80bb1ce76';
const BRAND_DIR = path.join(__dirname, '../public/brand');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// 9 Peças Curadas — 100% em Português — Padrão Museu GOAT (Collins / Metalab / Pentagram / Dieter Rams)
const FEED_POSTS = [
  {
    num: 1,
    id: "feed-01",
    pos: "Linha 1, Col 1 // Superior Esquerda",
    theme: "Manifesto Institucional",
    headline: "SEU PRODUTO PARECE AMADOR.",
    sub1: "O mercado não compra o que é bom. Compra o que parece inatingível.",
    sub2: "Construímos a tecnologia e os ecossistemas que separam quem lidera do resto.",
    tagPill: "POSICIONAMENTO DE LUXO // blklnk.com",
    bgPath: path.join(BRAND_DIR, "glass-01-chain.jpg"),
    layout: "manifesto-left"
  },
  {
    num: 2,
    id: "feed-02",
    pos: "Linha 1, Col 2 // Superior Centro",
    theme: "Software & Produto Real",
    headline: "A PLATAFORMA BLACK LINK",
    sub1: "Telemetria de receita em tempo real e esteira comercial inteligente.",
    sub2: "Dados vivos e previsão matemática de fechamento de contratos.",
    tagPill: "BLACK LINK CRM OS // blklnk.com",
    bgPath: path.join(BRAIN_DIR, "crm_interface_frontal_1792091145296.jpg"),
    layout: "software-clean"
  },
  {
    num: 3,
    id: "feed-03",
    pos: "Linha 1, Col 3 // Superior Direita",
    theme: "A Lei do High-Ticket",
    headline: "PRECIFICAÇÃO É PERCEPÇÃO.",
    sub1: "Quem tem autoridade visual dita as regras do mercado.",
    sub2: "Quem usa ferramentas comuns é forçado a dar desconto para vender.",
    tagPill: "ENGENHARIA HIGH-TICKET // blklnk.com",
    bgPath: path.join(BRAND_DIR, "glass-02-pillar.jpg"),
    layout: "pillar-center"
  },
  {
    num: 4,
    id: "feed-04",
    pos: "Linha 2, Col 1 // Meio Esquerda",
    theme: "Estratégia de Ecossistema",
    headline: "ECOSSISTEMAS VENCEM CURSOS.",
    sub1: "A era do infoproduto genérico morreu.",
    sub2: "Grandes marcas retêm clientes com software, comunidade e status.",
    tagPill: "RETENÇÃO & LTV // blklnk.com",
    bgPath: path.join(BRAND_DIR, "glass-04-slab.jpg"),
    layout: "diagram-split"
  },
  {
    num: 5,
    id: "feed-05",
    pos: "Linha 2, Col 2 // Centro Absoluto (O Coração do Feed)",
    theme: "O Monólito Central",
    headline: "BLACK LINK",
    sub1: "ECOSSISTEMAS DIGITAIS SOBERANOS",
    sub2: "Engenharia de software e autoridade visual para o topo da cadeia.",
    tagPill: "SOVEREIGN ECOSYSTEMS // EST. 2026",
    bgPath: path.join(BRAIN_DIR, "brand_centerpiece_soberano_1792091075011.jpg"),
    layout: "centerpiece-monolith"
  },
  {
    num: 6,
    id: "feed-06",
    pos: "Linha 2, Col 3 // Meio Direita",
    theme: "Autonomia do Fundador",
    headline: "ENGENHARIA DA AUSÊNCIA.",
    sub1: "Se sua empresa para quando você viaja, você tem um emprego.",
    sub2: "Codificamos sua esteira para que ela escale sem a sua presença.",
    tagPill: "SOBERANIA OPERACIONAL // blklnk.com",
    bgPath: path.join(BRAIN_DIR, "glass_ribbon_blank_1792091324665.jpg"),
    layout: "ribbon-quote"
  },
  {
    num: 7,
    id: "feed-07",
    pos: "Linha 3, Col 1 // Inferior Esquerda",
    theme: "Métricas de Conversão",
    headline: "VELOCIDADE É CONVERSÃO.",
    sub1: "Responder em 30 segundos multiplica por 4 o fechamento de contratos.",
    sub2: "IA proprietária qualificando o decisor antes do concorrente abrir a mensagem.",
    tagPill: "TELEMETRIA COMERCIAL // blklnk.com",
    bgPath: path.join(BRAIN_DIR, "museum_tile07_data_1792088568481.jpg"),
    layout: "data-minimal"
  },
  {
    num: 8,
    id: "feed-08",
    pos: "Linha 3, Col 2 // Inferior Centro",
    theme: "Infraestrutura Corporativa",
    headline: "ARQUITETURA INTOCÁVEL.",
    sub1: "Sua escala comercial não cabe em ferramentas gratuitas.",
    sub2: "Bancos de dados distribuídos e tecnologia de padrão corporativo.",
    tagPill: "SEGURANÇA CORPORATIVA // blklnk.com",
    bgPath: path.join(BRAND_DIR, "glass-08-vault.jpg"),
    layout: "vault-tech"
  },
  {
    num: 9,
    id: "feed-09",
    pos: "Linha 3, Col 3 // Inferior Direita (Fechamento)",
    theme: "Convite Institucional",
    headline: "CONSTRUA SEU ECOSSISTEMA.",
    sub1: "As portas estão abertas para novos projetos corporativos.",
    sub2: "Solicite sua avaliação executiva com nosso time de engenharia.",
    tagPill: "ACESSO CORPORATIVO // blklnk.com",
    bgPath: path.join(BRAIN_DIR, "access_card_blank_1792091220745.jpg"),
    layout: "card-access"
  }
];

function escapeXml(unsafe) {
  return String(unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function buildFeed() {
  console.log("=== COMPILANDO GRADE OFICIAL DE MUSEU (9 PEÇAS) ===");

  for (const post of FEED_POSTS) {
    const numStr = String(post.num).padStart(2, '0');
    console.log(`Renderizando Peça #${numStr} (${post.headline})...`);

    let overlaySvg = '';

    if (post.layout === "centerpiece-monolith") {
      // Post 05: Monólito Central - Quase zero texto, apenas microtipografia periférica
      overlaySvg = `
<svg width="1080" height="1080" viewBox="0 0 1080 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Pílula Superior Sutil -->
  <g transform="translate(54, 54)">
    <rect width="180" height="36" rx="18" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
    <text x="90" y="23" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="11" fill="#FFFFFF" letter-spacing="2">BLACK LINK</text>
  </g>
  <g transform="translate(896, 54)">
    <rect width="130" height="36" rx="18" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
    <text x="65" y="23" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="11" fill="rgba(255,255,255,0.8)" letter-spacing="1.5">blklnk.com</text>
  </g>

  <!-- Rodapé Microtipográfico Sóbrio -->
  <g transform="translate(54, 980)">
    <text x="486" y="20" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="11" fill="rgba(255,255,255,0.6)" letter-spacing="3">ECOSSISTEMAS DIGITAIS SOBERANOS // EST. 2026</text>
  </g>
</svg>`;
    } else if (post.layout === "software-clean") {
      // Post 02: Software Real - Apenas moldura elegante de precisão
      overlaySvg = `
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
    <text x="486" y="20" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="11" fill="rgba(255,255,255,0.6)" letter-spacing="3">TELEMETRIA DE RECEITA EM TEMPO REAL // CRM PROPRIETÁRIO</text>
  </g>
</svg>`;
    } else if (post.layout === "card-access") {
      // Post 09: Cartão de Acesso VIP
      overlaySvg = `
<svg width="1080" height="1080" viewBox="0 0 1080 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Gravação a laser sobre o cartão de cristal central -->
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
    } else {
      // Padrão Editorial Sóbrio (Posts 1, 3, 4, 6, 7, 8):
      // Linha de vidro fumê fina, tipografia monumental em português, sem card sufocando a arte.
      overlaySvg = `
<svg width="1080" height="1080" viewBox="0 0 1080 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Pílulas Superiores -->
  <g transform="translate(54, 54)">
    <rect width="180" height="36" rx="18" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
    <text x="90" y="23" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="11" fill="#FFFFFF" letter-spacing="2">BLACK LINK</text>
  </g>
  <g transform="translate(896, 54)">
    <rect width="130" height="36" rx="18" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
    <text x="65" y="23" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="11" fill="rgba(255,255,255,0.8)" letter-spacing="1.5">blklnk.com</text>
  </g>

  <!-- Barra Editorial Sutil na Base (Vidro Fosco Fino de 180px, sem sufocar a arte) -->
  <g transform="translate(54, 820)">
    <rect width="972" height="190" rx="20" fill="rgba(7, 7, 10, 0.78)" stroke="rgba(255,255,255,0.14)" stroke-width="1" />

    <!-- Título Principal em Português -->
    <text x="44" y="62" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="800" font-size="36" fill="#FFFFFF" letter-spacing="-0.5">${escapeXml(post.headline)}</text>

    <!-- Subtítulo Explicativo -->
    <text x="44" y="104" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="500" font-size="18" fill="rgba(255,255,255,0.85)">${escapeXml(post.sub1)}</text>
    <text x="44" y="132" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="500" font-size="18" fill="rgba(255,255,255,0.55)">${escapeXml(post.sub2)}</text>

    <!-- Microtag Institucional -->
    <text x="44" y="166" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="10" fill="rgba(255,255,255,0.4)" letter-spacing="2">${escapeXml(post.tagPill)}</text>
  </g>
</svg>`;
    }

    // Processamento com Sharp
    await sharp(post.bgPath)
      .resize(1080, 1080, { fit: 'cover' })
      .composite([{ input: Buffer.from(overlaySvg) }])
      .jpeg({ quality: 95 })
      .toFile(path.join(OUTPUT_DIR, `museum-${numStr}.jpg`));
  }

  console.log("=== TODAS AS 9 PEÇAS CONCLUÍDAS COM SUCESSO! ===");
}

buildFeed().catch(console.error);
