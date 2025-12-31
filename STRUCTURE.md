# 📁 Estructura del Proyecto BudgetPro

```
00-Sistema presupuestos/
│
├── 📄 README.md                    # Documentación principal
├── 📄 QUICKSTART.md               # Guía de inicio rápido
├── 📄 SETUP.md                    # Guía de configuración detallada
├── 📄 API_DOCUMENTATION.md        # Documentación de la API REST
├── 📄 STRUCTURE.md                # Este archivo (estructura del proyecto)
├── 📄 docker-compose.yml          # Orquestación de servicios Docker
├── 📄 .gitignore                  # Archivos ignorados por Git
│
├── 🗄️  backend/                    # Backend FastAPI + PostgreSQL
│   │
│   ├── 📄 main.py                 # Aplicación principal FastAPI
│   │   ├── Configuración de CORS
│   │   ├── Inclusión de routers
│   │   └── Endpoints de health check
│   │
│   ├── 📄 database.py             # Configuración de SQLAlchemy
│   │   ├── Conexión a PostgreSQL
│   │   ├── SessionLocal (manejo de sesiones)
│   │   └── Base (declarative_base)
│   │
│   ├── 📄 models.py               # Modelos de base de datos (ORM)
│   │   ├── Budget (tabla budgets)
│   │   │   ├── id, budget_id, client
│   │   │   ├── date, validity, status
│   │   │   ├── total, is_manual_total
│   │   │   └── Relación con BudgetItem
│   │   └── BudgetItem (tabla budget_items)
│   │       ├── id, budget_db_id (FK)
│   │       ├── description, amount
│   │       └── order_index
│   │
│   ├── 📄 schemas.py              # Schemas Pydantic (validación)
│   │   ├── BudgetItemBase, Create, Response
│   │   ├── BudgetBase, Create, Update
│   │   └── BudgetResponse, ListResponse
│   │
│   ├── 📂 routers/                # Endpoints de la API
│   │   ├── 📄 __init__.py
│   │   │
│   │   ├── 📄 budgets.py          # CRUD de presupuestos
│   │   │   ├── POST   /budgets/           - Crear presupuesto
│   │   │   ├── GET    /budgets/           - Listar presupuestos
│   │   │   ├── GET    /budgets/{id}       - Obtener presupuesto
│   │   │   ├── PUT    /budgets/{id}       - Actualizar presupuesto
│   │   │   ├── DELETE /budgets/{id}       - Eliminar presupuesto
│   │   │   └── GET    /budgets/{id}/pdf   - Generar PDF
│   │   │
│   │   └── 📄 budget_items.py     # CRUD de items
│   │       ├── GET    /{budget_id}/items        - Listar items
│   │       ├── POST   /{budget_id}/items        - Agregar item
│   │       └── DELETE /items/{item_id}          - Eliminar item
│   │
│   ├── 📄 requirements.txt        # Dependencias Python
│   │   ├── fastapi==0.109.0
│   │   ├── uvicorn[standard]==0.27.0
│   │   ├── sqlalchemy==2.0.25
│   │   ├── psycopg2-binary==2.9.9
│   │   ├── python-dotenv==1.0.0
│   │   └── pydantic==2.5.3
│   │
│   ├── 📄 Dockerfile              # Imagen Docker del backend
│   └── 📄 .env.example            # Ejemplo de variables de entorno
│       └── DATABASE_URL, API_HOST, API_PORT, CORS_ORIGINS
│
├── 🎨 frontend/                   # Frontend React + Vite
│   │
│   ├── 📄 package.json            # Dependencias Node.js
│   │   ├── react ^18.2.0
│   │   ├── axios ^1.6.5
│   │   ├── lucide-react ^0.309.0
│   │   └── tailwindcss ^3.4.1
│   │
│   ├── 📄 vite.config.js          # Configuración Vite
│   │   ├── Plugin de React
│   │   └── Proxy API (/api -> localhost:8000)
│   │
│   ├── 📄 tailwind.config.js      # Configuración Tailwind CSS
│   │   └── Paleta de colores verde primario
│   │
│   ├── 📄 postcss.config.js       # Configuración PostCSS
│   ├── 📄 index.html              # HTML principal
│   ├── 📄 Dockerfile              # Imagen Docker del frontend
│   ├── 📄 .env.example            # Variables de entorno ejemplo
│   │
│   └── 📂 src/                    # Código fuente React
│       │
│       ├── 📄 main.jsx            # Punto de entrada React
│       │   └── Renderiza <App />
│       │
│       ├── 📄 App.jsx             # Componente principal
│       │   ├── Estado de presupuestos
│       │   ├── Carga de datos desde API
│       │   ├── Búsqueda y filtrado
│       │   ├── Tabla de presupuestos
│       │   └── Modal de creación
│       │
│       ├── 📄 index.css           # Estilos globales + Tailwind
│       │   ├── @tailwind directives
│       │   └── Animaciones personalizadas
│       │
│       ├── 📂 components/         # Componentes React
│       │   │
│       │   ├── 📄 BudgetModal.jsx # Modal de creación/edición
│       │   │   ├── Formulario de presupuesto
│       │   │   ├── Tabla dinámica de items
│       │   │   ├── Toggle modo manual/automático
│       │   │   └── Cálculo de total
│       │   │
│       │   └── 📄 StatusBadge.jsx # Badge de estado (Pendiente/Aceptado/Rechazado)
│       │       ├── Colores según estado
│       │       └── Iconos de Lucide React
│       │
│       └── 📂 services/           # Servicios API
│           │
│           └── 📄 api.js          # Cliente Axios + funciones API
│               ├── budgetService
│               │   ├── getAll()
│               │   ├── getById(id)
│               │   ├── create(data)
│               │   ├── update(id, data)
│               │   ├── delete(id)
│               │   └── generatePDF(id)
│               └── budgetItemService
│                   ├── getItems(budgetId)
│                   ├── addItem(budgetId, data)
│                   └── deleteItem(itemId)
│
└── 🗃️  database/                   # Base de datos PostgreSQL
    └── budgetpro_db
        ├── 📊 budgets             # Tabla de presupuestos
        │   └── Campos: id, budget_id, client, date, validity,
        │       status, total, is_manual_total, timestamps
        │
        └── 📊 budget_items        # Tabla de items
            └── Campos: id, budget_db_id (FK), description,
                amount, order_index, created_at
```

