import type { NextRequest } from "next/server";

export const DEFAULT_API_KEY = "blklnk_live_sec_89234710293847";

/**
 * Valida o cabeçalho x-api-key para integrações Machine-to-Machine (M2M) autônomas
 */
export function validateApiKey(request: NextRequest | Request): boolean {
  const providedKey = request.headers.get("x-api-key");
  const configuredKey = process.env.BLACKLINK_API_KEY || DEFAULT_API_KEY;

  if (!providedKey) {
    return false;
  }

  return providedKey === configuredKey;
}
