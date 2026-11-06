import type { ExtractedSheetLead } from "@/app/api/crm/lead-extractor/route";
import type { KanbanStage, Lead } from "@/db/schema";
import { formatPhoneBrDisplay, normalizeLeadCompanyName, sanitizePhoneE164 } from "./deduplication";

export const ANCHOR_SHEET_ID = "15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co";
export const ANCHOR_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co/edit?usp=sharing";
export const ANCHOR_SHEET_TITLE = "Clientes Âncora (R$ 50.000/mês cada)";
export const ANCHOR_SHEET_TABS = ["Implementos Rodoviários", "Caçambas", "Baús"];

export const LEGACY_SHEET_ID = "1m9Gjeb9UxLJ1aDgPOWOLmKzCqRf7CPkFFyXSGDJpUXA";
export const LEGACY_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1m9Gjeb9UxLJ1aDgPOWOLmKzCqRf7CPkFFyXSGDJpUXA/edit?usp=sharing";
export const LEGACY_SHEET_TITLE = "Leads — Construção Modular & Fachadas";
export const LEGACY_SHEET_TABS = ["Casas Modulares", "Fachadas", "Lajes"];

export const ANCHOR_CLIENTS_LEADS: ExtractedSheetLead[] = [
  {
    "id": "ancora-1",
    "empresa": "Truckvan Indústria de Carrocerias",
    "cnpj": "",
    "responsavel": "",
    "email": "comercial@truckvan.com.br",
    "contato": "(11) 2086-5555",
    "nivelProspeccao": "Tentativa de contato",
    "observacoes": "[Guarulhos - SP] Materiais: Chapas Grossas A36, Perfis U Dobrados, Tubos Industriais Retangulares, Vigas Estruturais | Abordagem: Pronta-entrega de chapas grossas e perfis cortados sob medida para montagem customizada sem atraso.",
    "website": "www.truckvan.com.br",
    "campanha": "CAMP-ANCORA-IMPLEMENTOS-RODOVIARIOS",
    "scriptAbordagem": "Pronta-entrega de chapas grossas e perfis cortados sob medida para montagem customizada sem atraso.",
    "highlighted": true,
    "tab": "Implementos Rodoviários",
    "cidadeRegiao": "Guarulhos - SP",
    "linhaProdutos": "Carrocerias metálicas, unidades móveis, semirreboques e carretas customizadas",
    "materiaisAco": "Chapas Grossas A36, Perfis U Dobrados, Tubos Industriais Retangulares, Vigas Estruturais",
    "argumentoHunter": "Pronta-entrega de chapas grossas e perfis cortados sob medida para montagem customizada sem atraso.",
    "statusOriginal": "A Ligar",
    "spreadsheetId": "15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co",
    "spreadsheetTitle": "Clientes Âncora (R$ 50.000/mês cada)"
  },
  {
    "id": "ancora-2",
    "empresa": "Engetruck Equipamentos de Auto Socorro",
    "cnpj": "",
    "responsavel": "",
    "email": "comercial@engetruck.com",
    "contato": "(11) 4414-4800",
    "nivelProspeccao": "Tentativa de contato",
    "observacoes": "[Atibaia - SP] Materiais: Chapa Xadrez antiderrapante, Chapas de Alta Resistência (SAC/Strenx), Perfis U Dobrados, Tubos Mecânicos | Abordagem: Entrega dedicada de chapa piso xadrez e perfis dobrados com tolerâncias rigorosas para reduzir retrabalho e soldagem.",
    "website": "www.engetruck.com",
    "campanha": "CAMP-ANCORA-IMPLEMENTOS-RODOVIARIOS",
    "scriptAbordagem": "Entrega dedicada de chapa piso xadrez e perfis dobrados com tolerâncias rigorosas para reduzir retrabalho e soldagem.",
    "highlighted": true,
    "tab": "Implementos Rodoviários",
    "cidadeRegiao": "Atibaia - SP",
    "linhaProdutos": "Plataformas de auto socorro hidráulicas, lanças de arraste e guinchos industriais pesados",
    "materiaisAco": "Chapa Xadrez antiderrapante, Chapas de Alta Resistência (SAC/Strenx), Perfis U Dobrados, Tubos Mecânicos",
    "argumentoHunter": "Entrega dedicada de chapa piso xadrez e perfis dobrados com tolerâncias rigorosas para reduzir retrabalho e soldagem.",
    "statusOriginal": "A Ligar",
    "spreadsheetId": "15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co",
    "spreadsheetTitle": "Clientes Âncora (R$ 50.000/mês cada)"
  },
  {
    "id": "ancora-3",
    "empresa": "4Truck Implementos Rodoviários",
    "cnpj": "",
    "responsavel": "",
    "email": "comercial@4truck.com.br",
    "contato": "(11) 2481-6000",
    "nivelProspeccao": "Tentativa de contato",
    "observacoes": "[Guarulhos - SP] Materiais: Tubos Estruturais Retangulares/Quadrados, Perfis U Enrijecidos em Chapa Fina a Quente, Cantoneiras | Abordagem: Corte e dobra sob medida de perfis U e longarinas, diminuindo o tempo de fabricação e aumentando o giro de oficina.",
    "website": "www.4truck.com.br",
    "campanha": "CAMP-ANCORA-IMPLEMENTOS-RODOVIARIOS",
    "scriptAbordagem": "Corte e dobra sob medida de perfis U e longarinas, diminuindo o tempo de fabricação e aumentando o giro de oficina.",
    "highlighted": true,
    "tab": "Implementos Rodoviários",
    "cidadeRegiao": "Guarulhos - SP",
    "linhaProdutos": "Carrocerias metálicas abertas, implementos sobre chassi e furgões industriais",
    "materiaisAco": "Tubos Estruturais Retangulares/Quadrados, Perfis U Enrijecidos em Chapa Fina a Quente, Cantoneiras",
    "argumentoHunter": "Corte e dobra sob medida de perfis U e longarinas, diminuindo o tempo de fabricação e aumentando o giro de oficina.",
    "statusOriginal": "A Ligar",
    "spreadsheetId": "15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co",
    "spreadsheetTitle": "Clientes Âncora (R$ 50.000/mês cada)"
  },
  {
    "id": "ancora-4",
    "empresa": "Fast Truck Plataformas",
    "cnpj": "",
    "responsavel": "",
    "email": "comercial@ftplataformas.com.br",
    "contato": "(11) 2469-1486",
    "nivelProspeccao": "Tentativa de contato",
    "observacoes": "[Guarulhos / Arujá - SP] Materiais: Chapa Xadrez antiderrapante, Perfis U Laminados e Dobrados, Chapa Grossa A36 | Abordagem: Elimine gargalos na produção de pranchas hidráulicas com estoque dedicado de chapa piso xadrez e perfis estruturais.",
    "website": "www.ftplataformas.com.br",
    "campanha": "CAMP-ANCORA-IMPLEMENTOS-RODOVIARIOS",
    "scriptAbordagem": "Elimine gargalos na produção de pranchas hidráulicas com estoque dedicado de chapa piso xadrez e perfis estruturais.",
    "highlighted": true,
    "tab": "Implementos Rodoviários",
    "cidadeRegiao": "Guarulhos / Arujá - SP",
    "linhaProdutos": "Plataformas hidráulicas para auto socorro, reboques e guinchos leves/pesados",
    "materiaisAco": "Chapa Xadrez antiderrapante, Perfis U Laminados e Dobrados, Chapa Grossa A36",
    "argumentoHunter": "Elimine gargalos na produção de pranchas hidráulicas com estoque dedicado de chapa piso xadrez e perfis estruturais.",
    "statusOriginal": "A Ligar",
    "spreadsheetId": "15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co",
    "spreadsheetTitle": "Clientes Âncora (R$ 50.000/mês cada)"
  },
  {
    "id": "ancora-5",
    "empresa": "World Equipamentos",
    "cnpj": "",
    "responsavel": "",
    "email": "comercial@worldequipamentos.ind.br",
    "contato": "(19) 3861-1200",
    "nivelProspeccao": "Tentativa de contato",
    "observacoes": "[Mogi Guaçu - SP] Materiais: Chapas de Alta Resistência SAE 1045 / ASTM A36, Tubos Estruturais de Parede Grossa, Cantoneiras | Abordagem: Fornecimento ágil de aços estruturais no interior paulista com certificado de usina para atender demandas de guinchos pesados.",
    "website": "www.worldequipamentos.ind.br",
    "campanha": "CAMP-ANCORA-IMPLEMENTOS-RODOVIARIOS",
    "scriptAbordagem": "Fornecimento ágil de aços estruturais no interior paulista com certificado de usina para atender demandas de guinchos pesados.",
    "highlighted": true,
    "tab": "Implementos Rodoviários",
    "cidadeRegiao": "Mogi Guaçu - SP",
    "linhaProdutos": "Plataformas hidráulicas para guincho pesado, equipamentos de resgate e reboques",
    "materiaisAco": "Chapas de Alta Resistência SAE 1045 / ASTM A36, Tubos Estruturais de Parede Grossa, Cantoneiras",
    "argumentoHunter": "Fornecimento ágil de aços estruturais no interior paulista com certificado de usina para atender demandas de guinchos pesados.",
    "statusOriginal": "A Ligar",
    "spreadsheetId": "15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co",
    "spreadsheetTitle": "Clientes Âncora (R$ 50.000/mês cada)"
  },
  {
    "id": "ancora-6",
    "empresa": "Roda de Ouro Implementos",
    "cnpj": "",
    "responsavel": "",
    "email": "comercial@rodadeouro.com.br",
    "contato": "(11) 2403-3522",
    "nivelProspeccao": "Tentativa de contato",
    "observacoes": "[Guarulhos - SP] Materiais: Chapa Fina a Quente, Perfis U Dobrados de Alta Precisão, Tubos Metalon Industriais | Abordagem: Reduza o custo por tonelada em perfis dobrados e chapas laminadas com condições comerciais direto da Gofer.",
    "website": "www.rodadeouro.com.br",
    "campanha": "CAMP-ANCORA-IMPLEMENTOS-RODOVIARIOS",
    "scriptAbordagem": "Reduza o custo por tonelada em perfis dobrados e chapas laminadas com condições comerciais direto da Gofer.",
    "highlighted": true,
    "tab": "Implementos Rodoviários",
    "cidadeRegiao": "Guarulhos - SP",
    "linhaProdutos": "Carrocerias metálicas abertas sobre chassi, reboques industriais e plataformas especiais",
    "materiaisAco": "Chapa Fina a Quente, Perfis U Dobrados de Alta Precisão, Tubos Metalon Industriais",
    "argumentoHunter": "Reduza o custo por tonelada em perfis dobrados e chapas laminadas com condições comerciais direto da Gofer.",
    "statusOriginal": "A Ligar",
    "spreadsheetId": "15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co",
    "spreadsheetTitle": "Clientes Âncora (R$ 50.000/mês cada)"
  },
  {
    "id": "ancora-7",
    "empresa": "EDARP Implementos Rodoviários",
    "cnpj": "",
    "responsavel": "",
    "email": "comercial@edarp.ind.br",
    "contato": "(11) 2955-4000",
    "nivelProspeccao": "Tentativa de contato",
    "observacoes": "[São Paulo (Zona Leste) - SP] Materiais: Perfis Dobrados a Frio, Tubos Estruturais Quadrados, Chapas Galvanizadas, Cantoneiras | Abordagem: Padronização de bitolas e pronta-entrega na Grande SP, evitando paradas de linha na montagem de carrocerias.",
    "website": "www.edarp.ind.br",
    "campanha": "CAMP-ANCORA-IMPLEMENTOS-RODOVIARIOS",
    "scriptAbordagem": "Padronização de bitolas e pronta-entrega na Grande SP, evitando paradas de linha na montagem de carrocerias.",
    "highlighted": true,
    "tab": "Implementos Rodoviários",
    "cidadeRegiao": "São Paulo (Zona Leste) - SP",
    "linhaProdutos": "Carrocerias metálicas sobre chassi, semirreboques e cabines suplementares",
    "materiaisAco": "Perfis Dobrados a Frio, Tubos Estruturais Quadrados, Chapas Galvanizadas, Cantoneiras",
    "argumentoHunter": "Padronização de bitolas e pronta-entrega na Grande SP, evitando paradas de linha na montagem de carrocerias.",
    "statusOriginal": "A Ligar",
    "spreadsheetId": "15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co",
    "spreadsheetTitle": "Clientes Âncora (R$ 50.000/mês cada)"
  },
  {
    "id": "ancora-8",
    "empresa": "Brascar Implementos",
    "cnpj": "",
    "responsavel": "",
    "email": "comercial@brascarimplementos.com.br",
    "contato": "(19) 3451-2200",
    "nivelProspeccao": "Tentativa de contato",
    "observacoes": "[Limeira / Campinas - SP] Materiais: Tubos Estruturais, Perfis Dobrados Enrijecidos, Chapas Finas a Quente e Frio Decapadas | Abordagem: Pacote de fornecimento de perfis e chapas com entregas fracionadas no polo industrial de Limeira/Campinas.",
    "website": "www.brascarimplementos.com.br",
    "campanha": "CAMP-ANCORA-IMPLEMENTOS-RODOVIARIOS",
    "scriptAbordagem": "Pacote de fornecimento de perfis e chapas com entregas fracionadas no polo industrial de Limeira/Campinas.",
    "highlighted": true,
    "tab": "Implementos Rodoviários",
    "cidadeRegiao": "Limeira / Campinas - SP",
    "linhaProdutos": "Carrocerias metálicas carga seca, cestas aéreas e furgões industriais",
    "materiaisAco": "Tubos Estruturais, Perfis Dobrados Enrijecidos, Chapas Finas a Quente e Frio Decapadas",
    "argumentoHunter": "Pacote de fornecimento de perfis e chapas com entregas fracionadas no polo industrial de Limeira/Campinas.",
    "statusOriginal": "A Ligar",
    "spreadsheetId": "15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co",
    "spreadsheetTitle": "Clientes Âncora (R$ 50.000/mês cada)"
  },
  {
    "id": "ancora-9",
    "empresa": "Carrocerias Imirim",
    "cnpj": "",
    "responsavel": "",
    "email": "comercial@carroceriaimirim.com.br",
    "contato": "(11) 3696-1133",
    "nivelProspeccao": "Tentativa de contato",
    "observacoes": "[Osasco / São Paulo - SP] Materiais: Chapa Grossa A36, Chapa Xadrez, Perfis U Laminados e Tubos Quadrados | Abordagem: Rapidez e agilidade no envio de peças cortadas e dobradas com pontualidade para projetos customizados e reformas.",
    "website": "www.carroceriaimirim.com.br",
    "campanha": "CAMP-ANCORA-IMPLEMENTOS-RODOVIARIOS",
    "scriptAbordagem": "Rapidez e agilidade no envio de peças cortadas e dobradas com pontualidade para projetos customizados e reformas.",
    "highlighted": true,
    "tab": "Implementos Rodoviários",
    "cidadeRegiao": "Osasco / São Paulo - SP",
    "linhaProdutos": "Carrocerias metálicas abertas, transformações veiculares e reforços de chassi",
    "materiaisAco": "Chapa Grossa A36, Chapa Xadrez, Perfis U Laminados e Tubos Quadrados",
    "argumentoHunter": "Rapidez e agilidade no envio de peças cortadas e dobradas com pontualidade para projetos customizados e reformas.",
    "statusOriginal": "A Ligar",
    "spreadsheetId": "15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co",
    "spreadsheetTitle": "Clientes Âncora (R$ 50.000/mês cada)"
  },
  {
    "id": "ancora-10",
    "empresa": "Boreal Implementos Rodoviários",
    "cnpj": "",
    "responsavel": "",
    "email": "comercial@borealimplementos.com.br",
    "contato": "(19) 3864-1500",
    "nivelProspeccao": "Tentativa de contato",
    "observacoes": "[Sumaré - SP] Materiais: Chapas de Aço Carbono ASTM A36, Perfis U Dobrados e Vigas Estruturais Laminadas | Abordagem: Preço competitivo em lotes de chapas grossas e perfis estruturais com frete direto para a Região de Campinas.",
    "website": "www.borealimplementos.com.br",
    "campanha": "CAMP-ANCORA-IMPLEMENTOS-RODOVIARIOS",
    "scriptAbordagem": "Preço competitivo em lotes de chapas grossas e perfis estruturais com frete direto para a Região de Campinas.",
    "highlighted": true,
    "tab": "Implementos Rodoviários",
    "cidadeRegiao": "Sumaré - SP",
    "linhaProdutos": "Reboques agrícolas, carretas industriais e plataformas rodoviárias",
    "materiaisAco": "Chapas de Aço Carbono ASTM A36, Perfis U Dobrados e Vigas Estruturais Laminadas",
    "argumentoHunter": "Preço competitivo em lotes de chapas grossas e perfis estruturais com frete direto para a Região de Campinas.",
    "statusOriginal": "A Ligar",
    "spreadsheetId": "15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co",
    "spreadsheetTitle": "Clientes Âncora (R$ 50.000/mês cada)"
  },
  {
    "id": "ancora-11",
    "empresa": "Ecovac Equipamentos Ambientais",
    "cnpj": "",
    "responsavel": "",
    "email": "comercial@ecovac.com.br",
    "contato": "(11) 2143-6000",
    "nivelProspeccao": "Tentativa de contato",
    "observacoes": "[São Paulo (Zona Leste) - SP] Materiais: Chapas Grossas Calandradas, Tubos Estruturais de Parede Grossa, Perfis Dobrados Pesados | Abordagem: Fornecimento com garantia de espessura e rastreabilidade total para tanques e pranchas sob pressão.",
    "website": "www.ecovac.com.br",
    "campanha": "CAMP-ANCORA-IMPLEMENTOS-RODOVIARIOS",
    "scriptAbordagem": "Fornecimento com garantia de espessura e rastreabilidade total para tanques e pranchas sob pressão.",
    "highlighted": true,
    "tab": "Implementos Rodoviários",
    "cidadeRegiao": "São Paulo (Zona Leste) - SP",
    "linhaProdutos": "Plataformas de auto socorro hidráulicas, tanques a vácuo e implementos combinados",
    "materiaisAco": "Chapas Grossas Calandradas, Tubos Estruturais de Parede Grossa, Perfis Dobrados Pesados",
    "argumentoHunter": "Fornecimento com garantia de espessura e rastreabilidade total para tanques e pranchas sob pressão.",
    "statusOriginal": "A Ligar",
    "spreadsheetId": "15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co",
    "spreadsheetTitle": "Clientes Âncora (R$ 50.000/mês cada)"
  },
  {
    "id": "ancora-12",
    "empresa": "Labor Equipamentos Rodoviários",
    "cnpj": "",
    "responsavel": "",
    "email": "comercial@labor.ind.br",
    "contato": "(12) 3609-2000",
    "nivelProspeccao": "Tentativa de contato",
    "observacoes": "[Taubaté - SP] Materiais: Chapas de Alta Resistência, Perfis Tubulares de Grande Porte, Vigas Especiais | Abordagem: Programação de entrega de vigas estruturais e tubos especiais de aço carbono com previsibilidade no Vale do Paraíba.",
    "website": "www.labor.ind.br",
    "campanha": "CAMP-ANCORA-IMPLEMENTOS-RODOVIARIOS",
    "scriptAbordagem": "Programação de entrega de vigas estruturais e tubos especiais de aço carbono com previsibilidade no Vale do Paraíba.",
    "highlighted": true,
    "tab": "Implementos Rodoviários",
    "cidadeRegiao": "Taubaté - SP",
    "linhaProdutos": "Semirreboques especiais com suspensão independente, carretas de piso duplo e implementos",
    "materiaisAco": "Chapas de Alta Resistência, Perfis Tubulares de Grande Porte, Vigas Especiais",
    "argumentoHunter": "Programação de entrega de vigas estruturais e tubos especiais de aço carbono com previsibilidade no Vale do Paraíba.",
    "statusOriginal": "A Ligar",
    "spreadsheetId": "15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co",
    "spreadsheetTitle": "Clientes Âncora (R$ 50.000/mês cada)"
  },
  {
    "id": "ancora-13",
    "empresa": "Rodovale Implementos (Filial SP)",
    "cnpj": "",
    "responsavel": "",
    "email": "comercial@rodovale.com.br",
    "contato": "(16) 3968-8000",
    "nivelProspeccao": "Tentativa de contato",
    "observacoes": "[Ribeirão Preto - SP] Materiais: Perfis Dobrados a Frio, Chapas Finas e Grossas Decapadas, Bobinas Cortadas (Slitter) | Abordagem: Estabilidade de preço e corte de chapas sob especificação para fabricantes de semirreboques no interior paulista.",
    "website": "www.rodovale.com.br",
    "campanha": "CAMP-ANCORA-IMPLEMENTOS-RODOVIARIOS",
    "scriptAbordagem": "Estabilidade de preço e corte de chapas sob especificação para fabricantes de semirreboques no interior paulista.",
    "highlighted": true,
    "tab": "Implementos Rodoviários",
    "cidadeRegiao": "Ribeirão Preto - SP",
    "linhaProdutos": "Semirreboques graneleiros, caçambas rodoviárias e carrocerias metálicas",
    "materiaisAco": "Perfis Dobrados a Frio, Chapas Finas e Grossas Decapadas, Bobinas Cortadas (Slitter)",
    "argumentoHunter": "Estabilidade de preço e corte de chapas sob especificação para fabricantes de semirreboques no interior paulista.",
    "statusOriginal": "A Ligar",
    "spreadsheetId": "15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co",
    "spreadsheetTitle": "Clientes Âncora (R$ 50.000/mês cada)"
  },
  {
    "id": "ancora-14",
    "empresa": "Reboques Vale",
    "cnpj": "",
    "responsavel": "",
    "email": "comercial@reboquesvale.com.br",
    "contato": "(12) 3951-8800",
    "nivelProspeccao": "Tentativa de contato",
    "observacoes": "[Jacareí - SP] Materiais: Tubos Retangulares Metalon, Perfis U Enrijecidos, Chapas Finas a Frio | Abordagem: Entrega rápida de tubos estruturais com costura e cantoneiras para linha seriada de carretinhas de alto giro.",
    "website": "www.reboquesvale.com.br",
    "campanha": "CAMP-ANCORA-IMPLEMENTOS-RODOVIARIOS",
    "scriptAbordagem": "Entrega rápida de tubos estruturais com costura e cantoneiras para linha seriada de carretinhas de alto giro.",
    "highlighted": true,
    "tab": "Implementos Rodoviários",
    "cidadeRegiao": "Jacareí - SP",
    "linhaProdutos": "Reboques médios e leves industriais, carretinhas para geradores e carga geral",
    "materiaisAco": "Tubos Retangulares Metalon, Perfis U Enrijecidos, Chapas Finas a Frio",
    "argumentoHunter": "Entrega rápida de tubos estruturais com costura e cantoneiras para linha seriada de carretinhas de alto giro.",
    "statusOriginal": "A Ligar",
    "spreadsheetId": "15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co",
    "spreadsheetTitle": "Clientes Âncora (R$ 50.000/mês cada)"
  },
  {
    "id": "ancora-15",
    "empresa": "Rodotécnica Implementos",
    "cnpj": "",
    "responsavel": "",
    "email": "comercial@rodotecnica.ind.br",
    "contato": "(16) 3946-2500",
    "nivelProspeccao": "Tentativa de contato",
    "observacoes": "[Sertãozinho - SP] Materiais: Chapas Grossas Resistentes à Abrasão, Vigas W/I Laminadas, Tubos Industriais Pesados | Abordagem: Abastecimento contínuo no polo sucroalcooleiro de Sertãozinho e Ribeirão Preto para atender a safra sem gargalo.",
    "website": "www.rodotecnica.ind.br",
    "campanha": "CAMP-ANCORA-IMPLEMENTOS-RODOVIARIOS",
    "scriptAbordagem": "Abastecimento contínuo no polo sucroalcooleiro de Sertãozinho e Ribeirão Preto para atender a safra sem gargalo.",
    "highlighted": true,
    "tab": "Implementos Rodoviários",
    "cidadeRegiao": "Sertãozinho - SP",
    "linhaProdutos": "Semirreboques canavieiros, reboques industriais e carrocerias metálicas pesadas",
    "materiaisAco": "Chapas Grossas Resistentes à Abrasão, Vigas W/I Laminadas, Tubos Industriais Pesados",
    "argumentoHunter": "Abastecimento contínuo no polo sucroalcooleiro de Sertãozinho e Ribeirão Preto para atender a safra sem gargalo.",
    "statusOriginal": "A Ligar",
    "spreadsheetId": "15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co",
    "spreadsheetTitle": "Clientes Âncora (R$ 50.000/mês cada)"
  },
  {
    "id": "ancora-16",
    "empresa": "Grimaldi Equipamentos para Transporte",
    "cnpj": "",
    "responsavel": "",
    "email": "comercial@grimaldi.com.br",
    "contato": "(19) 3896-9000",
    "nivelProspeccao": "Tentativa de contato",
    "observacoes": "[Santo Antônio de Posse - SP] Materiais: Perfis Dobrados Pesados, Chapas A36, Tubos Mecânicos e Vigas Laminadas | Abordagem: Redução de custos logísticos no fornecimento de chapas grossas e perfis na região de Campinas e Mogi Mirim.",
    "website": "www.grimaldi.com.br",
    "campanha": "CAMP-ANCORA-IMPLEMENTOS-RODOVIARIOS",
    "scriptAbordagem": "Redução de custos logísticos no fornecimento de chapas grossas e perfis na região de Campinas e Mogi Mirim.",
    "highlighted": true,
    "tab": "Implementos Rodoviários",
    "cidadeRegiao": "Santo Antônio de Posse - SP",
    "linhaProdutos": "Implementos rodoviários, plataformas hidráulicas, poliguindastes e semirreboques",
    "materiaisAco": "Perfis Dobrados Pesados, Chapas A36, Tubos Mecânicos e Vigas Laminadas",
    "argumentoHunter": "Redução de custos logísticos no fornecimento de chapas grossas e perfis na região de Campinas e Mogi Mirim.",
    "statusOriginal": "A Ligar",
    "spreadsheetId": "15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co",
    "spreadsheetTitle": "Clientes Âncora (R$ 50.000/mês cada)"
  },
  {
    "id": "ancora-17",
    "empresa": "Cal Leve Equipamentos Industriais",
    "cnpj": "",
    "responsavel": "",
    "email": "comercial@calleve.com.br",
    "contato": "(12) 3934-3967",
    "nivelProspeccao": "Tentativa de contato",
    "observacoes": "[São José dos Campos - SP] Materiais: Chapa Grossa A36 (3/16\" e 1/4\"), Chapa Fina a Quente (1/8\"), Perfis U Dobrados Estruturais | Abordagem: Fornecimento contínuo de chapas grossas de piso e perfis de travamento com entrega semanal programada.",
    "website": "www.calleve.com.br",
    "campanha": "CAMP-ANCORA-CACAMBAS",
    "scriptAbordagem": "Fornecimento contínuo de chapas grossas de piso e perfis de travamento com entrega semanal programada.",
    "highlighted": true,
    "tab": "Caçambas",
    "cidadeRegiao": "São José dos Campos - SP",
    "linhaProdutos": "Caçambas estacionárias para poliguindaste, caçambas roll-on roll-off e coletores industriais",
    "materiaisAco": "Chapa Grossa A36 (3/16\" e 1/4\"), Chapa Fina a Quente (1/8\"), Perfis U Dobrados Estruturais",
    "argumentoHunter": "Fornecimento contínuo de chapas grossas de piso e perfis de travamento com entrega semanal programada.",
    "statusOriginal": "A Ligar",
    "spreadsheetId": "15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co",
    "spreadsheetTitle": "Clientes Âncora (R$ 50.000/mês cada)"
  },
  {
    "id": "ancora-18",
    "empresa": "IMAVI Equipamentos Rodoviários",
    "cnpj": "",
    "responsavel": "",
    "email": "comercial@imavi.com",
    "contato": "(19) 3802-8500",
    "nivelProspeccao": "Tentativa de contato",
    "observacoes": "[Holambra - SP] Materiais: Perfis Dobrados Estruturais Pesados, Chapas de Aço Carbono A36, Vigas I e U Laminadas | Abordagem: Preço direto de distribuidor para grandes volumes de perfis U dobrados e chapas A36 com certificação de usina.",
    "website": "www.imavi.com",
    "campanha": "CAMP-ANCORA-CACAMBAS",
    "scriptAbordagem": "Preço direto de distribuidor para grandes volumes de perfis U dobrados e chapas A36 com certificação de usina.",
    "highlighted": true,
    "tab": "Caçambas",
    "cidadeRegiao": "Holambra - SP",
    "linhaProdutos": "Equipamentos roll-on roll-off, contêineres e caçambas industriais para transporte de carga",
    "materiaisAco": "Perfis Dobrados Estruturais Pesados, Chapas de Aço Carbono A36, Vigas I e U Laminadas",
    "argumentoHunter": "Preço direto de distribuidor para grandes volumes de perfis U dobrados e chapas A36 com certificação de usina.",
    "statusOriginal": "A Ligar",
    "spreadsheetId": "15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co",
    "spreadsheetTitle": "Clientes Âncora (R$ 50.000/mês cada)"
  },
  {
    "id": "ancora-19",
    "empresa": "Macofer Equipamentos Industriais",
    "cnpj": "",
    "responsavel": "",
    "email": "comercial@macofer.com.br",
    "contato": "(19) 3877-1667",
    "nivelProspeccao": "Tentativa de contato",
    "observacoes": "[Artur Nogueira - SP] Materiais: Chapas Pretas Laminadas a Quente (3mm a 6mm), Perfis U Enrijecidos, Tubos e Cantoneiras | Abordagem: Condições especiais em lotes mensais de chapas cortadas sob medida para caçambas de entulho e caixas roll-on.",
    "website": "www.macofer.com.br",
    "campanha": "CAMP-ANCORA-CACAMBAS",
    "scriptAbordagem": "Condições especiais em lotes mensais de chapas cortadas sob medida para caçambas de entulho e caixas roll-on.",
    "highlighted": true,
    "tab": "Caçambas",
    "cidadeRegiao": "Artur Nogueira - SP",
    "linhaProdutos": "Caçambas roll-on roll-off, caixas poliguindaste para entulho e carretas industriais",
    "materiaisAco": "Chapas Pretas Laminadas a Quente (3mm a 6mm), Perfis U Enrijecidos, Tubos e Cantoneiras",
    "argumentoHunter": "Condições especiais em lotes mensais de chapas cortadas sob medida para caçambas de entulho e caixas roll-on.",
    "statusOriginal": "A Ligar",
    "spreadsheetId": "15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co",
    "spreadsheetTitle": "Clientes Âncora (R$ 50.000/mês cada)"
  },
  {
    "id": "ancora-20",
    "empresa": "Stahlluz Metalurgia",
    "cnpj": "",
    "responsavel": "",
    "email": "comercial@stahlluz.com.br",
    "contato": "(11) 2056-1144",
    "nivelProspeccao": "Tentativa de contato",
    "observacoes": "[Mauá / São Paulo - SP] Materiais: Chapas de Aço Carbono Laminadas a Quente (2,65mm a 4,75mm), Perfis U Estruturais | Abordagem: Pronta-entrega de chapas laminadas e tubos na capital e Grande ABC com flexibilidade no faturamento.",
    "website": "www.stahlluz.com.br",
    "campanha": "CAMP-ANCORA-CACAMBAS",
    "scriptAbordagem": "Pronta-entrega de chapas laminadas e tubos na capital e Grande ABC com flexibilidade no faturamento.",
    "highlighted": true,
    "tab": "Caçambas",
    "cidadeRegiao": "Mauá / São Paulo - SP",
    "linhaProdutos": "Caçambas estacionárias para entulho de 3m³ a 7m³, caçambas roll-on e caçambas basculantes",
    "materiaisAco": "Chapas de Aço Carbono Laminadas a Quente (2,65mm a 4,75mm), Perfis U Estruturais",
    "argumentoHunter": "Pronta-entrega de chapas laminadas e tubos na capital e Grande ABC com flexibilidade no faturamento.",
    "statusOriginal": "A Ligar",
    "spreadsheetId": "15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co",
    "spreadsheetTitle": "Clientes Âncora (R$ 50.000/mês cada)"
  },
  {
    "id": "ancora-21",
    "empresa": "CB Caçambas (Grupo CB)",
    "cnpj": "",
    "responsavel": "",
    "email": "comercial@cbcacambas.com.br",
    "contato": "(11) 95570-0610",
    "nivelProspeccao": "Tentativa de contato",
    "observacoes": "[Pinhalzinho / Bragança Paulista - SP] Materiais: Chapa Grossa 3/16\" (fundo), Chapa Fina 1/8\" (laterais), Perfis U Laminados de Travamento | Abordagem: Eliminação do risco de desabastecimento de chapas de piso e perfis com frete ágil para a Região Bragantina.",
    "website": "www.cbcacambas.com.br",
    "campanha": "CAMP-ANCORA-CACAMBAS",
    "scriptAbordagem": "Eliminação do risco de desabastecimento de chapas de piso e perfis com frete ágil para a Região Bragantina.",
    "highlighted": true,
    "tab": "Caçambas",
    "cidadeRegiao": "Pinhalzinho / Bragança Paulista - SP",
    "linhaProdutos": "Caçambas estacionárias de entulho modelo poliguindaste e plataformas roll-on",
    "materiaisAco": "Chapa Grossa 3/16\" (fundo), Chapa Fina 1/8\" (laterais), Perfis U Laminados de Travamento",
    "argumentoHunter": "Eliminação do risco de desabastecimento de chapas de piso e perfis com frete ágil para a Região Bragantina.",
    "statusOriginal": "A Ligar",
    "spreadsheetId": "15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co",
    "spreadsheetTitle": "Clientes Âncora (R$ 50.000/mês cada)"
  },
  {
    "id": "ancora-22",
    "empresa": "Modelaço Implementos (Unidade SP)",
    "cnpj": "",
    "responsavel": "",
    "email": "comercial@modelaco.com.br",
    "contato": "(11) 2468-9000",
    "nivelProspeccao": "Tentativa de contato",
    "observacoes": "[Guarulhos - SP] Materiais: Chapas Finas e Grossas de Alta Resistência, Cantoneiras Laminadas, Tubos Mecânicos | Abordagem: Fornecimento de aço de alta resistência com garantia de planicidade para soldagem uniforme de caixotes roll-on.",
    "website": "www.modelaco.com.br",
    "campanha": "CAMP-ANCORA-CACAMBAS",
    "scriptAbordagem": "Fornecimento de aço de alta resistência com garantia de planicidade para soldagem uniforme de caixotes roll-on.",
    "highlighted": true,
    "tab": "Caçambas",
    "cidadeRegiao": "Guarulhos - SP",
    "linhaProdutos": "Caçambas roll-on roll-off de 15m³ a 40m³, caçambas basculantes e pranchas",
    "materiaisAco": "Chapas Finas e Grossas de Alta Resistência, Cantoneiras Laminadas, Tubos Mecânicos",
    "argumentoHunter": "Fornecimento de aço de alta resistência com garantia de planicidade para soldagem uniforme de caixotes roll-on.",
    "statusOriginal": "A Ligar",
    "spreadsheetId": "15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co",
    "spreadsheetTitle": "Clientes Âncora (R$ 50.000/mês cada)"
  },
  {
    "id": "ancora-23",
    "empresa": "Brazil Implementos (Polo SP)",
    "cnpj": "",
    "responsavel": "",
    "email": "comercial@brazilimplementos.com.br",
    "contato": "(11) 3230-8899",
    "nivelProspeccao": "Tentativa de contato",
    "observacoes": "[Guarulhos - SP] Materiais: Chapas Estruturais de Aço Carbono, Tubos para Eixos/Braços, Perfis Dobrados | Abordagem: Preços competitivos em pacotes casados de chapas grossas e perfis U para montagem seriada de poliguindastes.",
    "website": "www.brazilimplementos.com.br",
    "campanha": "CAMP-ANCORA-CACAMBAS",
    "scriptAbordagem": "Preços competitivos em pacotes casados de chapas grossas e perfis U para montagem seriada de poliguindastes.",
    "highlighted": true,
    "tab": "Caçambas",
    "cidadeRegiao": "Guarulhos - SP",
    "linhaProdutos": "Caçambas para poliguindaste simples e duplo, caçambas basculantes sobre chassi",
    "materiaisAco": "Chapas Estruturais de Aço Carbono, Tubos para Eixos/Braços, Perfis Dobrados",
    "argumentoHunter": "Preços competitivos em pacotes casados de chapas grossas e perfis U para montagem seriada de poliguindastes.",
    "statusOriginal": "A Ligar",
    "spreadsheetId": "15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co",
    "spreadsheetTitle": "Clientes Âncora (R$ 50.000/mês cada)"
  },
  {
    "id": "ancora-24",
    "empresa": "Caçambas Três Irmãos",
    "cnpj": "",
    "responsavel": "",
    "email": "comercial@tresirmaoscacambas.com.br",
    "contato": "(19) 3874-2100",
    "nivelProspeccao": "Tentativa de contato",
    "observacoes": "[Paulínia / Campinas - SP] Materiais: Chapa Fina a Quente 11 e 12 (laterais), Chapa Grossa 3/16\" (fundo), Perfis U Enrijecidos | Abordagem: Economia na compra combinada de chapas e perfis U dobrados com entrega rápida na Região Metropolitana de Campinas.",
    "website": "www.tresirmaoscacambas.com.br",
    "campanha": "CAMP-ANCORA-CACAMBAS",
    "scriptAbordagem": "Economia na compra combinada de chapas e perfis U dobrados com entrega rápida na Região Metropolitana de Campinas.",
    "highlighted": true,
    "tab": "Caçambas",
    "cidadeRegiao": "Paulínia / Campinas - SP",
    "linhaProdutos": "Caçambas para descarte de entulho estacionárias, caixas compactadoras e caçambas roll-on",
    "materiaisAco": "Chapa Fina a Quente 11 e 12 (laterais), Chapa Grossa 3/16\" (fundo), Perfis U Enrijecidos",
    "argumentoHunter": "Economia na compra combinada de chapas e perfis U dobrados com entrega rápida na Região Metropolitana de Campinas.",
    "statusOriginal": "A Ligar",
    "spreadsheetId": "15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co",
    "spreadsheetTitle": "Clientes Âncora (R$ 50.000/mês cada)"
  },
  {
    "id": "ancora-25",
    "empresa": "Roma Caçambas e Implementos",
    "cnpj": "",
    "responsavel": "",
    "email": "comercial@romaimplementos.com.br",
    "contato": "(19) 3873-4500",
    "nivelProspeccao": "Tentativa de contato",
    "observacoes": "[Sumaré - SP] Materiais: Perfis U Dobrados em Chapa 1/8\", Chapas de Aço Carbono Laminadas a Quente, Barras Chatas | Abordagem: Negociação direta com a Gofer para travar cotações em contratos trimestrais de fornecimento de aço.",
    "website": "www.romaimplementos.com.br",
    "campanha": "CAMP-ANCORA-CACAMBAS",
    "scriptAbordagem": "Negociação direta com a Gofer para travar cotações em contratos trimestrais de fornecimento de aço.",
    "highlighted": true,
    "tab": "Caçambas",
    "cidadeRegiao": "Sumaré - SP",
    "linhaProdutos": "Fabricação de caçambas estacionárias de entulho e sistemas hidráulicos basculantes",
    "materiaisAco": "Perfis U Dobrados em Chapa 1/8\", Chapas de Aço Carbono Laminadas a Quente, Barras Chatas",
    "argumentoHunter": "Negociação direta com a Gofer para travar cotações em contratos trimestrais de fornecimento de aço.",
    "statusOriginal": "A Ligar",
    "spreadsheetId": "15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co",
    "spreadsheetTitle": "Clientes Âncora (R$ 50.000/mês cada)"
  },
  {
    "id": "ancora-26",
    "empresa": "Meneghetti Caçambas Industriais",
    "cnpj": "",
    "responsavel": "",
    "email": "comercial@meneghettiimplementos.com.br",
    "contato": "(16) 3382-7700",
    "nivelProspeccao": "Tentativa de contato",
    "observacoes": "[Matão - SP] Materiais: Chapa Grossa A36, Perfis Tubulares Pesados, Cantoneiras Laminadas de Abas Iguais | Abordagem: Apoio técnico no dimensionamento de chapas para reduzir perdas de retalhos na caldeiraria pesada.",
    "website": "www.meneghettiimplementos.com.br",
    "campanha": "CAMP-ANCORA-CACAMBAS",
    "scriptAbordagem": "Apoio técnico no dimensionamento de chapas para reduzir perdas de retalhos na caldeiraria pesada.",
    "highlighted": true,
    "tab": "Caçambas",
    "cidadeRegiao": "Matão - SP",
    "linhaProdutos": "Caçambas basculantes industriais, caçambas roll-on e caixas para transporte de grãos",
    "materiaisAco": "Chapa Grossa A36, Perfis Tubulares Pesados, Cantoneiras Laminadas de Abas Iguais",
    "argumentoHunter": "Apoio técnico no dimensionamento de chapas para reduzir perdas de retalhos na caldeiraria pesada.",
    "statusOriginal": "A Ligar",
    "spreadsheetId": "15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co",
    "spreadsheetTitle": "Clientes Âncora (R$ 50.000/mês cada)"
  },
  {
    "id": "ancora-27",
    "empresa": "Rodoaço Equipamentos",
    "cnpj": "",
    "responsavel": "",
    "email": "comercial@rodoacoequipamentos.com.br",
    "contato": "(19) 3424-8800",
    "nivelProspeccao": "Tentativa de contato",
    "observacoes": "[Piracicaba - SP] Materiais: Chapas Resistentes à Abrasão (Hardox/USI-AR), Perfis U Dobrados Pesados, Vigas W | Abordagem: Disponibilidade de aços estruturais de alta resistência com certificado de dureza para caçambas de mineração.",
    "website": "www.rodoacoequipamentos.com.br",
    "campanha": "CAMP-ANCORA-CACAMBAS",
    "scriptAbordagem": "Disponibilidade de aços estruturais de alta resistência com certificado de dureza para caçambas de mineração.",
    "highlighted": true,
    "tab": "Caçambas",
    "cidadeRegiao": "Piracicaba - SP",
    "linhaProdutos": "Caçambas basculantes sobre chassi para mineração, canavieiro e construção civil",
    "materiaisAco": "Chapas Resistentes à Abrasão (Hardox/USI-AR), Perfis U Dobrados Pesados, Vigas W",
    "argumentoHunter": "Disponibilidade de aços estruturais de alta resistência com certificado de dureza para caçambas de mineração.",
    "statusOriginal": "A Ligar",
    "spreadsheetId": "15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co",
    "spreadsheetTitle": "Clientes Âncora (R$ 50.000/mês cada)"
  },
  {
    "id": "ancora-28",
    "empresa": "Zanetti Caçambas e Estruturas",
    "cnpj": "",
    "responsavel": "",
    "email": "comercial@zanetticacambas.com.br",
    "contato": "(16) 3942-3300",
    "nivelProspeccao": "Tentativa de contato",
    "observacoes": "[Sertãozinho - SP] Materiais: Chapa de Aço Carbono Laminada a Quente 1/8\" e 3/16\", Tubos Redondos de Içamento | Abordagem: Atendimento a projetos em conformidade rigorosa com a NBR 14728 fornecendo chapas certificadas e rastreadas.",
    "website": "www.zanetticacambas.com.br",
    "campanha": "CAMP-ANCORA-CACAMBAS",
    "scriptAbordagem": "Atendimento a projetos em conformidade rigorosa com a NBR 14728 fornecendo chapas certificadas e rastreadas.",
    "highlighted": true,
    "tab": "Caçambas",
    "cidadeRegiao": "Sertãozinho - SP",
    "linhaProdutos": "Caçambas de entulho padrão PMSP e normas ABNT NBR 14728, caçambas roll-on reforçadas",
    "materiaisAco": "Chapa de Aço Carbono Laminada a Quente 1/8\" e 3/16\", Tubos Redondos de Içamento",
    "argumentoHunter": "Atendimento a projetos em conformidade rigorosa com a NBR 14728 fornecendo chapas certificadas e rastreadas.",
    "statusOriginal": "A Ligar",
    "spreadsheetId": "15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co",
    "spreadsheetTitle": "Clientes Âncora (R$ 50.000/mês cada)"
  },
  {
    "id": "ancora-29",
    "empresa": "MultiCaçambas Fabricação",
    "cnpj": "",
    "responsavel": "",
    "email": "comercial@multicacambassp.com.br",
    "contato": "(11) 4642-1800",
    "nivelProspeccao": "Tentativa de contato",
    "observacoes": "[Itaquaquecetuba - SP] Materiais: Chapas Grossas para Assoalho, Perfis Estruturais de Travamento, Tubos Mecânicos | Abordagem: Entrega imediata de chapas e perfis no polo do Alto Tietê, eliminando descompassos no fluxo produtivo.",
    "website": "www.multicacambassp.com.br",
    "campanha": "CAMP-ANCORA-CACAMBAS",
    "scriptAbordagem": "Entrega imediata de chapas e perfis no polo do Alto Tietê, eliminando descompassos no fluxo produtivo.",
    "highlighted": true,
    "tab": "Caçambas",
    "cidadeRegiao": "Itaquaquecetuba - SP",
    "linhaProdutos": "Caçambas estacionárias reforçadas para entulho e caixas roll-on para sucatas",
    "materiaisAco": "Chapas Grossas para Assoalho, Perfis Estruturais de Travamento, Tubos Mecânicos",
    "argumentoHunter": "Entrega imediata de chapas e perfis no polo do Alto Tietê, eliminando descompassos no fluxo produtivo.",
    "statusOriginal": "A Ligar",
    "spreadsheetId": "15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co",
    "spreadsheetTitle": "Clientes Âncora (R$ 50.000/mês cada)"
  },
  {
    "id": "ancora-30",
    "empresa": "Carrocerias e Caçambas Morumbi",
    "cnpj": "",
    "responsavel": "",
    "email": "comercial@morumbiimplementos.com.br",
    "contato": "(11) 5841-3300",
    "nivelProspeccao": "Tentativa de contato",
    "observacoes": "[São Paulo (Zona Sul) - SP] Materiais: Chapas Finas a Quente, Chapa Grossa A36, Perfis U Dobrados, Vigas U Laminadas | Abordagem: Logística capilarizada de entrega de aço na capital com possibilidade de pedidos fracionados.",
    "website": "www.morumbiimplementos.com.br",
    "campanha": "CAMP-ANCORA-CACAMBAS",
    "scriptAbordagem": "Logística capilarizada de entrega de aço na capital com possibilidade de pedidos fracionados.",
    "highlighted": true,
    "tab": "Caçambas",
    "cidadeRegiao": "São Paulo (Zona Sul) - SP",
    "linhaProdutos": "Caçambas basculantes meia-cana, caçambas quadradas de entulho e sobre chassi",
    "materiaisAco": "Chapas Finas a Quente, Chapa Grossa A36, Perfis U Dobrados, Vigas U Laminadas",
    "argumentoHunter": "Logística capilarizada de entrega de aço na capital com possibilidade de pedidos fracionados.",
    "statusOriginal": "A Ligar",
    "spreadsheetId": "15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co",
    "spreadsheetTitle": "Clientes Âncora (R$ 50.000/mês cada)"
  },
  {
    "id": "ancora-31",
    "empresa": "Caçambas Líder SP",
    "cnpj": "",
    "responsavel": "",
    "email": "comercial@lidercacambassp.com.br",
    "contato": "(15) 3228-5500",
    "nivelProspeccao": "Tentativa de contato",
    "observacoes": "[Sorocaba - SP] Materiais: Chapas de Aço Carbono 1010/1020, Perfis Dobrados a Frio, Tubos Industriais de Travamento | Abordagem: Preço agressivo de distribuidor para chapas de caldeiraria com prazo de pagamento estendido no faturado.",
    "website": "www.lidercacambassp.com.br",
    "campanha": "CAMP-ANCORA-CACAMBAS",
    "scriptAbordagem": "Preço agressivo de distribuidor para chapas de caldeiraria com prazo de pagamento estendido no faturado.",
    "highlighted": true,
    "tab": "Caçambas",
    "cidadeRegiao": "Sorocaba - SP",
    "linhaProdutos": "Caçambas para poliguindaste articulado e caixas metálicas industriais de armazenamento",
    "materiaisAco": "Chapas de Aço Carbono 1010/1020, Perfis Dobrados a Frio, Tubos Industriais de Travamento",
    "argumentoHunter": "Preço agressivo de distribuidor para chapas de caldeiraria com prazo de pagamento estendido no faturado.",
    "statusOriginal": "A Ligar",
    "spreadsheetId": "15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co",
    "spreadsheetTitle": "Clientes Âncora (R$ 50.000/mês cada)"
  },
  {
    "id": "ancora-32",
    "empresa": "Facchini (Divisão Caçambas e Basculantes)",
    "cnpj": "",
    "responsavel": "",
    "email": "comercial@facchini.com.br",
    "contato": "(17) 3426-9000",
    "nivelProspeccao": "Tentativa de contato",
    "observacoes": "[Votuporanga - SP] Materiais: Chapas de Alta Resistência, Bobinas Grossas Laminadas a Quente, Perfis Estruturais Pesados | Abordagem: Fornecimento programado em larga escala de bobinas e chapas com rigor dimensional e logística garantida.",
    "website": "www.facchini.com.br",
    "campanha": "CAMP-ANCORA-CACAMBAS",
    "scriptAbordagem": "Fornecimento programado em larga escala de bobinas e chapas com rigor dimensional e logística garantida.",
    "highlighted": true,
    "tab": "Caçambas",
    "cidadeRegiao": "Votuporanga - SP",
    "linhaProdutos": "Caçambas basculantes rodoviárias, semirreboques caçamba e caixas roll-on para canavieiro",
    "materiaisAco": "Chapas de Alta Resistência, Bobinas Grossas Laminadas a Quente, Perfis Estruturais Pesados",
    "argumentoHunter": "Fornecimento programado em larga escala de bobinas e chapas com rigor dimensional e logística garantida.",
    "statusOriginal": "A Ligar",
    "spreadsheetId": "15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co",
    "spreadsheetTitle": "Clientes Âncora (R$ 50.000/mês cada)"
  },
  {
    "id": "ancora-33",
    "empresa": "Truckvan Furgões e Baús",
    "cnpj": "",
    "responsavel": "",
    "email": "comercial@truckvan.com.br",
    "contato": "(11) 2086-5555",
    "nivelProspeccao": "Tentativa de contato",
    "observacoes": "[Guarulhos - SP] Materiais: Tubos Estruturais Retangulares (Metalon), Perfis Z Dobrados, Chapas Finas Galvanizadas | Abordagem: Linha completa de tubos metalon e perfis dobrados para travamento e fechamento com entrega diária em Guarulhos.",
    "website": "www.truckvan.com.br",
    "campanha": "CAMP-ANCORA-BAUS",
    "scriptAbordagem": "Linha completa de tubos metalon e perfis dobrados para travamento e fechamento com entrega diária em Guarulhos.",
    "highlighted": true,
    "tab": "Baús",
    "cidadeRegiao": "Guarulhos - SP",
    "linhaProdutos": "Furgões carga seca em duralumínio/aço, carrocerias sider lonadas e semirreboques",
    "materiaisAco": "Tubos Estruturais Retangulares (Metalon), Perfis Z Dobrados, Chapas Finas Galvanizadas",
    "argumentoHunter": "Linha completa de tubos metalon e perfis dobrados para travamento e fechamento com entrega diária em Guarulhos.",
    "statusOriginal": "A Ligar",
    "spreadsheetId": "15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co",
    "spreadsheetTitle": "Clientes Âncora (R$ 50.000/mês cada)"
  },
  {
    "id": "ancora-34",
    "empresa": "4Truck Fabricante de Baús",
    "cnpj": "",
    "responsavel": "",
    "email": "comercial@4truck.com.br",
    "contato": "(11) 2481-6000",
    "nivelProspeccao": "Tentativa de contato",
    "observacoes": "[Guarulhos - SP] Materiais: Perfis Dobrados tipo Cartola e Z em Chapa Galvanizada, Tubos Quadrados, Cantoneiras | Abordagem: Chapas galvanizadas e perfis dobrados estruturais com tolerância milimétrica para montagem rápida de baús.",
    "website": "www.4truck.com.br",
    "campanha": "CAMP-ANCORA-BAUS",
    "scriptAbordagem": "Chapas galvanizadas e perfis dobrados estruturais com tolerância milimétrica para montagem rápida de baús.",
    "highlighted": true,
    "tab": "Baús",
    "cidadeRegiao": "Guarulhos - SP",
    "linhaProdutos": "Baús de alumínio/aço para caminhão, baús sider lonados e carrocerias carga seca",
    "materiaisAco": "Perfis Dobrados tipo Cartola e Z em Chapa Galvanizada, Tubos Quadrados, Cantoneiras",
    "argumentoHunter": "Chapas galvanizadas e perfis dobrados estruturais com tolerância milimétrica para montagem rápida de baús.",
    "statusOriginal": "A Ligar",
    "spreadsheetId": "15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co",
    "spreadsheetTitle": "Clientes Âncora (R$ 50.000/mês cada)"
  },
  {
    "id": "ancora-35",
    "empresa": "Rino Carrocerias Frigoríficas",
    "cnpj": "",
    "responsavel": "",
    "email": "comercial@rinocarrocerias.com.br",
    "contato": "(11) 3686-1053",
    "nivelProspeccao": "Tentativa de contato",
    "observacoes": "[Cotia - SP] Materiais: Chapa Xadrez de Alumínio e Aço para Piso, Perfis Tubulares Estruturais em Aço Carbono e Inox | Abordagem: Fornecimento de aço inoxidável e perfis estruturais de carbono com excelente acabamento para baixas temperaturas.",
    "website": "www.rinocarrocerias.com.br",
    "campanha": "CAMP-ANCORA-BAUS",
    "scriptAbordagem": "Fornecimento de aço inoxidável e perfis estruturais de carbono com excelente acabamento para baixas temperaturas.",
    "highlighted": true,
    "tab": "Baús",
    "cidadeRegiao": "Cotia - SP",
    "linhaProdutos": "Baús frigoríficos, furgões isotérmicos para congelados e carrocerias refrigeradas",
    "materiaisAco": "Chapa Xadrez de Alumínio e Aço para Piso, Perfis Tubulares Estruturais em Aço Carbono e Inox",
    "argumentoHunter": "Fornecimento de aço inoxidável e perfis estruturais de carbono com excelente acabamento para baixas temperaturas.",
    "statusOriginal": "A Ligar",
    "spreadsheetId": "15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co",
    "spreadsheetTitle": "Clientes Âncora (R$ 50.000/mês cada)"
  },
  {
    "id": "ancora-36",
    "empresa": "Carrocerias Weber e Baús Buoro",
    "cnpj": "",
    "responsavel": "",
    "email": "comercial@carroceriasweber.com.br",
    "contato": "(11) 2482-1200",
    "nivelProspeccao": "Tentativa de contato",
    "observacoes": "[Guarulhos - SP] Materiais: Perfis Dobrados em Chapa de Aço Fina a Frio e Galvanizada, Tubos Metalon para Grade | Abordagem: Pronta-entrega de perfis estruturais de travamento e quadros traseiros soldados para baús e carrocerias.",
    "website": "www.carroceriasweber.com.br",
    "campanha": "CAMP-ANCORA-BAUS",
    "scriptAbordagem": "Pronta-entrega de perfis estruturais de travamento e quadros traseiros soldados para baús e carrocerias.",
    "highlighted": true,
    "tab": "Baús",
    "cidadeRegiao": "Guarulhos - SP",
    "linhaProdutos": "Baús de alumínio carga seca, furgões lonados sider e carrocerias metálicas",
    "materiaisAco": "Perfis Dobrados em Chapa de Aço Fina a Frio e Galvanizada, Tubos Metalon para Grade",
    "argumentoHunter": "Pronta-entrega de perfis estruturais de travamento e quadros traseiros soldados para baús e carrocerias.",
    "statusOriginal": "A Ligar",
    "spreadsheetId": "15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co",
    "spreadsheetTitle": "Clientes Âncora (R$ 50.000/mês cada)"
  },
  {
    "id": "ancora-37",
    "empresa": "EDARP Baús e Furgões",
    "cnpj": "",
    "responsavel": "",
    "email": "comercial@edarp.ind.br",
    "contato": "(11) 2955-4000",
    "nivelProspeccao": "Tentativa de contato",
    "observacoes": "[São Paulo (Zona Leste) - SP] Materiais: Tubos Estruturais, Perfis U e Z de Aço Galvanizado, Chapas Decapadas para Longarinas | Abordagem: Redução de custos na aquisição de perfis de aço estrutural para reforço de piso e longarinas de baús.",
    "website": "www.edarp.ind.br",
    "campanha": "CAMP-ANCORA-BAUS",
    "scriptAbordagem": "Redução de custos na aquisição de perfis de aço estrutural para reforço de piso e longarinas de baús.",
    "highlighted": true,
    "tab": "Baús",
    "cidadeRegiao": "São Paulo (Zona Leste) - SP",
    "linhaProdutos": "Baús furgão de duralumínio, furgões carga seca em aço e carrocerias sider",
    "materiaisAco": "Tubos Estruturais, Perfis U e Z de Aço Galvanizado, Chapas Decapadas para Longarinas",
    "argumentoHunter": "Redução de custos na aquisição de perfis de aço estrutural para reforço de piso e longarinas de baús.",
    "statusOriginal": "A Ligar",
    "spreadsheetId": "15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co",
    "spreadsheetTitle": "Clientes Âncora (R$ 50.000/mês cada)"
  },
  {
    "id": "ancora-38",
    "empresa": "Bela Vista Carrocerias e Baús",
    "cnpj": "",
    "responsavel": "",
    "email": "comercial@belavistacarrocerias.com.br",
    "contato": "(11) 2955-6038",
    "nivelProspeccao": "Tentativa de contato",
    "observacoes": "[São Paulo (Parque Novo Mundo) - SP] Materiais: Perfis de Aço Dobrado, Tubos Retangulares para Chassi, Chapas de Piso Antiderrapante | Abordagem: Estoque a pronta-entrega na Zona Norte de chapas e tubos, agilizando reformas urgentes e fabricação nova.",
    "website": "www.belavistacarrocerias.com.br",
    "campanha": "CAMP-ANCORA-BAUS",
    "scriptAbordagem": "Estoque a pronta-entrega na Zona Norte de chapas e tubos, agilizando reformas urgentes e fabricação nova.",
    "highlighted": true,
    "tab": "Baús",
    "cidadeRegiao": "São Paulo (Parque Novo Mundo) - SP",
    "linhaProdutos": "Fabricação de baús de alumínio carga seca, carrocerias metálicas e reformas",
    "materiaisAco": "Perfis de Aço Dobrado, Tubos Retangulares para Chassi, Chapas de Piso Antiderrapante",
    "argumentoHunter": "Estoque a pronta-entrega na Zona Norte de chapas e tubos, agilizando reformas urgentes e fabricação nova.",
    "statusOriginal": "A Ligar",
    "spreadsheetId": "15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co",
    "spreadsheetTitle": "Clientes Âncora (R$ 50.000/mês cada)"
  },
  {
    "id": "ancora-39",
    "empresa": "Vision Implementos e Baús",
    "cnpj": "",
    "responsavel": "",
    "email": "comercial@visionimplementos.com.br",
    "contato": "(11) 2446-2800",
    "nivelProspeccao": "Tentativa de contato",
    "observacoes": "[Guarulhos - SP] Materiais: Tubos Industriais Metalon, Perfis Cartola Dobrados, Cantoneiras e Chapas Galvanizadas | Abordagem: Pacote mensal programado de perfis enrijecidos e tubos para produção seriada de furgões sider e carga seca.",
    "website": "www.visionimplementos.com.br",
    "campanha": "CAMP-ANCORA-BAUS",
    "scriptAbordagem": "Pacote mensal programado de perfis enrijecidos e tubos para produção seriada de furgões sider e carga seca.",
    "highlighted": true,
    "tab": "Baús",
    "cidadeRegiao": "Guarulhos - SP",
    "linhaProdutos": "Furgões carga seca, baús sider, baús refrigerados e cabines suplementares",
    "materiaisAco": "Tubos Industriais Metalon, Perfis Cartola Dobrados, Cantoneiras e Chapas Galvanizadas",
    "argumentoHunter": "Pacote mensal programado de perfis enrijecidos e tubos para produção seriada de furgões sider e carga seca.",
    "statusOriginal": "A Ligar",
    "spreadsheetId": "15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co",
    "spreadsheetTitle": "Clientes Âncora (R$ 50.000/mês cada)"
  },
  {
    "id": "ancora-40",
    "empresa": "Roda de Ouro Baús e Carrocerias",
    "cnpj": "",
    "responsavel": "",
    "email": "comercial@rodadeouro.com.br",
    "contato": "(11) 2469-1486",
    "nivelProspeccao": "Tentativa de contato",
    "observacoes": "[Guarulhos - SP] Materiais: Chapa Fina a Quente/Frio, Perfis Z e U Dobrados, Tubos para Quadro Traseiro | Abordagem: Apoio da engenharia da Gofer na escolha do aço ideal para aliviar o peso da carroceria sem perder resistência mecânica.",
    "website": "www.rodadeouro.com.br",
    "campanha": "CAMP-ANCORA-BAUS",
    "scriptAbordagem": "Apoio da engenharia da Gofer na escolha do aço ideal para aliviar o peso da carroceria sem perder resistência mecânica.",
    "highlighted": true,
    "tab": "Baús",
    "cidadeRegiao": "Guarulhos - SP",
    "linhaProdutos": "Baús de alumínio carga seca, carrocerias sider e furgões sobre chassi",
    "materiaisAco": "Chapa Fina a Quente/Frio, Perfis Z e U Dobrados, Tubos para Quadro Traseiro",
    "argumentoHunter": "Apoio da engenharia da Gofer na escolha do aço ideal para aliviar o peso da carroceria sem perder resistência mecânica.",
    "statusOriginal": "A Ligar",
    "spreadsheetId": "15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co",
    "spreadsheetTitle": "Clientes Âncora (R$ 50.000/mês cada)"
  },
  {
    "id": "ancora-41",
    "empresa": "Hami Baús e Implementos",
    "cnpj": "",
    "responsavel": "",
    "email": "comercial@hamibau.com.br",
    "contato": "(11) 2408-7700",
    "nivelProspeccao": "Tentativa de contato",
    "observacoes": "[São Paulo / Guarulhos - SP] Materiais: Perfis de Aço Galvanizado Dobrados, Tubos Estruturais, Chapas de Proteção de Rodapé | Abordagem: Fornecimento de chapas de desgaste para piso e proteção de rodapé de empilhadeiras com faturamento flexível.",
    "website": "www.hamibau.com.br",
    "campanha": "CAMP-ANCORA-BAUS",
    "scriptAbordagem": "Fornecimento de chapas de desgaste para piso e proteção de rodapé de empilhadeiras com faturamento flexível.",
    "highlighted": true,
    "tab": "Baús",
    "cidadeRegiao": "São Paulo / Guarulhos - SP",
    "linhaProdutos": "Baús carga seca, furgões de duralumínio e carrocerias lonadas sider",
    "materiaisAco": "Perfis de Aço Galvanizado Dobrados, Tubos Estruturais, Chapas de Proteção de Rodapé",
    "argumentoHunter": "Fornecimento de chapas de desgaste para piso e proteção de rodapé de empilhadeiras com faturamento flexível.",
    "statusOriginal": "A Ligar",
    "spreadsheetId": "15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co",
    "spreadsheetTitle": "Clientes Âncora (R$ 50.000/mês cada)"
  },
  {
    "id": "ancora-42",
    "empresa": "Refrigeração Real (RP Truck)",
    "cnpj": "",
    "responsavel": "",
    "email": "comercial@refrigeracaoreal.com.br",
    "contato": "(16) 3945-6734",
    "nivelProspeccao": "Tentativa de contato",
    "observacoes": "[Sertãozinho - SP] Materiais: Chapa Xadrez antiderrapante para piso, Perfis Tubulares de Sustentação de Painéis | Abordagem: Chapas de piso antiderrapante e perfis estruturais de reforço interno com entrega no polo de Sertãozinho.",
    "website": "www.refrigeracaoreal.com.br",
    "campanha": "CAMP-ANCORA-BAUS",
    "scriptAbordagem": "Chapas de piso antiderrapante e perfis estruturais de reforço interno com entrega no polo de Sertãozinho.",
    "highlighted": true,
    "tab": "Baús",
    "cidadeRegiao": "Sertãozinho - SP",
    "linhaProdutos": "Baús frigoríficos, carrocerias térmicas e isolamento térmico veicular",
    "materiaisAco": "Chapa Xadrez antiderrapante para piso, Perfis Tubulares de Sustentação de Painéis",
    "argumentoHunter": "Chapas de piso antiderrapante e perfis estruturais de reforço interno com entrega no polo de Sertãozinho.",
    "statusOriginal": "A Ligar",
    "spreadsheetId": "15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co",
    "spreadsheetTitle": "Clientes Âncora (R$ 50.000/mês cada)"
  },
  {
    "id": "ancora-43",
    "empresa": "FWest Baús Frigoríficos",
    "cnpj": "",
    "responsavel": "",
    "email": "comercial@fwestbaus.com.br",
    "contato": "(11) 3601-5000",
    "nivelProspeccao": "Tentativa de contato",
    "observacoes": "[Osasco - SP] Materiais: Tubos Estruturais para Subchassi, Cantoneiras e Reforços em Aço Carbono | Abordagem: Suprimento de aço estrutural para subchassi de baús isotérmicos com garantia de esquadro e tolerância precisa.",
    "website": "www.fwestbaus.com.br",
    "campanha": "CAMP-ANCORA-BAUS",
    "scriptAbordagem": "Suprimento de aço estrutural para subchassi de baús isotérmicos com garantia de esquadro e tolerância precisa.",
    "highlighted": true,
    "tab": "Baús",
    "cidadeRegiao": "Osasco - SP",
    "linhaProdutos": "Baús frigoríficos, carrocerias refrigeradas para utilitários e caminhões médios",
    "materiaisAco": "Tubos Estruturais para Subchassi, Cantoneiras e Reforços em Aço Carbono",
    "argumentoHunter": "Suprimento de aço estrutural para subchassi de baús isotérmicos com garantia de esquadro e tolerância precisa.",
    "statusOriginal": "A Ligar",
    "spreadsheetId": "15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co",
    "spreadsheetTitle": "Clientes Âncora (R$ 50.000/mês cada)"
  },
  {
    "id": "ancora-44",
    "empresa": "Bauforte Perfis e Implementos",
    "cnpj": "",
    "responsavel": "",
    "email": "comercial@bauforte.com.br",
    "contato": "(11) 2483-2271",
    "nivelProspeccao": "Tentativa de contato",
    "observacoes": "[Guarulhos - SP] Materiais: Chapas Galvanizadas Dobradas, Perfis Z, Perfis Cartola e Tubos de Amarração | Abordagem: Parceria no suprimento de bobinas galvanizadas e tiras cortadas (slitter) com entrega programada.",
    "website": "www.bauforte.com.br",
    "campanha": "CAMP-ANCORA-BAUS",
    "scriptAbordagem": "Parceria no suprimento de bobinas galvanizadas e tiras cortadas (slitter) com entrega programada.",
    "highlighted": true,
    "tab": "Baús",
    "cidadeRegiao": "Guarulhos - SP",
    "linhaProdutos": "Componentes estruturais e perfis de aço para baús carga seca, sider e bebidas",
    "materiaisAco": "Chapas Galvanizadas Dobradas, Perfis Z, Perfis Cartola e Tubos de Amarração",
    "argumentoHunter": "Parceria no suprimento de bobinas galvanizadas e tiras cortadas (slitter) com entrega programada.",
    "statusOriginal": "A Ligar",
    "spreadsheetId": "15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co",
    "spreadsheetTitle": "Clientes Âncora (R$ 50.000/mês cada)"
  },
  {
    "id": "ancora-45",
    "empresa": "Ice Frio Porto dos Baús",
    "cnpj": "",
    "responsavel": "",
    "email": "comercial@portodosbaus.com.br",
    "contato": "(11) 2631-8900",
    "nivelProspeccao": "Tentativa de contato",
    "observacoes": "[São Paulo (Zona Norte) - SP] Materiais: Perfis de Aço de Reforço, Cantoneiras Dobradas, Chapas Xadrez de Aço Carbono | Abordagem: Evite atrasos na entrega de baús refrigerados com pedidos expressos de perfis dobrados na Grande SP.",
    "website": "www.portodosbaus.com.br",
    "campanha": "CAMP-ANCORA-BAUS",
    "scriptAbordagem": "Evite atrasos na entrega de baús refrigerados com pedidos expressos de perfis dobrados na Grande SP.",
    "highlighted": true,
    "tab": "Baús",
    "cidadeRegiao": "São Paulo (Zona Norte) - SP",
    "linhaProdutos": "Baús frigoríficos, furgões térmicos e carrocerias isotérmicas",
    "materiaisAco": "Perfis de Aço de Reforço, Cantoneiras Dobradas, Chapas Xadrez de Aço Carbono",
    "argumentoHunter": "Evite atrasos na entrega de baús refrigerados com pedidos expressos de perfis dobrados na Grande SP.",
    "statusOriginal": "A Ligar",
    "spreadsheetId": "15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co",
    "spreadsheetTitle": "Clientes Âncora (R$ 50.000/mês cada)"
  },
  {
    "id": "ancora-46",
    "empresa": "Carrocerias São Pedro",
    "cnpj": "",
    "responsavel": "",
    "email": "comercial@carroceriassaopedro.com.br",
    "contato": "(19) 3289-4400",
    "nivelProspeccao": "Tentativa de contato",
    "observacoes": "[Campinas - SP] Materiais: Tubos Metalon para Grade Interna, Perfis Dobrados em Chapa Fina, Chapas Lisas | Abordagem: Preço agressivo de atacado em tubos estruturais e perfis dobrados para reformas e novos baús na Região de Campinas.",
    "website": "www.carroceriassaopedro.com.br",
    "campanha": "CAMP-ANCORA-BAUS",
    "scriptAbordagem": "Preço agressivo de atacado em tubos estruturais e perfis dobrados para reformas e novos baús na Região de Campinas.",
    "highlighted": true,
    "tab": "Baús",
    "cidadeRegiao": "Campinas - SP",
    "linhaProdutos": "Carrocerias baú de alumínio, furgões carga seca e reformas de frotas comerciais",
    "materiaisAco": "Tubos Metalon para Grade Interna, Perfis Dobrados em Chapa Fina, Chapas Lisas",
    "argumentoHunter": "Preço agressivo de atacado em tubos estruturais e perfis dobrados para reformas e novos baús na Região de Campinas.",
    "statusOriginal": "A Ligar",
    "spreadsheetId": "15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co",
    "spreadsheetTitle": "Clientes Âncora (R$ 50.000/mês cada)"
  },
  {
    "id": "ancora-47",
    "empresa": "JR Baús e Furgões",
    "cnpj": "",
    "responsavel": "",
    "email": "comercial@jrbaus.com",
    "contato": "(11) 2209-1500",
    "nivelProspeccao": "Tentativa de contato",
    "observacoes": "[São Paulo (Zona Norte) - SP] Materiais: Tubos Quadrados/Retangulares, Chapas de Piso Xadrez e Lisas, Perfis Z | Abordagem: Fornecimento de aços com medidas sob encomenda para oficinas de reforma e fabricação de baús na capital.",
    "website": "www.jrbaus.com",
    "campanha": "CAMP-ANCORA-BAUS",
    "scriptAbordagem": "Fornecimento de aços com medidas sob encomenda para oficinas de reforma e fabricação de baús na capital.",
    "highlighted": true,
    "tab": "Baús",
    "cidadeRegiao": "São Paulo (Zona Norte) - SP",
    "linhaProdutos": "Baús de alumínio carga seca novos e reformados, baús sider e carrocerias",
    "materiaisAco": "Tubos Quadrados/Retangulares, Chapas de Piso Xadrez e Lisas, Perfis Z",
    "argumentoHunter": "Fornecimento de aços com medidas sob encomenda para oficinas de reforma e fabricação de baús na capital.",
    "statusOriginal": "A Ligar",
    "spreadsheetId": "15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co",
    "spreadsheetTitle": "Clientes Âncora (R$ 50.000/mês cada)"
  },
  {
    "id": "ancora-48",
    "empresa": "UniFlex Baús e Refrigeração",
    "cnpj": "",
    "responsavel": "",
    "email": "comercial@uniflexbaus.com.br",
    "contato": "(19) 3873-9000",
    "nivelProspeccao": "Tentativa de contato",
    "observacoes": "[Sumaré / Campinas - SP] Materiais: Perfis Estruturais de Chassi, Tubos de Ancoragem de Carga, Cantoneiras de Aço | Abordagem: Atendimento especializado a encarroçadores da Região Metropolitana de Campinas com entrega expressa.",
    "website": "www.uniflexbaus.com.br",
    "campanha": "CAMP-ANCORA-BAUS",
    "scriptAbordagem": "Atendimento especializado a encarroçadores da Região Metropolitana de Campinas com entrega expressa.",
    "highlighted": true,
    "tab": "Baús",
    "cidadeRegiao": "Sumaré / Campinas - SP",
    "linhaProdutos": "Baús frigoríficos para perecíveis, furgões isotérmicos e baús carga seca",
    "materiaisAco": "Perfis Estruturais de Chassi, Tubos de Ancoragem de Carga, Cantoneiras de Aço",
    "argumentoHunter": "Atendimento especializado a encarroçadores da Região Metropolitana de Campinas com entrega expressa.",
    "statusOriginal": "A Ligar",
    "spreadsheetId": "15bQP-Xg7c_P_Zwe9oB-oRitWHdViCynVXXqds3Zr0co",
    "spreadsheetTitle": "Clientes Âncora (R$ 50.000/mês cada)"
  }
];

