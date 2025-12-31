# 🚀 Inicio Rápido - BudgetPro

## Opción 1: Ejecución Manual (Desarrollo)

### 1️⃣ Iniciar PostgreSQL

Asegúrate de tener PostgreSQL instalado y ejecutándose. Luego crea la base de datos:

```bash
# Conectar a PostgreSQL
sudo -u postgres psql

# Crear base de datos y usuario
CREATE DATABASE budgetpro_db;
CREATE USER budgetpro_user WITH PASSWORD 'budgetpro123';
GRANT ALL PRIVILEGES ON DATABASE budgetpro_db TO budgetpro_user;
\q
```

### 2️⃣ Iniciar Backend

```bash
# Abrir terminal 1
cd "/home/ferc33/Documentos/00-Sistema presupuestos/backend"

# Crear entorno virtual
python -m venv venv
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar .env (crear archivo si no existe)
echo 'DATABASE_URL=postgresql://budgetpro_user:budgetpro123@localhost:5432/budgetpro_db' > .env

# Ejecutar backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**✅ Backend ejecutándose en:** `http://localhost:8000`
**📚 Documentación API:** `http://localhost:8000/docs`

### 3️⃣ Iniciar Frontend

```bash
# Abrir terminal 2
cd "/home/ferc33/Documentos/00-Sistema presupuestos/frontend"

# Instalar dependencias
npm install

# Configurar .env (crear archivo si no existe)
echo 'VITE_API_URL=http://localhost:8000/api' > .env

# Ejecutar frontend
npm run dev
```

**✅ Frontend ejecutándose en:** `http://localhost:5173`

---

## Opción 2: Docker Compose (Más Simple)

```bash
# En el directorio raíz del proyecto
cd "/home/ferc33/Documentos/00-Sistema presupuestos"

# Levantar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f
```

**✅ Todo ejecutándose automáticamente:**
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- PostgreSQL: `localhost:5432`

---

## 🎯 Verificación

### 1. Probar el Backend

```bash
curl http://localhost:8000/api/health
```

Debería responder:
```json
{"status":"healthy","database":"connected"}
```

### 2. Abrir el Frontend

Visita: `http://localhost:5173`

Deberías ver la interfaz de BudgetPro con:
- Botón "Nuevo Presupuesto" en la esquina superior derecha
- Tabla de presupuestos (vacía inicialmente)
- Buscador

### 3. Crear tu Primer Presupuesto

1. Click en "Nuevo Presupuesto"
2. Completar:
   - Cliente: "Mi Primer Cliente"
   - Fecha: (se autocompleta)
   - Validez: "15 días"
3. Agregar items en la tabla
4. Click en "Guardar Presupuesto"

---

## 🛑 Detener los Servicios

### Si usaste ejecución manual:
- Presiona `Ctrl+C` en cada terminal

### Si usaste Docker:
```bash
docker-compose down
```

---

## 📊 Próximos Pasos

1. ✅ Sistema funcionando
2. 📖 Lee `README.md` para más detalles
3. 🔧 Lee `SETUP.md` para configuración avanzada
4. 🎨 Personaliza el sistema según tus necesidades

---

## ⚡ Comandos Rápidos

```bash
# Ver estructura del proyecto
tree -L 3 -I 'node_modules|venv|__pycache__'

# Reiniciar backend (desarrollo)
cd backend && uvicorn main:app --reload

# Reiniciar frontend (desarrollo)
cd frontend && npm run dev

# Ver logs de Docker
docker-compose logs -f backend
docker-compose logs -f frontend

# Conectar a la base de datos
psql -h localhost -U budgetpro_user -d budgetpro_db
```

---

**¡Listo para usar! 🎉**

Si tienes problemas, consulta la sección de **Solución de Problemas** en `SETUP.md`.

