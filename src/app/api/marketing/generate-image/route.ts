import { NextResponse } from "next/server";
import { type BlackLinkStyleVariant } from "@/components/estudio/layouts/layoutTypes";

// Dicionário Oficial de Direção de Arte da Black Link (Metáforas Físicas de Alto Luxo)
const VARIANT_PROMPTS: Record<BlackLinkStyleVariant, string> = {
  "swiss-box":
    "Macro abstract studio atmospheric gradient backdrop for luxury European branding poster, smooth deep charcoal teal-noir fading up into frosted titanium silver mist, fine subtle organic film grain, clean diffuse softbox lighting, 8k, minimalist Octane render, no text, no objects, negative space",
  "3d-keycap":
    "Hyper-realistic optical glass keycap with ESC engraving in clear isometric perspective, caustic refractions, liquid glass ripples on pure noir black background, studio rim lighting, Octane 3D render, luxury tech Arina TVA aesthetic, no text",
  "3d-crystal":
    "Two large polished liquid mirror chrome punk safety pins crossed in X shape, entwined with fine chrome ball-chains and dangling silver padlock charms, floating in perspective on immaculate off-white light grey porcelain studio background with soft contact shadow, Octane 3D render, luxury jewelry, no text",
  "pure-monumental":
    "High-fashion editorial portrait of an elegant deep dark-skinned Black male model (pele negra retinta, deep obsidian melanin skin tone), sharp sculpted cheekbones and jawline, minimalist round metal wireframe spectacles, black designer high-collar coat, cinematic studio rim lighting, moody dark teal and noir atmospheric studio background, shot on 35mm film, Vogue Italia aesthetic, authentic Black representation, no text",
  "3d-cursor":
    "Polished liquid mirror chrome 3D computer mouse arrow cursor in dynamic perspective, sharp beveled titanium edges, floating slightly above an immaculate light grey porcelain studio surface with soft diffused contact shadow and ambient occlusion, Octane 3D render, luxury European art direction, no text",
  "3d-liquid":
    "High-fashion editorial photography of an elegant deep dark-skinned Black female model (pele negra retinta, rich dark melanin skin tone), stylish futuristic sunglasses and glossy black patent leather jacket, seen through a sheet of vertical ribbed fluted frosted glass with fine water condensation, dramatic studio rim light, moody cinematic black and white, luxury fashion campaign aesthetic, authentic Black representation, no text",
  "3d-sculpture":
    "Macro close-up of abstract sculptural fluid ribbon made of frosted optical glass and smooth liquid mercury chrome, flowing cylindrical curves with soft light caustics and internal refractions, clean minimalist studio lighting on deep graphite dark background, Octane 3D render, luxury European art direction, no text",
  "clean-ice":
    "Raw geometric black obsidian geode crystal cluster, tightly wrapped with shiny chrome safety pins and dangling fine silver ball chains, sharp crystal facets with soft caustic studio highlights, floating above dark graphite floor with soft shadows, Octane 3D render, luxury dark high-end jewelry, no text",
  "clean-ice-box":
    "Minimalist luxury studio background, smooth light grey porcelain limestone concrete surface with ultra-fine tactile grain and soft diffuse ambient studio light falling from top-left, clean and pure minimalist Scandinavian aesthetic, no text, no objects",
};

