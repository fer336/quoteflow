# BudgetPro - Sistema de Gestión de Presupuestos

Sistema completo de gestión de presupuestos con backend en FastAPI y frontend en React.

## 🚀 Características

- ✅ Creación y gestión de presupuestos
- ✅ Carga dinámica de items/servicios
- ✅ Cálculo automático o manual del total
- ✅ Estados de presupuesto (Pendiente, Aceptado, Rechazado)
- ✅ Búsqueda y filtrado
- ✅ Interfaz moderna con Tailwind CSS
- ✅ API REST completa con FastAPI
- ✅ Base de datos PostgreSQL

## 📋 Requisitos Previos

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- npm o yarn

## 🛠️ Instalación

### Backend (FastAPI)

1. Navegar al directorio del backend:
```bash
cd backend
```

2. Crear entorno virtual:
```bash
python -m venv venv
source venv/bin/activate  # En Linux/Mac
# o
venv\Scripts\activate  # En Windows
```

3. Instalar dependencias:
```bash
pip install -r requirements.txt
```

4. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL
```

5. Crear la base de datos:
```sql
CREATE DATABASE budgetpro_db;
CREATE USER budgetpro_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE budgetpro_db TO budgetpro_user;
```

6. Ejecutar el servidor:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

El backend estará disponible en: `http://localhost:8000`
Documentación API: `http://localhost:8000/docs`

### Frontend (React + Vite)

1. Navegar al directorio del frontend:
```bash
cd frontend
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno (opcional):
```bash
cp .env.example .env
# Editar si es necesario
```

4. Ejecutar el servidor de desarrollo:
```bash
npm run dev
```

El frontend estará disponible en: `http://localhost:5173`

## 🐳 Despliegue con Docker

```bash
docker-compose up -d
```

Esto levantará:
- Backend en `http://localhost:8000`
- Frontend en `http://localhost:5173`
- PostgreSQL en puerto `5432`

## 📂 Estructura del Proyecto

```
00-Sistema presupuestos/
├── backend/
│   ├── main.py              # Aplicación principal FastAPI
│   ├── database.py          # Configuración de base de datos
│   ├── models.py            # Modelos SQLAlchemy
│   ├── schemas.py           # Schemas Pydantic
│   ├── routers/
│   │   ├── budgets.py       # Endpoints de presupuestos
│   │   └── budget_items.py  # Endpoints de items
│   ├── requirements.txt     # Dependencias Python
│   └── .env.example         # Variables de entorno ejemplo
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── services/        # Servicios API
│   │   ├── App.jsx          # Componente principal
│   │   └── main.jsx         # Punto de entrada
│   ├── package.json         # Dependencias Node
│   └── vite.config.js       # Configuración Vite
├── docker-compose.yml       # Configuración Docker
└── README.md               # Este archivo
```

## 🎨 Diseño

El sistema utiliza una paleta de colores moderna:
- **Verde primario**: Para acciones principales y elementos destacados
- **Gris**: Para textos y elementos secundarios
- **Gris oscuro**: Para encabezados y elementos de énfasis

## 🔌 API Endpoints

### Presupuestos

- `GET /api/budgets/` - Listar todos los presupuestos
- `POST /api/budgets/` - Crear nuevo presupuesto
- `GET /api/budgets/{id}` - Obtener presupuesto específico
- `PUT /api/budgets/{id}` - Actualizar presupuesto
- `DELETE /api/budgets/{id}` - Eliminar presupuesto
- `GET /api/budgets/{id}/pdf` - Generar PDF (en desarrollo)

### Items de Presupuesto

- `GET /api/budget-items/{budget_id}/items` - Obtener items de un presupuesto
- `POST /api/budget-items/{budget_id}/items` - Agregar item a presupuesto
- `DELETE /api/budget-items/items/{item_id}` - Eliminar item

## 🔧 Variables de Entorno

### Backend (.env)

```env
DATABASE_URL=postgresql://budgetpro_user:password@localhost:5432/budgetpro_db
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
DOMAIN=finanzas.qeva.xyz
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000/api
```

## 📊 Base de Datos

### Tabla: budgets

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Integer | ID interno |
| budget_id | String | ID visible (PR-001, PR-002, etc.) |
| client | String | Nombre del cliente |
| date | DateTime | Fecha del presupuesto |
| validity | String | Validez (7, 15, 30 días) |
| status | Enum | Estado (Pendiente/Aceptado/Rechazado) |
| total | Float | Monto total |
| is_manual_total | Integer | Modo de cálculo (0=auto, 1=manual) |

### Tabla: budget_items

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Integer | ID del item |
| budget_db_id | Integer | FK a budgets.id |
| description | String | Descripción del servicio/producto |
| amount | Float | Monto del item |
| order_index | Integer | Orden de visualización |

## 🚀 Próximas Características

- [ ] Generación de PDF de presupuestos
- [ ] Envío de presupuestos por email
- [ ] Dashboard con estadísticas
- [ ] Autenticación de usuarios
- [ ] Exportación a Excel
- [ ] Plantillas de presupuesto
- [ ] Historial de cambios
- [ ] Notificaciones

## 📝 Licencia

Este proyecto es propiedad privada.

## 👨‍💻 Desarrollo

- Frontend: React 18 + Vite + Tailwind CSS
- Backend: FastAPI + SQLAlchemy + PostgreSQL
- Diseño: Lucide Icons + Tailwind CSS

---

© 2025 BudgetPro. Todos los derechos reservados.

