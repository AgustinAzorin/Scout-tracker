-- Add support for additional scout documents in JSON format
ALTER TABLE scouts
ADD COLUMN IF NOT EXISTS otros_documentos JSONB DEFAULT '[]'::jsonb;
