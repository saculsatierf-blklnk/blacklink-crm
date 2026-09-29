"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Layers,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  User,
  X,
} from "lucide-react";
import {
  useOperationsStore,
  type OperationTask,
  type TaskPriority,
  type TaskStatus,
} from "@/store/useOperationsStore";
import { GlassCard } from "@/components/ui/GlassCard";

const COLUMNS: { id: TaskStatus; label: string; accentColor: string; pillColor: string }[] = [
  { id: "backlog", label: "Briefing / Backlog", accentColor: "border-zinc-500/40 text-zinc-400", pillColor: "bg-zinc-800 text-zinc-300 border-zinc-700" },
  { id: "in_production", label: "Em Produção (Design & Copy)", accentColor: "border-cyan-500/40 text-cyan-300", pillColor: "bg-cyan-950/60 text-cyan-300 border-cyan-800/40" },
  { id: "internal_review", label: "Revisão Interna", accentColor: "border-amber-500/40 text-amber-300", pillColor: "bg-amber-950/60 text-amber-300 border-amber-800/40" },
  { id: "awaiting_client", label: "Aguardando Cliente", accentColor: "border-purple-500/40 text-purple-300", pillColor: "bg-purple-950/60 text-purple-300 border-purple-800/40" },
  { id: "done", label: "Concluído", accentColor: "border-emerald-500/40 text-emerald-300", pillColor: "bg-emerald-950/60 text-emerald-300 border-emerald-800/40" },
];