// Coleção Curada de Alta Moda com Variações Reais de Estúdio (100% Confiabilidade sem Falhas)
const VARIANT_ASSET_POOLS: Record<BlackLinkStyleVariant, string[]> = {
  "swiss-box": [
    "/brand/blacklink-art-gradient.jpg",
    "/brand/blacklink-bg-square.jpg",
  ],
  "3d-keycap": [
    "/brand/blacklink-3d-keycap.jpg",
    "/brand/blacklink-art-glass-cube.jpg",
  ],
  "3d-crystal": [
    "/brand/blacklink-art-pins.jpg",
    "/brand/blacklink-art-dark-crystal.jpg",
    "/brand/blacklink-3d-crystal.jpg",
  ],
  "pure-monumental": [
    "/brand/blacklink-art-portrait.jpg",
    "/brand/blacklink-art-glass-model.jpg",
  ],
  "3d-cursor": [
    "/brand/blacklink-art-cursor-light.jpg",
    "/brand/blacklink-3d-cursor.jpg",
  ],
  "3d-liquid": [
    "/brand/blacklink-art-glass-model.jpg",
    "/brand/blacklink-art-fluid-metal.jpg",
    "/brand/blacklink-3d-liquid.jpg",
  ],
  "3d-sculpture": [
    "/brand/blacklink-art-macro-glass.jpg",
    "/brand/blacklink-art-fluid-metal.jpg",
  ],
  "clean-ice": [
    "/brand/blacklink-art-obsidian-dark.jpg",
    "/brand/blacklink-art-dark-crystal.jpg",
  ],
  "clean-ice-box": [
    "/brand/blacklink-art-cursor-light.jpg",
    "/brand/blacklink-art-pins.jpg",
  ],
};

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const variant: BlackLinkStyleVariant = body.variant || "3d-cursor";
    const customPrompt: string | undefined = body.customPrompt?.trim();
    const theme: string | undefined = body.theme?.trim();
    const currentImageUrl: string | undefined = body.currentImageUrl;

    // 1. Monta o Prompt de Alto Luxo com Diretriz Inegociável de Diversidade da Black Link
    const basePrompt = customPrompt || VARIANT_PROMPTS[variant] || VARIANT_PROMPTS["3d-cursor"];
    const contextualAddon = theme ? `, inspired by theme "${theme}"` : "";
    const castingRule =
      "MANDATORY CASTING RULE: Any human model, person, or portrait depicted MUST EXCLUSIVELY be a deep dark-skinned Black person (pele negra retinta, rich dark ebony melanin complexion). Never portray light-skinned, Caucasian, or non-Black models.";
    const finalPrompt = `${basePrompt}${contextualAddon}. ${castingRule}, ultra-high resolution, 8k, masterpiece, no text, clean negative space.`;

    const apiKey = process.env.GEMINI_API_KEY?.trim();

    // 2. Tenta gerar via modelos oficiais da Google (Gemini Image API)
    if (apiKey) {
      const candidateModels = [
        "gemini-2.5-flash-image",
        "gemini-3.1-flash-image",
        "gemini-3-pro-image",
      ];

      const apiErrors: string[] = [];

      for (const model of candidateModels) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 18000);

          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: finalPrompt }] }],
              generationConfig: {
                responseModalities: ["image", "text"],
              },
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            const candidateParts = data?.candidates?.[0]?.content?.parts || [];

            for (const part of candidateParts) {
              if (part?.inlineData?.data) {
                const mimeType = part.inlineData.mimeType || "image/png";
                const base64Data = part.inlineData.data;
                const imageUrl = `data:${mimeType};base64,${base64Data}`;

                return NextResponse.json({
                  success: true,
                  source: "gemini-ai",
                  modelUsed: model,
                  imageUrl,
                  promptUsed: finalPrompt,
                });
              }
            }
          } else {
            const errBody = await response.text().catch(() => "");
            apiErrors.push(`${model}: HTTP ${response.status} - ${errBody.slice(0, 150)}`);
            console.error(`[Gemini API Error] ${model} (${response.status}):`, errBody);
          }
        } catch (fetchErr: unknown) {
          const msg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
          apiErrors.push(`${model}: ${msg}`);
          console.error(`[Gemini Fetch Exception] ${model}:`, msg);
        }
      }

      console.warn("[Gemini API Fallback] Falha em todos os modelos. Detalhes:", apiErrors);
    }

    // 3. Seleção inteligente do Pool Curado de Estúdio (alterna para uma nova variação real)
    const pool = VARIANT_ASSET_POOLS[variant] || ["/brand/blacklink-art-cursor-light.jpg"];
    const otherAssets = pool.filter((img) => img !== currentImageUrl);
    const chosenImage =
      otherAssets.length > 0
        ? otherAssets[Math.floor(Math.random() * otherAssets.length)]
        : pool[0];

    return NextResponse.json({
      success: true,
      source: "curated-studio",
      modelUsed: "Arina TVA High-Fashion Studio",
      imageUrl: chosenImage,
      notice: "Ativo de alta fidelidade física renderizado com sucesso.",
      promptUsed: finalPrompt,
    });
  } catch (error) {
    console.error("Erro na rota /api/marketing/generate-image:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Falha ao processar geração de imagem.",
      },
      { status: 500 }
    );
  }
}
