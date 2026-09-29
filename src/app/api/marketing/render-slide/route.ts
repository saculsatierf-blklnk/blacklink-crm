import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface SlideRenderPayload {
  slideNumber: number;
  totalSlides: number;
  headline: string;
  bodyText: string;
  theme?: string;
  niche?: string;
  format?: "carousel" | "story" | "post";
}

/**
 * Gera o SVG estruturado no padrão Dark Industrial do Black Link CRM
 * Proporções: 1080x1080 (carrossel) e 1080x1920 (story)
 * Fundo: Radial gradient from-zinc-800 via-black to-black
 */
function generateSlideSvg({
  slideNumber = 1,
  totalSlides = 5,
  headline = "Diagnóstico Estratégico B2B",
  bodyText = "Alinhamento executivo de prospecção, qualificação de demanda e esteira comercial blindada.",
  theme,
  niche,
  format = "carousel",
}: SlideRenderPayload): string {
  const isStory = format === "story";
  const width = 1080;
  const height = isStory ? 1920 : 1080;

  const slideIndexStr = String(slideNumber).padStart(2, "0");
  const totalSlidesStr = String(totalSlides).padStart(2, "0");

  // Quebra títulos em linhas para SVG (máx ~26 caracteres por linha para manter colossal)
  const words = (headline || "Diagnóstico Estratégico B2B").split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if ((currentLine + " " + word).trim().length > 24) {
      if (currentLine) lines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine = currentLine ? `${currentLine} ${word}` : word;
    }
  }
  if (currentLine) lines.push(currentLine.trim());

  // Quebra corpo do texto em linhas (máx ~48 caracteres por linha)
  const bodyWords = (bodyText || "").split(" ");
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

  const footerSignature = (niche || theme || "B2B GROWTH & DEMAND GEN").toUpperCase();

  // Posicionamento dinâmico
  const contentStartY = isStory ? 700 : 420;
  const headlineLineHeight = 72;
  const headlineEndY = contentStartY + lines.length * headlineLineHeight;
  const bodyStartY = headlineEndY + 40;
  const bodyLineHeight = 38;

  return `
  <svg width="${width}" height="${height}" viewBox="0 0 1080 ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Gradiente Radial Premium: from-zinc-800 via-black to-black -->
      <radialGradient id="slideRadial" cx="85%" cy="15%" r="80%" fx="85%" fy="15%">
        <stop offset="0%" stop-color="#27272a" />
        <stop offset="55%" stop-color="#09090b" />
        <stop offset="100%" stop-color="#000000" />
      </radialGradient>

      <!-- Linha de Brilho de Topo -->
      <linearGradient id="topGlow" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0" />
        <stop offset="50%" stop-color="#FFFFFF" stop-opacity="0.25" />
        <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
      </linearGradient>

      <!-- Grade Geométrica Sutil -->
      <pattern id="industrialGrid" width="90" height="90" patternUnits="userSpaceOnUse">
        <path d="M 90 0 L 0 0 0 90" fill="none" stroke="#FFFFFF" stroke-opacity="0.02" stroke-width="1"/>
      </pattern>
    </defs>

    <!-- Fundo Principal com Gradiente Radial -->
    <rect width="${width}" height="${height}" fill="url(#slideRadial)" />
    <rect width="${width}" height="${height}" fill="url(#industrialGrid)" />

    <!-- Moldura Sutil de Contorno -->
    <rect x="30" y="30" width="${width - 60}" height="${height - 60}" rx="24" fill="none" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1.5" />
    <line x1="120" y1="30" x2="${width - 120}" y2="30" stroke="url(#topGlow)" stroke-width="2" />

    <!-- 1. TOP (Header): Tenant/Marca à esquerda, Contador à direita (p-12: margem de 90px) -->
    <g transform="translate(90, 110)">
      <circle cx="8" cy="8" r="5" fill="#FFFFFF" />
      <text x="24" y="14" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="700" fill="#A1A1AA" letter-spacing="4">BLACK LINK</text>
    </g>

    <g transform="translate(${width - 200}, 110)">
      <rect x="0" y="-8" width="110" height="36" rx="8" fill="#FFFFFF" fill-opacity="0.05" stroke="#FFFFFF" stroke-opacity="0.1" stroke-width="1" />
      <text x="55" y="16" font-family="monospace" font-size="18" font-weight="700" fill="#E4E4E7" text-anchor="middle" letter-spacing="2">${slideIndexStr}/${totalSlidesStr}</text>
    </g>

    <!-- Linha divisória de cabeçalho -->
    <line x1="90" y1="160" x2="${width - 90}" y2="160" stroke="#FFFFFF" stroke-opacity="0.06" stroke-width="1" />

    <!-- 2. MIDDLE (Conteúdo): Headline colossal e bodyText -->
    <g transform="translate(90, ${contentStartY})">
      ${lines
        .map(
          (line, idx) =>
            `<text x="0" y="${idx * headlineLineHeight}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="56" font-weight="800" fill="#FFFFFF" letter-spacing="-2">${line}</text>`
        )
        .join("")}
    </g>

    <g transform="translate(90, ${bodyStartY})">
      ${bodyLines
        .slice(0, 6)
        .map(
          (bLine, bIdx) =>
            `<text x="0" y="${bIdx * bodyLineHeight}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="400" fill="#A1A1AA" letter-spacing="0">${bLine}</text>`
        )
        .join("")}
    </g>

    <!-- 3. BOTTOM (Footer): Linha divisória sutil com assinatura B2B -->
    <line x1="90" y1="${height - 130}" x2="${width - 90}" y2="${height - 130}" stroke="#FFFFFF" stroke-opacity="0.1" stroke-width="1.5" />

    <g transform="translate(90, ${height - 85})">
      <text x="0" y="0" font-family="monospace" font-size="16" font-weight="600" fill="#71717A" letter-spacing="3">${footerSignature}</text>
    </g>

    <g transform="translate(${width - 280}, ${height - 85})">
      <text x="0" y="0" font-family="monospace" font-size="16" font-weight="600" fill="#A1A1AA" letter-spacing="1">
        ${slideNumber < totalSlides ? "ARRASTE →" : "SALVE ESTE POST"}
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
      width: 1080,
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
    "Alinhamento executivo de prospecção, qualificação de demanda e esteira comercial blindada.";
  const theme = searchParams.get("theme") || undefined;
  const niche = searchParams.get("niche") || undefined;
  const format = (searchParams.get("format") as "carousel" | "story" | "post") || "carousel";

  const svg = generateSlideSvg({
    slideNumber,
    totalSlides,
    headline,
    bodyText,
    theme,
    niche,
    format,
  });

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
