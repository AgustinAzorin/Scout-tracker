"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, X, AlertCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Role {
  id: string;
  nombre: string;
}

interface User {
  id: string;
  nombre: string;
  email: string;
  role_id: string;
  coordinador?: string[];
  is_active: boolean;
}

interface Scout {
  equipo: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [equipos, setEquipos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    role_id: "",
    coordinador: [] as string[],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar usuarios
      const usersResponse = await apiFetch<{ users: User[] }>("/api/admin/users", {
        method: "GET",
      });
      setUsers(usersResponse.users || []);

      // Cargar roles
      const rolesResponse = await apiFetch<{ roles: Role[] }>("/api/admin/roles", {
        method: "GET",
      });
      setRoles(rolesResponse.roles || []);

      // Cargar equipos únicos desde scouts
      const scoutsResponse = await apiFetch<{ data: Scout[] }>("/api/scouts?limit=1000", {
        method: "GET",
      });
      const uniqueEquipos = Array.from(
        new Set((scoutsResponse.data || []).map((s) => s.equipo).filter(Boolean))
      ).sort();
      setEquipos(uniqueEquipos);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando datos");
    } finally {
      setLoading(false);
    }
  };

  const getRolName = (roleId: string): string => {
    const role = roles.find((r) => r.id === roleId);
    return role?.nombre || roleId;
  };

  const toggleEquipo = (equipo: string) => {
    setFormData((current) => ({
      ...current,
      coordinador: current.coordinador.includes(equipo)
        ? current.coordinador.filter((item) => item !== equipo)
        : [...current.coordinador, equipo],
    }));
  };

  const openNewUserModal = () => {
    setEditingUser(null);
    setFormData({ nombre: "", email: "", role_id: roles[0]?.id || "", coordinador: [] });
    setIsModalOpen(true);
    setIsDeleteConfirmOpen(false);
  };

  const openEditUserModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      nombre: user.nombre,
      email: user.email,
      role_id: user.role_id,
      coordinador: user.coordinador || [],
    });
    setIsModalOpen(true);
    setIsDeleteConfirmOpen(false);
  };

  const handleSave = async () => {
    if (!formData.nombre || !formData.email) {
      setError("Nombre y email son requeridos");
      return;
    }

    try {
      setError(null);
      if (editingUser) {
        await apiFetch<{ user: User }>(`/api/admin/users/${editingUser.id}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
      } else {
        await apiFetch<{ user: User }>("/api/admin/users", {
          method: "POST",
          body: JSON.stringify(formData),
        });
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error guardando usuario");
    }
  };

  const handleDelete = async () => {
    if (!editingUser) return;
    try {
      setError(null);
      await apiFetch<{ success: boolean }>(`/api/admin/users/${editingUser.id}`, {
        method: "DELETE",
      });
      setIsModalOpen(false);
      setIsDeleteConfirmOpen(false);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error eliminando usuario");
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <button
          onClick={openNewUserModal}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Nuevo Usuario
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-900">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Nombre</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Email</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Rol</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Coordinador de</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Estado</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No hay usuarios registrados
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{user.nombre}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{user.email}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {getRolName(user.role_id)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {user.coordinador && user.coordinador.length > 0
                      ? user.coordinador.join(", ")
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${user.is_active ? "bg-green-500" : "bg-red-500"}`}
                    />
                    <span className="ml-2">{user.is_active ? "Activo" : "Inactivo"}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => openEditUserModal(user)}
                        className="rounded p-2 hover:bg-blue-100 dark:hover:bg-blue-900"
                        title="Editar"
                      >
                        <Pencil size={16} className="text-blue-600 dark:text-blue-400" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setIsDeleteConfirmOpen(true);
                        }}
                        className="rounded p-2 hover:bg-red-100 dark:hover:bg-red-900"
                        title="Eliminar"
                      >
                        <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-96 max-w-full rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                <AlertCircle size={16} />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {isDeleteConfirmOpen ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
                <p className="text-sm font-semibold text-red-800 dark:text-red-200">Eliminar usuario</p>
                <p className="mt-2 text-sm text-red-700 dark:text-red-300">
                  ¿Estás seguro de que deseas desactivar este usuario? Se marcará como inactivo.
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setIsDeleteConfirmOpen(false)}
                    className="flex-1 rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-100 dark:border-red-700 dark:text-red-200 dark:hover:bg-red-900"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                  >
                    Desactivar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) =>
                        setFormData({ ...formData, nombre: e.target.value })
                      }
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                      placeholder="Nombre completo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                      placeholder="correo@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rol</label>
                    <select
                      value={formData.role_id}
                      onChange={(e) =>
                        setFormData({ ...formData, role_id: e.target.value })
                      }
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                    >
                      <option value="">Seleccionar rol...</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Equipos a Coordinar
                      </label>
                      {formData.coordinador.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, coordinador: [] })}
                          className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Limpiar selección
                        </button>
                      ) : null}
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {equipos.length === 0 ? (
                        <div className="col-span-full rounded-lg border border-dashed border-gray-300 px-3 py-4 text-center text-sm text-gray-500 dark:border-gray-600 dark:text-gray-400">
                          No hay equipos disponibles
                        </div>
                      ) : (
                        equipos.map((equipo) => {
                          const isSelected = formData.coordinador.includes(equipo);

                          return (
                            <button
                              key={equipo}
                              type="button"
                              onClick={() => toggleEquipo(equipo)}
                              className={`rounded-xl border px-3 py-3 text-left text-sm font-medium transition ${
                                isSelected
                                  ? "border-blue-500 bg-blue-50 text-blue-900 shadow-sm dark:border-blue-500 dark:bg-blue-950 dark:text-blue-100"
                                  : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50/60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-blue-700 dark:hover:bg-gray-700"
                              }`}
                              aria-pressed={isSelected}
                            >
                              <span className="flex items-center justify-between gap-2">
                                <span className="truncate">{equipo}</span>
                                <span
                                  className={`h-3 w-3 rounded-full ${
                                    isSelected ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
                                  }`}
                                />
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>

                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Un click selecciona o desmarca cada equipo. Los que están activos quedan resaltados.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex gap-2">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    {editingUser ? "Guardar" : "Crear"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}