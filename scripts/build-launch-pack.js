const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { execSync } = require('child_process');

const OUTPUT_DIR = path.join(__dirname, '../public/launch-pack');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const POSTS = [
  {
    num: 1,
    id: "post-bl-01",
    pos: "Grade: Superior Esquerda",
    goat: "Bureau Borsche // Brutalismo Noir",
    theme: "Engenharia da Ausência",
    tag: "01 // SOBERANIA",
    headline: "ENGENHARIA DA AUSÊNCIA",
    bodyText: "Criamos a infraestrutura que sua autoridade merece. Assuma o comando sem ruídos.",
    bgImage: "blacklink-art-gradient.jpg",
    caption: `A maioria das operações morre no atrito invisível da própria equipe.

Na Black Link, construímos sistemas comerciais e inteligência sob medida para que os fundadores liderem sem operar o operacional.

Descubra a Engenharia da Ausência em blklnk.com

#BlackLink #EngenhariaDaAusencia #VendasB2B #HighTicket #Soberania`,
    linkedin: `Existe uma diferença brutal entre ter uma empresa e ser prisioneiro da própria operação.

A verdadeira soberania corporativa começa quando a esteira de vendas, os processos e a telemetria funcionam com precisão matemática, sem depender da presença diária do CEO.

Na Black Link (blklnk.com), desenvolvemos a Engenharia da Ausência para holdings e líderes de alto valor.`
  },
  {
    num: 2,
    id: "post-bl-02",
    pos: "Grade: Superior Centro",
    goat: "COLLINS // Arquitetura Cinética",
    theme: "Telemetria de Receita",
    tag: "02 // VELOCIDADE",
    headline: "TELEMETRIA DE RECEITA",
    bodyText: "Dados frios do pipeline em tempo real para decisões sem achismos.",
    bgImage: "blacklink-3d-keycap.jpg",
    caption: `Planilhas manuais não escalam holdings de 8 dígitos.

O Black Link CRM OS centraliza cada interação, pontua o momento exato de fechamento e automatiza o follow-up executivo.

Saiba mais em blklnk.com

#TelemetriaDeReceita #BlackLink #CRMOS #EnterpriseB2B`,
    linkedin: `Como você sabe com 100% de certeza quais negócios vão fechar esta semana?

Se sua resposta envolve perguntar para a equipe de vendas ou abrir uma planilha desatualizada, sua operação está no escuro.

Telemetria de receita em tempo real é o padrão da Black Link (blklnk.com).`
  },
  {
    num: 3,
    id: "post-bl-03",
    pos: "Grade: Superior Direita",
    goat: "Base Design // Swiss Porcelain Luxury",
    theme: "Automação Inteligente",
    tag: "03 // EFICIÊNCIA",
    headline: "AUTOMAÇÃO INTELIGENTE",
    bodyText: "Agentes autônomos que qualificam e avançam leads 24 horas por dia.",
    bgImage: "blacklink-art-pins.jpg",
    caption: `Trabalho braçal e atraso no primeiro contato custam contratos milionários.

Implementamos pipelines automatizados com IA que conduzem o tomador de decisão da dúvida ao agendamento direto com o sócio.

Explore em blklnk.com

#AutomacaoInteligente #BlackLink #IAOperacional #HighTicket`,
    linkedin: `Tempo de resposta é o maior preditor de conversão em vendas consultivas B2B.

Enquanto concorrentes levam horas para responder, a infraestrutura da Black Link engaja, analisa o perfil do lead e agenda reuniões em minutos.`
  },
  {
    num: 4,
    id: "post-bl-04",
    pos: "Grade: Meio Esquerda",
    goat: "Vogue Italia // Editorial C-Level Alta Moda",
    theme: "Branding Soberano",
    tag: "04 // AUTORIDADE",
    headline: "BRANDING SOBERANO",
    bodyText: "Alta moda e rigor suíço para empresas que cobram alto valor.",
    bgImage: "blacklink-art-portrait.jpg",
    caption: `Empresas comuns brigam por preço. Marcas soberanas ditam as regras do mercado.

A estética minimalista e monumental da Black Link posiciona sua holding como referência inquestionável no primeiro contato.

Conheça nosso ecossistema em blklnk.com

#BrandingSoberano #AltaModa #BlackLink #LuxoSuico`,
    linkedin: `Design não é apenas cosmética. É a primeira linha de defesa da sua precificação.

Quando seu posicionamento visual respira autoridade internacional, você nunca mais precisa justificar seu ticket em reuniões de negócios.`
  },
  {
    num: 5,
    id: "post-bl-05",
    pos: "Grade: Centro Absoluto",
    goat: "COLLINS & Borsche // Centro de Comando",
    theme: "Controle Absoluto",
    tag: "05 // COMANDO",
    headline: "CONTROLE ABSOLUTO",
    bodyText: "Visão 360° de cada oportunidade comercial em uma interface pura.",
    bgImage: "blacklink-art-cursor-light.jpg",
    caption: `O centro de comando da sua expansão comercial.

Sem interfaces poluídas de softwares legados dos anos 2000. O Black Link CRM OS foi esculpido para decisões de segundos.

Conheça em blklnk.com

#ControleAbsoluto #BlackLinkOS #Enterprise #VendasB2B`,
    linkedin: `Quantas abas abertas seu time comercial precisa para registrar uma ligação?

Complexidade é o inimigo número 1 da produtividade. Criamos um sistema operacional comercial que une minimalismo visual e máxima tração de negócios.`
  },
  {
    num: 6,
    id: "post-bl-06",
    pos: "Grade: Meio Direita",
    goat: "Vogue Italia // Editorial Escultural Futurista",
    theme: "Disrupção Operacional",
    tag: "06 // DISRUPÇÃO",
    headline: "DISRUPÇÃO OPERACIONAL",
    bodyText: "Substitua atritos e processos manuais por inteligência aplicada.",
    bgImage: "blacklink-art-glass-model.jpg",
    caption: `O mercado mudou. Vendas consultivas modernas exigem inteligência preditiva e esteira de automações conectadas.

Conheça a arquitetura proprietária da Black Link em blklnk.com

#DisrupcaoOperacional #BlackLink #InteligenciaArtificial`,
    linkedin: `Se sua empresa ainda depende de rotinas repetitivas que poderiam ser automatizadas, sua margem está sendo consumida por ineficiência.

Engenharia de automações é investimento em escala pura.`
  },
  {
    num: 7,
    id: "post-bl-07",
    pos: "Grade: Inferior Esquerda",
    goat: "Pentagram // Macro Arquitetura Óptica de Vidro",
    theme: "Blindagem Comercial",
    tag: "07 // BLINDAGEM",
    headline: "BLINDAGEM COMERCIAL",
    bodyText: "Zero vazamento de oportunidades no pipeline de alta demanda.",
    bgImage: "blacklink-art-macro-glass.jpg",
    caption: `Cada lead não respondido é capital deixado na mesa.

A esteira da Black Link monitora o tempo de resposta e reativa conversas adormecidas sem intervenção manual.

Conheça o CRM OS em blklnk.com

#BlindagemComercial #BlackLink #EnterpriseB2B`,
    linkedin: `Vazamento de pipeline é o custo silencioso mais caro de qualquer organização comercial.

Blindamos sua esteira de aquisição com gatilhos automáticos de retenção e telemetria de negócios.`
  },
  {
    num: 8,
    id: "post-bl-08",
    pos: "Grade: Inferior Centro",
    goat: "Accept & Proceed // Monólito de Dados Obsidiana",
    theme: "Protocolo de Expansão",
    tag: "08 // ESCALA",
    headline: "PROTOCOLO DE EXPANSÃO",
    bodyText: "O método validado de tração para empresas e holdings B2B.",
    bgImage: "blacklink-art-obsidian-dark.jpg",
    caption: `Não acreditamos em fórmulas mágicas de internet. Acreditamos em engenharia de processos, esteira técnica e autoridade executiva.

Explore em blklnk.com/protocolo

#ProtocoloDeExpansao #BlackLink #EngenhariaDeVendas`,
    linkedin: `Crescimento sustentável não nasce do improviso. Nasce de um protocolo comercial rigoroso e repetível.

É exatamente essa engenharia que entregamos na Black Link.`
  },
  {
    num: 9,
    id: "post-bl-09",
    pos: "Grade: Inferior Direita",
    goat: "Pentagram // Metal Líquido Institucional",
    theme: "Soberania Digital",
    tag: "09 // LIDERANÇA",
    headline: "SOBERANIA DIGITAL",
    bodyText: "A infraestrutura definitiva para liderar seu segmento com elegância.",
    bgImage: "blacklink-art-fluid-metal.jpg",
    caption: `A Black Link foi concebida para liderar o futuro da inteligência de negócios.

Assuma o comando da sua presença e do seu faturamento com quem entende de tecnologia de ponta.

→ Inicie seu projeto ou simule sua arquitetura em blklnk.com

#SoberaniaDigital #BlackLink #HighTicket #LiderancaB2B`,
    linkedin: `Liderança de mercado não se pede. Conquista-se através de autoridade visual implacável e sistemas de entrega perfeitos.

Bem-vindo à Black Link (blklnk.com).`
  }
];