/**
 * Retorna o estágio efetivo de 5 colunas do Kanban ("new" | "negotiation" | "quoted" | "nurturing" | "closed").
 * Prioriza cadenceState.kanbanStage (para suportar Orçamento Enviado e Cultivo sem quebrar o enum nativo do Postgres).
 */
export function getEffectiveKanbanStage(lead: Lead): KanbanStage {
  const cadStage = lead?.cadenceState?.kanbanStage;
  if (
    cadStage === "new" ||
    cadStage === "negotiation" ||
    cadStage === "quoted" ||
    cadStage === "nurturing" ||
    cadStage === "closed"
  ) {
    return cadStage;
  }
  if (lead?.status === "closed") return "closed";
  if (lead?.status === "negotiation") return "negotiation";
  return "new";
}

/**
 * Converte um KanbanStage de 5 colunas para o status de 3 colunas do banco PostgreSQL.
 */
export function mapKanbanStageToDbStatus(stage: KanbanStage): "new" | "negotiation" | "closed" {
  if (stage === "closed") return "closed";
  if (stage === "negotiation" || stage === "quoted" || stage === "nurturing") {
    return "negotiation";
  }
  return "new";
}

/**
 * Mapa indexado pelo nome normalizado da empresa para reparo instantâneo de leads
 * que tiveram números/cidades/sites trocados em importações anteriores.
 */
