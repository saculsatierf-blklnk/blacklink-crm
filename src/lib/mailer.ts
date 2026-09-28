import nodemailer from "nodemailer";

interface SendVerificationEmailParams {
  toEmail: string;
  recipientName: string;
  companyName: string;
  verificationCode: string;
}

/**
 * Envio real de e-mail com chave de ativação corporativa
 * Suporta Resend API (RESEND_API_KEY) ou SMTP padrão (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)
 */
export async function sendVerificationEmail({
  toEmail,
  recipientName,
  companyName,
  verificationCode,
}: SendVerificationEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const htmlBody = `
      <div style="background-color: #030303; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #E5E4E2;">
        <div style="max-width: 520px; margin: 0 auto; background-color: #0A0A0A; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background-color: #FFFFFF; color: #000000; font-weight: 800; font-size: 14px; letter-spacing: 2px; padding: 8px 12px; border-radius: 6px;">BL</div>
            <h1 style="color: #FFFFFF; font-size: 18px; margin-top: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Black Link CRM</h1>
            <p style="color: #71717A; font-size: 12px; margin-top: 4px;">Validação e Ativação de Acesso Corporativo</p>
          </div>

          <div style="border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 20px; margin-bottom: 24px;">
            <p style="font-size: 14px; color: #E5E4E2; line-height: 1.5; margin: 0 0 16px 0;">
              Olá, <strong>${recipientName}</strong>.
            </p>
            <p style="font-size: 13px; color: #A1A1AA; line-height: 1.5; margin: 0 0 24px 0;">
              Para confirmar a titularidade deste e-mail e ativar a conta de Administrador da empresa <strong>${companyName}</strong>, insira a chave de segurança abaixo:
            </p>

            <div style="background-color: #121214; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
              <span style="font-family: monospace; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #FFFFFF;">
                ${verificationCode}
              </span>
              <div style="font-size: 11px; color: #71717A; margin-top: 8px; font-family: monospace;">
                Válido por 15 minutos &bull; Uso único
              </div>
            </div>

            <p style="font-size: 11px; color: #71717A; line-height: 1.4; margin: 0;">
              Se você não solicitou este cadastro no Black Link CRM, por favor ignore esta mensagem.
            </p>
          </div>

          <div style="border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 16px; text-align: center; font-size: 10px; color: #52525B; font-family: monospace;">
            Black Link Ecosystem &bull; Segurança de Acesso TLS 1.3
          </div>
        </div>
      </div>
    `;

    // 1. Provedor Resend API (se configurado)
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const fromAddress = process.env.RESEND_FROM || "Black Link CRM <onboarding@resend.dev>";
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [toEmail],
          subject: `Sua Chave de Acesso Black Link CRM: ${verificationCode}`,
          html: htmlBody,
        }),
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        console.error("Erro no envio via Resend:", errorJson);
        return {
          success: false,
          error: errorJson.message || "Falha ao despachar chave via Resend.",
        };
      }

      return { success: true };
    }

    // 2. Provedor SMTP Padrão (Gmail, Brevo, corporativo)
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT) || 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const fromAddress = process.env.SMTP_FROM || `Black Link CRM <${smtpUser || "no-reply@blacklink.com.br"}>`;

    if (smtpHost && smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject: `Sua Chave de Acesso Black Link CRM: ${verificationCode}`,
        text: `Olá ${recipientName},\n\nSua chave de acesso para ativar a conta da empresa ${companyName} no Black Link CRM é: ${verificationCode}\n\nEsta chave é válida por 15 minutos.\n\nBlack Link Ecosystem`,
        html: htmlBody,
      });

      return { success: true };
    }

    // Se nenhuma credencial de envio foi configurada, falha expressamente
    return {
      success: false,
      error:
        "Servidor de e-mail não configurado. Por favor, adicione as credenciais de SMTP (SMTP_HOST, SMTP_USER, SMTP_PASS) ou RESEND_API_KEY no arquivo .env para que o e-mail real seja disparado para a sua caixa de entrada.",
    };
  } catch (err: unknown) {
    console.error("Erro ao enviar e-mail de verificação:", err);
    const message = err instanceof Error ? err.message : "Falha na comunicação com o servidor SMTP.";
    return { success: false, error: message };
  }
}
