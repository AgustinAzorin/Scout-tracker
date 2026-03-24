import type { ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { AuthProvider } from "@/lib/auth-context";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_1fr]">
        <Sidebar />
        <div>
          <Topbar />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </AuthProvider>
  );
}