async function testWebhook() {
  const companyId = "44d73af8-8026-4061-8aa9-91a6becd33c9";
  const url = "http://localhost:3000/api/webhooks/leads";

  const payload = {
    companyId,
    leadName: "Roberto Silveira (Apex Capital Enterprise)",
    leadEmail: "roberto.silveira@apexcapital.io",
    leadPhone: "+55 (11) 98888-7766",
    origin: "n8n_test",
  };

  console.log("------------------------------------------");
  console.log("DISPARANDO REQUISIÇÃO WEBHOOK M2M...");
  console.log(`DESTINO: ${url}`);
  console.log("PAYLOAD:", JSON.stringify(payload, null, 2));
  console.log("------------------------------------------");

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const status = response.status;
    const data = await response.json();

    console.log(`STATUS_HTTP_RECEBIDO: ${status}`);
    console.log("RESPOSTA_DO_ENDPOINT:", JSON.stringify(data, null, 2));
    console.log("------------------------------------------");

    if (status === 201) {
      console.log(
        "TESTE_E2E_CONCLUIDO_COM_SUCESSO: Lead injetado via automação externa!"
      );
    } else {
      console.error("FALHA_NA_VALIDACAO: Resposta inesperada do webhook.");
      process.exit(1);
    }
  } catch (error) {
    console.error("Erro na comunicação com o servidor local:", error);
    process.exit(1);
  }
}

testWebhook();
