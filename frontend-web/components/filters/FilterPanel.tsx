"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Filter, RotateCcw, Search, X } from "lucide-react";

export interface FilterConfig {
  scoutName?: string;
  equipo?: string;
  elemento?: string;
  promesa?: string;
  tada?: string;
  edadMin?: string;
  edadMax?: string;
  cumpleDesde?: string;
  cumpleHasta?: string;
  vaCampamento?: string;
  ingresoMovimiento?: string;
  etapa?: string;
  cuotaSocial?: string;
  cuotaDistrito?: string;
  raid?: string;
}

interface FilterPanelProps {
  onFilterChange: (filters: FilterConfig) => void;
  defaultFilters?: FilterConfig;
  equipos?: string[];
  promesas?: string[];
  etapas?: string[];
  raids?: string[];
}

const ELEMENTOS = ["Fuego", "Tierra", "Agua", "Aire"];
const INGRESOS = ["Manada", "Unidad", "Caminantes"];
const TADA_OPTIONS = ["Tiene", "Puede hacer", "No puede"];
const PROMESA_OPTIONS = ["Sin promesa", "Con promesa sin pañuelo", "Con pañuelo"];
const ETAPA_OPTIONS = ["Ini", "1°", "2°", "3°"];
const RAID_OPTIONS = ["1°R", "2°R", "3°R"];

function baseInputClassName() {
  return "w-full rounded-xl border border-neutral-200 bg-white/80 px-3 py-2.5 text-sm text-neutral-900 shadow-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 dark:border-neutral-700 dark:bg-neutral-950/70 dark:text-white";
}

function baseLabelClassName() {
  return "mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400";
}

function countActiveFilters(filters: FilterConfig) {
  return Object.values(filters).filter((value) => value !== undefined && value !== "").length;
}

