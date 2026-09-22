import { NextRequest } from "next/server";
import {
  dealMomentumEmitter,
  type DealMomentumEvent,
} from "@/lib/deal-stream";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Canal de Streaming Persistente de Alta Frequência (Deal Momentum Stream)
 * Fornece push em tempo real para a interface do Closer com latência zero.
 */
export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 1. Notificação imediata de conexão ativa
      const initialEvent: DealMomentumEvent = {
        id: `init_${Date.now()}`,
        type: "connected",
        timestamp: new Date().toISOString(),
        details: "Deal Momentum Stream conectado com latência zero.",
      };
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify(initialEvent)}\n\n`)
      );

      // 2. Listener de eventos do motor preditivo
      const handleDealEvent = (event: DealMomentumEvent) => {
        try {
          const payload = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        } catch {
          // Stream fechada pelo cliente
        }
      };

      dealMomentumEmitter.on("deal_event", handleDealEvent);

      // 3. Heartbeat periódico para sustentação de proxies e CDNs
      const heartbeatTimer = setInterval(() => {
        try {
          const heartbeat: DealMomentumEvent = {
            id: `hb_${Date.now()}`,
            type: "heartbeat",
            timestamp: new Date().toISOString(),
          };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(heartbeat)}\n\n`)
          );
        } catch {
          clearInterval(heartbeatTimer);
        }
      }, 20000);

      // 4. Limpeza de recursos na desconexão
      request.signal.addEventListener("abort", () => {
        dealMomentumEmitter.off("deal_event", handleDealEvent);
        clearInterval(heartbeatTimer);
        try {
          controller.close();
        } catch {
          // Já finalizado
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