const ANCHOR_BY_NORM_NAME = new Map<string, ExtractedSheetLead>();
for (const item of ANCHOR_CLIENTS_LEADS) {
  const norm = normalizeLeadCompanyName(item.empresa);
  if (norm) ANCHOR_BY_NORM_NAME.set(norm, item);
}

export function findMatchingAnchorLead(companyOrLeadName?: string | null): ExtractedSheetLead | undefined {
  if (!companyOrLeadName) return undefined;
  const raw = String(companyOrLeadName).trim();
  const norm = normalizeLeadCompanyName(raw);
  if (!norm) return undefined;
  if (ANCHOR_BY_NORM_NAME.has(norm)) return ANCHOR_BY_NORM_NAME.get(norm);

  // Tenta extrair a parte da empresa quando o nome está como "Cidade - UF - Nome da Empresa" ou "Compras / Engenharia - Nome"
  const parts = raw.split(" - ").map((p) => p.trim()).filter(Boolean);
  for (let i = parts.length - 1; i >= 0; i--) {
    const pNorm = normalizeLeadCompanyName(parts[i]);
    if (pNorm && ANCHOR_BY_NORM_NAME.has(pNorm)) {
      return ANCHOR_BY_NORM_NAME.get(pNorm);
    }
  }

  for (const [k, val] of ANCHOR_BY_NORM_NAME.entries()) {
    if (k.length >= 6 && norm.length >= 6 && (norm.includes(k) || k.includes(norm))) {
      return val;
    }
  }
  return undefined;
}

