from datetime import datetime

def simulate_onpe_query(dni):
    """Simula una consulta al portal de la ONPE"""
    # Base de datos ficticia para el examen
    mock_db = {
        "12345678": {
            "miembro_mesa": "SI",
            "ubicacion": "LIMA / LIMA / MIRAFLORES",
            "direccion_local": "I.E. ADVENTISTA MIRAFLORES - AV. DOS DE MAYO 356"
        },
        "87654321": {
            "miembro_mesa": "NO",
            "ubicacion": "AREQUIPA / AREQUIPA / YANAHUARA",
            "direccion_local": "ESTADIO UMACCOLLO - CALLE TRINIDAD MORAN S/N"
        }
    }
    
    # Si el DNI está en nuestro mock, devolvemos los datos, si no, generamos uno genérico
    if dni in mock_db:
        result = mock_db[dni]
    else:
        # Resultado por defecto para cualquier otro DNI
        result = {
            "miembro_mesa": "NO",
            "ubicacion": "UBICACIÓN NO DETERMINADA",
            "direccion_local": "LOCAL POR ASIGNAR - CONSULTE WEB OFICIAL"
        }
    
    result["dni"] = str(dni)
    result["fecha_consulta"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    return result
