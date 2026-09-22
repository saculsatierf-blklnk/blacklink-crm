import { EventEmitter } from "events";

export interface DealMomentumEvent {
  id: string;
  type: "telemetry" | "score_update" | "nlp_objection" | "heartbeat" | "connected";
  leadId?: string;
  leadName?: string;
  company?: string;
  score?: number;
  delta?: number;
  triggerType?: string;
  triggerLabel?: string;
  command?: string;
  zone?: "closing" | "traction" | "nurturing";
  timestamp: string;
  details?: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __blacklinkDealEmitter: EventEmitter | undefined;
}

function getDealEmitter(): EventEmitter {
  if (!globalThis.__blacklinkDealEmitter) {
    const emitter = new EventEmitter();
    emitter.setMaxListeners(100);
    globalThis.__blacklinkDealEmitter = emitter;
  }
  return globalThis.__blacklinkDealEmitter;
}

export const dealMomentumEmitter = getDealEmitter();

/**
 * Dispara evento de momentum em tempo real para todos os clientes conectados
 */
export function broadcastDealEvent(event: Omit<DealMomentumEvent, "id" | "timestamp"> & { id?: string; timestamp?: string }) {
  const payload: DealMomentumEvent = {
    id: event.id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: event.timestamp || new Date().toISOString(),
    ...event,
  };

  dealMomentumEmitter.emit("deal_event", payload);
  return payload;
}
