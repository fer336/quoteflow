-- Script SQL para configurar la base de datos BudgetPro en el servidor Hetzner
-- Ejecutar como usuario postgres: sudo -u postgres psql < setup_database.sql

-- Crear base de datos
CREATE DATABASE budgetpro_db;

-- Crear usuario (CAMBIAR 'tu_password_seguro' por una contraseña real)
CREATE USER budgetpro_user WITH PASSWORD 'tu_password_seguro';

-- Otorgar privilegios en la base de datos
GRANT ALL PRIVILEGES ON DATABASE budgetpro_db TO budgetpro_user;

-- Hacer al usuario dueño de la base de datos
ALTER DATABASE budgetpro_db OWNER TO budgetpro_user;

-- Conectar a la base de datos
\c budgetpro_db

-- Otorgar permisos en el esquema público
GRANT ALL ON SCHEMA public TO budgetpro_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO budgetpro_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO budgetpro_user;

-- Configurar permisos por defecto para objetos futuros
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO budgetpro_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO budgetpro_user;

-- Verificar la configuración
SELECT usename, usecreatedb, usesuper FROM pg_user WHERE usename = 'budgetpro_user';

-- Mensaje final
\echo '✅ Base de datos budgetpro_db configurada correctamente'
\echo '📋 Usuario: budgetpro_user'
\echo '🔑 Recuerda cambiar la contraseña en este script antes de ejecutarlo'

