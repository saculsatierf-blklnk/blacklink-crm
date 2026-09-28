import dotenv from "dotenv";
dotenv.config();

import { sendVerificationEmail } from "../src/lib/mailer";

async function main() {
  const targetEmail = process.argv[2] || process.env.SMTP_USER || "saculsatierf@gmail.com";
  console.log(`[SMTP-TEST] Iniciando disparo de teste para: ${targetEmail}`);
  console.log(`[SMTP-TEST] Host: ${process.env.SMTP_HOST}`);
  console.log(`[SMTP-TEST] Port: ${process.env.SMTP_PORT}`);
  console.log(`[SMTP-TEST] User: ${process.env.SMTP_USER}`);

  const res = await sendVerificationEmail({
    toEmail: targetEmail,
    recipientName: "Lucas",
    companyName: "Black Link Ecosystem",
    verificationCode: "748921",
  });

  if (res.success) {
    console.log("[SMTP-TEST] Sucesso absoluto! E-mail entregue ao servidor SMTP do Google.");
  } else {
    console.error("[SMTP-TEST] Falha no disparo:", res.error);
  }
}

main().catch(console.error);
