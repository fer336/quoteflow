# Frontend app layer

Esta carpeta va a alojar bootstrap, providers globales y composition root del frontend.

## Regla

- `app/*` puede importar `features/*` y `shared/*`.
- `app/*` NO debe contener lógica de negocio de una vertical.
