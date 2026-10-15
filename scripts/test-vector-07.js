const path = require('path');
const sharp = require('sharp');

const OUTPUT_DIR = path.join(__dirname, '../public/launch-pack');

async function buildVector07() {
  const width = 1080;
  const height = 1080;

  const svg = `
<svg width="1080" height="1080" viewBox="0 0 1080 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#10B981" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#10B981" stop-opacity="0.0"/>
    </linearGradient>
    <linearGradient id="cardGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(255,255,255,0.05)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0.01)"/>
    </linearGradient>
  </defs>

  <!-- Fundo Preto Ardósia Puro -->
  <rect width="1080" height="1080" fill="#070709" />

  <!-- Grid Suíço Milimétrico (0.5px sutil) -->
  <g opacity="0.12" stroke="#FFFFFF" stroke-width="0.5">
    <line x1="54" y1="200" x2="1026" y2="200" stroke-dasharray="2 4"/>
    <line x1="54" y1="350" x2="1026" y2="350" stroke-dasharray="2 4"/>
    <line x1="54" y1="500" x2="1026" y2="500" stroke-dasharray="2 4"/>
    <line x1="54" y1="650" x2="1026" y2="650" stroke-dasharray="2 4"/>
    <line x1="550" y1="160" x2="550" y2="760" stroke-dasharray="2 4"/>
  </g>

  <!-- Header Superior -->
  <g transform="translate(54, 54)">
    <rect width="260" height="40" rx="20" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
    <text x="130" y="25" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="12" fill="#FFFFFF" letter-spacing="2">BLACK LINK // TELEMETRIA</text>
  </g>
  <g transform="translate(896, 54)">
    <rect width="130" height="40" rx="20" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
    <text x="65" y="25" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="12" fill="rgba(255,255,255,0.8)" letter-spacing="1.5">blklnk.com</text>
  </g>

  <!-- Sub-header -->
  <g transform="translate(54, 125)">
    <text x="0" y="20" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="11" fill="rgba(255,255,255,0.4)" letter-spacing="2">RELATÓRIO EXECUTIVO DE AUDITORIA // ESTEIRA COMERCIAL 2026</text>
  </g>

  <!-- Coluna Esquerda: Métrica Gigante e Gráfico de Onda -->
  <g transform="translate(54, 170)">
    <!-- Grande Métrica -->
    <text x="0" y="90" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="900" font-size="96" fill="#FFFFFF" letter-spacing="-3">+412%</text>
    <text x="4" y="130" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="800" font-size="20" fill="#FFFFFF" letter-spacing="2">VELOCIDADE DE FECHAMENTO</text>

    <!-- Cards Comparativos -->
    <g transform="translate(0, 160)">
      <!-- Card Humano -->
      <rect width="210" height="74" rx="14" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
      <text x="16" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="10" fill="rgba(255,255,255,0.4)" letter-spacing="1">TEMPO HUMANO</text>
      <text x="16" y="56" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="800" font-size="22" fill="#E4E4E7">4.2 HORAS</text>

      <!-- Card IA -->
      <g transform="translate(225, 0)">
        <rect width="235" height="74" rx="14" fill="rgba(16,185,129,0.08)" stroke="rgba(16,185,129,0.3)" stroke-width="1"/>
        <text x="16" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="10" fill="#10B981" letter-spacing="1">RESPOSTA IA BLACK LINK</text>
        <text x="16" y="56" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="800" font-size="22" fill="#10B981">28 SEGUNDOS</text>
      </g>
    </g>

    <!-- Curva de Conversão Suave com Gradiente -->
    <g transform="translate(0, 260)">
      <path d="M 0 240 Q 120 220, 240 180 T 460 30 L 460 250 L 0 250 Z" fill="url(#chartGrad)" />
      <path d="M 0 240 Q 120 220, 240 180 T 460 30" fill="none" stroke="#10B981" stroke-width="3.5" />
      
      <!-- Pontos de Telemetria -->
      <circle cx="0" cy="240" r="5" fill="#10B981" />
      <circle cx="120" cy="210" r="5" fill="#10B981" />
      <circle cx="240" cy="180" r="5" fill="#10B981" />
      <circle cx="360" cy="110" r="5" fill="#10B981" />
      <circle cx="460" cy="30" r="7" fill="#FFFFFF" stroke="#10B981" stroke-width="3" />
      
      <!-- Labels de Eixo -->
      <text x="0" y="275" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="600" font-size="10" fill="rgba(255,255,255,0.3)">0s</text>
      <text x="110" y="275" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="600" font-size="10" fill="rgba(255,255,255,0.3)">10s</text>
      <text x="230" y="275" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="600" font-size="10" fill="rgba(255,255,255,0.3)">20s</text>
      <text x="350" y="275" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="600" font-size="10" fill="rgba(255,255,255,0.3)">30s</text>
      <text x="440" y="275" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="10" fill="#10B981">FECHADO</text>
    </g>
  </g>

  <!-- Coluna Direita: Tabela de Telemetria Financeira -->
  <g transform="translate(580, 180)">
    <rect width="446" height="520" rx="20" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
    
    <!-- Header da Tabela -->
    <text x="28" y="44" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="11" fill="rgba(255,255,255,0.4)" letter-spacing="2">INDICADOR COMERCIAL</text>
    <text x="280" y="44" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="11" fill="rgba(255,255,255,0.4)" letter-spacing="2">STATUS</text>
    <text x="375" y="44" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="11" fill="rgba(255,255,255,0.4)" letter-spacing="2">ALTA</text>

    <!-- Linha 1 -->
    <g transform="translate(28, 70)">
      <line x1="0" y1="0" x2="390" y2="0" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
      <text x="0" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="15" fill="#FFFFFF">RETENÇÃO LÍQUIDA</text>
      <text x="0" y="52" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="500" font-size="11" fill="rgba(255,255,255,0.4)">LTV CLIENTES CORPORATIVOS</text>
      <text x="250" y="42" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="800" font-size="16" fill="#10B981">R$ 8.9M</text>
      <text x="348" y="42" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="800" font-size="16" fill="#10B981">+88%</text>
      <!-- Mini Barra -->
      <rect x="0" y="66" width="390" height="4" rx="2" fill="rgba(255,255,255,0.08)"/>
      <rect x="0" y="66" width="343" height="4" rx="2" fill="#10B981"/>
    </g>

    <!-- Linha 2 -->
    <g transform="translate(28, 165)">
      <line x1="0" y1="0" x2="390" y2="0" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
      <text x="0" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="15" fill="#FFFFFF">FLUXO DE PIPELINE</text>
      <text x="0" y="52" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="500" font-size="11" fill="rgba(255,255,255,0.4)">OPORTUNIDADES ATIVAS</text>
      <text x="250" y="42" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="800" font-size="16" fill="#10B981">R$ 3.8M</text>
      <text x="348" y="42" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="800" font-size="16" fill="#10B981">+71%</text>
      <rect x="0" y="66" width="390" height="4" rx="2" fill="rgba(255,255,255,0.08)"/>
      <rect x="0" y="66" width="276" height="4" rx="2" fill="#10B981"/>
    </g>

    <!-- Linha 3 -->
    <g transform="translate(28, 260)">
      <line x1="0" y1="0" x2="390" y2="0" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
      <text x="0" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="15" fill="#FFFFFF">RECEITA RECORRENTE</text>
      <text x="0" y="52" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="500" font-size="11" fill="rgba(255,255,255,0.4)">CONTRATOS DE RETENÇÃO</text>
      <text x="250" y="42" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="800" font-size="16" fill="#10B981">R$ 21.4M</text>
      <text x="348" y="42" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="800" font-size="16" fill="#10B981">+35%</text>
      <rect x="0" y="66" width="390" height="4" rx="2" fill="rgba(255,255,255,0.08)"/>
      <rect x="0" y="66" width="136" height="4" rx="2" fill="#10B981"/>
    </g>

    <!-- Linha 4 -->
    <g transform="translate(28, 355)">
      <line x1="0" y1="0" x2="390" y2="0" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
      <text x="0" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="15" fill="#FFFFFF">EXPANSÃO DE CONTRATOS</text>
      <text x="0" y="52" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="500" font-size="11" fill="rgba(255,255,255,0.4)">UP-SELL AUTOMATIZADO</text>
      <text x="250" y="42" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="800" font-size="16" fill="#10B981">R$ 1.1M</text>
      <text x="348" y="42" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="800" font-size="16" fill="#10B981">+52%</text>
      <rect x="0" y="66" width="390" height="4" rx="2" fill="rgba(255,255,255,0.08)"/>
      <rect x="0" y="66" width="202" height="4" rx="2" fill="#10B981"/>
    </g>
  </g>

  <!-- Barra Editorial Sutil na Base (100% em Português) -->
  <g transform="translate(54, 820)">
    <rect width="972" height="190" rx="20" fill="rgba(7, 7, 10, 0.88)" stroke="rgba(255,255,255,0.14)" stroke-width="1" />
    <text x="44" y="62" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="800" font-size="36" fill="#FFFFFF" letter-spacing="-0.5">VELOCIDADE É CONVERSÃO.</text>
    <text x="44" y="104" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="500" font-size="18" fill="rgba(255,255,255,0.85)">Responder em 30 segundos multiplica por 4 o fechamento de contratos.</text>
    <text x="44" y="132" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="500" font-size="18" fill="rgba(255,255,255,0.55)">IA proprietária qualificando o decisor antes do concorrente abrir a mensagem.</text>
    <text x="44" y="166" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="10" fill="rgba(255,255,255,0.4)" letter-spacing="2">TELEMETRIA COMERCIAL // blklnk.com</text>
  </g>
</svg>`;

  await sharp(Buffer.from(svg))
    .jpeg({ quality: 98 })
    .toFile(path.join(OUTPUT_DIR, "museum-07-vector.jpg"));
  console.log("museum-07-vector.jpg criado!");
}

buildVector07().catch(console.error);
