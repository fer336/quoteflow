# QuoteFlow

QuoteFlow es una aplicación para gestionar presupuestos comerciales, clientes y generación de PDFs desde una interfaz web moderna. El proyecto combina **FastAPI + SQLAlchemy + PostgreSQL** en backend y **React + Vite + Tailwind CSS** en frontend, con autenticación por email/contraseña y Google OAuth.

## Stack principal

- **Frontend:** React 18, Vite, Tailwind CSS, Axios, `@react-oauth/google`
- **Backend:** FastAPI, SQLAlchemy, Pydantic, python-jose, Passlib
- **Base de datos:** PostgreSQL
- **Integraciones:** Google OAuth (popup JS + validación server-side), MinIO para logos/activos
- **Salida de documentos:** ReportLab para PDFs

## Capturas de interfaz

### Login

![Login de QuoteFlow](docs/images/login.png)

### Dashboard

![Dashboard de QuoteFlow](docs/images/dashboard.png)

### Modal de presupuesto

![Modal de presupuesto en QuoteFlow](docs/images/budget-modal.png)

## Requisitos previos

### Recomendados

- **Python 3.11** (alineado con `backend/Dockerfile`)
- **Node.js 18+** (alineado con `frontend/Dockerfile`)
- **npm 9+**
- **PostgreSQL 14+** si vas a correr una base local

### Opcionales según tu setup

- **PostgreSQL local**: necesario si no vas a usar una base remota existente
- **MinIO**: solo si necesitás probar subida/lectura de logos de empresa localmente

## Instalación y ejecución local

### 1) Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Si además vas a levantar **PostgreSQL local**, creá la base y el usuario antes de arrancar la API:

```sql
CREATE DATABASE budgetpro_db;
CREATE USER budgetpro_user WITH PASSWORD 'tu_password';
GRANT ALL PRIVILEGES ON DATABASE budgetpro_db TO budgetpro_user;
```

> Si ya tenés una base remota disponible, no hace falta PostgreSQL local: apuntá `DATABASE_URL` a esa instancia.

Creá `backend/.env` con valores mínimos como estos:

```env
DATABASE_URL=postgresql://budgetpro_user:tu_password@localhost:5432/budgetpro_db
GOOGLE_CLIENT_ID=tu_google_client_id.apps.googleusercontent.com
SECRET_KEY=generar_una_clave_larga_y_unica
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
DOMAIN=localhost
```

Luego levantá la API:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Endpoints útiles:

- API: `http://localhost:8000`
- Healthcheck: `http://localhost:8000/api/health`
- Swagger UI: `http://localhost:8000/docs`

### 2) Frontend

En otra terminal:

```bash
cd frontend
npm install
```

Creá `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000/api
VITE_GOOGLE_CLIENT_ID=tu_google_client_id.apps.googleusercontent.com
```

Levantá el frontend:

```bash
npm run dev
```

Acceso local:

- App web: `http://localhost:5173`

### 3) Verificación rápida

```bash
curl http://localhost:8000/api/health
```

Respuesta esperada:

```json
{"status":"healthy","database":"connected"}
```

## Variables de entorno mínimas

### Backend

| Variable | Obligatoria | Uso |
|---|---:|---|
| `DATABASE_URL` | Sí | Conexión SQLAlchemy a PostgreSQL |
| `GOOGLE_CLIENT_ID` | Sí si usás Google OAuth | Verifica el ID token recibido desde Google |
| `SECRET_KEY` | Sí recomendado | Firma de JWT internos del sistema |
| `API_HOST` | No | Host de bind para Uvicorn |
| `API_PORT` | No | Puerto de la API |
| `CORS_ORIGINS` | No/documentativa hoy | Lista esperada de orígenes permitidos |
| `DOMAIN` | No | Dominio de referencia para despliegue |

> **Importante:** hoy el backend permite `localhost/127.0.0.1` por regex y además tiene orígenes productivos hardcodeados en `backend/main.py`. O sea: `CORS_ORIGINS` está documentada, pero NO gobierna el comportamiento actual por sí sola.

### Frontend

| Variable | Obligatoria | Uso |
|---|---:|---|
| `VITE_API_URL` | Sí | Base URL del backend |
| `VITE_GOOGLE_CLIENT_ID` | Sí si usás Google OAuth | Client ID inyectado en `GoogleOAuthProvider` |

## Google OAuth

### Flujo real actual

El login con Google hoy funciona así:

1. El frontend monta `GoogleOAuthProvider` con `VITE_GOOGLE_CLIENT_ID`.
2. En la pantalla de login se renderiza el componente `GoogleLogin` de `@react-oauth/google`.
3. Google abre el **popup JS** y devuelve un **ID token** (`credentialResponse.credential`).
4. El frontend hace `POST /api/auth/google` enviando `{ "token": "<google-id-token>" }`.
5. El backend valida el token contra `GOOGLE_CLIENT_ID`, busca el usuario por email y devuelve un **JWT interno** de QuoteFlow.

