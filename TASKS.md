# TASKS - QuoteFlow CI/CD + Multitenancy

## 🔴 Pendiente
- [ ] Testear nuevo Settings en el sistema deployed (testing)
- [ ] Probar PDF con branding fields cargados
- [ ] Merge a main cuando todo esté OK
- [ ] Validar manualmente CMS admin (CRUD + membresía) en entorno local
- [ ] Migrar users a UUID por fases (dual-key + backfill + cutover)
- [ ] Validar política final: superadmin sin membresía y operadores con membresía
- [ ] Ejecutar y validar SQL de Fase 1 UUID en entorno de testing
- [ ] Implementar Fase 2 UUID (dual-write en app principal)
- [b] 🐛 Resolver error DB en login CMS: columna users.role inexistente
- [b] 🐛 Resolver 500 en /api/auth/google tenant (respuesta vacía)
- [ ] Deployar CMS en producción en cms-flow.octopustrack.shop

## 🟡 En progreso
- [/] Validar flujo local: backend :8000 + npm run dev:tenant / npm run dev:cms
- [/] Validar login CMS por Google y regla de membresía solo para operadores
- [/] Confirmar frontend único (sin carpeta admin-cms) con paleta del tenant
- [/] 🐛 Resolver 500 en /api/auth/google tenant (respuesta vacía)
- [/] Deployar CMS en producción en cms-flow.octopustrack.shop
- [/] Revisar ausencia de deploy en testing/producción y re-disparar pipeline
- [/] Congelar rama estable del cliente en branch marinkovic

## 🟢 Hecho
- [x] Migrar dominio tenant a login-flow.octopustrack.shop en infra + frontend ✅ 2026-04-29
- [x] Diagnosticar auto-redeploy en Portainer y separar webhooks main/testing ✅ 2026-04-29
- [x] Centrar visualmente la fila de íconos de acciones en cards mobile del CMS ✅ 2026-04-29
- [x] Ajustar acciones CMS a una sola fila con botones solo íconos ✅ 2026-04-29
- [x] Rediseñar CMS mobile-first (bonito + práctico) ✅ 2026-04-29
- [x] Preparar infraestructura de deploy CMS (imagen frontend-cms + Traefik + CORS multi-dominio) ✅ 2026-04-29
- [x] 🐛 Corregir login principal para leer email/password aunque navegador autocompleta ✅ 2026-04-29
- [x] Implementar onboarding sin contraseña desde CMS (seteo al ingresar con Google) ✅ 2026-04-29
- [x] 🐛 Hacer robusto delete de usuarios en CMS ✅ 2026-04-29
- [x] Agregar eliminación de usuarios desde CMS (backend + frontend) ✅ 2026-04-29
- [x] 🐛 Permitir salir de modo "Editar usuario" y volver a "Crear usuario" ✅ 2026-04-29
- [x] Unificar branding CMS con sistema principal (logo + naming OctopusFlow) ✅ 2026-04-29
- [x] Cambiar login CMS a Google OAuth (superadmin único) ✅ 2026-04-29
- [x] Eliminar carpeta admin-cms y consolidar CMS en frontend principal ✅ 2026-04-29
- [x] Agregar modo frontend CMS por VITE_APP_MODE en puerto 5174 ✅ 2026-04-29
- [x] Inicializar Alembic en backend y crear migración base de membresía/rol ✅ 2026-04-29
- [x] Verificar/instalar Alembic en entorno local backend ✅ 2026-04-29
- [x] Unificar CMS para usar backend principal (:8000) vía /api/admin ✅ 2026-04-29
- [x] Exponer scripts raíz npm run dev:tenant y npm run dev:cms ✅ 2026-04-29
- [x] Diseñar Fase 1 UUID sin downtime (script SQL dual-key + backfill) ✅ 2026-04-29
- [x] Implementar gate de superadmin en CMS (auth + protección endpoints) ✅ 2026-04-29
- [x] Crear CMS admin separado (backend + frontend + docker + README) ✅ 2026-04-29
- [x] Cambiar logo del login a SVG para evitar pixelado ✅ 2026-04-28
- [x] Integrar logo-header también en pantalla de login ✅ 2026-04-28
- [x] Integrar logo-header nuevo en UI del sistema ✅ 2026-04-28
- [x] Ajustar favicon para mayor tamaño visual en pestaña del navegador ✅ 2026-04-28
- [x] Revisar y reestructurar favicons según buenas prácticas SEO ✅ 2026-04-28
- [x] Corregir metadatos OG/Twitter para WhatsApp (texto e imagen) ✅ 2026-04-28
- [x] Actualizar metadata (title + og-image) y reordenar assets en frontend/public/images ✅ 2026-04-28
- [x] Igualar ancho de columnas Estado, Total y Acciones en tabla desktop ✅ 2026-04-28
- [x] Reordenar columnas de tabla: ID, Fecha, Cliente, Estado, Total, Acciones ✅ 2026-04-28
- [x] Cambiar botón "Nuevo" para mostrar solo "+" ✅ 2026-04-28
- [x] Refactor layout a full-width y alta densidad en pantalla principal ✅ 2026-04-28
- [x] Reducir aún más el título "Iniciar sesión" ✅ 2026-04-28
- [x] Reducir más el tamaño del título "Iniciar sesión" ✅ 2026-04-28
- [x] Implementar botón Google custom (G azul) manteniendo login funcional ✅ 2026-04-28
- [x] Ajustar tamaño del título de login ✅ 2026-04-28
- [x] Ajustar login: mismo diseño de referencia, cambiando solo paleta de colores ✅ 2026-04-28
- [x] Replicar diseño de login de /Documentos/18-OctopusTrack ✅ 2026-04-28
- [x] Corregir login: eliminar cualquier fondo residual visible ✅ 2026-04-28
- [x] Revisar fondo del login para que sea transparente y se vea solo el tentáculo ✅ 2026-04-28
- [x] Crear branch testing desde main ✅ 2026-04-27
- [x] Crear .github/workflows/backend.yml ✅ 2026-04-27
- [x] Crear .github/workflows/frontend.yml ✅ 2026-04-27
- [x] Crear .github/workflows/release.yml ✅ 2026-04-27
- [x] Actualizar backend/Dockerfile con labels GHCR ✅ 2026-04-27
- [x] Actualizar frontend/Dockerfile con labels GHCR ✅ 2026-04-27
- [x] Crear .env.example ✅ 2026-04-27
- [x] docker-compose.yml con GHCR + secreto budgetpro_backend_env_v2 ✅ 2026-04-27
- [x] Crear docker-compose.portainer.yml (testing tag + mismo secreto) ✅ 2026-04-27
- [x] Push branch testing a GitHub ✅ 2026-04-27
- [x] Configurar GitHub var PORTAINER_WEBHOOK_URL ✅ 2026-04-27
- [x] Multitenancy: campos branding User model ✅ 2026-04-27
- [x] Multitenancy: GET/PATCH /api/company/settings ✅ 2026-04-27
- [x] Multitenancy: auto-migrate schema columns ✅ 2026-04-27
- [x] Multitenancy: PDF generator con todos los fields ✅ 2026-04-27
- [x] Multitenancy: CORS dinamico via CORS_ORIGINS env ✅ 2026-04-27
- [x] Frontend: SettingsModal tabbed (Logo + Empresa) ✅ 2026-04-27
- [x] Configurar secreto quoteflow_backend_env en Portainer para nuevo stack ✅ 2026-04-27
- [x] CI/CD rebuild con cambios multitenancy (corriendo en GitHub Actions) ✅ 2026-04-27

## 🚧 Bloqueado