/**
 * Verifica se uma string parece ser "Cidade - UF" (ex: "Guarulhos - SP", "São Paulo (Zona Leste) - SP").
 */
export function looksLikeCityState(val?: string | null): boolean {
  if (!val) return false;
  const t = String(val).trim();
  return /\s[-–]\s*[A-Z]{2}$/.test(t) || /^[A-Za-zÀ-ÿ\s/()]+-[A-Z]{2}$/.test(t);
}

/**
 * Verifica se uma string parece um site/domínio e NÃO um telefone.
 */
export function looksLikeWebsiteNotPhone(val?: string | null): boolean {
  if (!val) return false;
  const t = String(val).trim().toLowerCase();
  if (!t) return false;
  return (t.startsWith("www.") || t.includes(".com") || t.includes(".ind.br") || t.includes(".net")) && !t.includes("@");
}

/**
 * Repara automaticamente linhas da planilha que possam ter sido salvas no localStorage
 * com colunas deslocadas (ex: cidade em responsavel, site em contato).
 */
export function repairAndEnrichSheetRow(row: ExtractedSheetLead): ExtractedSheetLead {
  const repaired = { ...row };
  const matchedAnchor = findMatchingAnchorLead(repaired.empresa);

  if (looksLikeCityState(repaired.responsavel)) {
    if (!repaired.cidadeRegiao) {
      repaired.cidadeRegiao = repaired.responsavel.trim();
    }
    repaired.responsavel = "";
  }

  if (looksLikeWebsiteNotPhone(repaired.contato)) {
    if (!repaired.website) {
      repaired.website = repaired.contato.trim();
    }
    repaired.contato = "";
  }

  if (matchedAnchor) {
    repaired.empresa = matchedAnchor.empresa;
    if (!repaired.contato || !sanitizePhoneE164(repaired.contato)) {
      repaired.contato = formatPhoneBrDisplay(matchedAnchor.contato) || matchedAnchor.contato;
    } else {
      repaired.contato = formatPhoneBrDisplay(repaired.contato) || repaired.contato;
    }
    if (!repaired.cidadeRegiao) repaired.cidadeRegiao = matchedAnchor.cidadeRegiao;
    if (!repaired.website || repaired.website.startsWith("freemail:")) {
      repaired.website = matchedAnchor.website;
    }
    if (!repaired.linhaProdutos) repaired.linhaProdutos = matchedAnchor.linhaProdutos;
    if (!repaired.materiaisAco) repaired.materiaisAco = matchedAnchor.materiaisAco;
    if (!repaired.argumentoHunter) repaired.argumentoHunter = matchedAnchor.argumentoHunter;
    if (!repaired.statusOriginal) repaired.statusOriginal = matchedAnchor.statusOriginal;
    if (!repaired.spreadsheetId) repaired.spreadsheetId = ANCHOR_SHEET_ID;
    if (!repaired.spreadsheetTitle) repaired.spreadsheetTitle = ANCHOR_SHEET_TITLE;
    if (!repaired.tab || repaired.tab === " Baús") {
      repaired.tab = matchedAnchor.tab;
    }
  } else {
    if (repaired.tab === " Baús") repaired.tab = "Baús";
    if (!repaired.spreadsheetId) {
      if (ANCHOR_SHEET_TABS.includes(repaired.tab)) {
        repaired.spreadsheetId = ANCHOR_SHEET_ID;
        repaired.spreadsheetTitle = ANCHOR_SHEET_TITLE;
      } else {
        repaired.spreadsheetId = LEGACY_SHEET_ID;
        repaired.spreadsheetTitle = LEGACY_SHEET_TITLE;
      }
    }
  }

  return repaired;
}

