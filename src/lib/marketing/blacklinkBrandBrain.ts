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

import { BlackLinkStyleVariant } from "@/components/estudio/layouts/layoutTypes";

export interface BlackLinkCampaignPreset {
  id: string;
  name: string;
  productId: string;
  badge: string;
  headlineSummary: string;
  description: string;
  posts: Array<{
    id: string;
    theme: string;
    hookHeadline: string;
    bodyCopy: string;
    postCaption: string;
    ctaText: string;
    hashtags: string[];
    scheduledDate: string;
    blackLinkVariant: BlackLinkStyleVariant;
    slides: Array<{
      slideNumber: number;
      headline: string;
      bodyText: string;
      tag: string;
      blackLinkVariant: BlackLinkStyleVariant;
      seamlessBleed?: boolean;
      imageUrl?: string;
    }>;
    linkedinPostText?: string;
  }>;
}

export const BLACKLINK_CAMPAIGN_PRESETS: BlackLinkCampaignPreset[] = [
  {
    "id": "camp-crm-os",
    "name": "Black Link CRM OS | Arquitetura de Escala",
    "productId": "crm-os",
    "badge": "⚡ CRM OS",
    "headlineSummary": "Substituição de planilhas por telemetria preditiva de vendas enterprise.",
    "description": "Campanha focada em diretores comerciais e fundadores B2B cansados de perder negócios por falta de visibilidade.",
    "posts": [
      {
        "id": "post-bl-01",
        "theme": "Estratégia B2B",
        "hookHeadline": "ESTRATÉGIA B2B",
        "bodyCopy": "A diferença entre operações que escalam e as que travam está na ausência de atrito no pipeline comercial.\n\nConstruímos o Black Link OS para substituir planilhas lentas por telemetria preditiva e velocidade executiva.",
        "postCaption": "A diferença entre operações que escalam e as que travam está na ausência de atrito no pipeline comercial.\n\nConstruímos o Black Link OS para substituir planilhas lentas por telemetria preditiva e velocidade executiva.\n\nSolicite demonstração executiva via Direct ou em blklnk.com.\n\n#BlackLink #VendasB2B #CRMOS #Enterprise #Telemetria",
        "ctaText": "Agende sua demonstração no perfil.",
        "hashtags": [
          "#BlackLink",
          "#VendasB2B",
          "#CRMOS"
        ],
        "scheduledDate": "Segunda • 09:00",
        "blackLinkVariant": "swiss-box",
        "slides": [
          {
            "slideNumber": 1,
            "headline": "ESTRATÉGIA B2B",
            "bodyText": "Arquitetura de dados e esteira de fechamento corporativo.",
            "tag": "01 // FRAMEWORK",
            "blackLinkVariant": "swiss-box",
            "imageUrl": "/brand/blacklink-art-gradient.jpg"
          }
        ],
        "linkedinPostText": "ESTRATÉGIA B2B // DIRETRIZ EXECUTIVA B2B\n\nA diferença entre operações que escalam e as que travam está na ausência de atrito no pipeline comercial.\n\nConstruímos o Black Link OS para substituir planilhas lentas por telemetria preditiva e velocidade executiva.\n\nNa Black Link (blklnk.com), operamos sob o princípio da Engenharia da Ausência: simplificamos a infraestrutura e elevamos o rigor técnico para que sua liderança foque estritamente no fechamento e na expansão de margem.\n\n• Solução: Black Link CRM OS | Arquitetura de Escala\n• Diretriz: 01 // FRAMEWORK\n• Ação: Conheça a demonstração executiva em blklnk.com ou solicite o dossiê via mensagem direta.\n\n#BlackLink #EnterpriseB2B #EngenhariaDaAusencia #LiderancaB2B #HighTicket"
      },
      {
        "id": "post-bl-02",
        "theme": "Fim das Planilhas",
        "hookHeadline": "ARQUITETURA DE DADOS",
        "bodyCopy": "Planilhas não fecham contratos enterprise. Sua esteira precisa de telemetria em tempo real e histórico auditável.",
        "postCaption": "Planilhas não fecham contratos enterprise.\n\nSua esteira precisa de telemetria em tempo real, status de cadência e histórico auditável.\n\nMigre sua operação para o Black Link CRM OS.\n\n#SoftwareEnterprise #SaaS #EngenhariaWeb #BlackLink",
        "ctaText": "Descubra o Black Link OS.",
        "hashtags": [
          "#SoftwareEnterprise",
          "#SaaS",
          "#BlackLink"
        ],
        "scheduledDate": "Terça • 12:00",
        "blackLinkVariant": "3d-keycap",
        "slides": [
          {
            "slideNumber": 1,
            "headline": "ARQUITETURA DE DADOS",
            "bodyText": "Fim das planilhas. A esteira comercial precisa de telemetria.",
            "tag": "02 // INFRAESTRUTURA",
            "blackLinkVariant": "3d-keycap",
            "imageUrl": "/brand/blacklink-3d-keycap.jpg"
          }
        ],
        "linkedinPostText": "FIM DAS PLANILHAS // DIRETRIZ EXECUTIVA B2B\n\nPlanilhas não fecham contratos enterprise. Sua esteira precisa de telemetria em tempo real e histórico auditável.\n\nNa Black Link (blklnk.com), operamos sob o princípio da Engenharia da Ausência: simplificamos a infraestrutura e elevamos o rigor técnico para que sua liderança foque estritamente no fechamento e na expansão de margem.\n\n• Solução: Black Link CRM OS | Arquitetura de Escala\n• Diretriz: 02 // INFRAESTRUTURA\n• Ação: Conheça a demonstração executiva em blklnk.com ou solicite o dossiê via mensagem direta.\n\n#BlackLink #EnterpriseB2B #EngenhariaDaAusencia #LiderancaB2B #HighTicket"
      },
      {
        "id": "post-bl-03",
        "theme": "Filtro de Decisores",
        "hookHeadline": "SISTEMA DE QUALIFICAÇÃO",
        "bodyCopy": "Filtro implacável antes de qualquer reunião comercial. Closers seniores só devem falar com decisores com orçamento.",
        "postCaption": "Filtro implacável antes de qualquer reunião comercial.\n\nClosers seniores só devem falar com decisores com orçamento aprovado e poder de caneta.\n\nConheça a qualificação do Black Link OS.\n\n#QualificacaoB2B #HighTicket #VendasSoberanas",
        "ctaText": "Conheça o sistema no perfil.",
        "hashtags": [
          "#QualificacaoB2B",
          "#HighTicket"
        ],
        "scheduledDate": "Quarta • 15:30",
        "blackLinkVariant": "3d-crystal",
        "slides": [
          {
            "slideNumber": 1,
            "headline": "SISTEMA DE MARCA",
            "bodyText": "Filtro implacável de decisores antes de qualquer call.",
            "tag": "03 // MONÓLITO",
            "blackLinkVariant": "3d-crystal",
            "imageUrl": "/brand/blacklink-art-pins.jpg"
          }
        ],
        "linkedinPostText": "FILTRO DE DECISORES // DIRETRIZ EXECUTIVA B2B\n\nFiltro implacável antes de qualquer reunião comercial. Closers seniores só devem falar com decisores com orçamento.\n\nNa Black Link (blklnk.com), operamos sob o princípio da Engenharia da Ausência: simplificamos a infraestrutura e elevamos o rigor técnico para que sua liderança foque estritamente no fechamento e na expansão de margem.\n\n• Solução: Black Link CRM OS | Arquitetura de Escala\n• Diretriz: 03 // MONÓLITO\n• Ação: Conheça a demonstração executiva em blklnk.com ou solicite o dossiê via mensagem direta.\n\n#BlackLink #EnterpriseB2B #EngenhariaDaAusencia #LiderancaB2B #HighTicket"
      },
      {
        "id": "post-bl-04",
        "theme": "Manifesto Executivo",
        "hookHeadline": "ZERO ATRITO.\nMÁXIMA CONVERSÃO.",
        "bodyCopy": "Menos burocracia interna e mais presença diante de decisores de alto ticket. Essa é a regra de ouro do Black Link OS.",
        "postCaption": "Menos burocracia interna e mais presença diante de decisores de alto ticket.\n\nEssa é a regra de ouro das operações B2B de alta densidade.\n\n#VendasCorporativas #AltaConversao #BlackLink",
        "ctaText": "Blindagem comercial em blklnk.com",
        "hashtags": [
          "#VendasCorporativas",
          "#BlackLink"
        ],
        "scheduledDate": "Quinta • 10:00",
        "blackLinkVariant": "pure-monumental",
        "slides": [
          {
            "slideNumber": 1,
            "headline": "ZERO ATRITO.\nMÁXIMA CONVERSÃO.",
            "bodyText": "Menos burocracia interna e mais presença diante de decisores.",
            "tag": "04 // MANIFESTO",
            "blackLinkVariant": "pure-monumental",
            "imageUrl": "/brand/blacklink-art-portrait.jpg"
          }
        ],
        "linkedinPostText": "MANIFESTO EXECUTIVO // DIRETRIZ EXECUTIVA B2B\n\nMenos burocracia interna e mais presença diante de decisores de alto ticket. Essa é a regra de ouro do Black Link OS.\n\nNa Black Link (blklnk.com), operamos sob o princípio da Engenharia da Ausência: simplificamos a infraestrutura e elevamos o rigor técnico para que sua liderança foque estritamente no fechamento e na expansão de margem.\n\n• Solução: Black Link CRM OS | Arquitetura de Escala\n• Diretriz: 04 // MANIFESTO\n• Ação: Conheça a demonstração executiva em blklnk.com ou solicite o dossiê via mensagem direta.\n\n#BlackLink #EnterpriseB2B #EngenhariaDaAusencia #LiderancaB2B #HighTicket"
      },
      {
        "id": "post-bl-05",
        "theme": "Núcleo Operacional",
        "hookHeadline": "BLACK LINK OS",
        "bodyCopy": "O centro nevrálgico da sua operação de vendas enterprise. O elo definitivo entre inteligência de dados e conversão.",
        "postCaption": "O centro nevrálgico da sua operação de vendas enterprise.\n\nO elo definitivo entre inteligência de dados, cadência autônoma e conversão comercial previsível.\n\n#BlackLinkOS #Enterprise #InteligenciaArtificial #VendasB2B",
        "ctaText": "Conheça o ecossistema Black Link.",
        "hashtags": [
          "#BlackLinkOS",
          "#Enterprise",
          "#VendasB2B"
        ],
        "scheduledDate": "Sexta • 18:00",
        "blackLinkVariant": "3d-cursor",
        "slides": [
          {
            "slideNumber": 1,
            "headline": "BLACK LINK OS",
            "bodyText": "O centro nevrálgico da sua operação de vendas enterprise.",
            "tag": "05 // TELEMETRIA B2B",
            "blackLinkVariant": "3d-cursor",
            "imageUrl": "/brand/blacklink-art-cursor-light.jpg"
          }
        ],
        "linkedinPostText": "NÚCLEO OPERACIONAL // DIRETRIZ EXECUTIVA B2B\n\nO centro nevrálgico da sua operação de vendas enterprise. O elo definitivo entre inteligência de dados e conversão.\n\nNa Black Link (blklnk.com), operamos sob o princípio da Engenharia da Ausência: simplificamos a infraestrutura e elevamos o rigor técnico para que sua liderança foque estritamente no fechamento e na expansão de margem.\n\n• Solução: Black Link CRM OS | Arquitetura de Escala\n• Diretriz: 05 // TELEMETRIA B2B\n• Ação: Conheça a demonstração executiva em blklnk.com ou solicite o dossiê via mensagem direta.\n\n#BlackLink #EnterpriseB2B #EngenhariaDaAusencia #LiderancaB2B #HighTicket"
      },
      {
        "id": "post-bl-06",
        "theme": "Visibilidade do Pipeline",
        "hookHeadline": "TELEMETRIA EM\nTEMPO REAL",
        "bodyCopy": "Visibilidade cirúrgica: saiba em qual etapa cada negócio trava e onde a margem está escapando.",
        "postCaption": "Visibilidade cirúrgica: saiba em qual etapa cada negócio trava e onde a margem está escapando.\n\nTelemetria preditiva ao vivo no Black Link CRM OS.\n\n#RevOps #Telemetria #VendasB2B #BlackLink",
        "ctaText": "Audite seu pipeline no link da bio.",
        "hashtags": [
          "#RevOps",
          "#Telemetria",
          "#BlackLink"
        ],
        "scheduledDate": "Sábado • 11:00",
        "blackLinkVariant": "3d-liquid",
        "slides": [
          {
            "slideNumber": 1,
            "headline": "TELEMETRIA EM\nTEMPO REAL",
            "bodyText": "Visibilidade total do pipeline: de lead frio a contrato assinado.",
            "tag": "06 // REVOPS",
            "blackLinkVariant": "3d-liquid",
            "imageUrl": "/brand/blacklink-art-glass-model.jpg"
          }
        ],
        "linkedinPostText": "VISIBILIDADE DO PIPELINE // DIRETRIZ EXECUTIVA B2B\n\nVisibilidade cirúrgica: saiba em qual etapa cada negócio trava e onde a margem está escapando.\n\nNa Black Link (blklnk.com), operamos sob o princípio da Engenharia da Ausência: simplificamos a infraestrutura e elevamos o rigor técnico para que sua liderança foque estritamente no fechamento e na expansão de margem.\n\n• Solução: Black Link CRM OS | Arquitetura de Escala\n• Diretriz: 06 // REVOPS\n• Ação: Conheça a demonstração executiva em blklnk.com ou solicite o dossiê via mensagem direta.\n\n#BlackLink #EnterpriseB2B #EngenhariaDaAusencia #LiderancaB2B #HighTicket"
      },
      {
        "id": "post-bl-07",
        "theme": "Fechamento High-Ticket",
        "hookHeadline": "QUALIFICAÇÃO DE\nALTO TICKET",
        "bodyCopy": "Elimine o ruído de reuniões inúteis. Foque a energia dos seus closers apenas onde há margem de 5 a 6 dígitos.",
        "postCaption": "Elimine o ruído de reuniões inúteis.\n\nFoque a energia dos seus closers apenas onde há margem de 5 a 6 dígitos.\n\n#HighTicket #VendasEnterprise #BlackLink",
        "ctaText": "Eleve seu ticket médio.",
        "hashtags": [
          "#HighTicket",
          "#VendasEnterprise"
        ],
        "scheduledDate": "Domingo • 16:00",
        "blackLinkVariant": "3d-sculpture",
        "slides": [
          {
            "slideNumber": 1,
            "headline": "QUALIFICAÇÃO DE\nALTO TICKET",
            "bodyText": "Elimine curiosos. Fale apenas com quem tem orçamento e poder.",
            "tag": "07 // HIGH TICKET",
            "blackLinkVariant": "3d-sculpture",
            "imageUrl": "/brand/blacklink-art-macro-glass.jpg"
          }
        ],
        "linkedinPostText": "FECHAMENTO HIGH-TICKET // DIRETRIZ EXECUTIVA B2B\n\nElimine o ruído de reuniões inúteis. Foque a energia dos seus closers apenas onde há margem de 5 a 6 dígitos.\n\nNa Black Link (blklnk.com), operamos sob o princípio da Engenharia da Ausência: simplificamos a infraestrutura e elevamos o rigor técnico para que sua liderança foque estritamente no fechamento e na expansão de margem.\n\n• Solução: Black Link CRM OS | Arquitetura de Escala\n• Diretriz: 07 // HIGH TICKET\n• Ação: Conheça a demonstração executiva em blklnk.com ou solicite o dossiê via mensagem direta.\n\n#BlackLink #EnterpriseB2B #EngenhariaDaAusencia #LiderancaB2B #HighTicket"
      },
      {
        "id": "post-bl-08",
        "theme": "Relatórios Executivos",
        "hookHeadline": "DOSSIÊ EXECUTIVO\nDE ESCALA",
        "bodyCopy": "Relatórios que a diretoria e investidores compreendem em 30 segundos, sem decifrar fórmulas de planilha.",
        "postCaption": "Relatórios que a diretoria e investidores compreendem em 30 segundos, sem decifrar fórmulas de planilha.\n\nInteligência executiva com Black Link OS.\n\n#CLevel #Diretoria #EscalaB2B #BlackLink",
        "ctaText": "Relatórios executivos no perfil.",
        "hashtags": [
          "#CLevel",
          "#EscalaB2B"
        ],
        "scheduledDate": "Segunda • 08:30",
        "blackLinkVariant": "clean-ice",
        "slides": [
          {
            "slideNumber": 1,
            "headline": "DOSSIÊ EXECUTIVO\nDE ESCALA",
            "bodyText": "Relatórios que a diretoria entende sem decifrar planilhas.",
            "tag": "08 // GOVERNANÇA",
            "blackLinkVariant": "clean-ice",
            "imageUrl": "/brand/blacklink-art-obsidian-dark.jpg"
          }
        ],
        "linkedinPostText": "RELATÓRIOS EXECUTIVOS // DIRETRIZ EXECUTIVA B2B\n\nRelatórios que a diretoria e investidores compreendem em 30 segundos, sem decifrar fórmulas de planilha.\n\nNa Black Link (blklnk.com), operamos sob o princípio da Engenharia da Ausência: simplificamos a infraestrutura e elevamos o rigor técnico para que sua liderança foque estritamente no fechamento e na expansão de margem.\n\n• Solução: Black Link CRM OS | Arquitetura de Escala\n• Diretriz: 08 // GOVERNANÇA\n• Ação: Conheça a demonstração executiva em blklnk.com ou solicite o dossiê via mensagem direta.\n\n#BlackLink #EnterpriseB2B #EngenhariaDaAusencia #LiderancaB2B #HighTicket"
      },
      {
        "id": "post-bl-09",
        "theme": "Engenharia da Ausência",
        "hookHeadline": "ENGENHARIA DA\nAUSÊNCIA",
        "bodyCopy": "Sua equipe foca em construir relacionamentos e assinar termos. O software cuida da cadência, auditoria e telemetria.",
        "postCaption": "Sua equipe foca em construir relacionamentos e assinar termos.\n\nO software cuida da cadência, auditoria e telemetria.\n\nIsso é Engenharia da Ausência. Isso é Black Link.\n\n#EngenhariaDaAusencia #BlackLink #SaaS",
        "ctaText": "Visite blklnk.com e conheça a tese.",
        "hashtags": [
          "#EngenhariaDaAusencia",
          "#BlackLink"
        ],
        "scheduledDate": "Terça • 14:00",
        "blackLinkVariant": "clean-ice-box",
        "slides": [
          {
            "slideNumber": 1,
            "headline": "ENGENHARIA DA\nAUSÊNCIA",
            "bodyText": "Sua equipe foca em fechar contratos. O software cuida do resto.",
            "tag": "09 // FILOSOFIA",
            "blackLinkVariant": "clean-ice-box",
            "imageUrl": "/brand/blacklink-bg-square.jpg"
          }
        ],
        "linkedinPostText": "ENGENHARIA DA AUSÊNCIA // DIRETRIZ EXECUTIVA B2B\n\nSua equipe foca em construir relacionamentos e assinar termos. O software cuida da cadência, auditoria e telemetria.\n\nNa Black Link (blklnk.com), operamos sob o princípio da Engenharia da Ausência: simplificamos a infraestrutura e elevamos o rigor técnico para que sua liderança foque estritamente no fechamento e na expansão de margem.\n\n• Solução: Black Link CRM OS | Arquitetura de Escala\n• Diretriz: 09 // FILOSOFIA\n• Ação: Conheça a demonstração executiva em blklnk.com ou solicite o dossiê via mensagem direta.\n\n#BlackLink #EnterpriseB2B #EngenhariaDaAusencia #LiderancaB2B #HighTicket"
      }
    ]
  },
  {
    "id": "camp-automacoes-ia",
    "name": "Automações & IA | Operação Autônoma",
    "productId": "automacoes-ia",
    "badge": "🤖 Automações & IA",
    "headlineSummary": "Eliminação total de tarefas operacionais repetitivas via agentes e n8n.",
    "description": "Campanha que ataca o desperdício de tempo humano e lentidão de resposta aos leads qualificados.",
    "posts": [
      {
        "id": "post-bl-01",
        "theme": "Tempo de Resposta",
        "hookHeadline": "VELOCIDADE ZERO",
        "bodyCopy": "Leads que esperam mais de 5 minutos perdem 80% do interesse. Nossos agentes de IA qualificam em segundos.",
        "postCaption": "Leads que esperam mais de 5 minutos perdem 80% do interesse.\n\nNossos agentes de IA respondem, qualificam e agendam em segundos, 24 horas por dia.\n\nEnvie 'AUTOMAÇÃO' no Direct para auditar seu funil.\n\n#AgentesIA #AutomacaoOperacional #BlackLink #n8n",
        "ctaText": "Envie AUTOMAÇÃO no direct.",
        "hashtags": [
          "#AgentesIA",
          "#AutomacaoOperacional",
          "#BlackLink"
        ],
        "scheduledDate": "Segunda • 09:00",
        "blackLinkVariant": "swiss-box",
        "slides": [
          {
            "slideNumber": 1,
            "headline": "VELOCIDADE ZERO",
            "bodyText": "Primeira resposta ao lead em menos de 10 segundos com IA.",
            "tag": "01 // CADÊNCIA",
            "blackLinkVariant": "swiss-box",
            "imageUrl": "/brand/blacklink-art-glass-cube.jpg"
          }
        ],
        "linkedinPostText": "TEMPO DE RESPOSTA // DIRETRIZ EXECUTIVA B2B\n\nLeads que esperam mais de 5 minutos perdem 80% do interesse. Nossos agentes de IA qualificam em segundos.\n\nNa Black Link (blklnk.com), operamos sob o princípio da Engenharia da Ausência: simplificamos a infraestrutura e elevamos o rigor técnico para que sua liderança foque estritamente no fechamento e na expansão de margem.\n\n• Solução: Automações & IA | Operação Autônoma\n• Diretriz: 01 // CADÊNCIA\n• Ação: Conheça a demonstração executiva em blklnk.com ou solicite o dossiê via mensagem direta.\n\n#BlackLink #EnterpriseB2B #EngenhariaDaAusencia #LiderancaB2B #HighTicket"
      },
      {
        "id": "post-bl-02",
        "theme": "Trabalho Manual",
        "hookHeadline": "ZERO TRABALHO\nBRAÇAL",
        "bodyCopy": "Copiar dados do WhatsApp para o CRM é desperdício de intelecto. Automação de ponta a ponta sem falhas humanas.",
        "postCaption": "Copiar dados do WhatsApp para o CRM é desperdício de intelecto humano.\n\nImplementamos pipelines autônomos que sincronizam tudo em milissegundos.\n\n#OperacaoAutonoma #AutomacaoB2B #BlackLink",
        "ctaText": "Automatize sua operação.",
        "hashtags": [
          "#OperacaoAutonoma",
          "#AutomacaoB2B"
        ],
        "scheduledDate": "Terça • 12:00",
        "blackLinkVariant": "3d-keycap",
        "slides": [
          {
            "slideNumber": 1,
            "headline": "ZERO TRABALHO\nBRAÇAL",
            "bodyText": "Sincronização autônoma de dados entre canais e CRM.",
            "tag": "02 // DISPATCH",
            "blackLinkVariant": "3d-keycap",
            "imageUrl": "/brand/blacklink-art-fluid-metal.jpg"
          }
        ],
        "linkedinPostText": "TRABALHO MANUAL // DIRETRIZ EXECUTIVA B2B\n\nCopiar dados do WhatsApp para o CRM é desperdício de intelecto. Automação de ponta a ponta sem falhas humanas.\n\nNa Black Link (blklnk.com), operamos sob o princípio da Engenharia da Ausência: simplificamos a infraestrutura e elevamos o rigor técnico para que sua liderança foque estritamente no fechamento e na expansão de margem.\n\n• Solução: Automações & IA | Operação Autônoma\n• Diretriz: 02 // DISPATCH\n• Ação: Conheça a demonstração executiva em blklnk.com ou solicite o dossiê via mensagem direta.\n\n#BlackLink #EnterpriseB2B #EngenhariaDaAusencia #LiderancaB2B #HighTicket"
      },
      {
        "id": "post-bl-03",
        "theme": "Infraestrutura n8n",
        "hookHeadline": "FLUXOS N8N\nSOBERANOS",
        "bodyCopy": "Servidores proprietários e integrações robustas que nunca caem e não cobram por tarefa executada.",
        "postCaption": "Servidores proprietários e integrações robustas no n8n que nunca caem e não cobram por tarefa executada.\n\nSoberania técnica para empresas de alto volume.\n\n#n8n #Infraestrutura #BlackLink",
        "ctaText": "Soberania técnica em blklnk.com",
        "hashtags": [
          "#n8n",
          "#Infraestrutura"
        ],
        "scheduledDate": "Quarta • 15:30",
        "blackLinkVariant": "3d-crystal",
        "slides": [
          {
            "slideNumber": 1,
            "headline": "FLUXOS N8N\nSOBERANOS",
            "bodyText": "Arquitetura autônoma dedicada em servidores privados.",
            "tag": "03 // SERVIDORES",
            "blackLinkVariant": "3d-crystal",
            "imageUrl": "/brand/blacklink-art-dark-crystal.jpg"
          }
        ],
        "linkedinPostText": "INFRAESTRUTURA N8N // DIRETRIZ EXECUTIVA B2B\n\nServidores proprietários e integrações robustas que nunca caem e não cobram por tarefa executada.\n\nNa Black Link (blklnk.com), operamos sob o princípio da Engenharia da Ausência: simplificamos a infraestrutura e elevamos o rigor técnico para que sua liderança foque estritamente no fechamento e na expansão de margem.\n\n• Solução: Automações & IA | Operação Autônoma\n• Diretriz: 03 // SERVIDORES\n• Ação: Conheça a demonstração executiva em blklnk.com ou solicite o dossiê via mensagem direta.\n\n#BlackLink #EnterpriseB2B #EngenhariaDaAusencia #LiderancaB2B #HighTicket"
      },
      {
        "id": "post-bl-04",
        "theme": "Follow-up Implacável",
        "hookHeadline": "FOLLOW-UP\nIMPLACÁVEL",
        "bodyCopy": "70% das vendas são perdidas por esquecimento de follow-up. Agentes autônomos nunca esquecem de nutrir o lead.",
        "postCaption": "70% das vendas são perdidas por esquecimento de follow-up.\n\nNossos agentes autônomos nutrem leads na cadência exata sem soar como spam.\n\n#VendasAutonomas #CadenciaComercial #BlackLink",
        "ctaText": "Conheça o sistema no perfil.",
        "hashtags": [
          "#VendasAutonomas",
          "#BlackLink"
        ],
        "scheduledDate": "Quinta • 10:00",
        "blackLinkVariant": "pure-monumental",
        "slides": [
          {
            "slideNumber": 1,
            "headline": "FOLLOW-UP\nIMPLACÁVEL",
            "bodyText": "Nutrição e reengajamento inteligente sem intervenção manual.",
            "tag": "04 // CADÊNCIA",
            "blackLinkVariant": "pure-monumental",
            "imageUrl": "/brand/blacklink-chain.jpg"
          }
        ],
        "linkedinPostText": "FOLLOW-UP IMPLACÁVEL // DIRETRIZ EXECUTIVA B2B\n\n70% das vendas são perdidas por esquecimento de follow-up. Agentes autônomos nunca esquecem de nutrir o lead.\n\nNa Black Link (blklnk.com), operamos sob o princípio da Engenharia da Ausência: simplificamos a infraestrutura e elevamos o rigor técnico para que sua liderança foque estritamente no fechamento e na expansão de margem.\n\n• Solução: Automações & IA | Operação Autônoma\n• Diretriz: 04 // CADÊNCIA\n• Ação: Conheça a demonstração executiva em blklnk.com ou solicite o dossiê via mensagem direta.\n\n#BlackLink #EnterpriseB2B #EngenhariaDaAusencia #LiderancaB2B #HighTicket"
      },
      {
        "id": "post-bl-05",
        "theme": "IA Operacional",
        "hookHeadline": "AGENTE IA\nOPERACIONAL",
        "bodyCopy": "Não é chatbot genérico. É um cérebro treinado na sua tese de negócios que analisa e decide ações no funil.",
        "postCaption": "Não é chatbot genérico.\n\nÉ um cérebro treinado na sua tese comercial que analisa o tom do lead e despacha para o closer ideal.\n\n#AgentesIA #InteligenciaArtificial #BlackLink",
        "ctaText": "Audite seu processo em blklnk.com",
        "hashtags": [
          "#AgentesIA",
          "#BlackLink"
        ],
        "scheduledDate": "Sexta • 18:00",
        "blackLinkVariant": "3d-cursor",
        "slides": [
          {
            "slideNumber": 1,
            "headline": "AGENTE IA\nOPERACIONAL",
            "bodyText": "Triagem cognitiva e qualificação sem formulários chatos.",
            "tag": "05 // NEVRÁLGICO",
            "blackLinkVariant": "3d-cursor",
            "imageUrl": "/brand/blacklink-3d-liquid.jpg"
          }
        ],
        "linkedinPostText": "IA OPERACIONAL // DIRETRIZ EXECUTIVA B2B\n\nNão é chatbot genérico. É um cérebro treinado na sua tese de negócios que analisa e decide ações no funil.\n\nNa Black Link (blklnk.com), operamos sob o princípio da Engenharia da Ausência: simplificamos a infraestrutura e elevamos o rigor técnico para que sua liderança foque estritamente no fechamento e na expansão de margem.\n\n• Solução: Automações & IA | Operação Autônoma\n• Diretriz: 05 // NEVRÁLGICO\n• Ação: Conheça a demonstração executiva em blklnk.com ou solicite o dossiê via mensagem direta.\n\n#BlackLink #EnterpriseB2B #EngenhariaDaAusencia #LiderancaB2B #HighTicket"
      },
      {
        "id": "post-bl-06",
        "theme": "Eliminação de Erros",
        "hookHeadline": "PRECISÃO\nCIRÚRGICA",
        "bodyCopy": "Erros de preenchimento e dados duplicados destroem relatórios. A IA higieniza e valida todas as informações.",
        "postCaption": "Erros de preenchimento e dados duplicados destroem relatórios executivos.\n\nA IA higieniza e valida todas as informações antes de gravar no banco.\n\n#DataHygiene #QualidadeDeDados #BlackLink",
        "ctaText": "Descubra a precisão Black Link.",
        "hashtags": [
          "#DataHygiene",
          "#BlackLink"
        ],
        "scheduledDate": "Sábado • 11:00",
        "blackLinkVariant": "3d-liquid",
        "slides": [
          {
            "slideNumber": 1,
            "headline": "PRECISÃO\nCIRÚRGICA",
            "bodyText": "Higienização contínua de base e enriquecimento automático.",
            "tag": "06 // HIGIENE",
            "blackLinkVariant": "3d-liquid",
            "imageUrl": "/brand/blacklink-3d-cursor.jpg"
          }
        ],
        "linkedinPostText": "ELIMINAÇÃO DE ERROS // DIRETRIZ EXECUTIVA B2B\n\nErros de preenchimento e dados duplicados destroem relatórios. A IA higieniza e valida todas as informações.\n\nNa Black Link (blklnk.com), operamos sob o princípio da Engenharia da Ausência: simplificamos a infraestrutura e elevamos o rigor técnico para que sua liderança foque estritamente no fechamento e na expansão de margem.\n\n• Solução: Automações & IA | Operação Autônoma\n• Diretriz: 06 // HIGIENE\n• Ação: Conheça a demonstração executiva em blklnk.com ou solicite o dossiê via mensagem direta.\n\n#BlackLink #EnterpriseB2B #EngenhariaDaAusencia #LiderancaB2B #HighTicket"
      },
      {
        "id": "post-bl-07",
        "theme": "Redução de Custo",
        "hookHeadline": "REDUÇÃO DE\nCUSTO FIXO",
        "bodyCopy": "Escale o volume de prospecção em 10x sem dobrar a folha de pagamento de analistas juniores.",
        "postCaption": "Escale o volume de prospecção em 10x sem dobrar a folha de pagamento de analistas juniores.\n\nAutonomia operacional é vantagem competitiva inegociável.\n\n#MargemOperacional #EficienciaB2B #BlackLink",
        "ctaText": "Escale com margem em blklnk.com",
        "hashtags": [
          "#MargemOperacional",
          "#BlackLink"
        ],
        "scheduledDate": "Domingo • 16:00",
        "blackLinkVariant": "3d-sculpture",
        "slides": [
          {
            "slideNumber": 1,
            "headline": "REDUÇÃO DE\nCUSTO FIXO",
            "bodyText": "Multiplique sua capacidade de atendimento sem inflar a folha.",
            "tag": "07 // ESCALA",
            "blackLinkVariant": "3d-sculpture",
            "imageUrl": "/brand/blacklink-3d-crystal.jpg"
          }
        ],
        "linkedinPostText": "REDUÇÃO DE CUSTO // DIRETRIZ EXECUTIVA B2B\n\nEscale o volume de prospecção em 10x sem dobrar a folha de pagamento de analistas juniores.\n\nNa Black Link (blklnk.com), operamos sob o princípio da Engenharia da Ausência: simplificamos a infraestrutura e elevamos o rigor técnico para que sua liderança foque estritamente no fechamento e na expansão de margem.\n\n• Solução: Automações & IA | Operação Autônoma\n• Diretriz: 07 // ESCALA\n• Ação: Conheça a demonstração executiva em blklnk.com ou solicite o dossiê via mensagem direta.\n\n#BlackLink #EnterpriseB2B #EngenhariaDaAusencia #LiderancaB2B #HighTicket"
      },
      {
        "id": "post-bl-08",
        "theme": "Auditoria de Processos",
        "hookHeadline": "DIAGNÓSTICO DE\nGARGALOS",
        "bodyCopy": "Mapeie exatamente onde a sua operação gasta mais tempo e substitua cada ponto de fricção por código.",
        "postCaption": "Mapeie exatamente onde a sua equipe gasta mais tempo e substitua cada ponto de fricção por código.\n\nSolicite auditoria de processos via Direct.\n\n#Auditoria #ProcessosB2B #BlackLink",
        "ctaText": "Auditoria gratuita no direct.",
        "hashtags": [
          "#Auditoria",
          "#BlackLink"
        ],
        "scheduledDate": "Segunda • 08:30",
        "blackLinkVariant": "clean-ice",
        "slides": [
          {
            "slideNumber": 1,
            "headline": "DIAGNÓSTICO DE\nGARGALOS",
            "bodyText": "Substituição pontual de fricção humana por código autônomo.",
            "tag": "08 // AUDITORIA",
            "blackLinkVariant": "clean-ice",
            "imageUrl": "/brand/blacklink-art-macro-glass.jpg"
          }
        ],
        "linkedinPostText": "AUDITORIA DE PROCESSOS // DIRETRIZ EXECUTIVA B2B\n\nMapeie exatamente onde a sua operação gasta mais tempo e substitua cada ponto de fricção por código.\n\nNa Black Link (blklnk.com), operamos sob o princípio da Engenharia da Ausência: simplificamos a infraestrutura e elevamos o rigor técnico para que sua liderança foque estritamente no fechamento e na expansão de margem.\n\n• Solução: Automações & IA | Operação Autônoma\n• Diretriz: 08 // AUDITORIA\n• Ação: Conheça a demonstração executiva em blklnk.com ou solicite o dossiê via mensagem direta.\n\n#BlackLink #EnterpriseB2B #EngenhariaDaAusencia #LiderancaB2B #HighTicket"
      },
      {
        "id": "post-bl-09",
        "theme": "Autonomia Total",
        "hookHeadline": "OPERAÇÃO EM\nPILOTO AUTOMÁTICO",
        "bodyCopy": "Quando os sistemas conversam entre si, o fundador volta a pensar apenas na estratégia e nos grandes contratos.",
        "postCaption": "Quando os sistemas conversam entre si, o fundador volta a pensar apenas na estratégia e nos grandes contratos.\n\nIsso é Engenharia da Ausência.\n\n#BlackLink #Autonomia #HighTicket",
        "ctaText": "Visite blklnk.com/protocolo",
        "hashtags": [
          "#BlackLink #Autonomia"
        ],
        "scheduledDate": "Terça • 14:00",
        "blackLinkVariant": "clean-ice-box",
        "slides": [
          {
            "slideNumber": 1,
            "headline": "OPERAÇÃO EM\nPILOTO AUTOMÁTICO",
            "bodyText": "Sua empresa rodando com precisão de software 24/7.",
            "tag": "09 // SOBERANIA",
            "blackLinkVariant": "clean-ice-box",
            "imageUrl": "/brand/blacklink-art-obsidian-dark.jpg"
          }
        ],
        "linkedinPostText": "AUTONOMIA TOTAL // DIRETRIZ EXECUTIVA B2B\n\nQuando os sistemas conversam entre si, o fundador volta a pensar apenas na estratégia e nos grandes contratos.\n\nNa Black Link (blklnk.com), operamos sob o princípio da Engenharia da Ausência: simplificamos a infraestrutura e elevamos o rigor técnico para que sua liderança foque estritamente no fechamento e na expansão de margem.\n\n• Solução: Automações & IA | Operação Autônoma\n• Diretriz: 09 // SOBERANIA\n• Ação: Conheça a demonstração executiva em blklnk.com ou solicite o dossiê via mensagem direta.\n\n#BlackLink #EnterpriseB2B #EngenhariaDaAusencia #LiderancaB2B #HighTicket"
      }
    ]
  },
  {
    "id": "camp-marketing-branding",
    "name": "Marketing & Branding Soberano",
    "productId": "marketing-branding",
    "badge": "👑 Branding Soberano",
    "headlineSummary": "Posicionamento internacional para sair da guerra de preços e atrair alto valor.",
    "description": "Campanha contra o design amador e a comunicação genérica que desvaloriza o ticket de empresas B2B.",
    "posts": [
      {
        "id": "post-bl-01",
        "theme": "Percepção de Valor",
        "hookHeadline": "FIM DO DESIGN\nGENÉRICO",
        "bodyCopy": "Empresas com soluções milionárias não podem ter visual de agência amadora. Sua estética precisa impor respeito imediato.",
        "postCaption": "Empresas com soluções de alto ticket não podem ter visual de template amador.\n\nSua estética precisa impor respeito antes mesmo de você abrir a boca na reunião.\n\nComente 'SOBERANIA' para receber nosso manifesto visual.\n\n#DesignSoberano #BrandingB2B #BlackLink #HighTicket",
        "ctaText": "Comente SOBERANIA no direct.",
        "hashtags": [
          "#DesignSoberano",
          "#BrandingB2B"
        ],
        "scheduledDate": "Segunda • 09:00",
        "blackLinkVariant": "swiss-box",
        "slides": [
          {
            "slideNumber": 1,
            "headline": "FIM DO DESIGN\nGENÉRICO",
            "bodyText": "Estética internacional que elimina pedidos de desconto.",
            "tag": "01 // POSICIONAMENTO",
            "blackLinkVariant": "swiss-box",
            "imageUrl": "/brand/blacklink-art-portrait.jpg"
          }
        ],
        "linkedinPostText": "PERCEPÇÃO DE VALOR // DIRETRIZ EXECUTIVA B2B\n\nEmpresas com soluções milionárias não podem ter visual de agência amadora. Sua estética precisa impor respeito imediato.\n\nNa Black Link (blklnk.com), operamos sob o princípio da Engenharia da Ausência: simplificamos a infraestrutura e elevamos o rigor técnico para que sua liderança foque estritamente no fechamento e na expansão de margem.\n\n• Solução: Marketing & Branding Soberano\n• Diretriz: 01 // POSICIONAMENTO\n• Ação: Conheça a demonstração executiva em blklnk.com ou solicite o dossiê via mensagem direta.\n\n#BlackLink #EnterpriseB2B #EngenhariaDaAusencia #LiderancaB2B #HighTicket"
      },
      {
        "id": "post-bl-02",
        "theme": "Poder de Precificação",
        "hookHeadline": "PODER DE\nPRECIFICAÇÃO",
        "bodyCopy": "Quem tem presença comum compete por centavos. Quem tem posicionamento soberano define as regras do mercado.",
        "postCaption": "Quem tem presença comum compete por centavos.\n\nQuem tem posicionamento soberano define as regras e o preço do mercado.\n\n#Posicionamento #AltaAutoridade #BlackLink",
        "ctaText": "Eleve seu ticket médio.",
        "hashtags": [
          "#Posicionamento",
          "#AltaAutoridade"
        ],
        "scheduledDate": "Terça • 12:00",
        "blackLinkVariant": "3d-keycap",
        "slides": [
          {
            "slideNumber": 1,
            "headline": "PODER DE\nPRECIFICAÇÃO",
            "bodyText": "A percepção de autoridade dita o teto do seu faturamento.",
            "tag": "02 // VALOR",
            "blackLinkVariant": "3d-keycap",
            "imageUrl": "/brand/blacklink-art-pins.jpg"
          }
        ],
        "linkedinPostText": "PODER DE PRECIFICAÇÃO // DIRETRIZ EXECUTIVA B2B\n\nQuem tem presença comum compete por centavos. Quem tem posicionamento soberano define as regras do mercado.\n\nNa Black Link (blklnk.com), operamos sob o princípio da Engenharia da Ausência: simplificamos a infraestrutura e elevamos o rigor técnico para que sua liderança foque estritamente no fechamento e na expansão de margem.\n\n• Solução: Marketing & Branding Soberano\n• Diretriz: 02 // VALOR\n• Ação: Conheça a demonstração executiva em blklnk.com ou solicite o dossiê via mensagem direta.\n\n#BlackLink #EnterpriseB2B #EngenhariaDaAusencia #LiderancaB2B #HighTicket"
      },
      {
        "id": "post-bl-03",
        "theme": "Direção de Arte Suíça",
        "hookHeadline": "RIGOR TIPOGRÁFICO\nINTERNACIONAL",
        "bodyCopy": "Brutalismo suíço, contrastes puros e ausência de ruído. A linguagem dos maiores conglomerados globais.",
        "postCaption": "Brutalismo suíço, contrastes puros e ausência de ruído.\n\nA linguagem visual que os decisores globais respeitam e confiam.\n\n#DirecaoDeArte #DesignInternacional #BlackLink",
        "ctaText": "Conheça nosso estúdio.",
        "hashtags": [
          "#DirecaoDeArte",
          "#BlackLink"
        ],
        "scheduledDate": "Quarta • 15:30",
        "blackLinkVariant": "3d-crystal",
        "slides": [
          {
            "slideNumber": 1,
            "headline": "RIGOR TIPOGRÁFICO\nINTERNACIONAL",
            "bodyText": "A estética dos conglomerados globais adaptada ao seu B2B.",
            "tag": "03 // ESTÉTICA",
            "blackLinkVariant": "3d-crystal",
            "imageUrl": "/brand/blacklink-art-glass-model.jpg"
          }
        ],
        "linkedinPostText": "DIREÇÃO DE ARTE SUÍÇA // DIRETRIZ EXECUTIVA B2B\n\nBrutalismo suíço, contrastes puros e ausência de ruído. A linguagem dos maiores conglomerados globais.\n\nNa Black Link (blklnk.com), operamos sob o princípio da Engenharia da Ausência: simplificamos a infraestrutura e elevamos o rigor técnico para que sua liderança foque estritamente no fechamento e na expansão de margem.\n\n• Solução: Marketing & Branding Soberano\n• Diretriz: 03 // ESTÉTICA\n• Ação: Conheça a demonstração executiva em blklnk.com ou solicite o dossiê via mensagem direta.\n\n#BlackLink #EnterpriseB2B #EngenhariaDaAusencia #LiderancaB2B #HighTicket"
      },
      {
        "id": "post-bl-04",
        "theme": "Autoridade Instantânea",
        "hookHeadline": "AUTORIDADE\nINEGOCIÁVEL",
        "bodyCopy": "Você não precisa convencer ninguém quando sua presença digital já comunica excelência antes do aperto de mãos.",
        "postCaption": "Você não precisa convencer ninguém quando sua presença digital já comunica excelência antes do aperto de mãos.\n\n#AutoridadeB2B #HighTicket #BlackLink",
        "ctaText": "Manifesto visual em blklnk.com",
        "hashtags": [
          "#AutoridadeB2B",
          "#HighTicket"
        ],
        "scheduledDate": "Quinta • 10:00",
        "blackLinkVariant": "pure-monumental",
        "slides": [
          {
            "slideNumber": 1,
            "headline": "AUTORIDADE\nINEGOCIÁVEL",
            "bodyText": "Credibilidade imediata antes mesmo da primeira conversa.",
            "tag": "04 // MANIFESTO",
            "blackLinkVariant": "pure-monumental",
            "imageUrl": "/brand/blacklink-art-fluid-metal.jpg"
          }
        ],
        "linkedinPostText": "AUTORIDADE INSTANTÂNEA // DIRETRIZ EXECUTIVA B2B\n\nVocê não precisa convencer ninguém quando sua presença digital já comunica excelência antes do aperto de mãos.\n\nNa Black Link (blklnk.com), operamos sob o princípio da Engenharia da Ausência: simplificamos a infraestrutura e elevamos o rigor técnico para que sua liderança foque estritamente no fechamento e na expansão de margem.\n\n• Solução: Marketing & Branding Soberano\n• Diretriz: 04 // MANIFESTO\n• Ação: Conheça a demonstração executiva em blklnk.com ou solicite o dossiê via mensagem direta.\n\n#BlackLink #EnterpriseB2B #EngenhariaDaAusencia #LiderancaB2B #HighTicket"
      },
      {
        "id": "post-bl-05",
        "theme": "Sistemas de Marca",
        "hookHeadline": "SISTEMA VISUAL\nIMPERMEÁVEL",
        "bodyCopy": "Manuais de marca que não são apenas PDFs bonitos, mas um ecossistema visual consistente em todos os pontos de contato.",
        "postCaption": "Manuais de marca que não são apenas PDFs bonitos, mas um ecossistema visual consistente em todos os pontos de contato.\n\n#BrandSystem #IdentidadeVisual #BlackLink",
        "ctaText": "Explore nossos sistemas.",
        "hashtags": [
          "#BrandSystem",
          "#IdentidadeVisual"
        ],
        "scheduledDate": "Sexta • 18:00",
        "blackLinkVariant": "3d-cursor",
        "slides": [
          {
            "slideNumber": 1,
            "headline": "SISTEMA VISUAL\nIMPERMEÁVEL",
            "bodyText": "Coerência absoluta do Instagram à proposta comercial.",
            "tag": "05 // SISTEMA",
            "blackLinkVariant": "3d-cursor",
            "imageUrl": "/brand/blacklink-art-cursor-light.jpg"
          }
        ],
        "linkedinPostText": "SISTEMAS DE MARCA // DIRETRIZ EXECUTIVA B2B\n\nManuais de marca que não são apenas PDFs bonitos, mas um ecossistema visual consistente em todos os pontos de contato.\n\nNa Black Link (blklnk.com), operamos sob o princípio da Engenharia da Ausência: simplificamos a infraestrutura e elevamos o rigor técnico para que sua liderança foque estritamente no fechamento e na expansão de margem.\n\n• Solução: Marketing & Branding Soberano\n• Diretriz: 05 // SISTEMA\n• Ação: Conheça a demonstração executiva em blklnk.com ou solicite o dossiê via mensagem direta.\n\n#BlackLink #EnterpriseB2B #EngenhariaDaAusencia #LiderancaB2B #HighTicket"
      },
      {
        "id": "post-bl-06",
        "theme": "Eliminação de Clichês",
        "hookHeadline": "ZERO CLICHÊS\nDE MARKETING",
        "bodyCopy": "Sem dancinhas, sem frases prontas de autoajuda e sem clichês de afiliados. Apenas substância e impacto institucional.",
        "postCaption": "Sem dancinhas, sem frases prontas de autoajuda e sem clichês de afiliados.\n\nApenas substância, engenharia e autoridade institucional.\n\n#MarketingSoberano #BlackLink",
        "ctaText": "Conheça nossa filosofia.",
        "hashtags": [
          "#MarketingSoberano",
          "#BlackLink"
        ],
        "scheduledDate": "Sábado • 11:00",
        "blackLinkVariant": "3d-liquid",
        "slides": [
          {
            "slideNumber": 1,
            "headline": "ZERO CLICHÊS\nDE MARKETING",
            "bodyText": "Comunicação executiva que atrai diretores e investidores.",
            "tag": "06 // SOBRIEDADE",
            "blackLinkVariant": "3d-liquid",
            "imageUrl": "/brand/blacklink-art-dark-crystal.jpg"
          }
        ],
        "linkedinPostText": "ELIMINAÇÃO DE CLICHÊS // DIRETRIZ EXECUTIVA B2B\n\nSem dancinhas, sem frases prontas de autoajuda e sem clichês de afiliados. Apenas substância e impacto institucional.\n\nNa Black Link (blklnk.com), operamos sob o princípio da Engenharia da Ausência: simplificamos a infraestrutura e elevamos o rigor técnico para que sua liderança foque estritamente no fechamento e na expansão de margem.\n\n• Solução: Marketing & Branding Soberano\n• Diretriz: 06 // SOBRIEDADE\n• Ação: Conheça a demonstração executiva em blklnk.com ou solicite o dossiê via mensagem direta.\n\n#BlackLink #EnterpriseB2B #EngenhariaDaAusencia #LiderancaB2B #HighTicket"
      },
      {
        "id": "post-bl-07",
        "theme": "Conversão Elegante",
        "hookHeadline": "CONVERSÃO SEM\nDESESPERO",
        "bodyCopy": "Marcas maduras não imploram por clientes. Elas criam um magnetismo que faz os melhores negócios virem até elas.",
        "postCaption": "Marcas maduras não imploram por clientes.\n\nElas criam um magnetismo que faz os melhores negócios virem até elas.\n\n#InboundEnterprise #AltaConversao #BlackLink",
        "ctaText": "Atraia clientes de alto valor.",
        "hashtags": [
          "#InboundEnterprise",
          "#BlackLink"
        ],
        "scheduledDate": "Domingo • 16:00",
        "blackLinkVariant": "3d-sculpture",
        "slides": [
          {
            "slideNumber": 1,
            "headline": "CONVERSÃO SEM\nDESESPERO",
            "bodyText": "Magnetismo comercial baseado em excelência comprovada.",
            "tag": "07 // MAGNETISMO",
            "blackLinkVariant": "3d-sculpture",
            "imageUrl": "/brand/blacklink-art-macro-glass.jpg"
          }
        ],
        "linkedinPostText": "CONVERSÃO ELEGANTE // DIRETRIZ EXECUTIVA B2B\n\nMarcas maduras não imploram por clientes. Elas criam um magnetismo que faz os melhores negócios virem até elas.\n\nNa Black Link (blklnk.com), operamos sob o princípio da Engenharia da Ausência: simplificamos a infraestrutura e elevamos o rigor técnico para que sua liderança foque estritamente no fechamento e na expansão de margem.\n\n• Solução: Marketing & Branding Soberano\n• Diretriz: 07 // MAGNETISMO\n• Ação: Conheça a demonstração executiva em blklnk.com ou solicite o dossiê via mensagem direta.\n\n#BlackLink #EnterpriseB2B #EngenhariaDaAusencia #LiderancaB2B #HighTicket"
      },
      {
        "id": "post-bl-08",
        "theme": "Ativos Perenes",
        "hookHeadline": "ATIVOS DE MÍDIA\nPERENES",
        "bodyCopy": "Construa criativos e carrosséis que continuam gerando autoridade e conversões meses após a publicação.",
        "postCaption": "Construa criativos e carrosséis que continuam gerando autoridade e conversões meses após a publicação.\n\n#ConteudoPerene #AtivosDigitais #BlackLink",
        "ctaText": "Construa ativos perenes.",
        "hashtags": [
          "#ConteudoPerene",
          "#BlackLink"
        ],
        "scheduledDate": "Segunda • 08:30",
        "blackLinkVariant": "clean-ice",
        "slides": [
          {
            "slideNumber": 1,
            "headline": "ATIVOS DE MÍDIA\nPERENES",
            "bodyText": "Comunicação duradoura que não expira em 24 horas.",
            "tag": "08 // DURABILIDADE",
            "blackLinkVariant": "clean-ice",
            "imageUrl": "/brand/blacklink-chain.jpg"
          }
        ],
        "linkedinPostText": "ATIVOS PERENES // DIRETRIZ EXECUTIVA B2B\n\nConstrua criativos e carrosséis que continuam gerando autoridade e conversões meses após a publicação.\n\nNa Black Link (blklnk.com), operamos sob o princípio da Engenharia da Ausência: simplificamos a infraestrutura e elevamos o rigor técnico para que sua liderança foque estritamente no fechamento e na expansão de margem.\n\n• Solução: Marketing & Branding Soberano\n• Diretriz: 08 // DURABILIDADE\n• Ação: Conheça a demonstração executiva em blklnk.com ou solicite o dossiê via mensagem direta.\n\n#BlackLink #EnterpriseB2B #EngenhariaDaAusencia #LiderancaB2B #HighTicket"
      },
      {
        "id": "post-bl-09",
        "theme": "Engenharia Estética",
        "hookHeadline": "ESTÉTICA DE\nULTRA-LUXO",
        "bodyCopy": "A união entre design industrial e tecnologia proprietária. O padrão definitivo da Black Link.",
        "postCaption": "A união entre design industrial e tecnologia proprietária.\n\nO padrão definitivo da Black Link.\n\n#UltraLuxo #BlackLink #Branding",
        "ctaText": "Visite blklnk.com/contact",
        "hashtags": [
          "#UltraLuxo",
          "#BlackLink"
        ],
        "scheduledDate": "Terça • 14:00",
        "blackLinkVariant": "clean-ice-box",
        "slides": [
          {
            "slideNumber": 1,
            "headline": "ESTÉTICA DE\nULTRA-LUXO",
            "bodyText": "A assinatura visual que consolida sua liderança de nicho.",
            "tag": "09 // SOBERANIA",
            "blackLinkVariant": "clean-ice-box",
            "imageUrl": "/brand/blacklink-bg-square.jpg"
          }
        ],
        "linkedinPostText": "ENGENHARIA ESTÉTICA // DIRETRIZ EXECUTIVA B2B\n\nA união entre design industrial e tecnologia proprietária. O padrão definitivo da Black Link.\n\nNa Black Link (blklnk.com), operamos sob o princípio da Engenharia da Ausência: simplificamos a infraestrutura e elevamos o rigor técnico para que sua liderança foque estritamente no fechamento e na expansão de margem.\n\n• Solução: Marketing & Branding Soberano\n• Diretriz: 09 // SOBERANIA\n• Ação: Conheça a demonstração executiva em blklnk.com ou solicite o dossiê via mensagem direta.\n\n#BlackLink #EnterpriseB2B #EngenhariaDaAusencia #LiderancaB2B #HighTicket"
      }
    ]
  },
  {
    "id": "camp-protocolo-simulador",
    "name": "Protocolo Black Link | Simulador de Projeto",
    "productId": "protocolo-simulador",
    "badge": "📐 Protocolo Simulador",
    "headlineSummary": "Auditoria arquitetônica e simulação gratuita de escala em blklnk.com/protocolo.",
    "description": "Campanha que convida decisores a realizarem o diagnóstico interativo de suas operações.",
    "posts": [
      {
        "id": "post-bl-01",
        "theme": "Diagnóstico Operacional",
        "hookHeadline": "DIAGNÓSTICO\nARQUITETÔNICO",
        "bodyCopy": "Antes de contratar qualquer software ou equipe, descubra o mapa exato de gargalos e oportunidades da sua empresa.",
        "postCaption": "Antes de contratar qualquer software ou equipe, descubra o mapa exato de gargalos da sua operação.\n\nSimule gratuitamente a rota de escala em blklnk.com/protocolo.\n\n#ProtocoloBlackLink #SimuladorB2B #Diagnostico #Escala",
        "ctaText": "Simule em blklnk.com/protocolo",
        "hashtags": [
          "#ProtocoloBlackLink",
          "#SimuladorB2B"
        ],
        "scheduledDate": "Segunda • 09:00",
        "blackLinkVariant": "swiss-box",
        "slides": [
          {
            "slideNumber": 1,
            "headline": "DIAGNÓSTICO\nARQUITETÔNICO",
            "bodyText": "Mapeamento completo antes de qualquer investimento.",
            "tag": "01 // AUDITORIA",
            "blackLinkVariant": "swiss-box",
            "imageUrl": "/brand/blacklink-art-glass-cube.jpg"
          }
        ],
        "linkedinPostText": "DIAGNÓSTICO OPERACIONAL // DIRETRIZ EXECUTIVA B2B\n\nAntes de contratar qualquer software ou equipe, descubra o mapa exato de gargalos e oportunidades da sua empresa.\n\nNa Black Link (blklnk.com), operamos sob o princípio da Engenharia da Ausência: simplificamos a infraestrutura e elevamos o rigor técnico para que sua liderança foque estritamente no fechamento e na expansão de margem.\n\n• Solução: Protocolo Black Link | Simulador de Projeto\n• Diretriz: 01 // AUDITORIA\n• Ação: Conheça a demonstração executiva em blklnk.com ou solicite o dossiê via mensagem direta.\n\n#BlackLink #EnterpriseB2B #EngenhariaDaAusencia #LiderancaB2B #HighTicket"
      },
      {
        "id": "post-bl-02",
        "theme": "Simulador de Escala",
        "hookHeadline": "SIMULE SEU PROJETO\nEM 3 MINUTOS",
        "bodyCopy": "Insira suas métricas de vendas e receba um dossiê com a estrutura recomendada de CRM, automações e branding.",
        "postCaption": "Insira suas métricas de vendas e receba um dossiê com a estrutura recomendada.\n\nAcesse blklnk.com/protocolo e faça sua simulação.\n\n#SimuladorDeProjeto #BlackLink #InteligenciaB2B",
        "ctaText": "Acesse o simulador no perfil.",
        "hashtags": [
          "#SimuladorDeProjeto",
          "#BlackLink"
        ],
        "scheduledDate": "Terça • 12:00",
        "blackLinkVariant": "3d-keycap",
        "slides": [
          {
            "slideNumber": 1,
            "headline": "SIMULE SEU PROJETO\nEM 3 MINUTOS",
            "bodyText": "Dossiê instantâneo de infraestrutura necessária para escalar.",
            "tag": "02 // SIMULADOR",
            "blackLinkVariant": "3d-keycap",
            "imageUrl": "/brand/blacklink-3d-keycap.jpg"
          }
        ],
        "linkedinPostText": "SIMULADOR DE ESCALA // DIRETRIZ EXECUTIVA B2B\n\nInsira suas métricas de vendas e receba um dossiê com a estrutura recomendada de CRM, automações e branding.\n\nNa Black Link (blklnk.com), operamos sob o princípio da Engenharia da Ausência: simplificamos a infraestrutura e elevamos o rigor técnico para que sua liderança foque estritamente no fechamento e na expansão de margem.\n\n• Solução: Protocolo Black Link | Simulador de Projeto\n• Diretriz: 02 // SIMULADOR\n• Ação: Conheça a demonstração executiva em blklnk.com ou solicite o dossiê via mensagem direta.\n\n#BlackLink #EnterpriseB2B #EngenhariaDaAusencia #LiderancaB2B #HighTicket"
      },
      {
        "id": "post-bl-03",
        "theme": "Eliminação do Achismo",
        "hookHeadline": "DECISÕES BASEADAS\nEM MATEMÁTICA",
        "bodyCopy": "Pare de tentar adivinhar se precisa de mais vendedores ou de melhor software. O Protocolo calcula o ROI exato.",
        "postCaption": "Pare de tentar adivinhar se precisa de mais vendedores ou de melhor software.\n\nO Protocolo Black Link calcula o retorno exato de cada movimento.\n\n#DecisoesComerciais #RevOps #BlackLink",
        "ctaText": "Calcule seu ROI no protocolo.",
        "hashtags": [
          "#DecisoesComerciais",
          "#BlackLink"
        ],
        "scheduledDate": "Quarta • 15:30",
        "blackLinkVariant": "3d-crystal",
        "slides": [
          {
            "slideNumber": 1,
            "headline": "DECISÕES BASEADAS\nEM MATEMÁTICA",
            "bodyText": "Fim do achismo comercial. Telemetria orientada a dados.",
            "tag": "03 // DADOS",
            "blackLinkVariant": "3d-crystal",
            "imageUrl": "/brand/blacklink-art-dark-crystal.jpg"
          }
        ],
        "linkedinPostText": "ELIMINAÇÃO DO ACHISMO // DIRETRIZ EXECUTIVA B2B\n\nPare de tentar adivinhar se precisa de mais vendedores ou de melhor software. O Protocolo calcula o ROI exato.\n\nNa Black Link (blklnk.com), operamos sob o princípio da Engenharia da Ausência: simplificamos a infraestrutura e elevamos o rigor técnico para que sua liderança foque estritamente no fechamento e na expansão de margem.\n\n• Solução: Protocolo Black Link | Simulador de Projeto\n• Diretriz: 03 // DADOS\n• Ação: Conheça a demonstração executiva em blklnk.com ou solicite o dossiê via mensagem direta.\n\n#BlackLink #EnterpriseB2B #EngenhariaDaAusencia #LiderancaB2B #HighTicket"
      },
      {
        "id": "post-bl-04",
        "theme": "Orçamento sem Desperdício",
        "hookHeadline": "ALOCAÇÃO CIRÚRGICA\nDE CAPITAL",
        "bodyCopy": "Não gaste 1 real em marketing antes de ter a esteira de conversão e fechamento plenamente blindada.",
        "postCaption": "Não gaste 1 real em marketing antes de ter a esteira de fechamento plenamente blindada.\n\nDescubra onde alocar capital em blklnk.com/protocolo.\n\n#AlocacaoDeCapital #EficienciaComercial #BlackLink",
        "ctaText": "Blindagem comercial em blklnk.com",
        "hashtags": [
          "#AlocacaoDeCapital",
          "#BlackLink"
        ],
        "scheduledDate": "Quinta • 10:00",
        "blackLinkVariant": "pure-monumental",
        "slides": [
          {
            "slideNumber": 1,
            "headline": "ALOCAÇÃO CIRÚRGICA\nDE CAPITAL",
            "bodyText": "Direcione investimentos onde há maior retorno imediato.",
            "tag": "04 // CAPITAL",
            "blackLinkVariant": "pure-monumental",
            "imageUrl": "/brand/blacklink-art-portrait.jpg"
          }
        ],
        "linkedinPostText": "ORÇAMENTO SEM DESPERDÍCIO // DIRETRIZ EXECUTIVA B2B\n\nNão gaste 1 real em marketing antes de ter a esteira de conversão e fechamento plenamente blindada.\n\nNa Black Link (blklnk.com), operamos sob o princípio da Engenharia da Ausência: simplificamos a infraestrutura e elevamos o rigor técnico para que sua liderança foque estritamente no fechamento e na expansão de margem.\n\n• Solução: Protocolo Black Link | Simulador de Projeto\n• Diretriz: 04 // CAPITAL\n• Ação: Conheça a demonstração executiva em blklnk.com ou solicite o dossiê via mensagem direta.\n\n#BlackLink #EnterpriseB2B #EngenhariaDaAusencia #LiderancaB2B #HighTicket"
      },
      {
        "id": "post-bl-05",
        "theme": "Visão 360 Graus",
        "hookHeadline": "RADAR COMPLETO\nDA OPERAÇÃO",
        "bodyCopy": "Software, IA, marketing e telemetria atuando como uma única máquina perfeitamente sincronizada.",
        "postCaption": "Software, IA, marketing e telemetria atuando como uma única máquina perfeitamente sincronizada.\n\nConheça o Protocolo Black Link.\n\n#EngenhariaIntegrada #BlackLink #Soberania",
        "ctaText": "Mapeie sua operação no link da bio.",
        "hashtags": [
          "#EngenhariaIntegrada",
          "#BlackLink"
        ],
        "scheduledDate": "Sexta • 18:00",
        "blackLinkVariant": "3d-cursor",
        "slides": [
          {
            "slideNumber": 1,
            "headline": "RADAR COMPLETO\nDA OPERAÇÃO",
            "bodyText": "Integração holística entre atração, qualificação e fechamento.",
            "tag": "05 // RADAR",
            "blackLinkVariant": "3d-cursor",
            "imageUrl": "/brand/blacklink-3d-cursor.jpg"
          }
        ],
        "linkedinPostText": "VISÃO 360 GRAUS // DIRETRIZ EXECUTIVA B2B\n\nSoftware, IA, marketing e telemetria atuando como uma única máquina perfeitamente sincronizada.\n\nNa Black Link (blklnk.com), operamos sob o princípio da Engenharia da Ausência: simplificamos a infraestrutura e elevamos o rigor técnico para que sua liderança foque estritamente no fechamento e na expansão de margem.\n\n• Solução: Protocolo Black Link | Simulador de Projeto\n• Diretriz: 05 // RADAR\n• Ação: Conheça a demonstração executiva em blklnk.com ou solicite o dossiê via mensagem direta.\n\n#BlackLink #EnterpriseB2B #EngenhariaDaAusencia #LiderancaB2B #HighTicket"
      },
      {
        "id": "post-bl-06",
        "theme": "Relatório de Maturidade",
        "hookHeadline": "ÍNDICE DE MATURIDADE\nDIGITAL",
        "bodyCopy": "Descubra a nota técnica da sua operação comparada às maiores holdings e empresas de tecnologia do país.",
        "postCaption": "Descubra a nota técnica da sua operação comparada às maiores empresas de tecnologia do país.\n\nFaça o teste gratuito no Protocolo Black Link.\n\n#MaturidadeDigital #BlackLink",
        "ctaText": "Descubra sua nota técnica.",
        "hashtags": [
          "#MaturidadeDigital",
          "#BlackLink"
        ],
        "scheduledDate": "Sábado • 11:00",
        "blackLinkVariant": "3d-liquid",
        "slides": [
          {
            "slideNumber": 1,
            "headline": "ÍNDICE DE MATURIDADE\nDIGITAL",
            "bodyText": "Benchmark técnico direto contra líderes de mercado.",
            "tag": "06 // BENCHMARK",
            "blackLinkVariant": "3d-liquid",
            "imageUrl": "/brand/blacklink-3d-liquid.jpg"
          }
        ],
        "linkedinPostText": "RELATÓRIO DE MATURIDADE // DIRETRIZ EXECUTIVA B2B\n\nDescubra a nota técnica da sua operação comparada às maiores holdings e empresas de tecnologia do país.\n\nNa Black Link (blklnk.com), operamos sob o princípio da Engenharia da Ausência: simplificamos a infraestrutura e elevamos o rigor técnico para que sua liderança foque estritamente no fechamento e na expansão de margem.\n\n• Solução: Protocolo Black Link | Simulador de Projeto\n• Diretriz: 06 // BENCHMARK\n• Ação: Conheça a demonstração executiva em blklnk.com ou solicite o dossiê via mensagem direta.\n\n#BlackLink #EnterpriseB2B #EngenhariaDaAusencia #LiderancaB2B #HighTicket"
      },
      {
        "id": "post-bl-07",
        "theme": "Próximos Passos Claros",
        "hookHeadline": "ROTA DE ESCALA\nSEM RUIDO",
        "bodyCopy": "Um plano de ação em 3 fases para reestruturar sua presença e seus fluxos comerciais sem paralisar o faturamento.",
        "postCaption": "Um plano de ação em 3 fases para reestruturar seus fluxos comerciais sem paralisar o faturamento atual.\n\nSimule em blklnk.com/protocolo.\n\n#PlanoDeEscala #BlackLink",
        "ctaText": "Obtenha seu plano de ação.",
        "hashtags": [
          "#PlanoDeEscala",
          "#BlackLink"
        ],
        "scheduledDate": "Domingo • 16:00",
        "blackLinkVariant": "3d-sculpture",
        "slides": [
          {
            "slideNumber": 1,
            "headline": "ROTA DE ESCALA\nSEM RUIDO",
            "bodyText": "Plano executivo em 3 fases prioritárias de execução.",
            "tag": "07 // EXECUÇÃO",
            "blackLinkVariant": "3d-sculpture",
            "imageUrl": "/brand/blacklink-art-macro-glass.jpg"
          }
        ],
        "linkedinPostText": "PRÓXIMOS PASSOS CLAROS // DIRETRIZ EXECUTIVA B2B\n\nUm plano de ação em 3 fases para reestruturar sua presença e seus fluxos comerciais sem paralisar o faturamento.\n\nNa Black Link (blklnk.com), operamos sob o princípio da Engenharia da Ausência: simplificamos a infraestrutura e elevamos o rigor técnico para que sua liderança foque estritamente no fechamento e na expansão de margem.\n\n• Solução: Protocolo Black Link | Simulador de Projeto\n• Diretriz: 07 // EXECUÇÃO\n• Ação: Conheça a demonstração executiva em blklnk.com ou solicite o dossiê via mensagem direta.\n\n#BlackLink #EnterpriseB2B #EngenhariaDaAusencia #LiderancaB2B #HighTicket"
      },
      {
        "id": "post-bl-08",
        "theme": "Sem Compromisso",
        "hookHeadline": "AUDITORIA ABERTA\nE GRATUITA",
        "bodyCopy": "Disponibilizamos a nossa metodologia de engenharia para que fundadores sérios conheçam o padrão Black Link.",
        "postCaption": "Disponibilizamos a nossa metodologia de engenharia para que fundadores sérios conheçam o padrão Black Link.\n\nAcesse agora blklnk.com/protocolo.\n\n#BlackLink #MetodologiaExclusiva",
        "ctaText": "Auditoria gratuita no perfil.",
        "hashtags": [
          "#BlackLink",
          "#MetodologiaExclusiva"
        ],
        "scheduledDate": "Segunda • 08:30",
        "blackLinkVariant": "clean-ice",
        "slides": [
          {
            "slideNumber": 1,
            "headline": "AUDITORIA ABERTA\nE GRATUITA",
            "bodyText": "Metodologia de engenharia corporativa disponível online.",
            "tag": "08 // PROTOCOLO",
            "blackLinkVariant": "clean-ice",
            "imageUrl": "/brand/blacklink-art-obsidian-dark.jpg"
          }
        ],
        "linkedinPostText": "SEM COMPROMISSO // DIRETRIZ EXECUTIVA B2B\n\nDisponibilizamos a nossa metodologia de engenharia para que fundadores sérios conheçam o padrão Black Link.\n\nNa Black Link (blklnk.com), operamos sob o princípio da Engenharia da Ausência: simplificamos a infraestrutura e elevamos o rigor técnico para que sua liderança foque estritamente no fechamento e na expansão de margem.\n\n• Solução: Protocolo Black Link | Simulador de Projeto\n• Diretriz: 08 // PROTOCOLO\n• Ação: Conheça a demonstração executiva em blklnk.com ou solicite o dossiê via mensagem direta.\n\n#BlackLink #EnterpriseB2B #EngenhariaDaAusencia #LiderancaB2B #HighTicket"
      },
      {
        "id": "post-bl-09",
        "theme": "Ação Imediata",
        "hookHeadline": "SIMULE AGORA\nEM BLKLNK.COM",
        "bodyCopy": "O primeiro passo para a soberania digital da sua empresa começa com um diagnóstico lúcido e sem filtros.",
        "postCaption": "O primeiro passo para a soberania digital da sua empresa começa com um diagnóstico lúcido e sem filtros.\n\nSimule agora em blklnk.com/protocolo.\n\n#SoberaniaDigital #BlackLink",
        "ctaText": "Simule em blklnk.com/protocolo",
        "hashtags": [
          "#SoberaniaDigital",
          "#BlackLink"
        ],
        "scheduledDate": "Terça • 14:00",
        "blackLinkVariant": "clean-ice-box",
        "slides": [
          {
            "slideNumber": 1,
            "headline": "SIMULE AGORA\nEM BLKLNK.COM",
            "bodyText": "A infraestrutura que a sua autoridade merece.",
            "tag": "09 // SOBERANIA",
            "blackLinkVariant": "clean-ice-box",
            "imageUrl": "/brand/blacklink-art-gradient.jpg"
          }
        ],
        "linkedinPostText": "AÇÃO IMEDIATA // DIRETRIZ EXECUTIVA B2B\n\nO primeiro passo para a soberania digital da sua empresa começa com um diagnóstico lúcido e sem filtros.\n\nNa Black Link (blklnk.com), operamos sob o princípio da Engenharia da Ausência: simplificamos a infraestrutura e elevamos o rigor técnico para que sua liderança foque estritamente no fechamento e na expansão de margem.\n\n• Solução: Protocolo Black Link | Simulador de Projeto\n• Diretriz: 09 // SOBERANIA\n• Ação: Conheça a demonstração executiva em blklnk.com ou solicite o dossiê via mensagem direta.\n\n#BlackLink #EnterpriseB2B #EngenhariaDaAusencia #LiderancaB2B #HighTicket"
      }
    ]
  },
  {
    "id": "camp-megaeventos",
    "name": "Captação Cinematográfica em Megaeventos",
    "productId": "megaeventos",
    "badge": "🎬 Megaeventos",
    "headlineSummary": "Transformação de feiras e congressos corporativos em autoridade de cinema perene.",
    "description": "Campanha para marcas que investem fortunas em estandes mas voltam com fotos amadoras de celular.",
    "posts": [
      {
        "id": "post-bl-01",
        "theme": "Investimento em Estande",
        "hookHeadline": "ESTANDE MILIONÁRIO,\nFOTO AMADORA?",
        "bodyCopy": "Gastar seis dígitos em um estande e cobrir o evento com stories tremidos de celular destrói a percepção da sua marca.",
        "postCaption": "Gastar seis dígitos em um estande e cobrir o evento com stories tremidos de celular destrói a percepção da sua marca.\n\nSua empresa merece captação cinematográfica profissional em feiras e congressos.\n\n#CaptaçãoCinematográfica #Megaeventos #BlackLink #FeirasB2B",
        "ctaText": "Reserve sua cobertura no perfil.",
        "hashtags": [
          "#CaptaçãoCinematográfica",
          "#Megaeventos"
        ],
        "scheduledDate": "Segunda • 09:00",
        "blackLinkVariant": "swiss-box",
        "slides": [
          {
            "slideNumber": 1,
            "headline": "ESTANDE MILIONÁRIO,\nFOTO AMADORA?",
            "bodyText": "Eleve a cobertura visual do seu evento ao padrão de cinema.",
            "tag": "01 // COBERTURA",
            "blackLinkVariant": "swiss-box",
            "imageUrl": "/brand/blacklink-art-portrait.jpg"
          }
        ],
        "linkedinPostText": "INVESTIMENTO EM ESTANDE // DIRETRIZ EXECUTIVA B2B\n\nGastar seis dígitos em um estande e cobrir o evento com stories tremidos de celular destrói a percepção da sua marca.\n\nNa Black Link (blklnk.com), operamos sob o princípio da Engenharia da Ausência: simplificamos a infraestrutura e elevamos o rigor técnico para que sua liderança foque estritamente no fechamento e na expansão de margem.\n\n• Solução: Captação Cinematográfica em Megaeventos\n• Diretriz: 01 // COBERTURA\n• Ação: Conheça a demonstração executiva em blklnk.com ou solicite o dossiê via mensagem direta.\n\n#BlackLink #EnterpriseB2B #EngenhariaDaAusencia #LiderancaB2B #HighTicket"
      },
      {
        "id": "post-bl-02",
        "theme": "Padrão de Cinema",
        "hookHeadline": "PRODUÇÃO CINEMATOGRÁFICA\nCORPORATIVA",
        "bodyCopy": "Direção de fotografia com lentes de cinema, color grading profissional e equipe que entende o protocolo executivo.",
        "postCaption": "Direção de fotografia com lentes de cinema, iluminação de alto nível e equipe que entende o protocolo corporativo.\n\n#CinemaCorporativo #BlackLink #EventosDeLuxo",
        "ctaText": "Conheça nosso portfólio de cinema.",
        "hashtags": [
          "#CinemaCorporativo",
          "#BlackLink"
        ],
        "scheduledDate": "Terça • 12:00",
        "blackLinkVariant": "3d-keycap",
        "slides": [
          {
            "slideNumber": 1,
            "headline": "PRODUÇÃO CINEMATOGRÁFICA\nCORPORATIVA",
            "bodyText": "Lentes de cinema e estética internacional no seu estande.",
            "tag": "02 // CINEMA",
            "blackLinkVariant": "3d-keycap",
            "imageUrl": "/brand/blacklink-art-macro-glass.jpg"
          }
        ],
        "linkedinPostText": "PADRÃO DE CINEMA // DIRETRIZ EXECUTIVA B2B\n\nDireção de fotografia com lentes de cinema, color grading profissional e equipe que entende o protocolo executivo.\n\nNa Black Link (blklnk.com), operamos sob o princípio da Engenharia da Ausência: simplificamos a infraestrutura e elevamos o rigor técnico para que sua liderança foque estritamente no fechamento e na expansão de margem.\n\n• Solução: Captação Cinematográfica em Megaeventos\n• Diretriz: 02 // CINEMA\n• Ação: Conheça a demonstração executiva em blklnk.com ou solicite o dossiê via mensagem direta.\n\n#BlackLink #EnterpriseB2B #EngenhariaDaAusencia #LiderancaB2B #HighTicket"
      },
      {
        "id": "post-bl-03",
        "theme": "Ativos que Duram o Ano Todo",
        "hookHeadline": "CONTEÚDO PERENE\nPARA O ANO INTEIRO",
        "bodyCopy": "Um único congresso corporativo se transforma em dezenas de peças de autoridade para alimentar seu marketing por meses.",
        "postCaption": "Um único congresso corporativo se transforma em dezenas de peças de autoridade para alimentar seu marketing por meses.\n\n#ConteudoPerene #AutoridadeB2B #BlackLink",
        "ctaText": "Multiplique o retorno da feira.",
        "hashtags": [
          "#ConteudoPerene",
          "#BlackLink"
        ],
        "scheduledDate": "Quarta • 15:30",
        "blackLinkVariant": "3d-crystal",
        "slides": [
          {
            "slideNumber": 1,
            "headline": "CONTEÚDO PERENE\nPARA O ANO INTEIRO",
            "bodyText": "Transforme 3 dias de feira em 6 meses de autoridade contínua.",
            "tag": "03 // ACERVO",
            "blackLinkVariant": "3d-crystal",
            "imageUrl": "/brand/blacklink-art-dark-crystal.jpg"
          }
        ],
        "linkedinPostText": "ATIVOS QUE DURAM O ANO TODO // DIRETRIZ EXECUTIVA B2B\n\nUm único congresso corporativo se transforma em dezenas de peças de autoridade para alimentar seu marketing por meses.\n\nNa Black Link (blklnk.com), operamos sob o princípio da Engenharia da Ausência: simplificamos a infraestrutura e elevamos o rigor técnico para que sua liderança foque estritamente no fechamento e na expansão de margem.\n\n• Solução: Captação Cinematográfica em Megaeventos\n• Diretriz: 03 // ACERVO\n• Ação: Conheça a demonstração executiva em blklnk.com ou solicite o dossiê via mensagem direta.\n\n#BlackLink #EnterpriseB2B #EngenhariaDaAusencia #LiderancaB2B #HighTicket"
      },
      {
        "id": "post-bl-04",
        "theme": "Presença de Palco",
        "hookHeadline": "KEYNOTES E PALESTRAS\nIMORTALIZADAS",
        "bodyCopy": "Registre as palestras dos seus executivos com multi-câmeras, captação de áudio isolado e corte dinâmico de documentário.",
        "postCaption": "Registre as palestras dos seus executivos com multi-câmeras, captação de áudio isolado e corte dinâmico de documentário.\n\n#Keynote #PalestraCorporativa #BlackLink",
        "ctaText": "Cobertura de keynotes em blklnk.com",
        "hashtags": [
          "#Keynote",
          "#BlackLink"
        ],
        "scheduledDate": "Quinta • 10:00",
        "blackLinkVariant": "pure-monumental",
        "slides": [
          {
            "slideNumber": 1,
            "headline": "KEYNOTES E PALESTRAS\nIMORTALIZADAS",
            "bodyText": "Cortes de alto impacto para LinkedIn e apresentações.",
            "tag": "04 // KEYNOTE",
            "blackLinkVariant": "pure-monumental",
            "imageUrl": "/brand/blacklink-art-glass-model.jpg"
          }
        ],
        "linkedinPostText": "PRESENÇA DE PALCO // DIRETRIZ EXECUTIVA B2B\n\nRegistre as palestras dos seus executivos com multi-câmeras, captação de áudio isolado e corte dinâmico de documentário.\n\nNa Black Link (blklnk.com), operamos sob o princípio da Engenharia da Ausência: simplificamos a infraestrutura e elevamos o rigor técnico para que sua liderança foque estritamente no fechamento e na expansão de margem.\n\n• Solução: Captação Cinematográfica em Megaeventos\n• Diretriz: 04 // KEYNOTE\n• Ação: Conheça a demonstração executiva em blklnk.com ou solicite o dossiê via mensagem direta.\n\n#BlackLink #EnterpriseB2B #EngenhariaDaAusencia #LiderancaB2B #HighTicket"
      },
      {
        "id": "post-bl-05",
        "theme": "Protocolo Executivo",
        "hookHeadline": "DISCRIÇÃO E\nELEGÂNCIA NO ESTANDE",
        "bodyCopy": "Equipe de filmagem alinhada em trajes executivos que respeita as reuniões e conversas de negócios dos seus clientes.",
        "postCaption": "Equipe de filmagem alinhada em trajes executivos que respeita as reuniões e conversas de negócios dos seus clientes.\n\n#EleganciaCorporativa #BlackLink",
        "ctaText": "Conheça nosso protocolo em blklnk.com",
        "hashtags": [
          "#EleganciaCorporativa",
          "#BlackLink"
        ],
        "scheduledDate": "Sexta • 18:00",
        "blackLinkVariant": "3d-cursor",
        "slides": [
          {
            "slideNumber": 1,
            "headline": "DISCRIÇÃO E\nELEGÂNCIA NO ESTANDE",
            "bodyText": "Equipe com protocolo institucional de alto padrão.",
            "tag": "05 // POSTURA",
            "blackLinkVariant": "3d-cursor",
            "imageUrl": "/brand/blacklink-art-cursor-light.jpg"
          }
        ],
        "linkedinPostText": "PROTOCOLO EXECUTIVO // DIRETRIZ EXECUTIVA B2B\n\nEquipe de filmagem alinhada em trajes executivos que respeita as reuniões e conversas de negócios dos seus clientes.\n\nNa Black Link (blklnk.com), operamos sob o princípio da Engenharia da Ausência: simplificamos a infraestrutura e elevamos o rigor técnico para que sua liderança foque estritamente no fechamento e na expansão de margem.\n\n• Solução: Captação Cinematográfica em Megaeventos\n• Diretriz: 05 // POSTURA\n• Ação: Conheça a demonstração executiva em blklnk.com ou solicite o dossiê via mensagem direta.\n\n#BlackLink #EnterpriseB2B #EngenhariaDaAusencia #LiderancaB2B #HighTicket"
      },
      {
        "id": "post-bl-06",
        "theme": "Transmissão em Tempo Quase Real",
        "hookHeadline": "ENTREGA DE SNEAK PEEKS\nEM TEMPO REAL",
        "bodyCopy": "Receba teasers cinematográficos editados durante o próprio evento para postar no mesmo dia e dominar as timelines.",
        "postCaption": "Receba teasers cinematográficos editados durante o próprio evento para postar no mesmo dia e dominar as timelines.\n\n#SameDayEdit #AgilidadeVisual #BlackLink",
        "ctaText": "Domine a timeline da sua feira.",
        "hashtags": [
          "#SameDayEdit",
          "#BlackLink"
        ],
        "scheduledDate": "Sábado • 11:00",
        "blackLinkVariant": "3d-liquid",
        "slides": [
          {
            "slideNumber": 1,
            "headline": "ENTREGA DE TEASERS\nNO MESMO DIA",
            "bodyText": "Edições rápidas em 4K para publicação imediata no evento.",
            "tag": "06 // AGILIDADE",
            "blackLinkVariant": "3d-liquid",
            "imageUrl": "/brand/blacklink-art-fluid-metal.jpg"
          }
        ],
        "linkedinPostText": "TRANSMISSÃO EM TEMPO QUASE REAL // DIRETRIZ EXECUTIVA B2B\n\nReceba teasers cinematográficos editados durante o próprio evento para postar no mesmo dia e dominar as timelines.\n\nNa Black Link (blklnk.com), operamos sob o princípio da Engenharia da Ausência: simplificamos a infraestrutura e elevamos o rigor técnico para que sua liderança foque estritamente no fechamento e na expansão de margem.\n\n• Solução: Captação Cinematográfica em Megaeventos\n• Diretriz: 06 // AGILIDADE\n• Ação: Conheça a demonstração executiva em blklnk.com ou solicite o dossiê via mensagem direta.\n\n#BlackLink #EnterpriseB2B #EngenhariaDaAusencia #LiderancaB2B #HighTicket"
      },
      {
        "id": "post-bl-07",
        "theme": "Entrevistas com Decisores",
        "hookHeadline": "PODCAST E ENTREVISTAS\nON THE SPOT",
        "bodyCopy": "Aproveite a presença de clientes VIPs no seu estande para gravar episódios curtos e depoimentos espontâneos de alto valor.",
        "postCaption": "Aproveite a presença de clientes VIPs no seu estande para gravar episódios curtos e conversas espontâneas de alto valor.\n\n#EntrevistasVIP #BlackLink",
        "ctaText": "Grave com líderes do seu setor.",
        "hashtags": [
          "#EntrevistasVIP",
          "#BlackLink"
        ],
        "scheduledDate": "Domingo • 16:00",
        "blackLinkVariant": "3d-sculpture",
        "slides": [
          {
            "slideNumber": 1,
            "headline": "PODCAST E ENTREVISTAS\nON THE SPOT",
            "bodyText": "Estrutura ágil para gravar autoridades no seu estande.",
            "tag": "07 // VOZES",
            "blackLinkVariant": "3d-sculpture",
            "imageUrl": "/brand/blacklink-chain.jpg"
          }
        ],
        "linkedinPostText": "ENTREVISTAS COM DECISORES // DIRETRIZ EXECUTIVA B2B\n\nAproveite a presença de clientes VIPs no seu estande para gravar episódios curtos e depoimentos espontâneos de alto valor.\n\nNa Black Link (blklnk.com), operamos sob o princípio da Engenharia da Ausência: simplificamos a infraestrutura e elevamos o rigor técnico para que sua liderança foque estritamente no fechamento e na expansão de margem.\n\n• Solução: Captação Cinematográfica em Megaeventos\n• Diretriz: 07 // VOZES\n• Ação: Conheça a demonstração executiva em blklnk.com ou solicite o dossiê via mensagem direta.\n\n#BlackLink #EnterpriseB2B #EngenhariaDaAusencia #LiderancaB2B #HighTicket"
      },
      {
        "id": "post-bl-08",
        "theme": "Retorno sobre Investimento",
        "hookHeadline": "MAXIMIZAÇÃO DO\nROI DO EVENTO",
        "bodyCopy": "O custo do estande se paga quando a autoridade gerada pelo evento continua convertendo novos clientes o ano inteiro.",
        "postCaption": "O custo do estande se paga quando a autoridade gerada pelo evento continua convertendo novos clientes o ano inteiro.\n\n#ROIEspetacular #FeirasCorporativas #BlackLink",
        "ctaText": "Multiplique seu ROI em blklnk.com",
        "hashtags": [
          "#ROIEspetacular",
          "#BlackLink"
        ],
        "scheduledDate": "Segunda • 08:30",
        "blackLinkVariant": "clean-ice",
        "slides": [
          {
            "slideNumber": 1,
            "headline": "MAXIMIZAÇÃO DO\nROI DO EVENTO",
            "bodyText": "Justifique cada centavo investido na sua presença física.",
            "tag": "08 // RETORNO",
            "blackLinkVariant": "clean-ice",
            "imageUrl": "/brand/blacklink-art-obsidian-dark.jpg"
          }
        ],
        "linkedinPostText": "RETORNO SOBRE INVESTIMENTO // DIRETRIZ EXECUTIVA B2B\n\nO custo do estande se paga quando a autoridade gerada pelo evento continua convertendo novos clientes o ano inteiro.\n\nNa Black Link (blklnk.com), operamos sob o princípio da Engenharia da Ausência: simplificamos a infraestrutura e elevamos o rigor técnico para que sua liderança foque estritamente no fechamento e na expansão de margem.\n\n• Solução: Captação Cinematográfica em Megaeventos\n• Diretriz: 08 // RETORNO\n• Ação: Conheça a demonstração executiva em blklnk.com ou solicite o dossiê via mensagem direta.\n\n#BlackLink #EnterpriseB2B #EngenhariaDaAusencia #LiderancaB2B #HighTicket"
      },
      {
        "id": "post-bl-09",
        "theme": "Agendamento Prévio",
        "hookHeadline": "RESERVE SUA COBERTURA\nPARA A PRÓXIMA FEIRA",
        "bodyCopy": "Nossa agenda para grandes congressos e feiras tem limite rígido de clientes por evento para garantir exclusividade.",
        "postCaption": "Nossa agenda para grandes congressos e feiras tem limite rígido de marcas por evento para garantir exclusividade técnica.\n\nConsulte datas disponíveis em blklnk.com/contact.\n\n#Exclusividade #BlackLink #EventosCorporativos",
        "ctaText": "Consulte datas em blklnk.com/contact",
        "hashtags": [
          "#Exclusividade",
          "#BlackLink"
        ],
        "scheduledDate": "Terça • 14:00",
        "blackLinkVariant": "clean-ice-box",
        "slides": [
          {
            "slideNumber": 1,
            "headline": "RESERVE SUA COBERTURA\nPARA A PRÓXIMA FEIRA",
            "bodyText": "Vagas limitadas por congresso para garantir padrão cinema.",
            "tag": "09 // EXCLUSIVIDADE",
            "blackLinkVariant": "clean-ice-box",
            "imageUrl": "/brand/blacklink-art-pins.jpg"
          }
        ],
        "linkedinPostText": "AGENDAMENTO PRÉVIO // DIRETRIZ EXECUTIVA B2B\n\nNossa agenda para grandes congressos e feiras tem limite rígido de clientes por evento para garantir exclusividade.\n\nNa Black Link (blklnk.com), operamos sob o princípio da Engenharia da Ausência: simplificamos a infraestrutura e elevamos o rigor técnico para que sua liderança foque estritamente no fechamento e na expansão de margem.\n\n• Solução: Captação Cinematográfica em Megaeventos\n• Diretriz: 09 // EXCLUSIVIDADE\n• Ação: Conheça a demonstração executiva em blklnk.com ou solicite o dossiê via mensagem direta.\n\n#BlackLink #EnterpriseB2B #EngenhariaDaAusencia #LiderancaB2B #HighTicket"
      }
    ]
  }
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


