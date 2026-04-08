from flask import Flask, render_template, request, jsonify
import pandas as pd
import os
from datetime import datetime
from utils import simulate_onpe_query
from onpe_to_sheets import sync_with_sheets

app = Flask(__name__)

# Configuración del archivo Excel
EXCEL_FILE = 'consultas_onpe.xlsx'

def save_to_excel(data):
    """Guarda los datos de la consulta en un archivo Excel"""
    try:
        new_row = pd.DataFrame([data])
        
        if os.path.exists(EXCEL_FILE):
            df = pd.read_excel(EXCEL_FILE)
            df = pd.concat([df, new_row], ignore_index=True)
        else:
            df = new_row
            
        df.to_excel(EXCEL_FILE, index=False)
        return True
    except Exception as e:
        print(f"Error al guardar en Excel: {e}")
        return False

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/consultar', methods=['POST'])
def consultar():
    dni = request.form.get('dni')
    
    if not dni or len(dni) != 8 or not dni.isdigit():
        return jsonify({"error": "DNI inválido. Debe tener 8 dígitos numéricos."}), 400
    
    # Realizar la consulta (simulada)
    datos = simulate_onpe_query(dni)
    
    # Guardar en Excel
    save_to_excel(datos)
    
    return jsonify(datos)

@app.route('/sync_sheets', methods=['POST'])
def sync_sheets():
    """Ruta para disparar la sincronización con Google Sheets"""
    success, message = sync_with_sheets()
    if success:
        return jsonify({"message": message})
    else:
        return jsonify({"error": message}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
