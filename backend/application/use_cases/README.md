# Application use cases

Esta carpeta va a contener la orquestación de casos de uso sin detalles de FastAPI, SQLAlchemy ni servicios externos.

## Verticales iniciales

- `budgets.py`: crear, listar, obtener, actualizar y eliminar presupuestos.
- `clients.py`: listar y administrar clientes.

## Regla

Los casos de uso pueden depender de `domain/*` y `application/ports/*`, pero NO de `routers`, `database`, `models`, `services` ni librerías web.
