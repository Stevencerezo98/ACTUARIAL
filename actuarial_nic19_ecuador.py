"""
========================================================================================
MOTOR ACTUARIAL NIC 19 - CÓDIGO DEL TRABAJO DE ECUADOR
- Art. 185: Bonificación por Desahucio
- Art. 216: Jubilación Patronal (Topes 0.5 SBU a 1.0 SBU)
Compatible con pandas y con modo puro Python (sin dependencias externas requeridas)
========================================================================================
"""

import sys
import math

try:
    import pandas as pd
    import numpy as np
    HAS_PANDAS = True
except ImportError:
    HAS_PANDAS = False


def calcular_motor_actuarial(df_excel, variables_macro: dict):
    """
    Procesa las filas del Excel aplicando matemática financiera bajo NIC 19 (Ecuador).
    Recibe DataFrame con: 'Cedula', 'Nombre', 'Genero', 'Edad', 'Antiguedad', 'Sueldo_Actual'
    Retorna DataFrame (o lista de diccionarios si no hay pandas) con 'VPO_Desahucio', 'VPO_Jubilacion' y 'VPO_Total'.
    """
    # Extraer variables globales
    i = float(variables_macro.get('tasa_descuento', 0.075))
    s = float(variables_macro.get('tasa_incremento_sal', 0.030))
    r = float(variables_macro.get('tasa_rotacion', 0.050))
    sbu = float(variables_macro.get('sbu_vigente', 460.00))
    edad_retiro = int(variables_macro.get('edad_retiro', 65))
    factor_supervivencia = float(variables_macro.get('factor_supervivencia', 0.85))

    # Normalizar iteración según si es DataFrame de pandas o lista de diccionarios
    if HAS_PANDAS and isinstance(df_excel, pd.DataFrame):
        filas = df_excel.to_dict(orient='records')
    elif isinstance(df_excel, list):
        filas = df_excel
    else:
        filas = list(df_excel)
    
    resultados = []

    for empleado in filas:
        try:
            edad = int(float(empleado.get('Edad', 30)))
            antiguedad = int(float(empleado.get('Antiguedad', 1)))
            
            # Limpieza robusta de sueldo si viene con formato monetario o coma
            raw_sueldo = str(empleado.get('Sueldo_Actual', 460.0)).replace('$', '').replace('USD', '').strip()
            if ',' in raw_sueldo and '.' in raw_sueldo:
                raw_sueldo = raw_sueldo.replace(',', '')
            elif ',' in raw_sueldo:
                raw_sueldo = raw_sueldo.replace(',', '.')
            sueldo = float(raw_sueldo)

            genero = str(empleado.get('Genero', 'M')).strip().upper()
            if genero.startswith('F') or genero == 'MUJER':
                genero = 'F'
            else:
                genero = 'M'

            anios_faltantes = max(0, edad_retiro - edad)
            antiguedad_al_retiro = antiguedad + anios_faltantes
            
            # --- 1. CÁLCULO DE DESAHUCIO (Art. 185) ---
            sueldo_proyectado = sueldo * ((1.0 + s) ** anios_faltantes)
            beneficio_desahucio = 0.25 * sueldo_proyectado * antiguedad_al_retiro
            prob_permanencia = (1.0 - r) ** anios_faltantes
            vpo_desahucio = (beneficio_desahucio * prob_permanencia) / ((1.0 + i) ** anios_faltantes)

            # --- 2. CÁLCULO DE JUBILACIÓN PATRONAL (Art. 216) ---
            vpo_jubilacion = 0.0
            pension_m = 0.0
            tope_str = "NO ELEGIBLE"

            if antiguedad_al_retiro >= 25:
                coeficiente_tabla = 11.5 if genero == 'M' else 13.0
                pension_anual_teorica = (sueldo_proyectado * 12.0 * 0.05) / coeficiente_tabla
                pension_mensual = pension_anual_teorica / 12.0
                
                # Reglas estrictas del Código del Trabajo de Ecuador (Límites SBU)
                tope_min = sbu * 0.5
                tope_max = sbu * 1.0

                if pension_mensual < tope_min:
                    pension_mensual = tope_min
                    tope_str = "TOPE MÍNIMO (0.5 SBU)"
                elif pension_mensual > tope_max:
                    pension_mensual = tope_max
                    tope_str = "TOPE MÁXIMO (1.0 SBU)"
                else:
                    tope_str = "NINGUNO"
                
                pension_m = round(pension_mensual, 2)
                pension_anual_limite = pension_mensual * 12.0
                
                # Renta actuarial proyectada con factor de supervivencia y descuento
                vpo_jubilacion = (pension_anual_limite * coeficiente_tabla) * factor_supervivencia * prob_permanencia / ((1.0 + i) ** anios_faltantes)

            vpo_des = round(vpo_desahucio, 2)
            vpo_jub = round(vpo_jubilacion, 2)
            vpo_tot = round(vpo_des + vpo_jub, 2)

            res = dict(empleado)
            res['Anios_Faltantes'] = anios_faltantes
            res['Antiguedad_Al_Retiro'] = antiguedad_al_retiro
            res['Sueldo_Proyectado'] = round(sueldo_proyectado, 2)
            res['VPO_Desahucio'] = vpo_des
            res['Pension_Mensual'] = pension_m
            res['Tope_Pensional'] = tope_str
            res['VPO_Jubilacion'] = vpo_jub
            res['VPO_Total'] = vpo_tot
            resultados.append(res)

        except Exception as e:
            res = dict(empleado)
            res['Anios_Faltantes'] = 0
            res['Antiguedad_Al_Retiro'] = 0
            res['Sueldo_Proyectado'] = 0.0
            res['VPO_Desahucio'] = 0.0
            res['Pension_Mensual'] = 0.0
            res['Tope_Pensional'] = "ERROR"
            res['VPO_Jubilacion'] = 0.0
            res['VPO_Total'] = 0.0
            resultados.append(res)
            print(f"Error procesando fila {empleado.get('Nombre', 'Desconocido')}: {e}", file=sys.stderr)

    if HAS_PANDAS and isinstance(df_excel, pd.DataFrame):
        return pd.DataFrame(resultados)
    return resultados


