-- Initial Scout Tracker Schema

-- Teams
CREATE TABLE equipos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Active scouts
CREATE TABLE scouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero INTEGER,
  nombre TEXT NOT NULL,
  dni BIGINT UNIQUE,
  fecha_nacimiento DATE,
  tel_emergencias TEXT,
  tel_emergencias_2 TEXT,
  tel_propio TEXT,
  religion TEXT,
  categoria_miembro TEXT,
  dia_cumple INTEGER,
  va BOOLEAN DEFAULT FALSE,
  pdf_url TEXT,
  equipo TEXT REFERENCES equipos(nombre) ON UPDATE CASCADE,
  promesa TEXT,
  etapa TEXT,
  elemento TEXT CHECK (elemento IN ('Fuego','Tierra','Agua','Aire')),
  raid TEXT,
  cordi TEXT,
  guardian TEXT,
  diario_marcha DATE,
  rol_comunidad TEXT,
  tada_puede BOOLEAN,
  tada_tiene BOOLEAN,
  mistica TEXT,
  ingreso_movimiento TEXT CHECK (ingreso_movimiento IN ('Manada','Unidad','Caminantes')),
  distrito BOOLEAN,
  afiliacion BOOLEAN,
  cuota_social JSONB,
  retiro_solo TEXT,
  ddjj_salud TEXT,
  uso_imagen TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Former scouts
CREATE TABLE scouts_ex (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero INTEGER,
  nombre TEXT NOT NULL,
  dni BIGINT,
  fecha_nacimiento DATE,
  tel_emergencias TEXT,
  tel_emergencias_2 TEXT,
  tel_propio TEXT,
  religion TEXT,
  categoria_miembro TEXT,
  va BOOLEAN,
  equipo TEXT,
  promesa TEXT,
  etapa TEXT,
  elemento TEXT,
  raid TEXT,
  cordi TEXT,
  guardian TEXT,
  diario_marcha DATE,
  rol_comunidad TEXT,
  tada_puede BOOLEAN,
  tada_tiene BOOLEAN,
  mistica TEXT,
  ingreso_movimiento TEXT,
  distrito BOOLEAN,
  afiliacion BOOLEAN,
  cuota_social JSONB,
  fecha_baja DATE,
  motivo_baja TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Roles with granular permissions
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT UNIQUE NOT NULL,
  permisos JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- App users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  google_id TEXT,
  role_id UUID REFERENCES roles(id),
  equipo_asignado TEXT REFERENCES equipos(nombre) ON UPDATE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  refresh_token_hash TEXT,
  refresh_token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calendar events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  fecha_inicio TIMESTAMPTZ NOT NULL,
  fecha_fin TIMESTAMPTZ,
  tipo TEXT CHECK (tipo IN ('reunion','cumpleanos','campamento','raid','feriado','recordatorio')),
  color TEXT,
  equipo_destinatario TEXT,
  notificacion_antelacion_minutos INTEGER,
  notificacion_enviada BOOLEAN DEFAULT FALSE,
  es_cumpleanos BOOLEAN DEFAULT FALSE,
  scout_id UUID REFERENCES scouts(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Web push subscriptions (VAPID)
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('web','expo')),
  endpoint TEXT,
  p256dh TEXT,
  auth_key TEXT,
  expo_push_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification history
CREATE TABLE notifications_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT CHECK (tipo IN ('push','email')),
  destinatario_user_id UUID REFERENCES users(id),
  evento_id UUID REFERENCES events(id),
  mensaje TEXT,
  success BOOLEAN,
  enviado_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dynamic image mapping
CREATE TABLE element_images (
  elemento TEXT PRIMARY KEY CHECK (elemento IN ('Fuego','Tierra','Agua','Aire')),
  image_url TEXT NOT NULL
);

CREATE TABLE promise_images (
  promesa TEXT PRIMARY KEY,
  image_url TEXT NOT NULL
);

-- Sync configuration and logs
CREATE TABLE sync_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  sheet_url TEXT,
  sheet_id TEXT,
  range TEXT DEFAULT 'Datos!A:AL',
  polling_interval_minutes INTEGER DEFAULT 3,
  is_enabled BOOLEAN DEFAULT TRUE,
  last_sync_at TIMESTAMPTZ
);

CREATE TABLE sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ejecutado_at TIMESTAMPTZ DEFAULT NOW(),
  filas_actualizadas INTEGER,
  filas_sin_cambios INTEGER,
  errores TEXT,
  duracion_ms INTEGER
);

-- PDF activity generator
CREATE TABLE pdf_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_grupo TEXT,
  nombre_comunidad TEXT,
  equipo_educadores JSONB,
  diagnostico_rama TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pdf_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES pdf_templates(id),
  fecha DATE NOT NULL,
  lugar TEXT,
  justificacion TEXT,
  objetivos TEXT,
  grilla JSONB,
  anexos JSONB,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_scouts_equipo ON scouts(equipo);
CREATE INDEX idx_scouts_elemento ON scouts(elemento);
CREATE INDEX idx_scouts_promesa ON scouts(promesa);
CREATE INDEX idx_scouts_fecha_nacimiento ON scouts(fecha_nacimiento);
CREATE INDEX idx_scouts_dni ON scouts(dni);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_events_fecha_inicio ON events(fecha_inicio);
CREATE INDEX idx_events_tipo ON events(tipo);
CREATE INDEX idx_notifications_log_enviado_at ON notifications_log(enviado_at);
CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- Seed data: Teams
INSERT INTO equipos (nombre, descripcion) VALUES
  ('Baden Powell', 'Equipo fundador'),
  ('Frida Kahlo', 'Equipo artistico'),
  ('Lola Mora', 'Equipo cultural'),
  ('Tupac Amaru', 'Equipo historico')
ON CONFLICT DO NOTHING;

-- Seed data: Roles
INSERT INTO roles (nombre, permisos) VALUES
  ('superadmin', '{"scouts":{"ver":true,"editar":true,"crear":true,"eliminar":true},"graficos":{"ver":true},"calendario":{"ver":true,"editar":true,"crear":true,"eliminar":true},"admin":{"ver":true,"editar":true,"crear":true,"eliminar":true},"pdf":{"ver":true,"crear":true}}'),
  ('admin', '{"scouts":{"ver":true,"editar":true,"crear":true,"eliminar":false},"graficos":{"ver":true},"calendario":{"ver":true,"editar":true,"crear":true,"eliminar":false},"admin":{"ver":true,"editar":false},"pdf":{"ver":true,"crear":true}}'),
  ('coord_equipo', '{"scouts":{"ver":true,"editar":true,"crear":true,"eliminar":false},"graficos":{"ver":true},"calendario":{"ver":true,"editar":true,"crear":false},"admin":{"ver":false},"pdf":{"ver":true,"crear":false}}'),
  ('visor', '{"scouts":{"ver":true},"graficos":{"ver":true},"calendario":{"ver":true},"admin":{"ver":false},"pdf":{"ver":true}}')
ON CONFLICT DO NOTHING;

-- Seed data: Element images
INSERT INTO element_images (elemento, image_url) VALUES
  ('Fuego', '/images/elementos/fuego.png'),
  ('Tierra', '/images/elementos/tierra.png'),
  ('Agua', '/images/elementos/agua.png'),
  ('Aire', '/images/elementos/aire.png')
ON CONFLICT DO NOTHING;

-- Seed data: Sync config
INSERT INTO sync_config (id, polling_interval_minutes, is_enabled) VALUES
  (1, 3, true)
ON CONFLICT DO NOTHING;
