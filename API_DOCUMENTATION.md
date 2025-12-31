# 📚 Documentación de la API - BudgetPro

## Base URL

```
http://localhost:8000/api
```

En producción:
```
https://finanzas.qeva.xyz/api
```

## 🔍 Endpoints Disponibles

### 🏥 Health Check

#### GET `/health`

Verifica el estado del servidor y la conexión a la base de datos.

**Response:**
```json
{
  "status": "healthy",
  "database": "connected"
}
```

---

## 📋 Presupuestos (Budgets)

### 1. Listar Todos los Presupuestos

#### GET `/budgets/`

Obtiene una lista de todos los presupuestos con opciones de filtrado.

**Query Parameters:**
- `skip` (int, opcional): Número de registros a saltar (paginación)
- `limit` (int, opcional): Máximo de registros a retornar (default: 100)
- `search` (string, opcional): Buscar por nombre de cliente o ID
- `status` (string, opcional): Filtrar por estado (PENDIENTE, ACEPTADO, RECHAZADO)

**Ejemplo:**
```bash
curl "http://localhost:8000/api/budgets/?search=Alfa&status=PENDIENTE"
```

**Response:**
```json
[
  {
    "id": 1,
    "budget_id": "PR-001",
    "client": "Constructora Alfa",
    "date": "2025-12-31T10:30:00",
    "status": "Pendiente",
    "total": 1250.00
  },
  {
    "id": 2,
    "budget_id": "PR-002",
    "client": "María García",
    "date": "2025-12-30T14:20:00",
    "status": "Aceptado",
    "total": 450.50
  }
]
```

### 2. Obtener Presupuesto Específico

#### GET `/budgets/{budget_id}`

Obtiene los detalles completos de un presupuesto, incluyendo todos sus items.

**Path Parameters:**
- `budget_id` (int): ID interno del presupuesto

**Ejemplo:**
```bash
curl http://localhost:8000/api/budgets/1
```

**Response:**
```json
{
  "id": 1,
  "budget_id": "PR-001",
  "client": "Constructora Alfa",
  "date": "2025-12-31T10:30:00",
  "validity": "15 días",
  "status": "Pendiente",
  "total": 1250.00,
  "is_manual_total": 0,
  "created_at": "2025-12-31T10:30:00",
  "updated_at": "2025-12-31T10:30:00",
  "items": [
    {
      "id": 1,
      "budget_db_id": 1,
      "description": "Consultoría web inicial",
      "amount": 500.00,
      "order_index": 0,
      "created_at": "2025-12-31T10:30:00"
    },
    {
      "id": 2,
      "budget_db_id": 1,
      "description": "Desarrollo frontend React",
      "amount": 750.00,
      "order_index": 1,
      "created_at": "2025-12-31T10:30:00"
    }
  ]
}
```

### 3. Crear Nuevo Presupuesto

#### POST `/budgets/`

Crea un nuevo presupuesto con sus items.

**Request Body:**
```json
{
  "client": "Constructora Alfa",
  "date": "2025-12-31T10:30:00",
  "validity": "15 días",
  "is_manual_total": 0,
  "total": null,
  "items": [
    {
      "description": "Consultoría web inicial",
      "amount": 500.00,
      "order_index": 0
    },
    {
      "description": "Desarrollo frontend React",
      "amount": 750.00,
      "order_index": 1
    }
  ]
}
```

**Notas:**
- Si `is_manual_total` es `0`, el total se calcula automáticamente sumando los items
- Si `is_manual_total` es `1`, se usa el valor de `total` proporcionado
- El `budget_id` (PR-XXX) se genera automáticamente
- Si no se proporciona `date`, se usa la fecha actual

**Ejemplo con cURL:**
```bash
curl -X POST http://localhost:8000/api/budgets/ \
  -H "Content-Type: application/json" \
  -d '{
    "client": "Constructora Alfa",
    "validity": "15 días",
    "is_manual_total": 0,
    "items": [
      {"description": "Consultoría web", "amount": 500.00, "order_index": 0},
      {"description": "Desarrollo", "amount": 750.00, "order_index": 1}
    ]
  }'
```

**Response:** (mismo formato que GET individual)

### 4. Actualizar Presupuesto

#### PUT `/budgets/{budget_id}`

Actualiza los campos de un presupuesto existente.

**Path Parameters:**
- `budget_id` (int): ID interno del presupuesto

**Request Body (todos los campos opcionales):**
```json
{
  "client": "Nuevo Nombre Cliente",
  "validity": "30 días",
  "status": "ACEPTADO",
  "total": 2000.00,
  "is_manual_total": 1
}
```

**Valores válidos para status:**
- `PENDIENTE`
- `ACEPTADO`
- `RECHAZADO`

**Ejemplo:**
```bash
curl -X PUT http://localhost:8000/api/budgets/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "ACEPTADO"}'
```

**Response:** Presupuesto actualizado completo

### 5. Eliminar Presupuesto

#### DELETE `/budgets/{budget_id}`

Elimina un presupuesto y todos sus items asociados.

**Path Parameters:**
- `budget_id` (int): ID interno del presupuesto

**Ejemplo:**
```bash
curl -X DELETE http://localhost:8000/api/budgets/1
```

**Response:**
```json
{
  "message": "Presupuesto eliminado exitosamente"
}
```

### 6. Generar PDF del Presupuesto

