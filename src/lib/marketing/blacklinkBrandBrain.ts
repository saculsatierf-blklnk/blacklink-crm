/**
 * Black Link Brand & Product Intelligence Brain
 * Base oficial de conhecimento extraída de https://blklnk.com e do ecossistema Black Link CRM OS
 */

export interface BlackLinkProduct {
  id: string;
  name: string;
  shortDesc: string;
  category: "Software" | "Automação & IA" | "Branding & Posicionamento" | "Eventos & Mídia" | "Diagnóstico";
  targetAudience: string;
  painResolved: string;
  directCta: string;
  url?: string;
}

export const BLACKLINK_PRODUCTS: BlackLinkProduct[] = [
  {
    id: "crm-os",
    name: "Black Link CRM OS (Software sob Medida)",
    shortDesc: "Engenharia web e plataforma operacional proprietária para empresas de alto valor.",
    category: "Software",
    targetAudience: "Fundadores, Diretores Comerciais e Empresas B2B High-Ticket",
    painResolved: "Fim das planilhas desorganizadas, atrito invisível entre atração e fechamento, perda de negócios por falta de telemetria.",
    directCta: "Agende uma demonstração executiva do Black Link OS via Direct ou no link da bio.",
    url: "https://blklnk.com/contact?servico=software",
  },
  {
    id: "automacoes-ia",
    name: "Engenharia de Automações & I.A. Operacional",
    shortDesc: "Inteligência Artificial e otimização operacional autônoma que dispensa trabalho manual.",
    category: "Automação & IA",
    targetAudience: "Empresas com gargalos operacionais e equipes comerciais sobrecarregadas",
    painResolved: "Tempo desperdiçado com tarefas manuais repetitivas, lentidão no primeiro contato com leads e follow-ups esquecidos.",
    directCta: "Envie 'AUTOMAÇÃO' no Direct para auditar seus processos com nossa equipe.",
    url: "https://blklnk.com/protocolo",
  },
  {
    id: "marketing-branding",
    name: "Marketing & Branding Soberano",
    shortDesc: "Identidade visual soberana, posicionamento de alto valor e direção de arte internacional.",
    category: "Branding & Posicionamento",
    targetAudience: "Líderes que vendem soluções de alto valor mas têm presença digital genérica",
    painResolved: "A percepção de valor baixa que força o cliente a pedir desconto e desvaloriza o ticket médio da empresa.",
    directCta: "Comente 'SOBERANIA' para receber o manifesto de posicionamento executivo.",
    url: "https://blklnk.com/contact?servico=marketing",
  },
  {
    id: "protocolo-simulador",
    name: "Protocolo Black Link (Simulador de Projeto)",
    shortDesc: "Diagnóstico arquitetônico completo para mapear a reestruturação da infraestrutura digital da empresa.",
    category: "Diagnóstico",
    targetAudience: "Decisores que querem entender a rota exata de escala antes de contratar",
    painResolved: "Incerteza sobre onde investir primeiro (se em software, IA, branding ou mídia).",
    directCta: "Simule a arquitetura da sua operação gratuitamente em blklnk.com/protocolo.",
    url: "https://blklnk.com/protocolo",
  },
  {
    id: "megaeventos",
    name: "Captação Cinematográfica em Megaeventos",
    shortDesc: "Presença cinematográfica e cobertura de autoridade em grandes feiras e congressos corporativos.",
    category: "Eventos & Mídia",
    targetAudience: "Empresas que expõem em feiras e congressos mas não aproveitam a autoridade em conteúdo perene",
    painResolved: "Investir centenas de milhares de reais em um estande e ter apenas fotos amadoras com celular.",
    directCta: "Solicite a cobertura cinematográfica da sua empresa para a próxima feira em blklnk.com/contact.",
    url: "https://blklnk.com/contact?servico=megaeventos",
  },
];

export const BLACKLINK_BRAND_PROMPT_CONTEXT = `
VOCÊ É O DIRETOR EXECUTIVO DE GROWTH & CRIAÇÃO DA "BLACK LINK" (blklnk.com).
A Black Link é uma holding e software house de ultra-luxo e alta tecnologia corporativa, com a assinatura:
"BLACK LINK | Engenharia da Ausência"
"Simplificamos sua tecnologia e elevamos sua estética para que você foque apenas no que faz de melhor. Criamos a infraestrutura que sua autoridade merece, elevando sua presença digital e maximizando seus resultados."

DIRETRIZES DE TOM DE VOZ & NICHO:
- Tom de voz: Brutalista suíço, cirúrgico, executivo, sofisticado, sóbrio, autoridade inegociável.
- Referências: Arina TVA, Design Atum, Monolith, Vogue Business, Octane 3D, tipografia suíça rigorosa.
- Proibido: Clichês baratos de afiliados ("arrasta pra cima", "fature 10k", "segredo revelado", "comente EU QUERO"), linguagem informal exagerada, emojis infantis em excesso.
- Foco: Soluções de Alto Ticket, Soberania Operacional, Eliminação de Ruído, Tecnologia de Ponta.
- NUNCA CRIAR OU SUGERIR POSTS SOBRE "CASES" OU "DEPOIMENTOS GENÉRICOS". Em vez disso, crie manifestos, quebra de padrões de mercado, princípios de engenharia, teses de autoridade e demonstração de soberania tecnológica.

PRODUTOS & SOLUÇÕES DIGITAIS DA BLACK LINK PARA CONVERSÃO:
1. Black Link CRM OS (Plataforma sob medida de vendas e telemetria comercial)
2. Automações & Agentes de I.A. (Otimização operacional e processos autônomos no n8n)
3. Marketing & Branding Soberano (Posicionamento de alto valor e criativos de luxo)
4. Protocolo Black Link (Simulador de projeto em blklnk.com/protocolo)
5. Captação Cinematográfica em Megaeventos corporativos
`;
