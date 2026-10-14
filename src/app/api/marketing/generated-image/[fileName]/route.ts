import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ fileName: string }> }
) {
  const { fileName } = await params;
  const safeFileName = path.basename(fileName);

  // 1. Tenta carregar do /tmp (ambiente serverless / Lambda / Netlify)
  const tmpPath = path.join("/tmp", "generated-creatives", safeFileName);
  if (fs.existsSync(tmpPath)) {
    try {
      const fileBuffer = fs.readFileSync(tmpPath);
      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch (e) {
      console.warn("Erro ao ler imagem do /tmp:", e);
    }
  }

  // 2. Tenta carregar de public/generated-creatives (desenvolvimento local)
  const publicPath = path.join(process.cwd(), "public", "generated-creatives", safeFileName);
  if (fs.existsSync(publicPath)) {
    try {
      const fileBuffer = fs.readFileSync(publicPath);
      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch (e) {
      console.warn("Erro ao ler imagem de public:", e);
    }
  }

  // 3. Fallback gracioso: redireciona para um ativo curado de alta fidelidade
  return NextResponse.redirect(new URL("/brand/blacklink-art-cursor-light.jpg", req.url), 307);
}
