# Supabase Migrations

Esta carpeta contiene todas las migraciones SQL para Scout Tracker.

## Estructura

- `20260323_000000_initial_schema.sql` — Schema inicial con todas las tablas, relaciones e índices.

## Cómo aplicar migraciones

### Opción 1: Usando Supabase CLI

```bash
# Instalar Supabase CLI
npm install -g supabase

# Configurar credenciales
supabase login

# Aplicar migraciones a un proyecto existente
supabase db push
```

### Opción 2: Manualmente a través del Editor SQL en Supabase Dashboard

1. Ve a tu proyecto en https://app.supabase.com
2. Abre el editor SQL
3. Copia y pega el contenido de las migraciones en orden
4. Ejecuta

### Opción 3: Usando psql (conexión directa a PostgreSQL)

```bash
psql "postgresql://[user]:[password]@[host]:[port]/[database]" -f 20260323_000000_initial_schema.sql
```

## Naming Convention

Las migraciones siguen el formato: `YYYYMMDD_HHMMSS_descripcion.sql`

Ejemplo: `20260323_000000_initial_schema.sql`

## Nota Importante

- RLS (Row Level Security) está **deshabilitado** en este schema.
- La autorización se enforza en la capa de API (backend).
- Los datos sensibles (passwords, tokens) se hashean antes de almacenarse.