export function FilterPanel({
  onFilterChange,
  defaultFilters = {},
  equipos = [],
  promesas = [],
  etapas = [],
  raids = []
}: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<FilterConfig>(defaultFilters);

  useEffect(() => {
    setLocalFilters(defaultFilters);
  }, [defaultFilters]);

  const activeFilterCount = useMemo(() => countActiveFilters(localFilters), [localFilters]);

  const promesaOptions = promesas.length > 0 ? promesas : PROMESA_OPTIONS;
  const etapaOptions = etapas.length > 0 ? etapas : ETAPA_OPTIONS;
  const raidOptions = raids.length > 0 ? raids : RAID_OPTIONS;

  const updateFilter = useCallback(<K extends keyof FilterConfig>(key: K, value: FilterConfig[K]) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : value
    }));
  }, []);

  const handleApplyFilters = useCallback(() => {
    onFilterChange(localFilters);
    setIsOpen(false);
  }, [localFilters, onFilterChange]);

  const handleClearFilters = useCallback(() => {
    const cleared = {};
    setLocalFilters(cleared);
    onFilterChange(cleared);
  }, [onFilterChange]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white/80 px-3 py-2 text-sm font-medium text-neutral-700 shadow-sm backdrop-blur transition hover:bg-white dark:border-neutral-700 dark:bg-neutral-900/80 dark:text-neutral-200 dark:hover:bg-neutral-900"
      >
        <Filter size={18} />
        <span className="hidden sm:inline">Filtros</span>
        {activeFilterCount > 0 ? (
          <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[var(--accent)] px-1.5 py-0.5 text-[11px] font-semibold text-white">
            {activeFilterCount}
          </span>
        ) : null}
      </button>

      <div
        className={`fixed inset-0 z-40 bg-black/35 backdrop-blur-[2px] transition-opacity duration-200 ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsOpen(false)}
      />

      <aside
        className={`fixed right-0 top-0 z-50 flex h-dvh w-full max-w-md flex-col border-l border-white/20 bg-white/88 shadow-2xl backdrop-blur-xl transition-transform duration-300 dark:border-neutral-700 dark:bg-neutral-900/92 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="border-b border-neutral-200/80 px-5 py-4 dark:border-neutral-700">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[var(--accent)]/12 p-2 text-[var(--accent)]">
                <Filter size={18} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-neutral-900 dark:text-white">Filtros</h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{activeFilterCount} activos</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          <div>
            <label className={baseLabelClassName()}>Nombre del scout</label>
            <div className="relative">
              <Search size={16} className="pointer-events-none absolute left-3 top-3 text-neutral-400" />
              <input
                type="text"
                value={localFilters.scoutName ?? ""}
                onChange={(e) => updateFilter("scoutName", e.target.value)}
                placeholder="Buscar por nombre o número"
                className={`${baseInputClassName()} pl-9`}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={baseLabelClassName()}>Equipo</label>
              <select value={localFilters.equipo ?? ""} onChange={(e) => updateFilter("equipo", e.target.value)} className={baseInputClassName()}>
                <option value="">Todos</option>
                {equipos.map((equipo) => (
                  <option key={equipo} value={equipo}>{equipo}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={baseLabelClassName()}>Elemento</label>
              <select value={localFilters.elemento ?? ""} onChange={(e) => updateFilter("elemento", e.target.value)} className={baseInputClassName()}>
                <option value="">Todos</option>
                {ELEMENTOS.map((elemento) => (
                  <option key={elemento} value={elemento}>{elemento}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={baseLabelClassName()}>Promesa</label>
              <select value={localFilters.promesa ?? ""} onChange={(e) => updateFilter("promesa", e.target.value)} className={baseInputClassName()}>
                <option value="">Todas</option>
                {promesaOptions.map((promesa) => (
                  <option key={promesa} value={promesa}>{promesa}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={baseLabelClassName()}>TADA</label>
              <select value={localFilters.tada ?? ""} onChange={(e) => updateFilter("tada", e.target.value)} className={baseInputClassName()}>
                <option value="">Todos</option>
                {TADA_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={baseLabelClassName()}>Edad</label>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                type="number"
                min="0"
                placeholder="Mínima"
                value={localFilters.edadMin ?? ""}
                onChange={(e) => updateFilter("edadMin", e.target.value)}
                className={baseInputClassName()}
              />
              <input
                type="number"
                min="0"
                placeholder="Máxima"
                value={localFilters.edadMax ?? ""}
                onChange={(e) => updateFilter("edadMax", e.target.value)}
                className={baseInputClassName()}
              />
            </div>
          </div>

          <div>
            <label className={baseLabelClassName()}>Cumpleaños</label>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                type="date"
                value={localFilters.cumpleDesde ?? ""}
                onChange={(e) => updateFilter("cumpleDesde", e.target.value)}
                className={baseInputClassName()}
              />
              <input
                type="date"
                value={localFilters.cumpleHasta ?? ""}
                onChange={(e) => updateFilter("cumpleHasta", e.target.value)}
                className={baseInputClassName()}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={baseLabelClassName()}>Próximo campamento</label>
              <select value={localFilters.vaCampamento ?? ""} onChange={(e) => updateFilter("vaCampamento", e.target.value)} className={baseInputClassName()}>
                <option value="">Todos</option>
                <option value="si">Va</option>
                <option value="no">No va</option>
              </select>
            </div>

            <div>
              <label className={baseLabelClassName()}>Ingreso al movimiento</label>
              <select value={localFilters.ingresoMovimiento ?? ""} onChange={(e) => updateFilter("ingresoMovimiento", e.target.value)} className={baseInputClassName()}>
                <option value="">Todos</option>
                {INGRESOS.map((ingreso) => (
                  <option key={ingreso} value={ingreso}>{ingreso}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={baseLabelClassName()}>Etapa</label>
              <select value={localFilters.etapa ?? ""} onChange={(e) => updateFilter("etapa", e.target.value)} className={baseInputClassName()}>
                <option value="">Todas</option>
                {etapaOptions.map((etapa) => (
                  <option key={etapa} value={etapa}>{etapa}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={baseLabelClassName()}>Raid</label>
              <select value={localFilters.raid ?? ""} onChange={(e) => updateFilter("raid", e.target.value)} className={baseInputClassName()}>
                <option value="">Todos</option>
                {raidOptions.map((raid) => (
                  <option key={raid} value={raid}>{raid}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={baseLabelClassName()}>Cuota social</label>
              <select value={localFilters.cuotaSocial ?? ""} onChange={(e) => updateFilter("cuotaSocial", e.target.value)} className={baseInputClassName()}>
                <option value="">Todos</option>
                <option value="pagado">Pagado (al día)</option>
                <option value="parcial">Parcial (algunas atrasadas)</option>
                <option value="no-pagadas">No pagadas</option>
              </select>
            </div>

            <div>
              <label className={baseLabelClassName()}>Cuota distrito</label>
              <select value={localFilters.cuotaDistrito ?? ""} onChange={(e) => updateFilter("cuotaDistrito", e.target.value)} className={baseInputClassName()}>
                <option value="">Todos</option>
                <option value="pagado">Pagado</option>
                <option value="no-pagado">No pagado</option>
              </select>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-200/80 bg-white/85 px-4 py-3 backdrop-blur-md dark:border-neutral-700 dark:bg-neutral-900/90">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              <RotateCcw size={15} />
              Limpiar
            </button>
            <button
              type="button"
              onClick={handleApplyFilters}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white transition hover:opacity-90"
            >
              <Check size={15} />
              Aplicar
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
