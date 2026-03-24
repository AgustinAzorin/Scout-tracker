"use client";

import Link from "next/link";
import { Bell, FileText, RefreshCcw, Shield, Users } from "lucide-react";

const ADMIN_SECTIONS = [
  {
    href: "/admin/usuarios",
    title: "Usuarios",
    description: "Alta, baja y gestión de acceso de usuarios del sistema.",
    icon: Users
  },
  {
    href: "/admin/equipos",
    title: "Equipos",
    description: "Alta, baja y administración de los equipos disponibles.",
    icon: Shield
  },
  {
    href: "/admin/notificaciones",
    title: "Notificaciones",
    description: "Envío manual e historial de notificaciones emitidas.",
    icon: Bell
  },
  {
    href: "/admin/sincronizacion",
    title: "Sincronización",
    description: "Configuración y seguimiento de la sincronización externa.",
    icon: RefreshCcw
  },
  {
    href: "/admin/pdf",
    title: "PDF",
    description: "Plantillas y generación de documentos PDF administrativos.",
    icon: FileText
  }
];

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white p-6 shadow dark:bg-neutral-900">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Administración</h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
          Centro de acceso a las herramientas de backoffice para usuarios, equipos, notificaciones,
          sincronización y documentos.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ADMIN_SECTIONS.map((section) => {
          const Icon = section.icon;

          return (
            <Link
              key={section.href}
              href={section.href}
              className="group rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--accent)]/40 hover:shadow dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-[var(--accent)]/40"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-neutral-100 p-3 text-neutral-700 transition group-hover:bg-[var(--accent)]/10 group-hover:text-[var(--accent)] dark:bg-neutral-800 dark:text-neutral-200">
                  <Icon size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">{section.title}</h2>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{section.description}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}