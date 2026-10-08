"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Plus, DollarSign } from "lucide-react";
import { useTenantStore, DealStage } from "@/store/useTenantStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const dealSchema = z.object({
  title: z.string().min(3, "Título deve ter no mínimo 3 caracteres"),
  companyName: z.string().min(2, "Nome da empresa é obrigatório"),
  contactPerson: z.string().min(2, "Nome do contato é obrigatório"),
  contactEmail: z.string().email("E-mail corporativo inválido"),
  value: z.coerce.number().min(1000, "Valor mínimo de R$ 1.000"),
  serviceCategory: z.enum([
    "Engenharia de Software",
    "Automações & Inteligência Artificial",
    "Tráfego de Performance & Growth",
    "Infraestrutura & Inteligência de Dados",
  ]),
  stage: z.enum([
    "prospecting",
    "qualification",
    "proposal",
    "negotiation",
    "won",
    "lost",
  ]),
  expectedCloseDate: z.string().min(1, "Data estimada é obrigatória"),
  owner: z.string().min(2, "Responsável é obrigatório"),
});

type DealFormData = z.infer<typeof dealSchema>;

interface NewDealModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewDealModal({ isOpen, onClose }: NewDealModalProps) {
  const { addDeal, activeTenantId } = useTenantStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DealFormData>({
    resolver: zodResolver(dealSchema) as any,
    defaultValues: {
      title: "",
      companyName: "",
      contactPerson: "",
      contactEmail: "",
      value: 50000,
      serviceCategory: "Engenharia de Software",
      stage: "prospecting",
      expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      owner: "Lucas S.",
    },
  });

  if (!isOpen) return null;

  const onSubmit = (data: DealFormData) => {
    addDeal({
      tenantId: activeTenantId,
      title: data.title,
      companyName: data.companyName,
      contactPerson: data.contactPerson,
      contactEmail: data.contactEmail,
      value: data.value,
      serviceCategory: data.serviceCategory,
      stage: data.stage as DealStage,
      probability: data.stage === "won" ? 100 : 50,
      expectedCloseDate: data.expectedCloseDate,
      owner: data.owner,
    });
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-carbon border border-border-hairline shadow-2xl p-6 flex flex-col gap-6 relative">
        {/* CABEÇALHO */}
        <div className="flex items-center justify-between pb-4 border-b border-border-hairline/60">
          <div className="flex flex-col">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-gold">
              Nova Oportunidade Comercial
            </span>
            <h2 className="text-base font-bold uppercase tracking-wider text-foreground">
              Cadastrar Deal Corporativo
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* FORMULÁRIO COM REACT HOOK FORM + ZOD */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Título da Oportunidade"
            placeholder="Ex: Plataforma de Microsserviços & Cloud"
            error={errors.title?.message}
            {...register("title")}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Empresa / Conta"
              placeholder="Ex: OmniCorp Seguros"
              error={errors.companyName?.message}
              {...register("companyName")}
            />
            <Input
              label="Valor Estimado (R$)"
              type="number"
              placeholder="Ex: 150000"
              error={errors.value?.message}
              {...register("value")}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Tomador de Decisão"
              placeholder="Ex: Carlos Albuquerque (CTO)"
              error={errors.contactPerson?.message}
              {...register("contactPerson")}
            />
            <Input
              label="E-mail Corporativo"
              type="email"
              placeholder="carlos@empresa.com.br"
              error={errors.contactEmail?.message}
              {...register("contactEmail")}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                Divisão de Serviço
              </label>
              <select
                className="h-10 px-3 bg-surface border border-border-hairline text-foreground text-xs focus:outline-none focus:border-border-focus"
                {...register("serviceCategory")}
              >
                <option value="Engenharia de Software">Engenharia de Software</option>
                <option value="Automações & Inteligência Artificial">Automações & IA</option>
                <option value="Tráfego de Performance & Growth">Tráfego & Performance</option>
                <option value="Infraestrutura & Inteligência de Dados">Infraestrutura & Dados</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                Estágio Inicial do Funil
              </label>
              <select
                className="h-10 px-3 bg-surface border border-border-hairline text-foreground text-xs focus:outline-none focus:border-border-focus"
                {...register("stage")}
              >
                <option value="prospecting">Prospecção</option>
                <option value="qualification">Qualificação Técnica</option>
                <option value="proposal">Proposta de Solução</option>
                <option value="negotiation">Negociação Contratual</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Data Prevista de Fechamento"
              type="date"
              error={errors.expectedCloseDate?.message}
              {...register("expectedCloseDate")}
            />
            <Input
              label="Responsável Interno"
              placeholder="Ex: Lucas S."
              error={errors.owner?.message}
              {...register("owner")}
            />
          </div>

          {/* BOTÕES DE AÇÃO */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-hairline/60">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="accent" isLoading={isSubmitting}>
              Salvar Oportunidade
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
