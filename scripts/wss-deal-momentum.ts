import http from "http";
import { WebSocketServer, WebSocket } from "ws";

const PORT = parseInt(process.env.WSS_PORT || "8080", 10);

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "healthy", connections: wss.clients.size }));
    return;
  }

  // Endpoint para ingestão externa de eventos HTTP disparando broadcast WSS
  if (req.method === "POST" && req.url === "/broadcast") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        const payload = JSON.parse(body);
        broadcast(payload);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, receivers: wss.clients.size }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ server });

function broadcast(data: Record<string, unknown>) {
  const message = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

wss.on("connection", (ws, req) => {
  const clientIp = req.socket.remoteAddress;
  console.log(`[WSS] Novo cliente conectado do IP: ${clientIp}. Total: ${wss.clients.size}`);

  ws.send(
    JSON.stringify({
      type: "connected",
      message: "Deal Momentum WSS Server ativo com latência zero.",
      timestamp: new Date().toISOString(),
    })
  );

  ws.on("message", (message) => {
    try {
      const parsed = JSON.parse(message.toString());
      if (parsed.type === "ping") {
        ws.send(JSON.stringify({ type: "pong", timestamp: new Date().toISOString() }));
      }
    } catch {
      // Ignora mensagens malformadas
    }
  });

  ws.on("close", () => {
    console.log(`[WSS] Cliente desconectado. Total: ${wss.clients.size}`);
  });
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`⚡ WSS Deal Momentum Server operacional na porta :${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/health`);
  console.log(`====================================================`);
});
