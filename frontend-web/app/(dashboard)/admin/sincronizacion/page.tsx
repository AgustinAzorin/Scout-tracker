"use client";

import { useState } from "react";
import { RefreshCcw, CheckCircle, AlertCircle, Clock } from "lucide-react";

interface SyncLog {
  id: string;
  tipo: string;
  fecha: string;
  estado: "exitoso" | "error" | "pendiente";
  mensaje: string;
  registros_procesados?: number;
}

export default function AdminSyncPage() {
  const [syncing, setSyncing] = useState(false);
  const [logs, setLogs] = useState<SyncLog[]>([
    {
      id: "1",
      tipo: "Sincronización con Google Sheets",
      fecha: "2026-03-24 14:30",
      estado: "exitoso",
      mensaje: "150 scouts sincronizados correctamente",
      registros_procesados: 150,
    },
    {
      id: "2",
      tipo: "Copia de seguridad",
      fecha: "2026-03-24 10:00",
      estado: "exitoso",
      mensaje: "Base de datos respaldada exitosamente",
    },
  ]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      // Simular sincronización
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      const newLog: SyncLog = {
        id: Date.now().toString(),
        tipo: "Sincronización manual",
        fecha: new Date().toLocaleString(),
        estado: "exitoso",
        mensaje: "Sincronización completada",
        registros_procesados: 42,
      };
      setLogs([newLog, ...logs]);
    } finally {
      setSyncing(false);
    }
  };

  const getStatusIcon = (status: SyncLog["estado"]) => {
    switch (status) {
      case "exitoso":
        return <CheckCircle size={18} className="text-green-500" />;
      case "error":
        return <AlertCircle size={18} className="text-red-500" />;
      case "pendiente":
        return <Clock size={18} className="text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sincronización</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Gestiona la sincronización y logs del sistema</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm text-gray-600 dark:text-gray-400">Último evento</p>
          <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
            {logs[0]?.fecha || "—"}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total sincronizaciones</p>
          <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
            {logs.length}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm text-gray-600 dark:text-gray-400">Registros procesados</p>
          <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
            {logs.reduce((sum, log) => sum + (log.registros_procesados || 0), 0)}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Iniciar Sincronización</h2>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCcw size={18} className={syncing ? "animate-spin" : ""} />
          {syncing ? "Sincronizando..." : "Sincronizar Ahora"}
        </button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-4 text-lg font-semibold">Logs de Sincronización</h2>
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 border-b border-gray-200 pb-3 last:border-0 dark:border-gray-700">
              {getStatusIcon(log.estado)}
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{log.tipo}</p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{log.mensaje}</p>
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{log.fecha}</span>
                  {log.registros_procesados && (
                    <span className="rounded-full bg-gray-100 px-2 py-1 dark:bg-gray-800">
                      {log.registros_procesados} registros
                    </span>
                  )}
                </div>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  log.estado === "exitoso"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : log.estado === "error"
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                }`}
              >
                {log.estado}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}