-- First, drop the foreign key constraint on equipo_asignado
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_equipo_asignado_fkey;

-- Rename equipo_asignado to coordinador
ALTER TABLE users RENAME COLUMN equipo_asignado TO coordinador;

-- Change the column type to TEXT[] (array)
ALTER TABLE users ALTER COLUMN coordinador SET DATA TYPE TEXT[] USING 
  CASE 
    WHEN coordinador IS NULL OR coordinador = '' THEN NULL
    ELSE ARRAY[coordinador]
  END;

-- Add comment for clarity
COMMENT ON COLUMN users.coordinador IS 'Array of team names that this user coordinates';
