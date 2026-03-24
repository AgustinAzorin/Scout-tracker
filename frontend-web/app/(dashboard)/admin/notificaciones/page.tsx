"use client";

import { useState } from "react";
import { AlertCircle, Send, Clock } from "lucide-react";

interface Notification {
  id: string;
  titulo: string;
  mensaje: string;
  destinatarios: string;
  fecha_envio: string;
  estado: "enviado" | "pendiente" | "error";
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [formData, setFormData] = useState({
    titulo: "",
    mensaje: "",
    destinatarios: "todos",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSend = async () => {
    if (!formData.titulo || !formData.mensaje) {
      setError("Título y mensaje son requeridos");
      return;
    }

    try {
      setError(null);
      setSuccess("Notificación enviada correctamente");
      setFormData({ titulo: "", mensaje: "", destinatarios: "todos" });
      
      // Simular agregar a historial
      const newNotification: Notification = {
        id: Date.now().toString(),
        ...formData,
        fecha_envio: new Date().toLocaleString(),
        estado: "enviado",
      };
      setNotifications([newNotification, ...notifications]);
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error enviando notificación");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Envío de Notificaciones</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Envía notificaciones a usuarios</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
          <span>✓ {success}</span>
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-4 text-lg font-semibold">Nueva Notificación</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Título</label>
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
              placeholder="Ej: Recordatorio de reunión"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mensaje</label>
            <textarea
              value={formData.mensaje}
              onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
              rows={4}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
              placeholder="Escribe el mensaje aquí..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Destinatarios</label>
            <select
              value={formData.destinatarios}
              onChange={(e) => setFormData({ ...formData, destinatarios: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
            >
              <option value="todos">Todos los usuarios</option>
              <option value="liders">Solo líderes</option>
              <option value="coordinadores">Solo coordinadores</option>
            </select>
          </div>

          <button
            onClick={handleSend}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <Send size={18} />
            Enviar Notificación
          </button>
        </div>
      </div>

      {notifications.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Clock size={20} />
            Historial
          </h2>
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div key={notif.id} className="border-l-4 border-blue-500 bg-gray-50 p-3 dark:bg-gray-800">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{notif.titulo}</p>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{notif.mensaje}</p>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                      {notif.fecha_envio} • {notif.destinatarios}
                    </p>
                  </div>
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                    {notif.estado}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}