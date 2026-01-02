#!/bin/bash

# Script para configurar el archivo .env
# Uso: ./setup_env.sh

echo "🔧 Configuración de BudgetPro para Servidor Hetzner"
echo "=================================================="
echo ""

# Solicitar contraseña
echo "Ingresa la contraseña para el usuario PostgreSQL 'budgetpro_user':"
read -s DB_PASSWORD
echo ""

# Crear archivo .env
cat > .env << EOF
# Configuración PostgreSQL en Hetzner
DATABASE_URL=postgresql://budgetpro_user:${DB_PASSWORD}@91.99.162.240:5432/budgetpro_db

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000

# CORS Origins
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,https://sistema.qeva.xyz,http://sistema.qeva.xyz

# Production domain
DOMAIN=sistema.qeva.xyz
EOF

echo "✅ Archivo .env creado exitosamente"
echo ""
echo "📋 Configuración guardada:"
echo "   - Servidor PostgreSQL: 91.99.162.240:5432"
echo "   - Base de datos: budgetpro_db"
echo "   - Usuario: budgetpro_user"
echo "   - Dominio: sistema.qeva.xyz"
echo ""
echo "🚀 Para iniciar el backend, ejecuta:"
echo "   source venv/bin/activate"
echo "   uvicorn main:app --reload --host 0.0.0.0 --port 8000"