if __name__ == '__main__':
    variables_ecuador = {
        'tasa_descuento': 0.075,      # 7.5% según mercado de bonos
        'tasa_incremento_sal': 0.030,  # 3.0% inflación/incremento estimado
        'tasa_rotacion': 0.050,        # 5.0% rotación histórica
        'sbu_vigente': 460.00,         # Salario Básico Unificado Ecuador
        'edad_retiro': 65,
        'factor_supervivencia': 0.85
    }

    datos_muestra = [
        {'Cedula': '1712345678', 'Nombre': 'Juan Perez', 'Genero': 'M', 'Edad': 45, 'Antiguedad': 15, 'Sueldo_Actual': 1200.00},
        {'Cedula': '0912345678', 'Nombre': 'Maria Rodriguez', 'Genero': 'F', 'Edad': 30, 'Antiguedad': 5, 'Sueldo_Actual': 850.00},
        {'Cedula': '0112345678', 'Nombre': 'Carlos Cueva', 'Genero': 'M', 'Edad': 62, 'Antiguedad': 24, 'Sueldo_Actual': 2100.00}
    ]

    print("=" * 80)
    print("EJECUTANDO MOTOR ACTUARIAL NIC 19 - CÓDIGO DEL TRABAJO DE ECUADOR")
    print("=" * 80)

    if HAS_PANDAS:
        df_input = pd.DataFrame(datos_muestra)
        df_resultado = calcular_motor_actuarial(df_input, variables_ecuador)
        cols = ['Nombre', 'Edad', 'Antiguedad', 'Sueldo_Actual', 'Sueldo_Proyectado', 'VPO_Desahucio', 'VPO_Jubilacion', 'VPO_Total']
        print(df_resultado[cols].to_string(index=False))
        total_desahucio = df_resultado['VPO_Desahucio'].sum()
        total_jubilacion = df_resultado['VPO_Jubilacion'].sum()
        total_dbo = df_resultado['VPO_Total'].sum()
    else:
        resultados = calcular_motor_actuarial(datos_muestra, variables_ecuador)
        headers = ['Nombre', 'Edad', 'Antig.', 'Sueldo', 'Sueldo Proy.', 'VPO Desahucio', 'VPO Jubilacion', 'VPO Total (DBO)']
        print(f"{headers[0]:<20} {headers[1]:<6} {headers[2]:<8} {headers[3]:<12} {headers[4]:<14} {headers[5]:<14} {headers[6]:<14} {headers[7]:<14}")
        print("-" * 105)
        for r in resultados:
            s_act = f"USD {r['Sueldo_Actual']:<8.2f}"
            s_proy = f"USD {r['Sueldo_Proyectado']:<10.2f}"
            v_des = f"USD {r['VPO_Desahucio']:<10.2f}"
            v_jub = f"USD {r['VPO_Jubilacion']:<10.2f}"
            v_tot = f"USD {r['VPO_Total']:<10.2f}"
            print(f"{r['Nombre']:<20} {r['Edad']:<6} {r['Antiguedad']:<8} {s_act:<12} {s_proy:<14} {v_des:<14} {v_jub:<14} {v_tot:<14}")
        total_desahucio = sum(r['VPO_Desahucio'] for r in resultados)
        total_jubilacion = sum(r['VPO_Jubilacion'] for r in resultados)
        total_dbo = sum(r['VPO_Total'] for r in resultados)

    print("-" * 80)
    print(f"Total VPO Desahucio  (Art. 185): USD {total_desahucio:,.2f}")
    print(f"Total VPO Jubilación (Art. 216): USD {total_jubilacion:,.2f}")
    print(f"TOTAL OBLIGACIÓN DBO (NIC 19)  : USD {total_dbo:,.2f}")
    print("=" * 80)
