#!/bin/bash

# Script para configurar el archivo .env del frontend
# Uso: ./setup_env.sh [dev|prod]

MODE=${1:-dev}

if [ "$MODE" = "prod" ]; then
    echo "🚀 Configurando frontend para PRODUCCIÓN"
    cat > .env << 'EOF'
# Production Environment
VITE_API_URL=https://sistema.qeva.xyz/api
EOF
    echo "✅ Frontend configurado para: https://sistema.qeva.xyz"
else
    echo "🔧 Configurando frontend para DESARROLLO"
    cat > .env << 'EOF'
# Development Environment
VITE_API_URL=http://localhost:8000/api
EOF
    echo "✅ Frontend configurado para: http://localhost:8000"
fi

echo ""
echo "📋 Para iniciar el frontend:"
echo "   npm install"
echo "   npm run dev"

