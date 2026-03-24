# Scout Tracker - Getting Started Guide

## 🚀 Inicio rápido (15 minutos)

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Supabase

**Opción A: Ya tienes un proyecto Supabase**

1. Abre `backend/.env.local`
2. Completa con tus credenciales:
   ```env
   SUPABASE_URL=https://tu-proyecto.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
   JWT_SECRET=clave-super-secreta-minimo-32-caracteres
   ```

3. Aplica las migraciones:
   ```bash
   supabase db push
   ```

**Opción B: Crear un proyecto Supabase nuevo**

1. Ve a https://app.supabase.com/projects
2. Crea un nuevo proyecto
3. Copia la URL y Service Role Key desde Settings > API
4. Completa `backend/.env.local` con esos valores
5. Ejecuta: `supabase link --project-ref YOUR_PROJECT_ID`
6. Luego: `supabase db push`

### 3. Crear usuarios de prueba

```bash
npm run seed:users -w backend
```

**Usuarios creados:**
- **Admin (Backoffice)**: `admin@scouttracker.local` / `admin123`
- **Scout (Solo lectura)**: `scout@scouttracker.local` / `scout123`

### 4. Iniciar desarrollo

Opción 1: Correr todo junto
```bash
npm run dev
```

Opción 2: Por separado
```bash
# Terminal 1: Backend (puerto 4000)
npm run dev -w backend

# Terminal 2: Frontend Web (puerto 3000)
npm run dev -w frontend-web

# Terminal 3: Frontend Mobile
npm run dev -w frontend-mobile
```

---

## 📱 Acceso a la aplicación

- **Frontend Web**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Mobile**: Expo dev client (`exp://localhost:8081`)

**Login con cualquiera de estos usuarios:**

| Email | Contraseña | Acceso |
|-------|-----------|--------|
| admin@scouttracker.local | admin123 | Backoffice completo |
| scout@scouttracker.local | scout123 | Solo lectura |

---

## 📚 Estructura del proyecto

```
Scouts/
├── backend/               # Next.js API (puerto 4000)
│   ├── app/api/          # API routes
│   ├── lib/              # Auth, DB, utilities
│   ├── supabase/         # Migrations y scripts
│   └── SETUP.md          # Setup detallado
├── frontend-web/         # Next.js SSR (puerto 3000)
│   ├── app/              # Pages y layout
│   └── lib/              # API client, hooks
├── frontend-mobile/      # Expo + React Native
│   ├── app/              # Screensnavigation
│   └── lib/              # Auth store, API
└── packages/             # Código compartido
    ├── shared-types/     # TypeScript interfaces
    └── shared-utils/     # Helpers, schemas
```

---

## 🛠️ Comandos útiles

```bash
# Desarrollo
npm run dev              # Correr todos los apps
npm run dev -w backend   # Solo backend
npm run dev -w frontend-web

# Build
npm run build            # Build todos
npm run build -w backend

# Lint & Type check
npm run lint
npm run typecheck

# Seed
npm run seed:users -w backend

# Supabase (backend/)
supabase db push         # Aplicar migraciones
supabase db reset        # Resetear BD (dev only)
supabase status          # Ver estado
```

---

## 🔐 Autenticación

El proyecto usa **JWT + Refresh Tokens**:

- **Web**: Tokens en HttpOnly cookies (seguro contra XSS)
- **Mobile**: Tokens en SecureStore nativo de Expo
- **API**: Verifica JWT en cada request

Para más detalles, ve: [backend/lib/auth.ts](backend/lib/auth.ts)

---

## 📖 Documentación detallada

- **Backend**: [backend/SETUP.md](backend/SETUP.md)
- **Migraciones**: [backend/supabase/migrations/README.md](backend/supabase/migrations/README.md)
- **API Routes**: [backend/app/api/README.md](backend/app/api/README.md) *(próximamente)*
- **Shared Types**: [packages/shared-types/README.md](packages/shared-types/README.md)

---

## ❓ Troubleshooting

### npm install falla
```bash
# Limpiar caché
npm cache clean --force
rm -rf node_modules package-lock.json

# Reinstalar
npm install
```

### Puerto 3000 o 4000 en uso
```bash
# Liberar puertos (Windows)
taskkill /PID 12345 /F

# Ver qué usa el puerto
Get-NetTCPConnection -LocalPort 4000 | Select-Object OwningProcess
```

### Seed no funciona
1. Verifica que completaste `.env.local` correctamente
2. Valida que `supabase db push` completó sin errores
3. Mira: [backend/SETUP.md - Troubleshooting](backend/SETUP.md#troubleshooting)

---

## 🚢 Deploy

El proyecto está listo para deployar a **Render**:

- Backend: `npm run build -w backend` + start `npm start -w backend`
- Frontend: `npm run build -w frontend-web` + start `npm start -w frontend-web`
- Mobile: Build APK con EAS

*Próximamente: GitHub Actions + CI/CD guide*

---

**¿Preguntas?** Revisa la documentación de cada app en su carpeta `SETUP.md`
