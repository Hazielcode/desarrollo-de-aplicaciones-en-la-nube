# Versión 1: Dockerfile Slim (Estándar)
FROM python:3.11-slim

WORKDIR /app

# Copiar dependencias e instalar
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto de la aplicación
COPY . .

# Exponer puerto de Flask
EXPOSE 5000

# Comando de ejecución
CMD ["python", "app.py"]
