"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Banknote, Eye, FileText, Pencil } from "lucide-react";
import { ScoutDetailModal } from "@/components/scouts/ScoutDetailModal";
import { ScoutEditModal } from "@/components/scouts/ScoutEditModal";
import { ScoutDocumentationModal } from "@/components/scouts/ScoutDocumentationModal";
import { CuotaSocialModal } from "@/components/scouts/CuotaSocialModal";
import { FilterPanel, type FilterConfig } from "@/components/filters/FilterPanel";
import { getCuotaSocialStatus } from "@/lib/cuota-social";
import type { Scout } from "@/types/scout";

type ScoutsResponse = {
  data: Scout[];
  total: number;
  page: number;
};

type EquiposResponse = {
  equipos: Array<{ id: string; nombre: string }>;
};

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

const PROMESA_OPTIONS = ["Sin promesa", "Con promesa sin pañuelo", "Con pañuelo"];
const ETAPA_OPTIONS = ["Ini", "1°", "2°", "3°"];
const RAID_OPTIONS = ["1°R", "2°R", "3°R"];

export default function ScoutsPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scouts, setScouts] = useState<Scout[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [docsModalOpen, setDocsModalOpen] = useState(false);
  const [cuotaSocialModalOpen, setCuotaSocialModalOpen] = useState(false);
  const [selectedScout, setSelectedScout] = useState<Scout | null>(null);
  const [filters, setFilters] = useState<FilterConfig>({});

  function handleScoutUpdated(updatedScout: Scout) {
    setScouts((prev) => {
      const exists = prev.some((scout) => scout.id === updatedScout.id);
      const next = exists
        ? prev.map((scout) => (scout.id === updatedScout.id ? updatedScout : scout))
        : [...prev, updatedScout];
      return next.sort((a, b) => a.numero - b.numero);
    });
    setSelectedScout((prev) => (prev?.id === updatedScout.id ? updatedScout : prev));
  }

  useEffect(() => {
    async function loadScouts() {
      try {
        setLoading(true);
        setError(null);

        const [scoutsRes, equiposRes] = await Promise.all([
          apiFetch<ScoutsResponse>("/api/scouts?page=1&limit=500"),
          apiFetch<EquiposResponse>("/api/equipos")
        ]);

        setScouts(scoutsRes.data ?? []);

        const teamNames = (equiposRes.equipos ?? []).map((t) => t.nombre);
        const fallbackTeams = Array.from(new Set((scoutsRes.data ?? []).map((s) => s.equipo)));
        const mergedTeams = teamNames.length > 0 ? teamNames : fallbackTeams;
        setTeams(mergedTeams);

        // Si hay un parámetro de query team, établcelo como filtro
        const teamParam = searchParams.get("team");
        if (teamParam) {
          setSelectedTeam(decodeURIComponent(teamParam));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo cargar los scouts");
      } finally {
        setLoading(false);
      }
    }

    loadScouts();
  }, [searchParams]);

  const promesaOptions = PROMESA_OPTIONS;
  const etapaOptions = ETAPA_OPTIONS;
  const raidOptions = RAID_OPTIONS;

  const filteredScouts = useMemo(() => {
    let result = scouts.filter((s) => s.is_active !== false);

    if (filters.scoutName) {
      const lowerSearch = filters.scoutName.toLowerCase();
      const searchNum = filters.scoutName;
      result = result.filter(
        (s) =>
          s.nombre.toLowerCase().includes(lowerSearch) ||
          s.numero.toString().includes(searchNum)
      );
    }

    if (filters.equipo) {
      result = result.filter((s) => s.equipo === filters.equipo);
    } else if (selectedTeam) {
      result = result.filter((s) => s.equipo === selectedTeam);
    }

    if (filters.elemento) {
      result = result.filter((s) => s.elemento === filters.elemento);
    }

    if (filters.promesa) {
      result = result.filter((s) => s.promesa === filters.promesa);
    }

    if (filters.tada) {
      result = result.filter((s) => s.tada_estado === filters.tada);
    }

    if (filters.edadMin) {
      result = result.filter((s) => s.edad >= Number(filters.edadMin));
    }

    if (filters.edadMax) {
      result = result.filter((s) => s.edad <= Number(filters.edadMax));
    }

    if (filters.cumpleDesde) {
      const dateFrom = new Date(filters.cumpleDesde);
      result = result.filter((s) => new Date(s.fecha_nacimiento) >= dateFrom);
    }

    if (filters.cumpleHasta) {
      const dateTo = new Date(filters.cumpleHasta);
      result = result.filter((s) => new Date(s.fecha_nacimiento) <= dateTo);
    }

    if (filters.vaCampamento) {
      const shouldGo = filters.vaCampamento === "si";
      result = result.filter((s) => s.va === shouldGo);
    }

    if (filters.ingresoMovimiento) {
      result = result.filter((s) => s.ingreso_movimiento === filters.ingresoMovimiento);
    }

    if (filters.etapa) {
      result = result.filter((s) => (s.etapa ?? "").toLowerCase().includes(filters.etapa!.toLowerCase()));
    }

    if (filters.cuotaSocial) {
      result = result.filter((s) => getCuotaSocialStatus(s.cuota_social) === filters.cuotaSocial);
    }

    if (filters.cuotaDistrito) {
      result = result.filter((s) => (filters.cuotaDistrito === "pagado" ? s.distrito === true : s.distrito !== true));
    }

    if (filters.raid) {
      result = result.filter((s) => (s.raid ?? "").toLowerCase().includes(filters.raid!.toLowerCase()));
    }

    return result.sort((a, b) => a.numero - b.numero);
  }, [scouts, filters, selectedTeam]);

  if (loading) {
    return <div className="rounded-xl bg-white p-4 shadow">Cargando scouts...</div>;
  }

  if (error) {
    return <div className="rounded-xl bg-red-50 p-4 text-red-700 shadow">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Nómina Completa</h1>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Mostrando <strong>{filteredScouts.length}</strong> de <strong>{scouts.length}</strong> scouts
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedScout(null);
                setCreateModalOpen(true);
              }}
              className="rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              + Scout
            </button>
            <FilterPanel
              onFilterChange={setFilters}
              equipos={teams}
              defaultFilters={filters}
              promesas={promesaOptions}
              etapas={etapaOptions}
              raids={raidOptions}
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow dark:bg-neutral-900">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-left font-medium text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Equipo</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Fecha Nac.</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredScouts.map((scout) => (
                <tr key={scout.id} className="border-b border-neutral-200 last:border-0 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800">
                  <td className="px-4 py-3 text-neutral-900 dark:text-white">{scout.numero}</td>
                  <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white">{scout.nombre}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200">
                      {scout.equipo}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">{scout.categoria_miembro ?? "—"}</td>
                  <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">{formatDate(scout.fecha_nacimiento)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedScout(scout);
                          setDetailModalOpen(true);
                        }}
                        className="rounded-lg p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400 transition"
                        title="Ver detalles"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedScout(scout);
                          setEditModalOpen(true);
                        }}
                        className="rounded-lg p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400 transition"
                        title="Editar scout"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedScout(scout);
                          setDocsModalOpen(true);
                        }}
                        className="rounded-lg p-1.5 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-700"
                        title="Gestionar documentación"
                      >
                        <FileText size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedScout(scout);
                          setCuotaSocialModalOpen(true);
                        }}
                        className="rounded-lg p-1.5 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-700"
                        title="Cuota social"
                      >
                        <Banknote size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredScouts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-neutral-500 dark:text-neutral-400">
                    No se encontraron scouts con los criterios de búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ScoutDetailModal scout={selectedScout} isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} />
      <ScoutEditModal
        scout={selectedScout}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onUpdated={handleScoutUpdated}
        equipos={teams}
      />
      <ScoutEditModal
        scout={null}
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onUpdated={handleScoutUpdated}
        equipos={teams}
      />
      <ScoutDocumentationModal
        scout={selectedScout}
        isOpen={docsModalOpen}
        onClose={() => setDocsModalOpen(false)}
        onUpdated={handleScoutUpdated}
      />
      <CuotaSocialModal
        scout={selectedScout}
        isOpen={cuotaSocialModalOpen}
        onClose={() => setCuotaSocialModalOpen(false)}
        onUpdated={handleScoutUpdated}
      />
    </div>
  );
}