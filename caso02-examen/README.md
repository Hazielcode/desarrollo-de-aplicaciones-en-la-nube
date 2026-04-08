# Caso 02: Sistema de Consulta ONPE (Cyberpunk Edition) 🤖⚡

Este proyecto es una aplicación web futurista diseñada para consultar si una persona es miembro de mesa, su ubicación y su local de votación, simulando una conexión con el portal de la ONPE.

## Características 🌟
- **Interfaz Cyberpunk**: Diseño estético con neones, fuentes Orbitron y efectos de escaneo.
- **Persistencia en Excel**: Cada consulta se registra automáticamente en el archivo `consultas_onpe.xlsx`.
- **Docker Ready**: Tres configuraciones diferentes de Docker para elegir según la necesidad.

## Estructura del Proyecto 📂
- `app.py`: Servidor Flask y lógica de negocio.
- `requirements.txt`: Dependencias (Flask, pandas, gspread, etc.).
- `onpe_to_sheets.py`: Robot de sincronización con la nube.
- `credentials.json`: Credenciales de Google Cloud (necesario para la nube).
- `templates/index.html`: Interfaz de usuario Cyberpunk con botón de sincronización.

## Requisitos de Ejecución 🚀

### 1. Configuración de Google Sheets (CLOUD)
Para que la sincronización funcione:
1.  Asegúrate de que el archivo `credentials.json` esté en la raíz de esta carpeta.
2.  Comparte tu hoja de cálculo con el correo del bot que figura en el JSON como **Editor**.
3.  Ingresa los DNIs en la **Columna A** de tu Google Sheet.

### 2. Ejecución Local (Sin Docker)
```bash
# Instalar dependencias
pip install -r requirements.txt

# Correr la app
python app.py
```
> Visita `http://localhost:5000`

### 3. Ejecución con Docker (Recomendado)
```bash
# Build Multi-Stage (Elite)
docker build -f Dockerfile.multistage -t onpe-app:v1.2-ninja .

# Run
docker run -p 5001:5000 --name onpe-container onpe-app:v1.2-ninja
```

## Funcionalidades del Escaneo 🤖
1.  **Individual**: Ingresa un DNI en la web y guarda el registro en un Excel local.
2.  **Cloud Batch**: Haz clic en **"SINCRONIZAR NODO GOOGLE-SHEETS"** para procesar todos los DNIs de tu hoja de cálculo en la nube automáticamente.

## Cómo recuperar el Excel generado en Docker 📊
Si corres la app en Docker y quieres ver el archivo Excel resultante en tu computadora, usa este comando:
```bash
docker cp onpe-container:/app/consultas_onpe.xlsx ./consultas_onpe.xlsx
```

---
*Desarrollado para el Examen Final - Caso 02*
