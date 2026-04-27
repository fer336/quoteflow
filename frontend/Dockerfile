# ==============================================================================
# QuoteFlow Frontend - Dockerfile
# Multi-stage build: Node.js (build) → Nginx (serve)
# ==============================================================================

# Etapa 1: Construcción
FROM node:18-alpine as build

# Labels para GHCR
LABEL org.opencontainers.image.source="https://github.com/fer336/quoteflow"
LABEL org.opencontainers.image.description="QuoteFlow Frontend"
LABEL org.opencontainers.image.licenses="MIT"

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Argumentos de construcción (Secrets públicos necesarios para el build)
ARG VITE_API_URL
ARG VITE_GOOGLE_CLIENT_ID

# Establecer variables de entorno para el build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

RUN npm run build

# Etapa 2: Servidor Nginx
FROM nginx:alpine

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos construidos
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]