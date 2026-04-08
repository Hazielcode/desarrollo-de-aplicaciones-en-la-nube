import gspread
from google.oauth2.service_account import Credentials
from utils import simulate_onpe_query
import time

# Configuración de Google Sheets
SPREADSHEET_ID = '1QraNbdAs05okg4Je4RbHHGOqzJ_-FN-lMqBCX08vFuE'
CREDENTIALS_FILE = 'credentials.json'

def sync_with_sheets():
    try:
        # Autenticación
        scopes = [
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/drive'
        ]
        
        creds = Credentials.from_service_account_file(CREDENTIALS_FILE, scopes=scopes)
        client = gspread.authorize(creds)
        
        # Abrir la hoja
        sheet = client.open_by_key(SPREADSHEET_ID).sheet1
        
        # Leer todos los datos
        # Asumiendo: Col A = DNI, Col B = Miembro, Col C = Ubicación, Col D = Dirección
        records = sheet.get_all_values()
        
        print(f"Detectadas {len(records)} filas. Iniciando procesamiento...")
        
        # Actualizar encabezados si la hoja está vacía en la primera fila
        if not records or records[0][0].upper() != 'DNI':
            sheet.update('A1:D1', [['DNI', 'MIEMBRO MESA', 'UBICACIÓN', 'LOCAL VOTACIÓN']])
            records = sheet.get_all_values()

        # Procesar cada fila (omitiendo el encabezado)
        for i, row in enumerate(records[1:], start=2):
            dni = str(row[0]).strip()
            
            if len(dni) == 8 and dni.isdigit():
                print(f"Procesando DNI: {dni}...")
                
                # Consultar datos
                resultado = simulate_onpe_query(dni)
                
                # Preparar fila de actualización
                update_row = [
                    resultado['miembro_mesa'],
                    resultado['ubicacion'],
                    resultado['direccion_local']
                ]
                
                # Actualizar celdas B, C, D de la fila i
                sheet.update(f'B{i}:D{i}', [update_row])
                
                # Respetar límites de cuota de la API de Google
                time.sleep(1) 
            else:
                print(f"DNI inválido saltado: {dni}")

        return True, "Sincronización completada con éxito."
        
    except FileNotFoundError:
        return False, "Error: No se encontró el archivo 'credentials.json'."
    except Exception as e:
        import traceback
        traceback.print_exc()
        return False, f"Error inesperado: {str(e)}"

if __name__ == '__main__':
    success, message = sync_with_sheets()
    print(message)
