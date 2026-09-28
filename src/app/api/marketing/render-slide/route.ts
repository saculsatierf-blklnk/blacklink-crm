import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface SlideRenderPayload {
  slideNumber: number;
  totalSlides: number;
  headline: string;
  bodyText: string;
  theme?: string;
  format?: "carousel" | "story" | "post";
}

/**
 * Gera o SVG estruturado no padrão Dark Industrial do Black Link
 */
function generateSlideSvg({
  slideNumber = 1,
  totalSlides = 5,
  headline = "Diagnóstico Estratégico",
  bodyText = "Alinhamento executivo de prospecção corporativa.",
  theme = "Estratégia B2B",
  format = "carousel",
}: SlideRenderPayload): string {
  const isStory = format === "story";
  const width = isStory ? 1080 : 1080;
  const height = isStory ? 1920 : 1080;

  // Quebra títulos longos em linhas para o SVG
  const words = headline.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if ((currentLine + " " + word).trim().length > 28) {
      if (currentLine) lines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine = currentLine ? `${currentLine} ${word}` : word;
    }
  }
  if (currentLine) lines.push(currentLine.trim());

  // Quebra corpo do texto em linhas
  const bodyWords = bodyText.split(" ");
  const bodyLines: string[] = [];
  let currentBodyLine = "";

  for (const word of bodyWords) {
    if ((currentBodyLine + " " + word).trim().length > 44) {
      if (currentBodyLine) bodyLines.push(currentBodyLine.trim());
      currentBodyLine = word;
    } else {
      currentBodyLine = currentBodyLine ? `${currentBodyLine} ${word}` : word;
    }
  }
  if (currentBodyLine) bodyLines.push(currentBodyLine.trim());

  const badgeText =
    slideNumber === 1
      ? "GANCHO PRINCIPAL"
      : slideNumber === totalSlides
      ? "AÇÃO RECOMENDADA"
      : `PASSO 0${slideNumber}`;

  return `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Gradientes Dark Industrial -->
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#030303" />
        <stop offset="50%" stop-color="#0A0A0A" />
        <stop offset="100%" stop-color="#030303" />
      </linearGradient>

      <linearGradient id="titaniumGlow" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.12" />
        <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.02" />
      </linearGradient>

      <linearGradient id="accentGlow" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#E5E4E2" />
        <stop offset="100%" stop-color="#71717A" />
      </linearGradient>

      <!-- Grade Geométrica Minimalista -->
      <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
        <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#FFFFFF" stroke-opacity="0.03" stroke-width="1"/>
      </pattern>
    </defs>

    <!-- Fundo Principal -->
    <rect width="${width}" height="${height}" fill="url(#bgGrad)" />
    <rect width="${width}" height="${height}" fill="url(#grid)" />

    <!-- Círculo de Difusão de Luz Suave -->
    <circle cx="${width / 2}" cy="${height / 2}" r="400" fill="#FFFFFF" fill-opacity="0.02" filter="blur(80px)" />

    <!-- Moldura de Blindagem com Cantos Cortados -->
    <rect x="40" y="40" width="${width - 80}" height="${height - 80}" rx="24" fill="none" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="2" />

    <!-- Topo: Marca Black Link -->
    <g transform="translate(80, 90)">
      <rect x="0" y="0" width="48" height="48" rx="8" fill="#FFFFFF" />
      <text x="24" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="900" fill="#030303" text-anchor="middle" letter-spacing="2">BL</text>

      <text x="68" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#FFFFFF" letter-spacing="3">BLACK LINK</text>
      <text x="68" y="44" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600" fill="#71717A" letter-spacing="1">B2B MARKETING INTELLIGENCE</text>
    </g>

    <!-- Indicador de Slide no Topo Direito -->
    <g transform="translate(${width - 200}, 90)">
      <rect x="0" y="0" width="120" height="40" rx="8" fill="#1C1C1E" stroke="#FFFFFF" stroke-opacity="0.1" />
      <text x="60" y="25" font-family="monospace" font-size="14" font-weight="700" fill="#E5E4E2" text-anchor="middle" letter-spacing="2">${slideNumber} / ${totalSlides}</text>
    </g>

    <!-- Badge da Etapa Estratégica -->
    <g transform="translate(80, ${isStory ? 380 : 260})">
      <rect x="0" y="0" width="${badgeText.length * 11 + 24}" height="32" rx="6" fill="#1C1C1E" stroke="#FFFFFF" stroke-opacity="0.15" />
      <text x="12" y="21" font-family="monospace" font-size="12" font-weight="800" fill="#E5E4E2" letter-spacing="2">${badgeText}</text>
    </g>

    <!-- Headline Principal (Título em Alto Contraste) -->
    <g transform="translate(80, ${isStory ? 460 : 340})">
      ${lines
        .map(
          (line, idx) =>
            `<text x="0" y="${idx * 68}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="800" fill="#FFFFFF" letter-spacing="-1">${line}</text>`
        )
        .join("")}
    </g>

    <!-- Linha Divisória de Carbono -->
    <line x1="80" y1="${isStory ? 760 : 640}" x2="400" y2="${isStory ? 760 : 640}" stroke="#FFFFFF" stroke-opacity="0.15" stroke-width="2" />

    <!-- Corpo do Texto (Copywriting da Lâmina) -->
    <g transform="translate(80, ${isStory ? 820 : 700})">
      ${bodyLines
        .slice(0, 6)
        .map(
          (bLine, bIdx) =>
            `<text x="0" y="${bIdx * 38}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="400" fill="#A1A1AA" letter-spacing="0">${bLine}</text>`
        )
        .join("")}
    </g>

    <!-- Rodapé: Call to Action e Indicador de Navegação -->
    <g transform="translate(80, ${height - 110})">
      <text x="0" y="24" font-family="monospace" font-size="14" font-weight="700" fill="#E5E4E2" letter-spacing="1">
        ${slideNumber < totalSlides ? "ARRASTE PARA O PRÓXIMO PASSO →" : "SALVE ESTE CONTEÚDO PARA CONSULTAR"}
      </text>
    </g>

    <g transform="translate(${width - 240}, ${height - 110})">
      <text x="0" y="24" font-family="monospace" font-size="12" font-weight="600" fill="#52525B" letter-spacing="2">
        BLACK LINK ECOSYSTEM
      </text>
    </g>
  </svg>
  `.trim();
}

/**
 * Handler POST: recebe os dados e devolve o SVG/DataURL para o n8n ou frontend
 */
export async function POST(request: NextRequest) {
  try {
    const body: SlideRenderPayload = await request.json();
    const svg = generateSlideSvg(body);

    const base64Svg = Buffer.from(svg).toString("base64");
    const dataUrl = `data:image/svg+xml;base64,${base64Svg}`;

    return NextResponse.json({
      success: true,
      slideNumber: body.slideNumber || 1,
      totalSlides: body.totalSlides || 5,
      dataUrl,
      width: body.format === "story" ? 1080 : 1080,
      height: body.format === "story" ? 1920 : 1080,
    });
  } catch (err: unknown) {
    console.error("Erro na renderização de slide:", err);
    return NextResponse.json(
      { error: "Falha ao gerar o criativo visual." },
      { status: 500 }
    );
  }
}

/**
 * Handler GET: permite renderizar o criativo diretamente em tags <img> ou requisições HTTP
 * Exemplo: /api/marketing/render-slide?slide=1&total=5&headline=Meu+Titulo
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const slideNumber = Number(searchParams.get("slide")) || 1;
  const totalSlides = Number(searchParams.get("total")) || 5;
  const headline = searchParams.get("headline") || "Diagnóstico Estratégico B2B";
  const bodyText =
    searchParams.get("body") ||
    "Alinhamento executivo de prospecção e esteira comercial blindada.";
  const format = (searchParams.get("format") as "carousel" | "story" | "post") || "carousel";

  const svg = generateSlideSvg({
    slideNumber,
    totalSlides,
    headline,
    bodyText,
    format,
  });

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
