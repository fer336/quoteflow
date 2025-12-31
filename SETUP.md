# Guía de Configuración - BudgetPro

Esta guía te ayudará a configurar el sistema paso a paso.

## 📦 Instalación Rápida

### Opción 1: Usando Docker (Recomendado)

```bash
# 1. Clonar o navegar al proyecto
cd "/home/ferc33/Documentos/00-Sistema presupuestos"

# 2. Configurar variables de entorno (opcional)
export DB_PASSWORD="tu_password_seguro"

# 3. Levantar todos los servicios
docker-compose up -d

# 4. Ver logs
docker-compose logs -f

# 5. Acceder a:
# - Frontend: http://localhost:5173
# - Backend API: http://localhost:8000
# - Docs API: http://localhost:8000/docs
```

### Opción 2: Instalación Manual

#### Backend

```bash
# 1. Instalar PostgreSQL (si no lo tienes)
sudo apt install postgresql postgresql-contrib  # Ubuntu/Debian
# o
brew install postgresql  # macOS

# 2. Crear base de datos
sudo -u postgres psql
postgres=# CREATE DATABASE budgetpro_db;
postgres=# CREATE USER budgetpro_user WITH PASSWORD 'tu_password';
postgres=# GRANT ALL PRIVILEGES ON DATABASE budgetpro_db TO budgetpro_user;
postgres=# \q

# 3. Configurar backend
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# o
venv\Scripts\activate  # Windows

pip install -r requirements.txt

# 4. Crear archivo .env
cat > .env << EOF
DATABASE_URL=postgresql://budgetpro_user:tu_password@localhost:5432/budgetpro_db
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=http://localhost:5173
EOF

# 5. Ejecutar backend
uvicorn main:app --reload
```

#### Frontend

```bash
# En otra terminal
cd frontend

# 1. Instalar dependencias
npm install

# 2. Crear archivo .env
echo "VITE_API_URL=http://localhost:8000/api" > .env

# 3. Ejecutar frontend
npm run dev
```

## 🔍 Verificación

### 1. Verificar Backend

```bash
# Health check
curl http://localhost:8000/api/health

# Debería responder:
# {"status":"healthy","database":"connected"}
```

### 2. Verificar Frontend

Abre tu navegador en `http://localhost:5173`

Deberías ver la interfaz de BudgetPro.

### 3. Probar API

Visita `http://localhost:8000/docs` para ver la documentación interactiva de Swagger.

## 🔧 Configuración Avanzada

### Variables de Entorno del Backend

```env
# Requeridas
DATABASE_URL=postgresql://user:password@host:port/database

# Opcionales
API_HOST=0.0.0.0                    # Host del servidor
API_PORT=8000                       # Puerto del servidor
CORS_ORIGINS=http://localhost:5173  # Orígenes permitidos (separados por coma)
DOMAIN=finanzas.qeva.xyz           # Dominio de producción
```

### Variables de Entorno del Frontend

```env
VITE_API_URL=http://localhost:8000/api  # URL del backend
```

## 🚀 Despliegue en Producción

### Con Traefik (según configuración del proyecto)

```yaml
# En docker-compose.yml agregar labels de Traefik
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.budgetpro-backend.rule=Host(`finanzas.qeva.xyz`) && PathPrefix(`/api`)"
  - "traefik.http.routers.budgetpro-backend.tls=true"
  - "traefik.http.routers.budgetpro-backend.tls.certresolver=letsencryptresolver"
  - "traefik.http.routers.budgetpro-frontend.rule=Host(`finanzas.qeva.xyz`)"
  - "traefik.http.routers.budgetpro-frontend.tls=true"
  - "traefik.http.routers.budgetpro-frontend.tls.certresolver=letsencryptresolver"
```

### Build de Producción

```bash
# Frontend
cd frontend
npm run build

# Los archivos estarán en frontend/dist/

# Backend (usar gunicorn en producción)
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## 🛠️ Comandos Útiles

### Docker

```bash
# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend

# Reiniciar servicios
docker-compose restart

# Detener todo
docker-compose down

# Detener y eliminar volúmenes (CUIDADO: borra la BD)
docker-compose down -v

# Reconstruir imágenes
docker-compose build --no-cache
```

### Base de Datos

```bash
# Conectar a la base de datos
psql -h localhost -U budgetpro_user -d budgetpro_db

# Backup
pg_dump -h localhost -U budgetpro_user budgetpro_db > backup.sql

# Restore
psql -h localhost -U budgetpro_user budgetpro_db < backup.sql
```

## 🐛 Solución de Problemas

### Error: "Connection refused" al conectar a la base de datos

1. Verificar que PostgreSQL esté ejecutándose:
```bash
sudo systemctl status postgresql  # Linux
brew services list  # macOS
```

2. Verificar credenciales en `.env`

### Error: "CORS policy" en el navegador

1. Verificar que el frontend esté en la lista de `CORS_ORIGINS`
2. Reiniciar el backend después de cambiar `.env`

### Error: "Module not found" en el frontend

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### El frontend no se conecta al backend

1. Verificar que `VITE_API_URL` esté correctamente configurado
2. Verificar que el backend esté ejecutándose en el puerto correcto
3. Reiniciar el servidor de desarrollo del frontend

## 📞 Soporte

Para problemas o dudas sobre la configuración, verificar:
1. Logs del backend: `docker-compose logs backend`
2. Logs del frontend: `docker-compose logs frontend`
3. Consola del navegador (F12)
4. Documentación de la API: `http://localhost:8000/docs`

---

¡Sistema listo para usar! 🎉