/**
 * Repara e enriquece um Lead do Kanban (do banco ou localStorage) que tenha tido dados
 * deslocados ou que pertença às planilhas conhecidas.
 */
export function repairAndEnrichKanbanLead(lead: Lead): Lead {
  if (!lead) return lead;
  const cad = { ...(lead.cadenceState || { completedSteps: [] }) };
  let leadName = (lead.leadName || "").trim();
  let leadPhone = (lead.leadPhone || "").trim();
  let leadEmail = (lead.leadEmail || "").trim();

  // Limpa prefixos artificiais como "Compras / Engenharia - Truckvan" ou "Guarulhos - SP - Truckvan"
  if (leadName.startsWith("Compras / Engenharia - ")) {
    leadName = leadName.replace(/^Compras\s*\/\s*Engenharia\s*-\s*/i, "").trim();
  }

  // Se contactPerson era "Compras / Engenharia" ou uma Cidade ("Guarulhos - SP")
  if (cad.contactPerson) {
    if (cad.contactPerson.trim().toLowerCase() === "compras / engenharia") {
      cad.contactPerson = "";
    } else if (looksLikeCityState(cad.contactPerson)) {
      if (!cad.location) cad.location = cad.contactPerson.trim();
      cad.contactPerson = "";
    }
  }

  // Se leadName tinha "Guarulhos - SP - Empresa", separa a cidade
  const nameDashParts = leadName.split(" - ").map((p) => p.trim());
  if (nameDashParts.length >= 3 && nameDashParts[1].length === 2 && /^[A-Z]{2}$/.test(nameDashParts[1])) {
    const cityPart = `${nameDashParts[0]} - ${nameDashParts[1]}`;
    const companyPart = nameDashParts.slice(2).join(" - ");
    if (companyPart) {
      if (!cad.location) cad.location = cityPart;
      leadName = companyPart;
      cad.companyName = companyPart;
    }
  }

  // Se o telefone continha um site (ex: "www.truckvan.com.br")
  if (looksLikeWebsiteNotPhone(leadPhone)) {
    if (!cad.website) cad.website = leadPhone;
    leadPhone = "";
  }
  if (looksLikeWebsiteNotPhone(cad.phone)) {
    if (!cad.website) cad.website = cad.phone;
    cad.phone = "";
  }
  if (looksLikeWebsiteNotPhone(cad.whatsapp)) {
    if (!cad.website) cad.website = cad.whatsapp;
    cad.whatsapp = "";
  }

  const matchedAnchor = findMatchingAnchorLead(cad.companyName || leadName);
  if (matchedAnchor) {
    cad.companyName = matchedAnchor.empresa;
    if (!cad.contactPerson) {
      leadName = matchedAnchor.empresa;
    }
    const cleanAnchorPhone = formatPhoneBrDisplay(matchedAnchor.contato) || matchedAnchor.contato;
    if (!leadPhone || !sanitizePhoneE164(leadPhone)) {
      leadPhone = cleanAnchorPhone;
    } else {
      leadPhone = formatPhoneBrDisplay(leadPhone) || leadPhone;
    }
    if (!cad.phone || !sanitizePhoneE164(cad.phone)) {
      cad.phone = leadPhone;
    }
    if (!cad.whatsapp || !sanitizePhoneE164(cad.whatsapp)) {
      cad.whatsapp = leadPhone;
    }
    if (!cad.location && matchedAnchor.cidadeRegiao) {
      cad.location = matchedAnchor.cidadeRegiao;
    }
    if (!cad.website && matchedAnchor.website) {
      cad.website = matchedAnchor.website;
    }
    if (!cad.mainProducts && matchedAnchor.linhaProdutos) {
      cad.mainProducts = matchedAnchor.linhaProdutos;
    }
    if (!cad.steelMaterials && matchedAnchor.materiaisAco) {
      cad.steelMaterials = matchedAnchor.materiaisAco;
    }
    if (!cad.hunterPitch && matchedAnchor.argumentoHunter) {
      cad.hunterPitch = matchedAnchor.argumentoHunter;
    }
    if (!cad.prospectionStatus && matchedAnchor.statusOriginal) {
      cad.prospectionStatus = matchedAnchor.statusOriginal;
    }
    if (!cad.sourceSpreadsheetId) {
      cad.sourceSpreadsheetId = ANCHOR_SHEET_ID;
    }
    if (!cad.sourceSpreadsheetTitle) {
      cad.sourceSpreadsheetTitle = ANCHOR_SHEET_TITLE;
    }
    if (!cad.sourceTabName) {
      cad.sourceTabName = matchedAnchor.tab;
    }
    if (!leadEmail && matchedAnchor.email) {
      leadEmail = matchedAnchor.email;
    }
  } else {
    // Mesmo que não seja da planilha âncora, infere a planilha/aba de origem a partir de origin ou roleTitle
    const rawOrigin = cad.roleTitle || lead.origin || "";
    if (rawOrigin.includes("·")) {
      const [sheetPart, tabPart] = rawOrigin.split("·").map((s) => s.trim());
      if (!cad.sourceTabName && tabPart) {
        cad.sourceTabName = tabPart === " Baús" ? "Baús" : tabPart;
      }
      if (!cad.sourceSpreadsheetTitle && sheetPart) {
        cad.sourceSpreadsheetTitle = sheetPart;
      }
    }
    if (!cad.sourceSpreadsheetId) {
      if (
        cad.sourceTabName &&
        ANCHOR_SHEET_TABS.includes(cad.sourceTabName)
      ) {
        cad.sourceSpreadsheetId = ANCHOR_SHEET_ID;
        cad.sourceSpreadsheetTitle = ANCHOR_SHEET_TITLE;
      } else if (
        cad.sourceTabName &&
        LEGACY_SHEET_TABS.includes(cad.sourceTabName)
      ) {
        cad.sourceSpreadsheetId = LEGACY_SHEET_ID;
        cad.sourceSpreadsheetTitle = cad.sourceSpreadsheetTitle || LEGACY_SHEET_TITLE;
      }
    }
  }

  if (!cad.kanbanStage) {
    cad.kanbanStage = lead.status || "new";
  }

  return {
    ...lead,
    leadName: leadName || lead.leadName,
    leadPhone: leadPhone || null,
    leadEmail: leadEmail || lead.leadEmail,
    cadenceState: cad,
  };
}
