const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OUTPUT_DIR = path.join(__dirname, '../public/launch-pack');

async function buildCleanCRM() {
  const svg = `
<svg width="1080" height="1080" viewBox="0 0 1080 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="screenGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#12131A"/>
      <stop offset="100%" stop-color="#0A0B0E"/>
    </linearGradient>
    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="rgba(16,185,129,0.1)"/>
      <stop offset="50%" stop-color="#10B981"/>
      <stop offset="100%" stop-color="rgba(16,185,129,0.2)"/>
    </linearGradient>
    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#10B981" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#10B981" stop-opacity="0.0"/>
    </linearGradient>
  </defs>

  <!-- Fundo Preto Ardósia Profundo -->
  <rect width="1080" height="1080" fill="#070709" />

  <!-- Pílulas Superiores -->
  <g transform="translate(54, 54)">
    <rect width="280" height="36" rx="18" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
    <text x="140" y="23" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="11" fill="#FFFFFF" letter-spacing="2">BLACK LINK // SOFTWARE</text>
  </g>
  <g transform="translate(896, 54)">
    <rect width="130" height="36" rx="18" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
    <text x="65" y="23" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="11" fill="rgba(255,255,255,0.8)" letter-spacing="1.5">blklnk.com</text>
  </g>

  <!-- Chassis do Tablet / Monitor Central (Vista Frontal Cirúrgica) -->
  <g transform="translate(60, 130)">
    <!-- Borda externa do hardware (titânio escovado fino) -->
    <rect width="960" height="660" rx="28" fill="#16171D" stroke="rgba(255,255,255,0.18)" stroke-width="1.5" />
    <!-- Tela Interna -->
    <rect x="8" y="8" width="944" height="644" rx="22" fill="url(#screenGrad)" />

    <!-- Barra de Navegação do Sistema (100% Português) -->
    <g transform="translate(24, 20)">
      <!-- Identificador do Sistema -->
      <circle cx="14" cy="14" r="7" fill="#10B981" />
      <text x="32" y="19" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="800" font-size="13" fill="#FFFFFF" letter-spacing="1.5">BLACK LINK CRM</text>

      <!-- Abas de Navegação -->
      <g transform="translate(260, 0)">
        <!-- Aba Ativa: Painel Geral -->
        <rect width="110" height="28" rx="8" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
        <text x="55" y="18" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="11" fill="#FFFFFF">Painel Geral</text>

        <!-- Outras Abas -->
        <text x="170" y="18" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="600" font-size="11" fill="rgba(255,255,255,0.45)">Esteira Ativa</text>
        <text x="270" y="18" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="600" font-size="11" fill="rgba(255,255,255,0.45)">Oportunidades</text>
        <text x="390" y="18" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="600" font-size="11" fill="rgba(255,255,255,0.45)">Relatórios</text>
      </g>

      <!-- Status do Operador -->
      <g transform="translate(760, 0)">
        <rect width="130" height="28" rx="14" fill="rgba(16,185,129,0.12)" stroke="rgba(16,185,129,0.3)" stroke-width="1"/>
        <circle cx="16" cy="14" r="3.5" fill="#10B981"/>
        <text x="30" y="18" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="10" fill="#10B981" letter-spacing="0.5">IA EM TEMPO REAL</text>
      </g>
    </g>

    <!-- Linha divisória da barra de navegação -->
    <line x1="24" y1="62" x2="936" y2="62" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>

    <!-- Grid de Métricas Principais (4 Cards Translúcidos) -->
    <g transform="translate(24, 76)">
      <!-- Card 1: Oportunidades Ativas -->
      <rect width="216" height="100" rx="14" fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
      <text x="16" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="10" fill="rgba(255,255,255,0.4)" letter-spacing="1">CONTATOS EM ANDAMENTO</text>
      <text x="16" y="58" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="800" font-size="26" fill="#FFFFFF">1.452</text>
      <text x="16" y="82" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="600" font-size="10" fill="#10B981">+18.4% este mês</text>

      <!-- Card 2: Valor em Negociação -->
      <g transform="translate(232, 0)">
        <rect width="216" height="100" rx="14" fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
        <text x="16" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="10" fill="rgba(255,255,255,0.4)" letter-spacing="1">PIPELINE TOTAL ATIVO</text>
        <text x="16" y="58" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="800" font-size="26" fill="#10B981">R$ 4.85M</text>
        <text x="16" y="82" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="600" font-size="10" fill="rgba(255,255,255,0.45)">Previsão de fechamento</text>
      </g>

      <!-- Card 3: Taxa de Qualificação -->
      <g transform="translate(464, 0)">
        <rect width="216" height="100" rx="14" fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
        <text x="16" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="10" fill="rgba(255,255,255,0.4)" letter-spacing="1">QUALIFICAÇÃO EXECUTIVA</text>
        <text x="16" y="58" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="800" font-size="26" fill="#FFFFFF">94.2%</text>
        <text x="16" y="82" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="600" font-size="10" fill="#10B981">Zero dispersão de leads</text>
      </g>

      <!-- Card 4: Tempo de Resposta -->
      <g transform="translate(696, 0)">
        <rect width="216" height="100" rx="14" fill="rgba(16,185,129,0.05)" stroke="rgba(16,185,129,0.25)" stroke-width="1"/>
        <text x="16" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="10" fill="#10B981" letter-spacing="1">RESPOSTA IMEDIATA IA</text>
        <text x="16" y="58" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="800" font-size="26" fill="#10B981">28s</text>
        <text x="16" y="82" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="600" font-size="10" fill="rgba(255,255,255,0.6)">Média do mercado: 4.2h</text>
      </g>
    </g>

    <!-- Área Principal: Gráfico de Conversão e Esteira Ativa -->
    <g transform="translate(24, 192)">
      <!-- Painel do Gráfico de Previsão -->
      <rect width="570" height="428" rx="16" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
      <text x="24" y="36" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="800" font-size="14" fill="#FFFFFF" letter-spacing="1">CURVA DE ACELERAÇÃO DE RECEITA</text>
      <text x="24" y="56" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="500" font-size="11" fill="rgba(255,255,255,0.4)">Projeção matemática com fechamento automatizado</text>

      <!-- Área do Gráfico -->
      <g transform="translate(24, 90)">
        <!-- Linhas guias -->
        <line x1="0" y1="50" x2="520" y2="50" stroke="rgba(255,255,255,0.04)" stroke-width="1" stroke-dasharray="2 4"/>
        <line x1="0" y1="130" x2="520" y2="130" stroke="rgba(255,255,255,0.04)" stroke-width="1" stroke-dasharray="2 4"/>
        <line x1="0" y1="210" x2="520" y2="210" stroke="rgba(255,255,255,0.04)" stroke-width="1" stroke-dasharray="2 4"/>

        <!-- Curva Preenchida -->
        <path d="M 0 240 Q 140 210, 260 140 T 520 20 L 520 270 L 0 270 Z" fill="url(#areaGrad)"/>
        <path d="M 0 240 Q 140 210, 260 140 T 520 20" fill="none" stroke="url(#lineGrad)" stroke-width="3"/>

        <!-- Pontos e tooltips -->
        <circle cx="260" cy="140" r="5" fill="#10B981"/>
        <g transform="translate(210, 85)">
          <rect width="100" height="36" rx="8" fill="rgba(10,12,18,0.9)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
          <text x="50" y="16" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="9" fill="rgba(255,255,255,0.5)">QUALIFICAÇÃO</text>
          <text x="50" y="29" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="800" font-size="11" fill="#10B981">R$ 2.450.000</text>
        </g>

        <circle cx="520" cy="20" r="7" fill="#FFFFFF" stroke="#10B981" stroke-width="3"/>

        <!-- Meses no Eixo X (Em Português!) -->
        <text x="0" y="295" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="600" font-size="11" fill="rgba(255,255,255,0.3)">Janeiro</text>
        <text x="120" y="295" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="600" font-size="11" fill="rgba(255,255,255,0.3)">Fevereiro</text>
        <text x="250" y="295" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="600" font-size="11" fill="rgba(255,255,255,0.3)">Março</text>
        <text x="380" y="295" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="600" font-size="11" fill="rgba(255,255,255,0.3)">Abril</text>
        <text x="490" y="295" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="11" fill="#10B981">Maio</text>
      </g>
    </g>

    <!-- Painel Lateral: Esteira Comercial Ativa -->
    <g transform="translate(610, 192)">
      <rect width="326" height="428" rx="16" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
      <text x="20" y="36" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="800" font-size="13" fill="#FFFFFF" letter-spacing="1">ESTEIRA EM TEMPO REAL</text>
      <text x="20" y="54" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="500" font-size="10" fill="rgba(255,255,255,0.4)">Proteção ativa anti-duplicidade</text>

      <!-- Card 1 na esteira -->
      <g transform="translate(16, 76)">
        <rect width="294" height="70" rx="10" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
        <circle cx="20" cy="24" r="4" fill="#10B981"/>
        <text x="32" y="28" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="11" fill="#FFFFFF">Gofer Metais // Expansão Industrial</text>
        <text x="32" y="48" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="800" font-size="13" fill="#10B981">R$ 380.000,00</text>
        <text x="210" y="48" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="600" font-size="10" fill="rgba(255,255,255,0.4)">Qualificado</text>
      </g>

      <!-- Card 2 na esteira -->
      <g transform="translate(16, 156)">
        <rect width="294" height="70" rx="10" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
        <circle cx="20" cy="24" r="4" fill="#10B981"/>
        <text x="32" y="28" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="11" fill="#FFFFFF">Grupo Alpha // Auditoria Digital</text>
        <text x="32" y="48" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="800" font-size="13" fill="#10B981">R$ 620.000,00</text>
        <text x="195" y="48" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="600" font-size="10" fill="rgba(255,255,255,0.4)">Em Fechamento</text>
      </g>

      <!-- Card 3 na esteira -->
      <g transform="translate(16, 236)">
        <rect width="294" height="70" rx="10" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
        <circle cx="20" cy="24" r="4" fill="#3B82F6"/>
        <text x="32" y="28" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="11" fill="#FFFFFF">Holding Vanguarda // Ecossistema</text>
        <text x="32" y="48" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="800" font-size="13" fill="#3B82F6">R$ 1.200.000,00</text>
        <text x="215" y="48" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="600" font-size="10" fill="rgba(255,255,255,0.4)">Em Análise</text>
      </g>

      <!-- Card 4 na esteira -->
      <g transform="translate(16, 316)">
        <rect width="294" height="70" rx="10" fill="rgba(16,185,129,0.05)" stroke="rgba(16,185,129,0.2)" stroke-width="1"/>
        <circle cx="20" cy="24" r="4" fill="#10B981"/>
        <text x="32" y="28" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="11" fill="#FFFFFF">Operação Atlas // Infraestrutura</text>
        <text x="32" y="48" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="800" font-size="13" fill="#10B981">R$ 850.000,00</text>
        <text x="205" y="48" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="10" fill="#10B981">Assinatura</text>
      </g>
    </g>
  </g>

  <!-- Barra Editorial Sutil na Base (100% em Português) -->
  <g transform="translate(54, 820)">
    <rect width="972" height="190" rx="20" fill="rgba(7, 7, 10, 0.88)" stroke="rgba(255,255,255,0.14)" stroke-width="1" />
    <text x="44" y="62" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="800" font-size="36" fill="#FFFFFF" letter-spacing="-0.5">A PLATAFORMA BLACK LINK.</text>
    <text x="44" y="104" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="500" font-size="18" fill="rgba(255,255,255,0.85)">Telemetria de receita em tempo real e esteira comercial inteligente.</text>
    <text x="44" y="132" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="500" font-size="18" fill="rgba(255,255,255,0.55)">Software proprietário desenvolvido para empresas que operam em alto volume.</text>
    <text x="44" y="166" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-weight="700" font-size="10" fill="rgba(255,255,255,0.4)" letter-spacing="2">ENGENHARIA DE SOFTWARE // blklnk.com</text>
  </g>
</svg>`;

  await sharp(Buffer.from(svg))
    .jpeg({ quality: 98 })
    .toFile(path.join(OUTPUT_DIR, "museum-02-clean.jpg"));
  console.log("museum-02-clean.jpg criado!");
}

buildCleanCRM().catch(console.error);