### Configuración en Google Cloud Console

Para el flujo actual **NO necesitás redirect URI**. Lo que sí necesitás es configurar correctamente **Authorized JavaScript origins** para cada origen desde el que se abre el popup.

Ejemplos típicos:

- `http://localhost:5173`
- `http://localhost:3000`
- `https://sistema.qeva.xyz`

### ¿Cuándo haría falta un Redirect URI?

Solo si en el futuro cambian el UX actual y migran a un flujo **redirect-based** en vez del popup JavaScript actual. Mientras sigan usando `GoogleLogin` en frontend y canje de token vía `POST /api/auth/google`, el punto crítico son los **Authorized JavaScript origins**.

## Usuario inicial / demo

El backend **no autocrea usuarios autorizados**. Para entrar, primero tenés que registrar el email en la tabla `users`.

### Opción recomendada: script existente

Desde `backend/` con el virtualenv activo:

```bash
# Listar usuarios
python manage_users.py list

# Crear usuario habilitado para Google login
python manage_users.py add demo@quoteflow.local "Usuario Demo"

# Crear usuario con contraseña para login tradicional
python manage_users.py add demo@quoteflow.local "Usuario Demo" "Cambiar123!"

# O asignar contraseña a un usuario ya existente
python manage_users.py set-password demo@quoteflow.local "Cambiar123!"
```

### Cómo iniciar sesión después

- **Google OAuth:** el email de la cuenta Google debe coincidir con un usuario previamente dado de alta.
- **Email/contraseña:** el usuario debe tener `hashed_password` cargado mediante `manage_users.py`.

### Alternativa manual segura

Si no querés usar el script, la alternativa segura es insertar el usuario directamente en PostgreSQL respetando al menos:

- `email` único
- `is_active = true`
- `hashed_password` solo si realmente vas a usar login por contraseña

No se recomienda editar registros “a mano” sin entender esos campos, porque Google login depende de encontrar el usuario por email y el login tradicional depende del hash bcrypt.

## PostgreSQL y migraciones

### Estado actual

- El backend ejecuta `Base.metadata.create_all(bind=engine)` al arrancar.
- Eso significa que **las tablas se crean automáticamente si no existen**.
- Hoy **no hay baseline de Alembic versionado en el repo**, aunque la dependencia sí está instalada.

### Recomendación próxima

Conviene crear una **baseline Alembic** y pasar a migraciones explícitas antes de seguir evolucionando el esquema.

### Runbook corto sugerido (sin implementarlo ahora)

1. Congelar el esquema actual como baseline.
2. Inicializar Alembic y apuntarlo a `DATABASE_URL`.
3. Generar una revisión inicial equivalente al esquema vivo.
4. Validar esa baseline en una base vacía.
5. Reemplazar gradualmente `create_all` por migraciones controladas.

Hasta que eso exista, cualquier cambio de esquema debe hacerse con MUCHO cuidado porque el arranque automático no reemplaza un historial de migraciones serio.

## Troubleshooting

### Puerto ocupado

- Backend: verificá si algo ya usa `8000`
- Frontend: verificá si Vite cambió de `5173` a otro puerto
- Si cambiás puertos, actualizá `VITE_API_URL` y, si corresponde, los orígenes de Google

### Error de CORS en local

- El backend actual acepta `localhost` y `127.0.0.1` por regex
- Si abrís el frontend desde otro hostname o puerto no esperado, vas a pegar contra CORS
- Reiniciá el backend después de cambios de entorno

### Error de Google: origen no autorizado

- Revisá los **Authorized JavaScript origins** del OAuth Client en Google Cloud Console
- El origen debe coincidir EXACTO con el que usás en el navegador (`http`/`https`, host y puerto)
- Asegurate de usar el mismo client ID en `GOOGLE_CLIENT_ID` y `VITE_GOOGLE_CLIENT_ID`

### Warning de collation en PostgreSQL

- Si aparece un warning de versión de collation/locale, normalmente viene del cluster de PostgreSQL o del sistema operativo, no de QuoteFlow
- No lo ignores si hubo upgrade del SO o restore entre entornos distintos
- Validalo con el equipo de infraestructura y planificá refresh de collation/reindex si corresponde



- nombre de base o usuario PostgreSQL heredado
- buckets/objetos de logos
- nombres de imágenes Docker
- referencias internas `budgetpro_*`


## Recomendaciones operativas

- Documentar un `.env.example` para backend y frontend
- Externalizar CORS real a configuración en vez de hardcodearlo en `backend/main.py`
- Crear baseline Alembic antes de tocar el esquema de datos otra vez
- Definir un flujo estándar de demo user para onboarding interno
