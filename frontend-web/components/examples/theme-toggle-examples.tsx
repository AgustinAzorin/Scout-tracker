import { ModeToggle } from "@/components/mode-toggle";

/**
 * Ejemplo de uso del componente ModeToggle en diferentes ubicaciones
 */

// OPCIÓN 1: En el Header/Topbar
export function HeaderWithThemeToggle() {
  return (
    <header className="flex items-center justify-between bg-white px-6 py-4 dark:bg-neutral-900">
      <h1 className="text-2xl font-bold">Mi App</h1>
      <div className="flex items-center gap-4">
        {/* Otros elementos del header aquí */}
        <ModeToggle />
      </div>
    </header>
  );
}

// OPCIÓN 2: En un menú flotante
export function FloatingThemeButton() {
  return (
    <div className="fixed bottom-4 right-4">
      <ModeToggle />
    </div>
  );
}

// OPCIÓN 3: En un settings/preferences panel
export function SettingsPanel() {
  return (
    <div className="space-y-4 rounded-lg bg-neutral-50 p-6 dark:bg-neutral-800">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Tema de la aplicación</label>
        <ModeToggle />
      </div>
    </div>
  );
}
