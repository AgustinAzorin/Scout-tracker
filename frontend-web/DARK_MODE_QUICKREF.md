# Dark Mode Setup - Referencia Rápida

## 🎯 Lo que se implementó

### ✅ Instalación
```bash
npm install next-themes
```

### ✅ Componentes Creados

#### 1. ThemeProvider (`components/theme-provider.tsx`)
- Wrapper que usa `next-themes`
- Configura persistencia en localStorage
- Detecta tema del SO automáticamente

#### 2. ModeToggle (`components/mode-toggle.tsx`)
- Botón elegante con iconos Sun/Moon
- Transiciones suaves (scale, rotate, opacity)
- Efecto hover con gradiente y brillo
- Manejo correcto de hidratación (sin parpadeos)
- Labels ARIA para accesibilidad

### ✅ Configuración

#### app/layout.tsx
```typescript
import { TailwindThemeProvider } from "@/components/theme-provider";

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <TailwindThemeProvider>
          {children}
        </TailwindThemeProvider>
      </body>
    </html>
  );
}
```

#### tailwind.config.ts
- `darkMode: "class"` habilitado
- Variables CSS para ambos temas
- Extensiones para colores personalizados

#### app/globals.css
- Variables CSS modernas (HSL format)
- Estilos transición suave
- Compatibilidad con estilos heredados

#### components/layout/Sidebar.tsx
- Integración del ModeToggle
- Ubicación en sidebar inferior

---

## 🚀 Uso Rápido

### En Layout o Header
```typescript
import { ModeToggle } from "@/components/mode-toggle";

export function TopBar() {
  return (
    <header>
      <h1>Mi App</h1>
      <ModeToggle />
    </header>
  );
}
```

### En Componentes Tailwind
```jsx
<div className="bg-white dark:bg-neutral-900">
  <p className="text-black dark:text-white">Contenido</p>
</div>
```

### Acceder al Tema en Lógica
```typescript
import { useTheme } from 'next-themes';

export function MyComponent() {
  const { theme, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Tema: {theme}
    </button>
  );
}
```

---

## 🎨 Características Visuales del ModeToggle

- **Sun Icon**: Visible en modo claro, desaparece con escala y rotación en modo oscuro
- **Moon Icon**: Visible en modo oscuro, desaparece en modo claro
- **Fondo Animado**: Gradiente amarillo/naranja en hover en claro, azul/cyan en oscuro
- **Efecto Shine**: Brillo de sombra sincronizado con el gradiente
- **Transiciones**: Duración 0.3s en todas las animaciones

---

## 🛡️ Validación

✅ **TypeScript**: Sin errores
✅ **Build**: Compilación exitosa
✅ **Hidratación**: Manejada correctamente (sin parpadeos)
✅ **Persistencia**: localStorage configurado
✅ **Tema Sistema**: Auto-detección habilitada

---

## 📁 Archivos Relacionados

```
frontend-web/
├── components/
│   ├── theme-provider.tsx        (NEW)
│   ├── mode-toggle.tsx           (NEW)
│   ├── layout/
│   │   └── Sidebar.tsx           (MODIFIED)
│   └── examples/
│       └── theme-toggle-examples.tsx (NEW)
├── app/
│   ├── layout.tsx                (MODIFIED)
│   └── globals.css               (MODIFIED)
├── tailwind.config.ts            (MODIFIED)
└── DARK_MODE_SETUP.md            (DOCUMENTATION)
```

---

## 💡 Pro Tips

1. **Valores de tema**: Accede con `useTheme()` para condicionales complejos
2. **Transiciones**: Usa `transition-colors` en Tailwind para cambios suaves
3. **SSR**: No olvides `suppressHydrationWarning` en el `<html>`
4. **Testing**: Verifica ambos temas (`prefers-color-scheme`)
5. **Performance**: ModeToggle devuelve `null` durante SSR (sin impacto)

---

## 🔗 Referencias
- [next-themes Documentation](https://github.com/pacocoursey/next-themes)
- [Tailwind Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [Lucide React Icons](https://lucide.dev)
