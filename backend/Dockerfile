# Usar imagen Debian Bullseye (Estable y compatible)
FROM python:3.11-slim-bullseye

# Establecer directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema
# libpq-dev: para psycopg2
# gcc: para compilar
# python3-dev: cabeceras de python
# libffi-dev: para criptografía (passlib/bcrypt)
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    python3-dev \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements e instalar dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código del backend
COPY . .

# Crear directorio para archivos estáticos (logos)
RUN mkdir -p static

# Exponer el puerto
EXPOSE 8000

# Comando para iniciar la aplicación
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