#### GET `/budgets/{budget_id}/pdf`

Genera y descarga un PDF del presupuesto (funcionalidad en desarrollo).

**Path Parameters:**
- `budget_id` (int): ID interno del presupuesto

**Response:** Archivo PDF (cuando esté implementado)

---

## 📝 Items de Presupuesto (Budget Items)

### 1. Obtener Items de un Presupuesto

#### GET `/budget-items/{budget_id}/items`

Obtiene todos los items de un presupuesto específico.

**Path Parameters:**
- `budget_id` (int): ID interno del presupuesto

**Ejemplo:**
```bash
curl http://localhost:8000/api/budget-items/1/items
```

**Response:**
```json
[
  {
    "id": 1,
    "budget_db_id": 1,
    "description": "Consultoría web inicial",
    "amount": 500.00,
    "order_index": 0,
    "created_at": "2025-12-31T10:30:00"
  },
  {
    "id": 2,
    "budget_db_id": 1,
    "description": "Desarrollo frontend React",
    "amount": 750.00,
    "order_index": 1,
    "created_at": "2025-12-31T10:30:00"
  }
]
```

### 2. Agregar Item a Presupuesto

#### POST `/budget-items/{budget_id}/items`

Agrega un nuevo item a un presupuesto existente.

**Path Parameters:**
- `budget_id` (int): ID interno del presupuesto

**Request Body:**
```json
{
  "description": "Hosting anual",
  "amount": 200.00,
  "order_index": 2
}
```

**Ejemplo:**
```bash
curl -X POST http://localhost:8000/api/budget-items/1/items \
  -H "Content-Type: application/json" \
  -d '{"description": "Hosting anual", "amount": 200.00}'
```

**Notas:**
- El total del presupuesto se recalcula automáticamente si `is_manual_total` es `0`
- El `order_index` se genera automáticamente si no se proporciona

**Response:** Item creado

### 3. Eliminar Item

#### DELETE `/budget-items/items/{item_id}`

Elimina un item específico de un presupuesto.

**Path Parameters:**
- `item_id` (int): ID del item

**Ejemplo:**
```bash
curl -X DELETE http://localhost:8000/api/budget-items/items/2
```

**Notas:**
- El total del presupuesto se recalcula automáticamente si `is_manual_total` es `0`

**Response:**
```json
{
  "message": "Item eliminado exitosamente"
}
```

---

## 🔐 Códigos de Estado HTTP

| Código | Significado | Descripción |
|--------|-------------|-------------|
| 200 | OK | Solicitud exitosa |
| 201 | Created | Recurso creado exitosamente |
| 400 | Bad Request | Error en los datos enviados |
| 404 | Not Found | Recurso no encontrado |
| 422 | Unprocessable Entity | Error de validación |
| 500 | Internal Server Error | Error del servidor |

---

## 📊 Modelos de Datos

### Budget (Presupuesto)

```typescript
{
  id: number;                    // ID interno (generado automáticamente)
  budget_id: string;             // ID visible (PR-001, PR-002, etc.)
  client: string;                // Nombre del cliente
  date: datetime;                // Fecha del presupuesto
  validity: string;              // Validez ("7 días", "15 días", "30 días")
  status: string;                // Estado (Pendiente, Aceptado, Rechazado)
  total: number;                 // Total del presupuesto
  is_manual_total: number;       // 0 = automático, 1 = manual
  created_at: datetime;          // Fecha de creación
  updated_at: datetime;          // Fecha de última actualización
  items: BudgetItem[];           // Lista de items
}
```

### BudgetItem (Item de Presupuesto)

```typescript
{
  id: number;                    // ID del item
  budget_db_id: number;          // ID del presupuesto padre
  description: string;           // Descripción del servicio/producto
  amount: number;                // Monto del item
  order_index: number;           // Orden de visualización
  created_at: datetime;          // Fecha de creación
}
```

---

## 🧪 Ejemplos de Uso con JavaScript/Axios

### Obtener todos los presupuestos

```javascript
import axios from 'axios';

const response = await axios.get('http://localhost:8000/api/budgets/');
console.log(response.data);
```

### Crear un presupuesto

```javascript
const newBudget = {
  client: "Tech Solutions Inc",
  validity: "15 días",
  is_manual_total: 0,
  items: [
    { description: "Desarrollo web", amount: 1500.00, order_index: 0 },
    { description: "SEO inicial", amount: 300.00, order_index: 1 }
  ]
};

const response = await axios.post('http://localhost:8000/api/budgets/', newBudget);
console.log('Presupuesto creado:', response.data);
```

### Actualizar estado de un presupuesto

```javascript
const response = await axios.put('http://localhost:8000/api/budgets/1', {
  status: 'ACEPTADO'
});
console.log('Presupuesto actualizado:', response.data);
```

### Eliminar un presupuesto

```javascript
await axios.delete('http://localhost:8000/api/budgets/1');
console.log('Presupuesto eliminado');
```

---

## 🔧 Herramientas de Prueba

### Swagger UI (Recomendado)

Visita `http://localhost:8000/docs` para una interfaz interactiva donde puedes probar todos los endpoints.

### Postman Collection

Puedes importar estos endpoints en Postman usando la URL de OpenAPI:
```
http://localhost:8000/openapi.json
```

---

**Documentación generada para BudgetPro API v1.0.0**

© 2025 BudgetPro. Sistema de Gestión de Presupuestos.

