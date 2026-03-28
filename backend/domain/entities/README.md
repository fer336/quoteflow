# Domain entities

Las entidades representan el lenguaje del negocio sin detalles de framework.

## Importante

- No importar FastAPI, SQLAlchemy, `database.py`, `models.py` ni `schemas.py`.
- Mantener entidades chicas y enfocadas en invariantes del dominio cuando llegue la migración real.
- Por ahora estos archivos son stubs para marcar el límite arquitectónico.
