# Backend Scripts

Utilidades de seed y mantenimiento para Scout Tracker.

## 📝 seed-users.js

**Propósito**: Crear dos usuarios iniciales para desarrollo con roles diferentes

**Usuarios creados**:

| Email | Contraseña | Rol | Acceso |
|-------|-----------|-----|--------|
| `admin@scouttracker.local` | `admin123` | superadmin | Backoffice completo |
| `scout@scouttracker.local` | `scout123` | visor | Solo lectura |

### Cómo ejecutar

```bash
# Desde la raíz del monorepo
npm run seed:users -w backend

# O desde la carpeta backend/
cd backend
npm run seed:users
```

### Requisitos

1. **`.env.local` configurado** con credenciales Supabase:
   ```env
   SUPABASE_URL=https://xxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
   JWT_SECRET=tu-clave-secreta
   ```

2. **Migraciones aplicadas**: `supabase db push`

3. **Los roles existen en la BD** (se crean en la migración inicial)

### Qué hace el script

1. Valida que `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` estén configuradas
2. Conecta a Supabase usando Service Role Key
3. Obtiene los roles `superadmin` y `visor` de la BD
4. Crea los dos usuarios si no existen (o actualiza si ya existen)
5. Hashea las contraseñas con bcryptjs (cost 12)
6. Imprime un resumen con las credenciales

### Output esperado

```
✅ Connected to Supabase
✅ Roles retrieved successfully
✅ User admin@scouttracker.local upserted (superadmin)
✅ User scout@scouttracker.local upserted (visor)

📋 Login Credentials:
   Admin: admin@scouttracker.local / admin123
   Scout: scout@scouttracker.local / scout123
```

### Troubleshooting

**Error: "SUPABASE_URL is not configured"**
- Completa `.env.local` con tus credenciales Supabase
- Ver: [SETUP.md - Configurar .env.local](../SETUP.md#3️⃣-configurar-envlocal)

**Error: "No roles found in database"**
- Las migraciones no se aplicaron correctamente
- Ejecuta: `supabase db push`
- Verifica que no hay errores en la migración

**Error de conexión a Supabase**
- Verifica que `SUPABASE_URL` es correcto (sin espacios)
- Verifica que `SUPABASE_SERVICE_ROLE_KEY` es completo
- Intenta copiar/pegar nuevamente desde Supabase Dashboard

**Dice "Already exists" o falla silenciosamente**
- Los usuarios ya existen en la BD
- El script es idempotente (safe to run multiple times)
- Puedes editarlos directo en Supabase SQL Editor si necesitas cambiar algo

---

## Agregar más scripts

Para crear nuevos scripts de seed o mantenimiento:

1. Crea un archivo `.js` en `backend/scripts/`
2. Importa lo necesario: `require('@supabase/supabase-js')`, etc.
3. Agrega el comando en `backend/package.json` bajo `"scripts"`
4. Ejemplo:
   ```json
   "seed:data": "node scripts/seed-data.js"
   ```
4. Ejecuta con `npm run nombre-script -w backend`
