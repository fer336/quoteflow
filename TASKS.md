# TASKS - QuoteFlow CI/CD + Multitenancy

## 🔴 Pendiente
- [ ] Testear nuevo Settings en el sistema deployed (testing)
- [ ] Probar PDF con branding fields cargados
- [ ] Merge a main cuando todo esté OK

## 🟡 En progreso

## 🟢 Hecho
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
