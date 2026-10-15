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
    theme: "O Choque de Realidade do Mercado Digital",
    headline: "SEU PRODUTO PARECE AMADOR.",
    sub1: "O mercado não compra o que é bom. Compra o que parece inatingível.",
    sub2: "Nós construímos a tecnologia e o ecossistema que separam você do resto.",
    tagPill: "ARQUITETURA DE PRODUTOS DIGITAIS // blklnk.com",
    bgImage: "glass-01-chain.jpg",
    caption: `Você pode ter o melhor método do mercado. Pode ter a melhor entrega.

Mas se a sua embalagem visual, sua plataforma e sua esteira de vendas parecem uma página genérica feita em 2021, o cliente de alto poder aquisitivo nem clica.

Marcas soberanas não brigam por atenção com dancinhas ou promessas baratas. Elas constroem uma presença que transmite autoridade inquestionável no primeiro segundo de contato.

Na Black Link, desenhamos e desenvolvemos produtos digitais, plataformas e ecossistemas sob medida para quem cansou de parecer amador e quer dominar o mercado high-ticket.

Se você está pronto para transformar sua operação em uma instituição: o link está na bio (blklnk.com).

#BlackLink #ProdutosDigitais #HighTicket #DesignDeAutoridade #BrandingSoberano`,
    linkedin: `Existe uma verdade desconfortável no mercado digital: o cliente não compra o produto mais completo; ele compra a percepção mais sofisticada.

Enquanto a maioria das empresas foca apenas em empurrar conteúdo em plataformas genéricas, os líderes do mercado investem em ecossistemas proprietários, design de alto impacto e infraestrutura sob medida.

Na Black Link (blklnk.com), criamos a tecnologia e a arquitetura visual para fundadores e empresas que lideram seus segmentos com autoridade inquestionável.`
  },
  {
    num: 2,
    id: "post-bl-02",
    pos: "Grade: Superior Centro",
    theme: "A Lei da Precificação High-Ticket",
    headline: "PRECIFICAÇÃO É PERCEPÇÃO.",
    sub1: "Quem tem autoridade visual e ecossistema próprio dita as regras.",
    sub2: "Quem usa ferramentas genéricas é forçado a dar desconto para vender.",
    tagPill: "ENGENHARIA HIGH-TICKET // blklnk.com",
    bgImage: "glass-02-pillar.jpg",
    caption: `Por que uma garrafa de água custa R$ 2 no semáforo e R$ 45 no lounge do hotel 5 estrelas?

A água é a mesma. O recipiente, a atmosfera e o status da entrega mudaram tudo.

No mercado digital, 90% dos infoprodutores e consultores sofrem pedindo desconto e lidando com curiosos porque sua presença não passa poder.

Quando seu produto digital é sustentado por uma infraestrutura cinematográfica, com UX impecável e tecnologia proprietária, a objeção de preço desaparece antes da reunião começar.

Pare de vender commodities. Construa seu ativo de autoridade com a Black Link.

→ Conheça nossos ecossistemas em blklnk.com

#Precificacao #HighTicket #BlackLink #PosicionamentoDeLuxo #VendasB2B`,
    linkedin: `Design não é cosmética. É a primeira linha de defesa da sua margem de lucro.

Quando seu posicionamento visual respira autoridade internacional, você nunca mais precisa justificar seu ticket em reuniões de negócios.

Na Black Link, desenvolvemos ecossistemas comerciais e plataformas digitais onde o preço alto é a consequência natural da entrega extraordinária.`
  },
  {
    num: 3,
    id: "post-bl-03",
    pos: "Grade: Superior Direita",
    theme: "A Máquina de Vendas Automatizada",
    headline: "A MÁQUINA DE 7 DÍGITOS.",
    sub1: "Sua operação de vendas precisa de telemetria, não de sorte.",
    sub2: "Agentes de IA e pipelines proprietários que fecham contratos 24h por dia.",
    tagPill: "TELEMETRIA COMERCIAL & IA // blklnk.com",
    bgImage: "glass-03-sphere.jpg",
    caption: `Depender do humor de vendedores ou de mensagens manuais no WhatsApp para bater meta não é negócio. É loteria.

Criamos sistemas de conversão e esteiras de dados que identificam o comportamento do lead em tempo real, ativam gatilhos de fechamento e nutrem tomadores de decisão 24 horas por dia.

Menos reuniões inúteis. Mais contratos assinados.

Construímos o CRM OS e a esteira de automações que a sua escala exige.

Acesse blklnk.com e simule sua nova estrutura.

#TelemetriaDeReceita #AutomacaoDeVendas #CRMproprietario #BlackLink #EscalaB2B`,
    linkedin: `Como você sabe com 100% de precisão quais negócios vão fechar esta semana?

Se sua resposta envolve abrir uma planilha desatualizada ou perguntar no grupo de mensagens, sua operação está no escuro.

Telemetria de receita em tempo real é o padrão que implementamos na Black Link (blklnk.com).`
  },
  {
    num: 4,
    id: "post-bl-04",
    pos: "Grade: Meio Esquerda",
    theme: "A Morte das Áreas de Membros Genéricas",
    headline: "ECOSSISTEMAS VENCEM CURSOS.",
    sub1: "A era do infoproduto gravado em plataforma barata morreu.",
    sub2: "Grandes marcas retêm clientes com software, comunidade e status.",
    tagPill: "ECOSSISTEMAS PROPRIETÁRIOS // blklnk.com",
    bgImage: "glass-04-slab.jpg",
    caption: `Ninguém mais quer pagar R$ 2.000 para assistir a 40 horas de vídeo gravado em plataforma genérica.

Os maiores players do mundo já entenderam: a retenção e o LTV moram no ecossistema proprietário. Plataformas customizadas, design imersivo, ranking em tempo real e experiência de software.

É isso que desenvolvemos para nossos parceiros e clientes: produtos digitais que geram orgulho de pertencer e recompra automática.

Se você fatura mais de R$ 50k/mês e quer criar seu ecossistema proprietário, acesse o link na bio (blklnk.com).

#ProdutosDigitais #SoftwareProprietario #LTV #Retencao #BlackLink`,
    linkedin: `A comoditização dos infoprodutos tradicionais é um fato consumado.

Para manter clientes engajados e construir um negócio que vale múltiplos dígitos, você precisa de um ecossistema: plataforma própria, experiência de usuário impecável e inteligência aplicada.

Na Black Link, desenhamos e programamos o software que transforma seu conhecimento em um ativo corporativo real.`
  },
  {
    num: 5,
    id: "post-bl-05",
    pos: "Grade: Centro Absoluto",
    theme: "Engenharia da Ausência: O Fundador Livre",
    headline: "ENGENHARIA DA AUSÊNCIA.",
    sub1: "Se sua empresa para quando você viaja, você tem um emprego.",
    sub2: "Codificamos seus processos para que o negócio escale sem a sua presença.",
    tagPill: "SOBERANIA OPERACIONAL // blklnk.com",
    bgImage: "glass-05-helix.jpg",
    caption: `Se sua operação para quando você viaja, você não tem uma empresa. Você tem um emprego de alta pressão que você mesmo criou.

A Engenharia da Ausência é o princípio fundamental da Black Link:

1. Processos comerciais transformados em código.
2. Automações com IA que qualificam e filtram curiosos.
3. Dashboard executivo em tempo real na palma da mão.

Sua autoridade merece uma estrutura que trabalhe por você.

Conheça o ecossistema Black Link em blklnk.com.

#EngenhariaDaAusencia #Soberania #GestaoDeElite #BlackLink #AutomacaoComercial`,
    linkedin: `Existe uma diferença brutal entre ser dono de uma empresa e ser prisioneiro da própria operação.

A verdadeira soberania corporativa começa quando a esteira de vendas, os processos e a telemetria funcionam com precisão matemática, sem depender da presença diária do CEO.

Na Black Link (blklnk.com), desenvolvemos a Engenharia da Ausência.`
  },
  {
    num: 6,
    id: "post-bl-06",
    pos: "Grade: Meio Direita",
    theme: "Design como Filtro de Riqueza",
    headline: "ESTÉTICA É FILTRO DE CLIENTE.",
    sub1: "Comunicação fraca atrai pedinte de desconto e suporte infinito.",
    sub2: "Design monumental e vidro atraem quem paga à vista sem questionar.",
    tagPill: "POSICIONAMENTO MONUMENTAL // blklnk.com",
    bgImage: "glass-06-cube.jpg",
    caption: `Quem reclama do seu preço não é o cliente ideal. É o cliente atraído pela sua comunicação fraca.

O público que compra soluções de R$ 10k, R$ 30k ou R$ 100k tem o olhar treinado. Eles compram rigor, sofisticação e segurança estética.

Quando você investe em um branding e numa experiência digital de alta densidade visual (Glassmorphism, Minimalismo e Tipografia Editorial), você filtra os curiosos e atrai quem já tem o orçamento aprovado.

Eleve o padrão do seu negócio.

Fale com nosso time em blklnk.com.

#DesignDeAutoridade #BrandingDeLuxo #BlackLink #ClientesHighTicket #Posicionamento`,
    linkedin: `A qualidade do seu cliente é o reflexo direto da sofisticação da sua embalagem digital.

Marcas genéricas atraem negociações desgastantes. Marcas com rigor estético institucional estabelecem autoridade instantânea antes mesmo da primeira conversa comercial.

Construa sua presença com a Black Link.`
  },
  {
    num: 7,
    id: "post-bl-07",
    pos: "Grade: Inferior Esquerda",
    theme: "Velocidade de Resposta Brutal",
    headline: "VELOCIDADE BRUTAL DE FECHAMENTO.",
    sub1: "Responder em 30 segundos aumenta em 400% a conversão de contratos.",
    sub2: "Nossa IA qualifica o lead e agenda a call antes do concorrente abrir o WhatsApp.",
    tagPill: "AUTOMAÇÃO DE CONVERSÃO // blklnk.com",
    bgImage: "glass-07-torus.jpg",
    caption: `Estudos de conversão mostram: responder um lead nos primeiros 5 minutos aumenta as chances de fechamento em quase 400%.

O problema? Equipes humanas dormem, almoçam, se distraem e demoram horas.

Nossos agentes autônomos integrados ao CRM recebem o lead, cruzam dados de faturamento da empresa dele, qualificam a dor e já liberam o link da agenda do closer em menos de 45 segundos.

Velocidade brutal. Conversão implacável.

Descubra como blindar seu funil em blklnk.com.

#VelocidadeComercial #IAdeVendas #BlackLinkCRM #AltaConversao #GrowthB2B`,
    linkedin: `Tempo de resposta é o maior preditor de conversão em vendas consultivas.

Enquanto seus concorrentes demoram horas para fazer o primeiro contato, a infraestrutura da Black Link engaja, analisa o perfil da oportunidade e agenda reuniões em minutos.`
  },
  {
    num: 8,
    id: "post-bl-08",
    pos: "Grade: Inferior Centro",
    theme: "Infraestrutura Enterprise Inquebrável",
    headline: "INFRAESTRUTURA INTOCÁVEL.",
    sub1: "Sua escala comercial não cabe em ferramentas no-code gratuitas.",
    sub2: "Desenvolvemos tecnologia escalável com segurança de padrão bancário.",
    tagPill: "TECNOLOGIA ENTERPRISE // blklnk.com",
    bgImage: "glass-08-vault.jpg",
    caption: `Lançar um produto digital com ferramentas 'no-code' remendadas com fita crepe digital é a receita perfeita para travar na hora do checkout.

Na Black Link, desenvolvemos tecnologia de padrão bancário: bancos de dados escaláveis, arquitetura serverless ultrarrápida e design nativo em alta performance.

Zero travamentos. Zero perda de vendas no pico de tráfego.

Sua escala não cabe mais em ferramentas gratuitas.

Consulte nossa equipe de engenharia em blklnk.com.

#InfraestruturaDigital #SegurancaBancaria #BlackLinkOS #EscalaGarantida`,
    linkedin: `Crescimento sustentável exige bases sólidas. Se a sua esteira digital falha durante picos de tráfego, você não está construindo uma empresa, está arriscando seu faturamento.

Na Black Link, desenhamos tecnologia com segurança, velocidade e confiabilidade de nível corporativo.`
  },
  {
    num: 9,
    id: "post-bl-09",
    pos: "Grade: Inferior Direita",
    theme: "O Convite para Liderar o Mercado",
    headline: "DOMINE O SEU MERCADO.",
    sub1: "Pare de ser apenas mais um no feed disputando atenção por centavos.",
    sub2: "Construa seu ecossistema digital com quem lidera o futuro.",
    tagPill: "INICIE SEU PROJETO // blklnk.com",
    bgImage: "glass-09-monolith.jpg",
    caption: `O mercado digital não perdoa a mediocridade. Daqui a 12 meses, quem tiver uma presença genérica será engolido pela comoditização.

Quem tiver um produto digital sofisticado, um ecossistema com IA e uma autoridade visual esmagadora vai monopolizar o faturamento.

A Black Link existe para desenhar, programar e escalar o seu ecossistema digital.

As portas estão abertas para novos projetos de alta escala.

→ Acesse blklnk.com ou envie uma mensagem direta para iniciar sua auditoria.

#SoberaniaDigital #LiderancaB2B #BlackLink #MonopolioDeMercado #HighTicket`,
    linkedin: `Liderança de mercado não se pede. Conquista-se através de autoridade visual implacável, produtos digitais superiores e sistemas de entrega impecáveis.

Bem-vindo à Black Link (blklnk.com).`
  }
];

