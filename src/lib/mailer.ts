import nodemailer from "nodemailer";

interface SendVerificationEmailParams {
  toEmail: string;
  recipientName: string;
  companyName: string;
  verificationCode: string;
}

/**
 * Envio de e-mail com chave de ativação corporativa
 */
export async function sendVerificationEmail({
  toEmail,
  recipientName,
  companyName,
  verificationCode,
}: SendVerificationEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT) || 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const fromAddress = process.env.SMTP_FROM || "Black Link CRM <no-reply@blacklink.com.br>";

    // Se houver configuração de SMTP no ambiente, realiza o disparo real
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
        html: `
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
                  Para confirmar a posse deste e-mail e ativar a conta de Administrador da <strong>${companyName}</strong>, utilize a chave de segurança abaixo:
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
        `,
      });

      return { success: true };
    }

    // Fallback para quando o SMTP ainda não foi parametrizado nas variáveis do ambiente
    console.info(
      `[BLACK LINK AUTH] Chave de verificação para ${toEmail}: ${verificationCode}`
    );
    return { success: true };
  } catch (err) {
    console.error("Erro ao enviar e-mail de verificação:", err);
    return { success: false, error: "Falha ao despachar chave por e-mail." };
  }
}
