"use client";

import React from "react";
import { createRoot } from "react-dom/client";
import * as htmlToImage from "html-to-image";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { PostSlideDisplay } from "@/components/marketing/growth/PostSlideDisplay";
import { type BlackLinkStyleVariant, type AspectRatio } from "@/components/estudio/layouts/layoutTypes";

/**
 * ============================================================================
 * BLACK LINK RENDER ENGINE (GOAT-TIER INDUSTRIAL EXPORT ARCHITECTURE)
 * ============================================================================
 * Desenvolvido a partir da engenharia reversa das melhores engines globais
 * (aiCarousels, Contentdrips, Satori/Vercel):
 * 
 * 1. Inlining total de assets em Base64 com GPU texture pre-decode (img.decode())
 * 2. Algoritmo de Auto-fit tipográfico matemático por busca binária (14 passos)
 * 3. Viewport isolada e offscreen criada sob demanda (zero overflow clipping)
 * 4. Parâmetros defensivos: pixelRatio=1, cacheBust=false, skipFonts=true
 * ============================================================================
 */

export interface SlideRenderPayload {
  headline?: string;
  bodyText?: string;
  tag?: string;
  imageUrl?: string;
  blackLinkVariant?: BlackLinkStyleVariant;
  aspectRatio?: AspectRatio;
}

export interface AuthorInfo {
  name: string;
  handle: string;
}

/**
 * Converte URLs relativas e externas para Data URLs (base64)
 * e força a GPU a pré-decodificar os pixels na memória de textura antes do snapshot.
 */
export async function inlineSlideAssets(container: HTMLElement): Promise<void> {
  const imgElements = Array.from(container.querySelectorAll("img"));

  await Promise.all(
    imgElements.map(async (img) => {
      // 1. Se já for base64 ou vazio, pula
      if (!img.src || img.src.startsWith("data:")) return;

      try {
        const fullUrl = img.src.startsWith("/")
          ? window.location.origin + img.src
          : img.src;

        const res = await fetch(fullUrl, { cache: "no-cache" });
        if (!res.ok) return;
        const blob = await res.blob();

        await new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === "string") {
              img.src = reader.result;
            }
            resolve();
          };
          reader.onerror = () => resolve();
          reader.readAsDataURL(blob);
        });

        // Remove atributos que causam conflito no SVG foreignObject
        img.removeAttribute("srcset");
        img.removeAttribute("crossorigin");
      } catch (err) {
        console.warn("[BlackLinkEngine] Falha ao embutir imagem em base64:", err);
      }
    })
  );

  // Inlining de backgroundImage inline CSS
  const bgElements = Array.from(container.querySelectorAll<HTMLElement>('[style*="background-image"]'));
  await Promise.all(
    bgElements.map(async (el) => {
      const style = el.style.backgroundImage;
      const match = style.match(/url\(['"]?(https?:\/\/[^'"]+|\/[^'"]+)['"]?\)/i);
      if (!match || !match[1] || match[1].startsWith("data:")) return;

      const url = match[1];
      const fullUrl = url.startsWith("/") ? window.location.origin + url : url;

      try {
        const res = await fetch(fullUrl, { cache: "no-cache" });
        if (!res.ok) return;
        const blob = await res.blob();
        await new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === "string") {
              el.style.backgroundImage = `url('${reader.result}')`;
            }
            resolve();
          };
          reader.onerror = () => resolve();
          reader.readAsDataURL(blob);
        });
      } catch (err) {
        console.warn("[BlackLinkEngine] Falha ao embutir background-image:", err);
      }
    })
  );

  // O PULO DO GATO REA / AICAROUSELS:
  // Força o navegador a descomprimir todas as imagens na memória de vídeo da GPU
  await Promise.all(
    Array.from(container.querySelectorAll("img"), (img) =>
      img.decode ? img.decode().catch(() => null) : null
    )
  );
}

/**
 * Algoritmo de Auto-Fit Tipográfico por Busca Binária (14 passos)
 * Acha com precisão fracionária de pixel o tamanho exato de fonte
 * para que o texto monumental ou a linha de apoio caibam perfeitamente sem overflow.
 */