export function OperationsKanbanBoard() {
  const {
    tasks,
    isLoading,
    fetchTasks,
    createTask,
    updateTaskStatus,
    deleteTask,
    searchQuery,
    setSearchQuery,
    priorityFilter,
    setPriorityFilter,
  } = useOperationsStore();

  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // Form states
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newAssignee, setNewAssignee] = useState("Equipe Black Link");
  const [newPriority, setNewPriority] = useState<TaskPriority>("medium");
  const [newStatus, setNewStatus] = useState<TaskStatus>("backlog");
  const [newDueDate, setNewDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Filtro de tarefas
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      task.assigneeName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  // Métricas
  const totalTasks = tasks.length;
  const inProductionCount = tasks.filter((t) => t.status === "in_production").length;
  const awaitingClientCount = tasks.filter((t) => t.status === "awaiting_client").length;
  const doneCount = tasks.filter((t) => t.status === "done").length;

  // Handlers de drag and drop
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    setDraggedTaskId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || draggedTaskId;
    if (id) {
      await updateTaskStatus(id, targetStatus);
    }
    setDraggedTaskId(null);
  };

  // Movimentação rápida de coluna
  const handleShiftColumn = async (task: OperationTask, direction: "prev" | "next") => {
    const currentIndex = COLUMNS.findIndex((c) => c.id === task.status);
    if (currentIndex === -1) return;

    const newIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < COLUMNS.length) {
      await updateTaskStatus(task.id, COLUMNS[newIndex].id);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    const success = await createTask({
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
      assigneeName: newAssignee.trim() || "Equipe Black Link",
      priority: newPriority,
      status: newStatus,
      dueDate: newDueDate || null,
    });

    setIsSubmitting(false);
    if (success) {
      setIsNewTaskModalOpen(false);
      setNewTitle("");
      setNewDescription("");
      setNewDueDate("");
    }
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case "urgent":
        return (
          <span className="rounded-full bg-red-500/10 border border-red-500/30 px-2.5 py-0.5 text-[9px] font-mono font-medium text-red-300 uppercase tracking-wider">
            Urgente
          </span>
        );
      case "high":
        return (
          <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-[9px] font-mono font-medium text-amber-300 uppercase tracking-wider">
            Alta
          </span>
        );
      case "medium":
        return (
          <span className="rounded-full bg-sky-500/10 border border-sky-500/30 px-2.5 py-0.5 text-[9px] font-mono font-medium text-sky-300 uppercase tracking-wider">
            Média
          </span>
        );
      case "low":
      default:
        return (
          <span className="rounded-full bg-white/[0.05] border border-white/10 px-2.5 py-0.5 text-[9px] font-mono text-zinc-400 uppercase tracking-wider">
            Baixa
          </span>
        );
    }
  };

  const formatDueDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const isPast = date < now;

    const formatted = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

    return {
      text: formatted,
      isPast,
    };
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      {/* Top Banner & Ações */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 border-b border-white/10 pb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              <Layers className="h-5 w-5" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-medium tracking-tight text-white">
              Operação & Prazos
            </h1>
            <span className="rounded-full bg-white/[0.08] border border-white/15 px-3.5 py-1 text-[11px] font-mono tracking-widest text-zinc-300 font-semibold uppercase">
              SLA Operacional
            </span>
          </div>
          <p className="text-xs lg:text-sm text-zinc-400 mt-2 leading-relaxed">
            Gestão unificada de prazos, refações, alocação de equipe (Design & Copy) e aprovação de clientes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchTasks()}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
            title="Atualizar tarefas"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Sincronizar</span>
          </button>

          <button
            type="button"
            onClick={() => setIsNewTaskModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-white text-black px-5 py-2.5 text-xs font-semibold tracking-tight hover:bg-zinc-200 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            <Plus className="h-4 w-4" />
            <span>+ Nova Demanda</span>
          </button>
        </div>
      </div>

      {/* KPI Cards de Resumo Apple Glass */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
        <GlassCard className="p-6 lg:p-8">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-3 block">
            Total em Andamento
          </span>
          <div className="text-3xl lg:text-4xl font-medium tracking-tight text-white">{totalTasks}</div>
        </GlassCard>

        <GlassCard className="p-6 lg:p-8">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400 mb-3 block">
            Em Produção Ativa
          </span>
          <div className="text-3xl lg:text-4xl font-medium tracking-tight text-cyan-300">{inProductionCount}</div>
        </GlassCard>

        <GlassCard className="p-6 lg:p-8">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-400 mb-3 block">
            Aguardando Cliente
          </span>
          <div className="text-3xl lg:text-4xl font-medium tracking-tight text-purple-300">{awaitingClientCount}</div>
        </GlassCard>

        <GlassCard className="p-6 lg:p-8">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 mb-3 block">
            Entregas Concluídas
          </span>
          <div className="text-3xl lg:text-4xl font-medium tracking-tight text-emerald-300">{doneCount}</div>
        </GlassCard>
      </div>

      {/* Barra de Filtros & Busca Apple Glass */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
        
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar por demanda, briefing ou responsável..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-black/20 border border-white/10 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:border-white/30 focus:ring-0 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <Filter className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500">Prioridade:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-xl bg-black/20 border border-white/10 px-3.5 py-2 text-xs font-mono text-white focus:border-white/30 focus:outline-none cursor-pointer transition-colors"
          >
            <option value="all" className="bg-[#0A0A0A] text-white">Todas</option>
            <option value="urgent" className="bg-[#0A0A0A] text-white">Urgente</option>
            <option value="high" className="bg-[#0A0A0A] text-white">Alta</option>
            <option value="medium" className="bg-[#0A0A0A] text-white">Média</option>
            <option value="low" className="bg-[#0A0A0A] text-white">Baixa</option>
          </select>
        </div>
      </div>

      {/* Grid de 5 Colunas do Kanban Apple Glass */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 items-start min-h-[600px]">
        {COLUMNS.map((col, colIndex) => {
          const columnTasks = filteredTasks.filter((t) => t.status === col.id);

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className="relative overflow-hidden flex flex-col rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-2xl min-h-[580px] p-5 shadow-2xl transition-all"
            >
              {/* Linha de refração no topo */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
              
              <div className="relative z-10 flex flex-col flex-1">
                {/* Header da Coluna */}
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-4">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`h-2 w-2 rounded-full border ${col.accentColor} bg-current shrink-0`} />
                    <span className="text-xs font-medium tracking-tight text-white truncate max-w-[130px]">
                      {col.label}
                    </span>
                  </div>
                  <span className="rounded-full bg-white/[0.06] border border-white/10 px-2.5 py-0.5 text-[10px] font-mono text-zinc-400">
                    {columnTasks.length}
                  </span>
                </div>

                {/* Lista de Cards da Coluna */}
                <div className="flex-1 space-y-3.5">
                  {columnTasks.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-[11px] font-mono text-zinc-500">
                      Sem demandas nesta etapa
                    </div>
                  ) : (
                    columnTasks.map((task) => {
                      const dueInfo = formatDueDate(task.dueDate);

                      return (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-4 shadow-lg hover:border-white/20 hover:bg-black/60 transition-all duration-200 space-y-3 cursor-grab active:cursor-grabbing group"
                        >
                          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

                          {/* Header do Card: Prioridade & Ações */}
                          <div className="flex items-center justify-between gap-1">
                            {getPriorityBadge(task.priority)}

                            <button
                              type="button"
                              onClick={() => deleteTask(task.id)}
                              className="text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer"
                              title="Excluir demanda"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>

                          {/* Título & Descrição */}
                          <div>
                            <h4 className="text-xs font-medium text-white tracking-tight line-clamp-2">
                              {task.title}
                            </h4>
                            {task.description && (
                              <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1.5 leading-snug">
                                {task.description}
                              </p>
                            )}
                          </div>

                          {/* Metadados: Responsável & Prazo */}
                          <div className="pt-3 border-t border-white/[0.08] flex flex-col gap-1.5 text-[10px] font-mono text-zinc-400">
                            <div className="flex items-center gap-2 truncate">
                              <User className="h-3 w-3 text-zinc-300 shrink-0" />
                              <span className="truncate">{task.assigneeName}</span>
                            </div>

                            {dueInfo && (
                              <div
                                className={`flex items-center gap-1.5 ${
                                  dueInfo.isPast ? "text-red-400 font-medium" : "text-zinc-400"
                                }`}
                              >
                                <Clock className="h-3 w-3 shrink-0" />
                                <span>
                                  {dueInfo.isPast ? "Atrasado: " : "Entrega: "}
                                  {dueInfo.text}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Controles de Transição Rápida */}
                          <div className="pt-2.5 flex items-center justify-between border-t border-white/[0.08]">
                            <button
                              type="button"
                              disabled={colIndex === 0}
                              onClick={() => handleShiftColumn(task, "prev")}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-all"
                              title="Mover para coluna anterior"
                            >
                              <ArrowLeft className="h-3 w-3" />
                            </button>

                            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-medium">
                              Mover
                            </span>

                            <button
                              type="button"
                              disabled={colIndex === COLUMNS.length - 1}
                              onClick={() => handleShiftColumn(task, "next")}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-all"
                              title="Avançar para próxima coluna"
                            >
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Criação de Nova Tarefa Apple Glass */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-2xl p-4 sm:p-6 animate-fadeIn">
          <div className="relative overflow-hidden w-full max-w-lg rounded-3xl border border-white/[0.12] bg-[#0A0A0A]/95 p-8 sm:p-10 shadow-2xl backdrop-blur-2xl space-y-6">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black shadow-md">
                  <Plus className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-medium text-white tracking-tight">
                  Nova Demanda Operacional
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewTaskModalOpen(false)}
                className="rounded-xl border border-white/10 p-2 text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="relative z-10 space-y-5 text-xs">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 block">
                  Título da Demanda *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Roteiro Carrossel Q4 - Vendas B2B"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-zinc-500 focus:border-white/30 focus:ring-0 focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 block">
                  Briefing & Instruções Técnicas
                </label>
                <textarea
                  rows={3}
                  placeholder="Detalhes sobre tom de voz, referências visuais, formato ou diretrizes de copy..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-zinc-500 focus:border-white/30 focus:ring-0 focus:outline-none transition-colors resize-y"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 block">
                    Responsável
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Beatriz Lima • Design"
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-zinc-500 focus:border-white/30 focus:ring-0 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 block">
                    Prazo de Entrega
                  </label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 font-mono text-xs text-white focus:border-white/30 focus:ring-0 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 block">
                    Prioridade
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 font-mono text-xs text-white focus:border-white/30 focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="low" className="bg-[#0A0A0A] text-white">Baixa</option>
                    <option value="medium" className="bg-[#0A0A0A] text-white">Média</option>
                    <option value="high" className="bg-[#0A0A0A] text-white">Alta</option>
                    <option value="urgent" className="bg-[#0A0A0A] text-white">Urgente</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 block">
                    Etapa Inicial
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as TaskStatus)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 font-mono text-xs text-white focus:border-white/30 focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="backlog" className="bg-[#0A0A0A] text-white">Briefing / Backlog</option>
                    <option value="in_production" className="bg-[#0A0A0A] text-white">Em Produção</option>
                    <option value="internal_review" className="bg-[#0A0A0A] text-white">Revisão Interna</option>
                    <option value="awaiting_client" className="bg-[#0A0A0A] text-white">Aguardando Cliente</option>
                    <option value="done" className="bg-[#0A0A0A] text-white">Concluído</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsNewTaskModalOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-2.5 text-xs text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newTitle.trim()}
                  className="flex items-center gap-2 rounded-xl bg-white text-black px-6 py-2.5 text-xs font-semibold hover:bg-zinc-200 transition-all cursor-pointer disabled:opacity-50 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <span>Criar Demanda</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
