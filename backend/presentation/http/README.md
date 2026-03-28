# HTTP presentation layer

Esta capa va a contener endpoints delgados: traducen HTTP ↔ casos de uso.

## Regla

- Puede importar `application/*`.
- NO debe contener queries ORM, reglas de negocio ni acceso directo a MinIO/PDF.
- Mientras dure la migración strangler, los routers legacy siguen siendo la fuente productiva.
