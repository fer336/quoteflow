# TASKS - QuoteFlow CI/CD + Multitenancy

## 🔴 Pendiente
- [ ] Configurar GitHub Variables: FRONTEND_VITE_API_URL, FRONTEND_GOOGLE_CLIENT_ID
- [ ] Configurar DNS: presupuestos.octopustrack.shop → apuntar al servidor
- [ ] Crear secret en Portainer: quoteflow_backend_env (o quoteflow_backend_env_v2)
- [ ] Pull primera imagen de testing en Portainer
- [ ] Testear deploy completo en testing
- [ ] Multitenancy: agregar campos de branding a User (company_name, address, phone, etc.)
- [ ] Multitenancy: endpoint PATCH /api/company/settings
- [ ] Multitenancy: frontend - página de configuración de empresa
- [ ] Multitenancy: actualizar PDF generator con nuevos campos
- [ ] Multitenancy: actualizar CORS para nuevo dominio

## 🟡 En progreso
- [ ] CI/CD: commitear y pushear cambios a branch testing

## 🟢 Hecho
- [x] Crear branch testing desde main ✅ 2026-04-27
- [x] Crear .github/workflows/backend.yml ✅ 2026-04-27
- [x] Crear .github/workflows/frontend.yml ✅ 2026-04-27
- [x] Crear .github/workflows/release.yml ✅ 2026-04-27
- [x] Actualizar backend/Dockerfile con labels GHCR ✅ 2026-04-27
- [x] Actualizar frontend/Dockerfile con labels GHCR ✅ 2026-04-27
- [x] Crear .env.example con todas las vars documentadas ✅ 2026-04-27
- [x] Actualizar docker-compose.yml con nuevo dominio y GHCR ✅ 2026-04-27
- [x] Crear docker-compose.portainer.yml (stack file para Portainer) ✅ 2026-04-27

## 🚧 Bloqueado