---

## 🔄 Flujo de Datos

```
┌─────────────┐
│   Usuario   │
└──────┬──────┘
       │
       │ Interacción (clicks, formularios)
       ▼
┌─────────────────────────────────────────────────┐
│             FRONTEND (React + Vite)             │
│                                                 │
│  ┌──────────────┐  ┌────────────────────────┐  │
│  │   App.jsx    │  │  components/           │  │
│  │              │  │  - BudgetModal.jsx     │  │
│  │  - Estado    │◄─┤  - StatusBadge.jsx     │  │
│  │  - Tabla     │  │                        │  │
│  │  - Búsqueda  │  └────────────────────────┘  │
│  └──────┬───────┘                               │
│         │                                       │
│         │ HTTP Requests (Axios)                 │
│         ▼                                       │
│  ┌──────────────┐                               │
│  │ services/    │                               │
│  │ api.js       │                               │
│  └──────┬───────┘                               │
└─────────┼───────────────────────────────────────┘
          │
          │ API REST (JSON)
          ▼
┌─────────────────────────────────────────────────┐
│           BACKEND (FastAPI + SQLAlchemy)        │
│                                                 │
│  ┌──────────────┐                               │
│  │   main.py    │  (Aplicación FastAPI)         │
│  └──────┬───────┘                               │
│         │                                       │
│         ▼                                       │
│  ┌──────────────┐                               │
│  │  routers/    │                               │
│  │  - budgets.py         ◄───┐                  │
│  │  - budget_items.py    │   │                  │
│  └──────┬───────┘        │   │                  │
│         │                │   │                  │
│         │ ORM Queries    │   │ Validación       │
│         ▼                │   │                  │
│  ┌──────────────┐        │   │                  │
│  │  models.py   │        │   │                  │
│  │  (SQLAlchemy)├────────┘   │                  │
│  └──────┬───────┘            │                  │
│         │                    │                  │
│         │                    │                  │
│  ┌──────────────┐    ┌───────┴────────┐         │
│  │ database.py  │    │  schemas.py    │         │
│  │ (Config DB)  │    │  (Pydantic)    │         │
│  └──────┬───────┘    └────────────────┘         │
└─────────┼──────────────────────────────────────┘
          │
          │ SQL Queries
          ▼
┌─────────────────────────────────────────────────┐
│         DATABASE (PostgreSQL)                   │
│                                                 │
│  ┌──────────────┐         ┌──────────────┐     │
│  │   budgets    │◄───┐    │ budget_items │     │
│  │              │    │    │              │     │
│  │  PK: id      │    └────┤  FK: budget  │     │
│  │              │         │      _db_id  │     │
│  └──────────────┘         └──────────────┘     │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🎯 Archivos Clave por Funcionalidad

### 🆕 Crear un Presupuesto

1. **Frontend:** `BudgetModal.jsx` - Formulario
2. **Service:** `api.js` → `budgetService.create()`
3. **Backend:** `routers/budgets.py` → `create_budget()`
4. **Validation:** `schemas.py` → `BudgetCreate`
5. **Database:** `models.py` → `Budget`, `BudgetItem`

### 📋 Listar Presupuestos

1. **Frontend:** `App.jsx` → `loadBudgets()`
2. **Service:** `api.js` → `budgetService.getAll()`
3. **Backend:** `routers/budgets.py` → `list_budgets()`
4. **Database:** Query con filtros

### ✏️ Actualizar Estado

1. **Frontend:** Botones de acción en tabla
2. **Service:** `api.js` → `budgetService.update()`
3. **Backend:** `routers/budgets.py` → `update_budget()`
4. **Validation:** `schemas.py` → `BudgetUpdate`

### 🗑️ Eliminar Presupuesto

1. **Frontend:** Botón eliminar + confirmación
2. **Service:** `api.js` → `budgetService.delete()`
3. **Backend:** `routers/budgets.py` → `delete_budget()`
4. **Database:** Cascade delete de items

---

## 🚀 Tecnologías Utilizadas

### Backend
- **FastAPI** - Framework web moderno de Python
- **SQLAlchemy** - ORM para manejo de base de datos
- **Pydantic** - Validación de datos
- **PostgreSQL** - Base de datos relacional
- **Uvicorn** - Servidor ASGI

### Frontend
- **React 18** - Biblioteca de UI
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de estilos utility-first
- **Axios** - Cliente HTTP
- **Lucide React** - Iconos modernos

### DevOps
- **Docker** - Contenedorización
- **Docker Compose** - Orquestación multi-contenedor

---

## 📊 Convenciones del Código

### Backend (Python)
- **snake_case** para funciones y variables
- **PascalCase** para clases
- Type hints en todas las funciones
- Docstrings para endpoints importantes

### Frontend (JavaScript/React)
- **camelCase** para funciones y variables
- **PascalCase** para componentes
- Hooks de React (useState, useEffect, useMemo)
- Componentes funcionales

### Base de Datos
- **snake_case** para tablas y columnas
- Timestamps automáticos (created_at, updated_at)
- Relaciones con CASCADE DELETE

---

**Estructura documentada para BudgetPro v1.0.0**

© 2025 BudgetPro. Sistema de Gestión de Presupuestos.