export function fitTextElement(
  element: HTMLElement,
  containerWidth: number,
  containerHeight: number,
  baseFontSize: number = 36,
  minFontSize: number = 14,
  maxFontSize: number = 72
): number {
  if (!element || !element.isConnected) return baseFontSize;

  let min = minFontSize;
  let max = maxFontSize;

  const fits = () => {
    return (
      element.scrollHeight <= containerHeight + 2 &&
      element.scrollWidth <= containerWidth + 2
    );
  };

  // Testa o tamanho máximo primeiro
  element.style.fontSize = `${max}px`;
  if (fits()) {
    return max;
  }

  // Testa o mínimo
  element.style.fontSize = `${min}px`;
  if (!fits()) {
    return min; // Já está estourando no mínimo
  }

  // Busca binária matemática em 14 iterações
  for (let i = 0; i < 14; i++) {
    const mid = (min + max) / 2;
    element.style.fontSize = `${mid}px`;
    if (fits()) {
      min = mid; // Cabe, tenta aumentar
    } else {
      max = mid; // Estourou, reduz
    }
  }

  const finalSize = Math.floor(min * 100) / 100;
  element.style.fontSize = `${finalSize}px`;
  return finalSize;
}

/**
 * Renderiza um slide em um contêiner isolado offscreen,
 * executa inlining, auto-fit, exporta PNG em 1080x1080 (ou 1080x1350) e dispara o download.
 */
export async function exportSlideToPng(
  slide: SlideRenderPayload,
  authorInfo: AuthorInfo = { name: "Black Link", handle: "@blacklink.com.br" },
  slideNumber: number = 1,
  totalSlides: number = 1,
  fileName: string = "blacklink_post.png"
): Promise<string> {
  // 1. Cria viewport de exportação isolada anexada ao body
  const exportViewport = document.createElement("div");
  exportViewport.className = "blacklink-export-isolated-viewport";
  
  const is45 = slide.aspectRatio === "4:5";
  const is916 = slide.aspectRatio === "9:16";
  const canvasWidth = 1080;
  const canvasHeight = is916 ? 1920 : is45 ? 1350 : 1080;

  exportViewport.style.position = "fixed";
  exportViewport.style.left = "-99999px";
  exportViewport.style.top = "-99999px";
  exportViewport.style.width = `${canvasWidth}px`;
  exportViewport.style.height = `${canvasHeight}px`;
  exportViewport.style.overflow = "hidden";
  exportViewport.style.zIndex = "-1000";
  exportViewport.style.visibility = "visible";
  exportViewport.style.pointerEvents = "none";
  exportViewport.style.background = "#030305";

  document.body.appendChild(exportViewport);

  const root = createRoot(exportViewport);

  try {
    // 2. Renderiza o componente React da lâmina dentro da viewport isolada
    await new Promise<void>((resolve) => {
      root.render(
        <PostSlideDisplay
          slide={slide}
          aspectRatio={slide.aspectRatio || "1:1"}
          authorName={authorInfo.name}
          authorHandle={authorInfo.handle}
          slideNumber={slideNumber}
          totalSlides={totalSlides}
          exportMode={true}
        />
      );
      // Aguarda 2 frames de render do React
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve());
      });
    });

    // 3. Aguarda fonts e DOM estabilizarem
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
    await new Promise((r) => setTimeout(r, 120));

    // 4. Inlining de imagens para base64 + GPU pre-decode
    await inlineSlideAssets(exportViewport);

    // 5. Auto-fit das headlines da viewport isolada
    const headings = Array.from(exportViewport.querySelectorAll<HTMLElement>("h1"));
    headings.forEach((h1) => {
      const parent = h1.parentElement;
      if (parent) {
        const parentW = parent.clientWidth || 560;
        const parentH = parent.clientHeight || 300;
        fitTextElement(h1, parentW, parentH, 36, 18, 54);
      }
    });

    await new Promise((r) => setTimeout(r, 100));

    // 6. Captura via htmlToImage com as flags industriais de segurança
    const dataUrl = await htmlToImage.toPng(exportViewport, {
      width: canvasWidth,
      height: canvasHeight,
      canvasWidth,
      canvasHeight,
      pixelRatio: 1, // Trava pixelRatio para evitar distorção Retina/4K
      cacheBust: false, // Impede corrupção de Data URLs base64
      skipFonts: true, // Usa as fontes já carregadas no DOM
      backgroundColor: "#030305",
      style: {
        transform: "none",
      },
    });

    // 7. Dispara download automático do arquivo PNG
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();

    return dataUrl;
  } finally {
    // 8. Desmonta o root React e remove a viewport do DOM
    root.unmount();
    exportViewport.remove();
  }
}