async function run() {
  console.log('Building 100% Extreme Glassmorphism Launch Pack for Black Link...');

  // 1. Generate text copies summary file
  let allCopiesText = `BLACK LINK // KIT OFICIAL DE LANÇAMENTO GLOBAL (9 POSTS)\n`;
  allCopiesText += `Domínio Oficial: blklnk.com\n`;
  allCopiesText += `Estilo Visual: EXTREME FROSTED GLASSMORPHISM & CLASH MONUMENTAL\n`;
  allCopiesText += `Objetivo: Autoridade Inquestionável, Viralidade e Venda de Produtos Digitais High-Ticket\n`;
  allCopiesText += `=========================================================================\n\n`;

  for (const post of POSTS) {
    allCopiesText += `-------------------------------------------------------------------------\n`;
    allCopiesText += `POST #${String(post.num).padStart(2, '0')} — ${post.headline} (${post.pos})\n`;
    allCopiesText += `TEMA: ${post.theme}\n`;
    allCopiesText += `HEADLINE DA ARTE: ${post.headline}\n`;
    allCopiesText += `SUBTÍTULO: ${post.sub1} ${post.sub2}\n\n`;
    allCopiesText += `[📸 LEGENDA INSTAGRAM]:\n${post.caption}\n\n`;
    allCopiesText += `[💼 POST LINKEDIN]:\n${post.linkedin}\n\n`;
  }

  fs.writeFileSync(path.join(OUTPUT_DIR, 'COPIES-E-LEGENDAS.txt'), allCopiesText, 'utf8');

  // 2. Generate SVGs and PNGs
  for (const post of POSTS) {
    const numStr = String(post.num).padStart(2, '0');
    const bgFilePath = path.join(__dirname, '../public/brand', post.bgImage);

    const xmlEscape = (str) => String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const headlineEscaped = xmlEscape(post.headline);
    const sub1Escaped = xmlEscape(post.sub1);
    const sub2Escaped = xmlEscape(post.sub2);
    const tagPillEscaped = xmlEscape(post.tagPill);

    // SVG Overlay with Extreme Glassmorphic Card
    const svgOverlay = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1080" height="1080" viewBox="0 0 1080 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="glow-${post.num}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="28" flood-color="rgba(0,0,0,0.88)" />
    </filter>
    <linearGradient id="card-glass-${post.num}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.14" />
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.03" />
    </linearGradient>
    <linearGradient id="border-glow-${post.num}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.55" />
      <stop offset="50%" stop-color="#FFFFFF" stop-opacity="0.12" />
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.40" />
    </linearGradient>
    <style>
      .brand-pill-text {
        font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
        font-weight: 800;
        letter-spacing: 2.5px;
      }
      .headline-text {
        font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
        font-weight: 900;
        letter-spacing: -0.5px;
        text-transform: uppercase;
      }
      .body-sub-text {
        font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
        font-weight: 500;
      }
      .tag-pill-text {
        font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
        font-weight: 800;
        letter-spacing: 2px;
        text-transform: uppercase;
      }
    </style>
  </defs>

  <!-- Pílulas Superiores em Vidro Puro -->
  <g transform="translate(54, 54)">
    <rect width="170" height="40" rx="20" fill="url(#card-glass-${post.num})" stroke="url(#border-glow-${post.num})" stroke-width="1.2" />
    <text x="85" y="25" text-anchor="middle" class="brand-pill-text" font-size="13" fill="#FFFFFF">BLACK LINK</text>
  </g>
  <g transform="translate(896, 54)">
    <rect width="130" height="40" rx="20" fill="url(#card-glass-${post.num})" stroke="url(#border-glow-${post.num})" stroke-width="1.2" />
    <text x="65" y="25" text-anchor="middle" class="brand-pill-text" font-size="12" fill="rgba(255,255,255,0.85)">blklnk.com</text>
  </g>

  <!-- Card Inferior em Extreme Glassmorphism -->
  <g transform="translate(54, 755)" filter="url(#glow-${post.num})">
    <!-- Camada de Vidro Escuro Acetinado -->
    <rect width="972" height="270" rx="28" fill="rgba(8, 8, 12, 0.72)" />
    <rect width="972" height="270" rx="28" fill="url(#card-glass-${post.num})" />
    <rect width="972" height="270" rx="28" stroke="url(#border-glow-${post.num})" stroke-width="1.5" fill="none" />

    <!-- Título Monumental -->
    <text x="48" y="85" class="headline-text" font-size="46" fill="#FFFFFF">${headlineEscaped}</text>

    <!-- Subtítulo Provocador de Autoridade -->
    <text x="48" y="148" class="body-sub-text" font-size="22" fill="rgba(255,255,255,0.88)">${sub1Escaped}</text>
    <text x="48" y="184" class="body-sub-text" font-size="22" fill="rgba(255,255,255,0.62)">${sub2Escaped}</text>

    <!-- Tag de Contexto Comercial -->
    <g transform="translate(48, 222)">
      <text x="0" y="16" class="tag-pill-text" font-size="12" fill="rgba(255,255,255,0.52)">${tagPillEscaped}</text>
    </g>
  </g>
</svg>`;

    // Standalone SVG
    const standaloneSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1080" height="1080" viewBox="0 0 1080 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="glow-${post.num}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="28" flood-color="rgba(0,0,0,0.88)" />
    </filter>
    <linearGradient id="card-glass-${post.num}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.14" />
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.03" />
    </linearGradient>
    <linearGradient id="border-glow-${post.num}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.55" />
      <stop offset="50%" stop-color="#FFFFFF" stop-opacity="0.12" />
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.40" />
    </linearGradient>
  </defs>

  <!-- Fundo de Vidro 3D Fosco -->
  <image href="/brand/${post.bgImage}" width="1080" height="1080" preserveAspectRatio="xMidYMid slice" />

  <!-- Pílulas Superiores em Vidro Puro -->
  <g transform="translate(54, 54)">
    <rect width="170" height="40" rx="20" fill="url(#card-glass-${post.num})" stroke="url(#border-glow-${post.num})" stroke-width="1.2" />
    <text x="85" y="25" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="800" font-size="13" fill="#FFFFFF" letter-spacing="2.5">BLACK LINK</text>
  </g>
  <g transform="translate(896, 54)">
    <rect width="130" height="40" rx="20" fill="url(#card-glass-${post.num})" stroke="url(#border-glow-${post.num})" stroke-width="1.2" />
    <text x="65" y="25" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="700" font-size="12" fill="rgba(255,255,255,0.85)" letter-spacing="1.5">blklnk.com</text>
  </g>

  <!-- Card Inferior em Extreme Glassmorphism -->
  <g transform="translate(54, 755)" filter="url(#glow-${post.num})">
    <rect width="972" height="270" rx="28" fill="rgba(8, 8, 12, 0.72)" />
    <rect width="972" height="270" rx="28" fill="url(#card-glass-${post.num})" />
    <rect width="972" height="270" rx="28" stroke="url(#border-glow-${post.num})" stroke-width="1.5" fill="none" />

    <text x="48" y="85" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="900" font-size="46" fill="#FFFFFF" letter-spacing="-0.5">${headlineEscaped}</text>
    <text x="48" y="148" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="500" font-size="22" fill="rgba(255,255,255,0.88)">${sub1Escaped}</text>
    <text x="48" y="184" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="500" font-size="22" fill="rgba(255,255,255,0.62)">${sub2Escaped}</text>

    <g transform="translate(48, 222)">
      <text x="0" y="16" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="800" font-size="12" fill="rgba(255,255,255,0.52)" letter-spacing="2">${tagPillEscaped}</text>
    </g>
  </g>
</svg>`;

    fs.writeFileSync(path.join(OUTPUT_DIR, `post-${numStr}.svg`), standaloneSvg, 'utf8');

    // Render 1080x1080 PNG using sharp
    await sharp(bgFilePath)
      .resize(1080, 1080, { fit: 'cover' })
      .composite([{ input: Buffer.from(svgOverlay) }])
      .png({ quality: 95 })
      .toFile(path.join(OUTPUT_DIR, `post-${numStr}.png`));

    console.log(`Rendered post-${numStr}.png & post-${numStr}.svg with Extreme Glassmorphism`);
  }

  // 3. Generate Static Standalone index.html
  const cardsHtml = POSTS.map(p => {
    const numStr = String(p.num).padStart(2, '0');
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
          <span class="preview-badge">POST #${numStr} • ${p.pos}</span>
        </div>
        <div class="meta-box">
          <div class="post-header">
            <div>
              <span class="post-num">POST #${numStr}</span>
              <span class="post-pos">• ${p.pos}</span>
            </div>
            <span class="tag-badge">GLASSMORPHISM EXTREMO</span>
          </div>

          <h3 class="post-title">${p.headline}</h3>
          <p class="post-body">${p.sub1} ${p.sub2}</p>

          <!-- Legenda Instagram -->
          <div class="copy-block">
            <div class="copy-label">
              <span>📸 Legenda Instagram (Viral & Conversão)</span>
              <button class="btn btn-sm" onclick="copyCardText(this, 'caption-${numStr}')">Copiar Legenda</button>
            </div>
            <pre class="copy-content" id="caption-${numStr}">${escapedCaption}</pre>
          </div>

          <!-- Artigo LinkedIn -->
          <div class="copy-block">
            <div class="copy-label">
              <span>💼 Artigo / Post LinkedIn (C-Level Authority)</span>
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
  <title>Black Link — Kit Oficial de Lançamento Global (Extreme Glassmorphism)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #050508;
      color: #FFFFFF;
      font-family: "Plus Jakarta Sans", sans-serif;
      padding: 40px 24px;
      line-height: 1.5;
    }
    .container { max-width: 1440px; margin: 0 auto; }
    header {
      margin-bottom: 48px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
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
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.25);
      color: #FFFFFF;
      font-family: "Space Grotesk", monospace;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 6px 16px;
      border-radius: 999px;
      margin-top: 10px;
      backdrop-filter: blur(10px);
    }
    .instructions {
      color: #A1A1AA;
      font-size: 1rem;
      max-width: 820px;
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
      background: rgba(18, 18, 24, 0.6);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 24px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
      backdrop-filter: blur(16px);
    }
    .card:hover {
      border-color: rgba(255,255,255,0.35);
      transform: translateY(-4px);
      box-shadow: 0 20px 50px rgba(0,0,0,0.8);
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
      border: 1px solid rgba(255,255,255,0.25);
      backdrop-filter: blur(12px);
      color: #FFF;
      font-family: "Space Grotesk", monospace;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 5px 12px;
      border-radius: 8px;
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
      font-size: 1rem;
      color: #FFFFFF;
      font-weight: 800;
    }
    .post-pos {
      font-size: 0.75rem;
      color: #71717A;
      font-family: "Space Grotesk", monospace;
    }
    .tag-badge {
      font-family: "Space Grotesk", monospace;
      font-size: 0.68rem;
      color: #FFFFFF;
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      padding: 4px 10px;
      border-radius: 999px;
      font-weight: 700;
    }
    .post-title {
      font-family: "Space Grotesk", sans-serif;
      font-size: 1.45rem;
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
      background: rgba(8, 8, 12, 0.8);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 14px;
      padding: 16px;
    }
    .copy-label {
      font-family: "Space Grotesk", monospace;
      font-size: 0.74rem;
      font-weight: 700;
      color: #A1A1AA;
      text-transform: uppercase;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .copy-content {
      font-size: 0.84rem;
      color: #E4E4E7;
      white-space: pre-wrap;
      word-break: break-word;
      max-height: 130px;
      overflow-y: auto;
      font-family: "Plus Jakarta Sans", sans-serif;
      background: rgba(255,255,255,0.02);
      padding: 10px;
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.04);
      line-height: 1.5;
    }
    .actions-row {
      margin-top: auto;
      display: flex;
      gap: 10px;
      padding-top: 10px;
    }
    .btn {
      border: none;
      border-radius: 12px;
      padding: 12px 20px;
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
      border: 1px solid rgba(255,255,255,0.15);
    }
    .btn-secondary:hover { background: rgba(255,255,255,0.18); }
    .btn-accent {
      background: #FFFFFF;
      color: #000;
    }
    .btn-accent:hover { background: #E4E4E7; }
    .btn-sm {
      padding: 5px 12px;
      font-size: 0.72rem;
      background: rgba(255,255,255,0.12);
      color: #FFFFFF;
      border-radius: 8px;
    }
    .btn-sm:hover { background: rgba(255,255,255,0.25); }
    .toast {
      position: fixed;
      bottom: 28px;
      right: 28px;
      background: #FFFFFF;
      color: #000000;
      font-weight: 800;
      padding: 14px 26px;
      border-radius: 14px;
      font-size: 0.92rem;
      display: none;
      box-shadow: 0 12px 35px rgba(0,0,0,0.8);
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
        <div class="badge">9 ARTES 1080x1080 EM GLASSMORPHISM EXTREMO & COPYS VIRAS HIGH-TICKET</div>
        <p class="instructions">
          Acervo oficial de lançamento da Black Link (<strong>blklnk.com</strong>).
          100% alinhado à estética do elo de vidro da marca: vidro fosco com microgotículas, cáusticas puras, fundo preto obsidiana e cards flutuantes em glassmorphism.
          Sem poluição, sem etiquetas absurdas, copys focadas em gerar autoridade e vendas de produtos digitais.
        </p>
      </div>
      <div class="header-actions">
        <a href="COPIES-E-LEGENDAS.txt" download="BLACKLINK-COPIES-E-LEGENDAS.txt" class="btn btn-secondary">
          📄 Copys em Texto (.txt)
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

  <div id="toast" class="toast">✓ Copiado para a área de transferência!</div>

  <script>
    function copyCardText(btn, elementId) {
      const el = document.getElementById(elementId);
      if (!el) return;
      const text = el.innerText || el.textContent;
      navigator.clipboard.writeText(text).then(() => {
        const originalText = btn.innerText;
        btn.innerText = "✓ Copiado!";
        btn.style.background = "#FFFFFF";
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

  // 4. Create ZIP package
  try {
    const zipCommand = `cd "${OUTPUT_DIR}" && rm -f blacklink-launch-pack-9posts.zip && zip -r -9 blacklink-launch-pack-9posts.zip *.png *.svg COPIES-E-LEGENDAS.txt`;
    execSync(zipCommand, { stdio: 'inherit' });
    console.log('Created blacklink-launch-pack-9posts.zip successfully!');
  } catch (err) {
    console.error('Error creating zip:', err.message);
  }

  console.log('All 9 extreme glassmorphism launch assets generated successfully!');
}

run().catch(err => {
  console.error('Fatal error in build-launch-pack:', err);
  process.exit(1);
});
