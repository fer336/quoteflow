-- PHASE 1 (no downtime): dual-key foundation
-- Objetivo: agregar UUID canónico sin romper FKs actuales basadas en INTEGER.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) users.uuid_id como identificador nuevo canónico
ALTER TABLE users ADD COLUMN IF NOT EXISTS uuid_id UUID;
UPDATE users SET uuid_id = gen_random_uuid() WHERE uuid_id IS NULL;
ALTER TABLE users ALTER COLUMN uuid_id SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_uuid_id_key'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_uuid_id_key UNIQUE (uuid_id);
  END IF;
END $$;

-- 2) columnas shadow en tablas hijas (sin tocar FKs existentes)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS user_uuid_id UUID;
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS user_uuid_id UUID;

-- 3) backfill inicial desde user_id (int) -> uuid_id
UPDATE clients c
SET user_uuid_id = u.uuid_id
FROM users u
WHERE c.user_id = u.id AND c.user_uuid_id IS NULL;

UPDATE budgets b
SET user_uuid_id = u.uuid_id
FROM users u
WHERE b.user_id = u.id AND b.user_uuid_id IS NULL;

-- 4) índices para lectura por uuid
CREATE INDEX IF NOT EXISTS ix_clients_user_uuid_id ON clients(user_uuid_id);
CREATE INDEX IF NOT EXISTS ix_budgets_user_uuid_id ON budgets(user_uuid_id);

-- Próxima fase:
-- - dual-write app layer (user_id y user_uuid_id)
-- - constraints FK de uuid (NOT VALID + VALIDATE)
-- - cutover de lecturas a uuid
-- - retiro progresivo de user_id int
