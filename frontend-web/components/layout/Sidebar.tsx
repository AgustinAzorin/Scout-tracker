"use client";

import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/scouts", label: "Scouts" },
  { href: "/graficos", label: "Graficos" },
  { href: "/calendario", label: "Calendario" },
  { href: "/admin", label: "Admin" }
];

export default function Sidebar() {
  return (
    <aside className="flex min-h-screen flex-col bg-[#0f6c5a] p-6 text-white dark:bg-[#0a3b31]">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Scout Tracker</h2>
        <ModeToggle />
      </div>
      <nav className="space-y-2">
        {links.map((link) => (
          <Link key={link.href} className="block rounded px-3 py-2 hover:bg-white/20" href={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}