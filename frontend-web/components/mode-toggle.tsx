'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

export function ModeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const currentTheme = theme === 'system' ? systemTheme : theme;
  const isDark = currentTheme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Cambiar a modo ${isDark ? 'claro' : 'oscuro'}`}
      className="group relative inline-flex items-center justify-center rounded-lg p-2 text-sm font-medium transition-all duration-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
    >
      {/* Fondo animado */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-yellow-200/0 to-orange-200/0 opacity-0 transition-opacity duration-300 group-hover:from-yellow-200/50 group-hover:to-orange-200/50 group-hover:opacity-100 dark:from-blue-300/0 dark:to-cyan-300/0 dark:group-hover:from-blue-300/50 dark:group-hover:to-cyan-300/50" />

      {/* Contenedor de iconos con rotación */}
      <div className="relative flex h-5 w-5 items-center justify-center">
        {/* Sol */}
        <Sun
          size={20}
          className={`absolute transition-all duration-300 ${
            isDark
              ? 'scale-0 rotate-90 opacity-0'
              : 'scale-100 rotate-0 opacity-100'
          } text-yellow-500`}
        />

        {/* Luna */}
        <Moon
          size={20}
          className={`absolute transition-all duration-300 ${
            isDark
              ? 'scale-100 rotate-0 opacity-100'
              : 'scale-0 -rotate-90 opacity-0'
          } text-blue-400`}
        />
      </div>

      {/* Brillo de fondo (shine effect) */}
      <div className="absolute inset-0 rounded-lg opacity-0 shadow-md shadow-yellow-300/20 transition-opacity duration-300 group-hover:opacity-100 dark:shadow-blue-400/20" />
    </button>
  );
}