/**
 * Exporta múltiplos slides empacotados em um único arquivo ZIP de alta resolução
 */
export async function exportSlidesToZip(
  slides: Array<{
    payload: SlideRenderPayload;
    fileName: string;
    slideNumber: number;
    totalSlides: number;
  }>,
  authorInfo: AuthorInfo = { name: "Black Link", handle: "@blacklink.com.br" },
  zipFileName: string = "blacklink_feed_collection.zip",
  onProgress?: (current: number, total: number, label: string) => void
): Promise<Blob> {
  const zip = new JSZip();
  const folder = zip.folder("blacklink_artes");

  for (let i = 0; i < slides.length; i++) {
    const item = slides[i];
    if (onProgress) {
      onProgress(i + 1, slides.length, `Renderizando arte ${i + 1} de ${slides.length}...`);
    }

    // Renderiza cada lâmina individualmente na viewport isolada
    const exportViewport = document.createElement("div");
    exportViewport.className = "blacklink-export-isolated-viewport";
    
    const is45 = item.payload.aspectRatio === "4:5";
    const is916 = item.payload.aspectRatio === "9:16";
    const canvasWidth = 1080;
    const canvasHeight = is916 ? 1920 : is45 ? 1350 : 1080;

    exportViewport.style.position = "fixed";
    exportViewport.style.left = "-99999px";
    exportViewport.style.top = "-99999px";
    exportViewport.style.width = `${canvasWidth}px`;
    exportViewport.style.height = `${canvasHeight}px`;
    exportViewport.style.overflow = "hidden";
    exportViewport.style.zIndex = "-1000";
    exportViewport.style.visibility = "visible";
    exportViewport.style.background = "#030305";

    document.body.appendChild(exportViewport);
    const root = createRoot(exportViewport);

    try {
      await new Promise<void>((resolve) => {
        root.render(
          <PostSlideDisplay
            slide={item.payload}
            aspectRatio={item.payload.aspectRatio || "1:1"}
            authorName={authorInfo.name}
            authorHandle={authorInfo.handle}
            slideNumber={item.slideNumber}
            totalSlides={item.totalSlides}
            exportMode={true}
          />
        );
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve());
        });
      });

      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      await new Promise((r) => setTimeout(r, 100));

      await inlineSlideAssets(exportViewport);

      const headings = Array.from(exportViewport.querySelectorAll<HTMLElement>("h1"));
      headings.forEach((h1) => {
        const parent = h1.parentElement;
        if (parent) {
          fitTextElement(h1, parent.clientWidth || 560, parent.clientHeight || 300, 36, 18, 54);
        }
      });

      await new Promise((r) => setTimeout(r, 60));

      const dataUrl = await htmlToImage.toPng(exportViewport, {
        width: canvasWidth,
        height: canvasHeight,
        canvasWidth,
        canvasHeight,
        pixelRatio: 1,
        cacheBust: false,
        skipFonts: true,
        backgroundColor: "#030305",
      });

      const base64Data = dataUrl.split(",")[1];
      if (folder && base64Data) {
        folder.file(item.fileName, base64Data, { base64: true });
      }
    } finally {
      root.unmount();
      exportViewport.remove();
    }
  }

  if (onProgress) {
    onProgress(slides.length, slides.length, "Empacotando arquivo ZIP final...");
  }

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, zipFileName);
  return content;
}