async function run() {
  console.log('Generating official Black Link Launch Pack (9 assets)...');

  // 1. Generate text copies summary file
  let allCopiesText = `BLACK LINK // KIT OFICIAL DE LANÇAMENTO GLOBAL (9 POSTS)\n`;
  allCopiesText += `Domínio Oficial: blklnk.com\n`;
  allCopiesText += `Padrão de Design: REA GOATs (Bureau Borsche, COLLINS, Base Design, Pentagram, Accept & Proceed, Vogue Italia)\n`;
  allCopiesText += `=========================================================================\n\n`;

  for (const post of POSTS) {
    allCopiesText += `-------------------------------------------------------------------------\n`;
    allCopiesText += `POST #${String(post.num).padStart(2, '0')} — ${post.headline} (${post.pos})\n`;
    allCopiesText += `DIREÇÃO DE ARTE: ${post.goat}\n`;
    allCopiesText += `TAG: ${post.tag}\n`;
    allCopiesText += `SUBTÍTULO: ${post.bodyText}\n\n`;
    allCopiesText += `[📸 LEGENDA INSTAGRAM]:\n${post.caption}\n\n`;
    allCopiesText += `[💼 POST LINKEDIN]:\n${post.linkedin}\n\n`;
  }

  fs.writeFileSync(path.join(OUTPUT_DIR, 'COPIES-E-LEGENDAS.txt'), allCopiesText, 'utf8');

  // 2. Generate SVGs and PNGs
  for (const post of POSTS) {
    const numStr = String(post.num).padStart(2, '0');
    const bgFilePath = path.join(__dirname, '../public/brand', post.bgImage);

    const xmlEscape = (str) => String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const tagEscaped = xmlEscape(post.tag);
    const headlineEscaped = xmlEscape(post.headline);
    const bodyTextEscaped = xmlEscape(post.bodyText);
    const goatEscaped = xmlEscape(post.goat.toUpperCase());

    // SVG Overlay without embedded image (clean vector overlay)
    const svgOverlay = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1080" height="1080" viewBox="0 0 1080 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .headline {
        font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Segoe UI", Arial, sans-serif;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: -1px;
      }
      .body-text {
        font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Segoe UI", Arial, sans-serif;
        font-weight: 500;
      }
      .tag-text {
        font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Segoe UI", Arial, sans-serif;
        font-weight: 700;
        letter-spacing: 3px;
        text-transform: uppercase;
      }
    </style>
    <linearGradient id="scrim-${post.num}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.25" />
      <stop offset="45%" stop-color="#000000" stop-opacity="0.15" />
      <stop offset="70%" stop-color="#000000" stop-opacity="0.75" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.94" />
    </linearGradient>
  </defs>

  <!-- Vinheta Cinematográfica Escura -->
  <rect width="1080" height="1080" fill="url(#scrim-${post.num})" />

  <!-- Moldura Suíça de Precisão -->
  <rect x="36" y="36" width="1008" height="1008" stroke="rgba(255,255,255,0.22)" stroke-width="1.5" rx="20" fill="none" />

  <!-- Mira de Precisão Suíça (Crosshairs) -->
  <line x1="36" y1="56" x2="56" y2="56" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" />
  <line x1="56" y1="36" x2="56" y2="56" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" />
  <line x1="1024" y1="56" x2="1044" y2="56" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" />
  <line x1="1024" y1="36" x2="1024" y2="56" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" />

  <!-- Tag Superior Esquerda -->
  <text x="72" y="96" class="tag-text" font-size="15" fill="rgba(255,255,255,0.85)">${tagEscaped}</text>

  <!-- Assinatura Superior Direita -->
  <text x="1008" y="96" text-anchor="end" class="tag-text" font-size="13" fill="rgba(255,255,255,0.75)">BLACK LINK // blklnk.com</text>

  <!-- Bloco Monumental Inferior -->
  <text x="72" y="830" class="headline" font-size="58" fill="#FFFFFF">${headlineEscaped}</text>
  <text x="72" y="885" class="body-text" font-size="22" fill="#E4E4E7">${bodyTextEscaped}</text>

  <!-- Linha Divisória de Telemetria -->
  <line x1="72" y1="970" x2="1008" y2="970" stroke="rgba(255,255,255,0.12)" stroke-width="1" />

  <!-- Rodapé Técnico de Curadoria -->
  <text x="72" y="1010" class="tag-text" font-size="12" fill="rgba(255,255,255,0.55)">POST #${numStr} • REA GOAT: ${goatEscaped} • blklnk.com</text>
  <text x="1008" y="1010" text-anchor="end" class="tag-text" font-size="12" fill="rgba(255,255,255,0.55)">1080 x 1080 HIGH RES</text>
</svg>`;

    // Complete standalone SVG that references the background image
    const standaloneSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1080" height="1080" viewBox="0 0 1080 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .headline {
        font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Segoe UI", Arial, sans-serif;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: -1px;
      }
      .body-text {
        font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Segoe UI", Arial, sans-serif;
        font-weight: 500;
      }
      .tag-text {
        font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Segoe UI", Arial, sans-serif;
        font-weight: 700;
        letter-spacing: 3px;
        text-transform: uppercase;
      }
    </style>
    <linearGradient id="scrim-${post.num}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.25" />
      <stop offset="45%" stop-color="#000000" stop-opacity="0.15" />
      <stop offset="70%" stop-color="#000000" stop-opacity="0.75" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.94" />
    </linearGradient>
  </defs>

  <!-- Imagem de Fundo de Alta Resolução -->
  <image href="/brand/${post.bgImage}" width="1080" height="1080" preserveAspectRatio="xMidYMid slice" />

  <!-- Vinheta Cinematográfica Escura -->
  <rect width="1080" height="1080" fill="url(#scrim-${post.num})" />

  <!-- Moldura Suíça de Precisão -->
  <rect x="36" y="36" width="1008" height="1008" stroke="rgba(255,255,255,0.22)" stroke-width="1.5" rx="20" fill="none" />

  <!-- Mira de Precisão Suíça (Crosshairs) -->
  <line x1="36" y1="56" x2="56" y2="56" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" />
  <line x1="56" y1="36" x2="56" y2="56" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" />
  <line x1="1024" y1="56" x2="1044" y2="56" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" />
  <line x1="1024" y1="36" x2="1024" y2="56" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" />

  <!-- Tag Superior Esquerda -->
  <text x="72" y="96" class="tag-text" font-size="15" fill="rgba(255,255,255,0.85)">${tagEscaped}</text>

  <!-- Assinatura Superior Direita -->
  <text x="1008" y="96" text-anchor="end" class="tag-text" font-size="13" fill="rgba(255,255,255,0.75)">BLACK LINK // blklnk.com</text>

  <!-- Bloco Monumental Inferior -->
  <text x="72" y="830" class="headline" font-size="58" fill="#FFFFFF">${headlineEscaped}</text>
  <text x="72" y="885" class="body-text" font-size="22" fill="#E4E4E7">${bodyTextEscaped}</text>

  <!-- Linha Divisória de Telemetria -->
  <line x1="72" y1="970" x2="1008" y2="970" stroke="rgba(255,255,255,0.12)" stroke-width="1" />

  <!-- Rodapé Técnico de Curadoria -->
  <text x="72" y="1010" class="tag-text" font-size="12" fill="rgba(255,255,255,0.55)">POST #${numStr} • REA GOAT: ${goatEscaped} • blklnk.com</text>
  <text x="1008" y="1010" text-anchor="end" class="tag-text" font-size="12" fill="rgba(255,255,255,0.55)">1080 x 1080 HIGH RES</text>
</svg>`;

    fs.writeFileSync(path.join(OUTPUT_DIR, `post-${numStr}.svg`), standaloneSvg, 'utf8');

    // Render 1080x1080 PNG using sharp
    await sharp(bgFilePath)
      .resize(1080, 1080, { fit: 'cover' })
      .composite([{ input: Buffer.from(svgOverlay) }])
      .png({ quality: 95 })
      .toFile(path.join(OUTPUT_DIR, `post-${numStr}.png`));

    console.log(`Rendered post-${numStr}.png & post-${numStr}.svg`);
  }

  // 3. Generate Static Standalone index.html
  const cardsHtml = POSTS.map(p => {
    const numStr = String(p.num).padStart(2, '0');
    // Sanitize captions for HTML and JS
    const escapedCaption = p.caption
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const escapedLinkedin = p.linkedin
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    return `
      <div class="card" id="card-${numStr}">
        <div class="preview-box">
          <img src="post-${numStr}.png" alt="${p.headline}" loading="lazy" />
          <span class="preview-badge">${p.tag}</span>
        </div>
        <div class="meta-box">
          <div class="post-header">
            <div>
              <span class="post-num">POST #${numStr}</span>
              <span class="post-pos">• ${p.pos}</span>
            </div>
            <span class="goat-tag">${p.goat}</span>
          </div>

          <h3 class="post-title">${p.headline}</h3>
          <p class="post-body">${p.bodyText}</p>

          <!-- Legenda Instagram -->
          <div class="copy-block">
            <div class="copy-label">
              <span>📸 Legenda Instagram</span>
              <button class="btn btn-sm" onclick="copyCardText(this, 'caption-${numStr}')">Copiar Legenda</button>
            </div>
            <pre class="copy-content" id="caption-${numStr}">${escapedCaption}</pre>
          </div>

          <!-- Artigo LinkedIn -->
          <div class="copy-block">
            <div class="copy-label">
              <span>💼 Artigo / Post LinkedIn</span>
              <button class="btn btn-sm" onclick="copyCardText(this, 'linkedin-${numStr}')">Copiar LinkedIn</button>
            </div>
            <pre class="copy-content" id="linkedin-${numStr}">${escapedLinkedin}</pre>
          </div>

          <div class="actions-row">
            <a href="post-${numStr}.png" download="blacklink-post-${numStr}.png" class="btn btn-primary">
              ↓ Baixar Imagem PNG (1080x1080)
            </a>
            <a href="post-${numStr}.svg" download="blacklink-post-${numStr}.svg" class="btn btn-secondary">
              SVG
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('\n');

  const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Black Link — Kit Oficial de Lançamento Global (9 Lâminas)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #09090B;
      color: #FFFFFF;
      font-family: "Plus Jakarta Sans", sans-serif;
      padding: 40px 24px;
      line-height: 1.5;
    }
    .container { max-width: 1440px; margin: 0 auto; }
    header {
      margin-bottom: 48px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      padding-bottom: 32px;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: flex-end;
      gap: 24px;
    }
    .brand-title {
      font-family: "Space Grotesk", sans-serif;
      font-size: 2.4rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      text-transform: uppercase;
    }
    .badge {
      display: inline-block;
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.4);
      color: #FBBF24;
      font-family: "Space Grotesk", monospace;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 5px 14px;
      border-radius: 999px;
      margin-top: 10px;
    }
    .instructions {
      color: #A1A1AA;
      font-size: 1rem;
      max-width: 780px;
      margin-top: 12px;
    }
    .header-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    .grid-3x3 {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
      gap: 36px;
    }
    @media (max-width: 640px) {
      .grid-3x3 { grid-template-columns: 1fr; }
    }
    .card {
      background: #111114;
      border: 1px solid rgba(255,255,255,0.09);
      border-radius: 20px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
    }
    .card:hover {
      border-color: rgba(255,255,255,0.3);
      transform: translateY(-4px);
      box-shadow: 0 16px 40px rgba(0,0,0,0.6);
    }
    .preview-box {
      width: 100%;
      aspect-ratio: 1 / 1;
      background: #000;
      position: relative;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .preview-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .preview-badge {
      position: absolute;
      top: 14px;
      left: 14px;
      background: rgba(0,0,0,0.75);
      border: 1px solid rgba(255,255,255,0.2);
      backdrop-filter: blur(8px);
      color: #FFF;
      font-family: "Space Grotesk", monospace;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 6px;
      letter-spacing: 1px;
    }
    .meta-box {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      flex: 1;
    }
    .post-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      padding-bottom: 12px;
      gap: 8px;
    }
    .post-num {
      font-family: "Space Grotesk", monospace;
      font-size: 0.95rem;
      color: #FBBF24;
      font-weight: 800;
    }
    .post-pos {
      font-size: 0.75rem;
      color: #71717A;
      font-family: "Space Grotesk", monospace;
    }
    .goat-tag {
      font-family: "Space Grotesk", monospace;
      font-size: 0.68rem;
      color: #A1A1AA;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      padding: 3px 8px;
      border-radius: 6px;
      text-align: right;
    }
    .post-title {
      font-family: "Space Grotesk", sans-serif;
      font-size: 1.4rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      text-transform: uppercase;
      color: #FFFFFF;
    }
    .post-body {
      color: #D4D4D8;
      font-size: 0.92rem;
      line-height: 1.45;
    }
    .copy-block {
      background: #09090B;
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 12px;
      padding: 14px;
    }
    .copy-label {
      font-family: "Space Grotesk", monospace;
      font-size: 0.72rem;
      font-weight: 700;
      color: #A1A1AA;
      text-transform: uppercase;
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .copy-content {
      font-size: 0.82rem;
      color: #E4E4E7;
      white-space: pre-wrap;
      word-break: break-word;
      max-height: 120px;
      overflow-y: auto;
      font-family: "Plus Jakarta Sans", sans-serif;
      background: rgba(255,255,255,0.02);
      padding: 8px;
      border-radius: 6px;
      border: 1px solid rgba(255,255,255,0.03);
    }
    .actions-row {
      margin-top: auto;
      display: flex;
      gap: 10px;
      padding-top: 8px;
    }
    .btn {
      border: none;
      border-radius: 10px;
      padding: 12px 18px;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      text-decoration: none;
      transition: all 0.15s ease;
    }
    .btn-primary {
      background: #FFFFFF;
      color: #09090B;
      flex: 1;
    }
    .btn-primary:hover { background: #E4E4E7; transform: translateY(-1px); }
    .btn-secondary {
      background: rgba(255,255,255,0.08);
      color: #FFFFFF;
      border: 1px solid rgba(255,255,255,0.12);
    }
    .btn-secondary:hover { background: rgba(255,255,255,0.15); }
    .btn-accent {
      background: #FBBF24;
      color: #000;
    }
    .btn-accent:hover { background: #F59E0B; }
    .btn-sm {
      padding: 4px 10px;
      font-size: 0.72rem;
      background: rgba(255,255,255,0.12);
      color: #FFFFFF;
    }
    .btn-sm:hover { background: rgba(255,255,255,0.22); }
    .toast {
      position: fixed;
      bottom: 28px;
      right: 28px;
      background: #10B981;
      color: #000000;
      font-weight: 800;
      padding: 14px 24px;
      border-radius: 12px;
      font-size: 0.92rem;
      display: none;
      box-shadow: 0 10px 30px rgba(0,0,0,0.6);
      z-index: 9999;
      letter-spacing: -0.01em;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <h1 class="brand-title">Black Link — Lançamento Global</h1>
        <div class="badge">9 LÂMINAS DE ALTA DEFINIÇÃO (1080x1080) & COPIES MONUMENTAIS</div>
        <p class="instructions">
          Acervo oficial de lançamento da Black Link (<strong>blklnk.com</strong>).
          Zero inteligência generativa imprevisível. Zero tempo de espera. Cada imagem está renderizada em 1080x1080 nativo pronta para postar no Instagram e LinkedIn com 1 clique de cópia de texto.
        </p>
      </div>
      <div class="header-actions">
        <a href="COPIES-E-LEGENDAS.txt" download="BLACKLINK-COPIES-E-LEGENDAS.txt" class="btn btn-secondary">
          📄 Baixar Todas as Copys (.txt)
        </a>
        <a href="blacklink-launch-pack-9posts.zip" download="blacklink-launch-pack-9posts.zip" class="btn btn-accent">
          📦 Baixar Pacote Completo (.ZIP)
        </a>
      </div>
    </header>

    <div class="grid-3x3">
      ${cardsHtml}
    </div>
  </div>

  <div id="toast" class="toast">✓ Texto copiado para a área de transferência!</div>

  <script>
    function copyCardText(btn, elementId) {
      const el = document.getElementById(elementId);
      if (!el) return;
      const text = el.innerText || el.textContent;
      navigator.clipboard.writeText(text).then(() => {
        const originalText = btn.innerText;
        btn.innerText = "✓ Copiado!";
        btn.style.background = "#10B981";
        btn.style.color = "#000";
        setTimeout(() => {
          btn.innerText = originalText;
          btn.style.background = "";
          btn.style.color = "";
        }, 1800);

        const toast = document.getElementById("toast");
        toast.style.display = "block";
        setTimeout(() => { toast.style.display = "none"; }, 2500);
      });
    }
  </script>
</body>
</html>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), htmlContent, 'utf8');
  console.log('Generated index.html successfully!');

  // 4. Create ZIP package containing all 9 PNGs, 9 SVGs, and text file
  try {
    const zipCommand = `cd "${OUTPUT_DIR}" && zip -r -9 blacklink-launch-pack-9posts.zip *.png *.svg COPIES-E-LEGENDAS.txt`;
    execSync(zipCommand, { stdio: 'inherit' });
    console.log('Created blacklink-launch-pack-9posts.zip successfully!');
  } catch (err) {
    console.error('Error creating zip:', err.message);
  }

  console.log('All 9 launch assets generated successfully!');
}

run().catch(err => {
  console.error('Fatal error in build-launch-pack:', err);
  process.exit(1);
});
