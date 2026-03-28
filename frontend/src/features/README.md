# Frontend features

Las verticales migradas van a vivir acá (`budgets`, `clients`, etc.).

## Regla

- Una feature puede depender de `shared/*`.
- Una feature NO puede importar otra feature de forma transversal sin pasar por `app/*` o por una API explícita.
