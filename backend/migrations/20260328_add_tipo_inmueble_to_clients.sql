-- Migración manual para bases existentes.
-- PostgreSQL 9.6+ soporta IF NOT EXISTS en ADD COLUMN.

ALTER TABLE clients
ADD COLUMN IF NOT EXISTS tipo_inmueble VARCHAR;
