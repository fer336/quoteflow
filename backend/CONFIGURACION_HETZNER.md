# Configuración para Servidor Hetzner

## Datos de Conexión

- **IP del Servidor PostgreSQL**: 91.99.162.240
- **Puerto**: 5432
- **Dominio**: sistema.qeva.xyz

## Pasos de Configuración

### 1. Crear archivo .env

En tu terminal local, ejecuta:

```bash
cd "/home/ferc33/Documentos/00-Sistema presupuestos/backend"

cat > .env << 'EOF'
# Configuración PostgreSQL en Hetzner
DATABASE_URL=postgresql://budgetpro_user:TU_PASSWORD_AQUI@91.99.162.240:5432/budgetpro_db

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000

# CORS Origins
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,https://sistema.qeva.xyz,http://sistema.qeva.xyz

# Production domain
DOMAIN=sistema.qeva.xyz
EOF
```

**IMPORTANTE**: Reemplaza `TU_PASSWORD_AQUI` con la contraseña real del usuario PostgreSQL.

### 2. Configurar PostgreSQL en el Servidor Hetzner

Conéctate a tu servidor:

```bash
ssh root@91.99.162.240
```

#### 2.1 Crear la Base de Datos

```bash
sudo -u postgres psql
```

Ejecuta estos comandos SQL:

```sql
-- Crear base de datos y usuario
CREATE DATABASE budgetpro_db;
CREATE USER budgetpro_user WITH PASSWORD 'elige_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE budgetpro_db TO budgetpro_user;
ALTER DATABASE budgetpro_db OWNER TO budgetpro_user;

-- Conectar a la base de datos
\c budgetpro_db

-- Dar permisos en el esquema público
GRANT ALL ON SCHEMA public TO budgetpro_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO budgetpro_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO budgetpro_user;

-- Configurar permisos por defecto
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO budgetpro_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO budgetpro_user;

\q
```

#### 2.2 Configurar PostgreSQL para Aceptar Conexiones Remotas

Edita la configuración principal:

```bash
sudo nano /etc/postgresql/$(ls /etc/postgresql)/main/postgresql.conf
```

Busca y modifica:

```conf
listen_addresses = '*'
```

Edita el archivo de autenticación:

```bash
sudo nano /etc/postgresql/$(ls /etc/postgresql)/main/pg_hba.conf
```

Agrega al final:

```conf
# BudgetPro - Permitir conexiones desde tu IP local
host    budgetpro_db    budgetpro_user    0.0.0.0/0    md5
```

**NOTA DE SEGURIDAD**: En producción, reemplaza `0.0.0.0/0` con tu IP específica.

#### 2.3 Reiniciar PostgreSQL

```bash
sudo systemctl restart postgresql
sudo systemctl status postgresql
```

#### 2.4 Configurar Firewall

```bash
# Permitir puerto 5432
sudo ufw allow 5432/tcp

# Verificar reglas
sudo ufw status
```

### 3. Probar la Conexión desde tu Máquina Local

```bash
psql -h 91.99.162.240 -U budgetpro_user -d budgetpro_db
```

Si se conecta correctamente, todo está listo.

### 4. Iniciar el Backend

```bash
cd "/home/ferc33/Documentos/00-Sistema presupuestos/backend"
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Verificar que las Tablas se Crearon

Desde tu servidor Hetzner:

```bash
sudo -u postgres psql -d budgetpro_db
```

```sql
-- Ver las tablas creadas
\dt

-- Debería mostrar:
-- budgets
-- budget_items

-- Ver estructura de una tabla
\d budgets
```

## Variables de Entorno Completas

Tu archivo `.env` final debe verse así:

```env
DATABASE_URL=postgresql://budgetpro_user:tu_password@91.99.162.240:5432/budgetpro_db
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=http://localhost:5173,https://sistema.qeva.xyz
DOMAIN=sistema.qeva.xyz
```

## Despliegue en Producción con Traefik

Para desplegar en sistema.qeva.xyz, agrega estos labels en tu docker-compose.yml:

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.budgetpro-backend.rule=Host(`sistema.qeva.xyz`) && PathPrefix(`/api`)"
  - "traefik.http.routers.budgetpro-backend.tls=true"
  - "traefik.http.routers.budgetpro-backend.tls.certresolver=letsencryptresolver"
  - "traefik.http.routers.budgetpro-frontend.rule=Host(`sistema.qeva.xyz`)"
  - "traefik.http.routers.budgetpro-frontend.tls=true"
  - "traefik.http.routers.budgetpro-frontend.tls.certresolver=letsencryptresolver"
```

## Troubleshooting

### Error: "Connection refused"

```bash
# En el servidor Hetzner
sudo systemctl status postgresql
sudo netstat -tulpn | grep 5432
```

### Error: "Authentication failed"

Verifica el usuario y contraseña en el archivo `.env`

### Error: "No route to host"

Verifica el firewall:

```bash
sudo ufw status
sudo iptables -L -n | grep 5432
```

## URLs del Sistema

- **Desarrollo Local**: http://localhost:5173
- **API Local**: http://localhost:8000
- **Producción**: https://sistema.qeva.xyz
- **API Producción**: https://sistema.qeva.xyz/api
- **Docs API**: https://sistema.qeva.xyz/docs

