# Scout Tracker Backend - Dev Environment Setup

## Configuración Inicial (5 minutos)

### 1️⃣ Crear un proyecto Supabase

1. Ve a https://app.supabase.com
2. Crea un nuevo proyecto
3. Anota estas credenciales (Settings > API):
   - `SUPABASE_URL`: URL del proyecto
   - `SUPABASE_SERVICE_ROLE_KEY`: Service Role Key

### 2️⃣ Aplicar migraciones

```bash
# Instalar Supabase CLI (una sola vez)
npm install -g supabase

# Autenticarse
supabase login

# Desde la raíz del proyecto, linkear tu proyecto
supabase link --project-ref YOUR_PROJECT_ID

# Aplicar migraciones a la BD
supabase db push
```

### 3️⃣ Configurar .env.local

Ya existe `backend/.env.local` con valores de ejemplo. Solo necesitas completar:

**Abre `backend/.env.local` y reemplaza estos valores:**

```env
# De tu proyecto Supabase (Settings > API)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Puedes usar cualquier string de 32+ caracteres
JWT_SECRET=mi-clave-super-secreta-123456
```

### 4️⃣ Ejecutar el seed (crear usuarios iniciales)

```bash
npm run seed:users -w backend
```

Esto va a crear dos usuarios listos para usar desarrollo:

| Email | Contraseña | Rol |
|-------|-----------|-----|
| `admin@scouttracker.local` | `admin123` | **Backoffice completo** |
| `scout@scouttracker.local` | `scout123` | Solo lectura |

### 5️⃣ Iniciar el backend

```bash
npm run dev -w backend
```

Backend estará en `http://localhost:4000`

---

## Prueba rápida (API endpoints)

Con el backend corriendo, prueba estos endpoints:

**1. Login:**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@scouttracker.local","password":"admin123"}'
```

**2. Get current user:**
```bash
curl http://localhost:4000/api/auth/me
```

**3. List scouts:**
```bash
curl http://localhost:4000/api/scouts
```

---

## Troubleshooting

### Error: "SUPABASE_URL is not configured"
- Abre `backend/.env.local`
- Completa `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`
- Vuelve a ejecutar: `npm run seed:users -w backend`

### Error: "No roles found in database"
- Las migraciones no se aplicaron
- Ejecuta: `supabase db push`
- Espera a que terminen

### Error de conexión a Supabase
- Verifica que `SUPABASE_URL` es correcto (sin espacios)
- Verifica que `SUPABASE_SERVICE_ROLE_KEY` es el completo
- Intenta copiar/pegar de nuevo desde Supabase Dashboard

### El seed dice "Already exists"
- Los usuarios ya fueron creados anteriormente
- Puedes editarlos directamente en Supabase Dashboard (SQL Editor)
- O eliminar y correr el seed de nuevo

---

## Variables de entorno (desarrollo)

**REQUERIDAS:**
- `SUPABASE_URL` - URL de tu proyecto Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Service Role Key
- `JWT_SECRET` - Clave para firmar JWTs (min 32 chars)

**Opcionales (usan defaults):**
- `JWT_EXPIRY` - Expiración de access token (default: 1h)
- `REFRESH_TOKEN_EXPIRY_DAYS` - Expiración de refresh token (default: 7)

---

## Comandos útiles

```bash
# Desarrollo
npm run dev -w backend

# Build para producción
npm run build -w backend

# Seed de usuarios
npm run seed:users -w backend

# Type checking
npm run typecheck -w backend

# Lint
npm run lint -w backend
```

---

Para más info, ver [scripts/README.md](scripts/README.md) y [supabase/migrations/README.md](supabase/migrations/README.md)
