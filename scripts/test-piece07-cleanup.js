const path = require('path');
const sharp = require('sharp');

const BRAIN_DIR = '/Users/blacklink.com.br/.gemini/antigravity/brain/b9ff108e-3882-4b47-a186-e6d80bb1ce76';
const OUTPUT_DIR = path.join(__dirname, '../public/launch-pack');

async function testClean07() {
  // SVG que cobre o texto em inglês do background e insere a telemetria 100% em português
  const svg07 = `
<svg width="1080" height="1080" viewBox="0 0 1080 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Pílula Superior Esquerda (Cobre "AURORA TECH" do background) -->
  <g transform="translate(48, 48)">
    <rect width="450" height="80" rx="16" fill="rgba(8, 8, 12, 0.95)" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
    <text x="24" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="800" font-size="16" fill="#FFFFFF" letter-spacing="2">BLACK LINK // TELEMETRIA</text>
    <text x="24" y="58" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="600" font-size="11" fill="rgba(255,255,255,0.5)" letter-spacing="1.5">RELATÓRIO DE DESEMPENHO COMERCIAL</text>
  </g>

  <!-- Pílula Superior Direita -->
  <g transform="translate(896, 48)">
    <rect width="130" height="36" rx="18" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
    <text x="65" y="23" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="11" fill="rgba(255,255,255,0.8)" letter-spacing="1.5">blklnk.com</text>
  </g>

  <!-- Cobre "DEAL VELOCITY" e coloca em português -->
  <g transform="translate(64, 305)">
    <rect width="520" height="60" rx="10" fill="rgba(8, 8, 12, 0.96)" />
    <text x="4" y="44" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="800" font-size="34" fill="#FFFFFF" letter-spacing="2">VELOCIDADE DE FECHAMENTO</text>
  </g>

  <!-- Cobre legendas de resposta humana e IA -->
  <g transform="translate(68, 395)">
    <rect width="250" height="26" fill="rgba(8, 8, 12, 0.96)" />
    <text x="0" y="20" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="14" fill="#10B981" letter-spacing="1">RESPOSTA HUMANA</text>
  </g>
  <g transform="translate(360, 395)">
    <rect width="250" height="26" fill="rgba(8, 8, 12, 0.96)" />
    <text x="0" y="20" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="14" fill="#10B981" letter-spacing="1">TELEMETRIA POR IA</text>
  </g>

  <!-- Cobre colunas do lado direito -->
  <g transform="translate(600, 165)">
    <rect width="430" height="580" rx="16" fill="rgba(8, 8, 12, 0.94)" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
    
    <!-- Linha 1 -->
    <text x="24" y="40" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="12" fill="rgba(255,255,255,0.4)" letter-spacing="1.5">MÉTRICA COMERCIAL</text>
    <text x="260" y="40" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="12" fill="rgba(255,255,255,0.4)" letter-spacing="1.5">STATUS</text>
    <text x="350" y="40" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="12" fill="rgba(255,255,255,0.4)" letter-spacing="1.5">ALTA</text>

    <text x="24" y="90" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="15" fill="#FFFFFF">RETENÇÃO LÍQUIDA</text>
    <text x="24" y="112" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="500" font-size="12" fill="rgba(255,255,255,0.5)">LTV CLIENTES VIP</text>
    <text x="260" y="105" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="800" font-size="15" fill="#10B981">R$ 8.9M</text>
    <text x="360" y="105" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="800" font-size="15" fill="#10B981">+88%</text>

    <!-- Linha 2 -->
    <text x="24" y="190" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="15" fill="#FFFFFF">FLUXO DE PIPELINE</text>
    <text x="24" y="212" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="500" font-size="12" fill="rgba(255,255,255,0.5)">CONVERSÃO ATIVA</text>
    <text x="260" y="205" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="800" font-size="15" fill="#10B981">R$ 3.8M</text>
    <text x="360" y="205" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="800" font-size="15" fill="#10B981">+71%</text>

    <!-- Linha 3 -->
    <text x="24" y="290" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="15" fill="#FFFFFF">RECEITA RECORRENTE</text>
    <text x="24" y="312" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="500" font-size="12" fill="rgba(255,255,255,0.5)">PROJEÇÃO ANUAL</text>
    <text x="260" y="305" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="800" font-size="15" fill="#10B981">R$ 21.4M</text>
    <text x="360" y="305" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="800" font-size="15" fill="#10B981">+35%</text>

    <!-- Linha 4 -->
    <text x="24" y="390" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="15" fill="#FFFFFF">EXPANSÃO DE CONTRATOS</text>
    <text x="24" y="412" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="500" font-size="12" fill="rgba(255,255,255,0.5)">UP-SELL AUTOMATIZADO</text>
    <text x="260" y="405" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="800" font-size="15" fill="#10B981">R$ 1.1M</text>
    <text x="360" y="405" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="800" font-size="15" fill="#10B981">+52%</text>

    <!-- Linha 5 -->
    <text x="24" y="490" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="15" fill="#FFFFFF">NOVOS CLIENTES</text>
    <text x="24" y="512" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="500" font-size="12" fill="rgba(255,255,255,0.5)">CAPTAÇÃO QUALIFICADA</text>
    <text x="260" y="505" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="800" font-size="15" fill="#10B981">+114</text>
    <text x="360" y="505" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="800" font-size="15" fill="#10B981">+29%</text>
  </g>

  <!-- Barra Editorial na Base (100% em Português) -->
  <g transform="translate(54, 820)">
    <rect width="972" height="190" rx="20" fill="rgba(7, 7, 10, 0.88)" stroke="rgba(255,255,255,0.14)" stroke-width="1" />
    <text x="44" y="62" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="800" font-size="36" fill="#FFFFFF" letter-spacing="-0.5">VELOCIDADE É CONVERSÃO.</text>
    <text x="44" y="104" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="500" font-size="18" fill="rgba(255,255,255,0.85)">Responder em 30 segundos multiplica por 4 o fechamento de contratos.</text>
    <text x="44" y="132" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="500" font-size="18" fill="rgba(255,255,255,0.55)">IA proprietária qualificando o tomador de decisão antes do concorrente abrir a mensagem.</text>
    <text x="44" y="166" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="10" fill="rgba(255,255,255,0.4)" letter-spacing="2">TELEMETRIA COMERCIAL // blklnk.com</text>
  </g>
</svg>`;

  await sharp(path.join(BRAIN_DIR, "museum_tile07_data_1792088568481.jpg"))
    .resize(1080, 1080, { fit: 'cover' })
    .composite([{ input: Buffer.from(svg07) }])
    .jpeg({ quality: 95 })
    .toFile(path.join(OUTPUT_DIR, "museum-07-test.jpg"));
  console.log("museum-07-test.jpg gerado com sucesso sem nenhum termo em inglês!");
}

testClean07().catch(console.error);
