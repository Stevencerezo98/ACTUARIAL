import { VariablesMacro, EmpleadoInput, EmpleadoProcesado, ResumenMotor, ItemSensibilidad } from '../types/actuarial';
import * as XLSX from 'xlsx';

export const DEFAULT_VARIABLES_MACRO: VariablesMacro = {
  tasa_descuento: 0.075,      // 7.5% según mercado de bonos USD
  tasa_incremento_sal: 0.030,  // 3.0% inflación/incremento estimado
  tasa_rotacion: 0.050,        // 5.0% rotación histórica de la empresa
  sbu_vigente: 460.00,         // Salario Básico Unificado en Ecuador
  edad_retiro: 65,             // 65 años ordinaria
  factor_supervivencia: 0.85,  // Factor de supervivencia promedio
  coeficiente_tabla_m: 11.5,   // Coeficiente tabla Art. 218 Hombre
  coeficiente_tabla_f: 13.0,   // Coeficiente tabla Art. 218 Mujer
};

/**
 * Motor de Cálculo Actuarial que implementa estrictamente las fórmulas especificadas
 * e incluye las métricas contables NIIF (NIC 19): DBO, CSC (Current Service Cost) e IC (Interest Cost).
 */
export function procesarMotorActuarial(
  empleados: EmpleadoInput[],
  variables: VariablesMacro
): { resultados: EmpleadoProcesado[]; resumen: ResumenMotor } {
  const i = variables.tasa_descuento;
  const s = variables.tasa_incremento_sal;
  const r = variables.tasa_rotacion;
  const sbu = variables.sbu_vigente;
  const edadRetiro = variables.edad_retiro;
  const factorSupervivencia = variables.factor_supervivencia;

  const resultados: EmpleadoProcesado[] = [];

  empleados.forEach((empleado, index) => {
    const fila = index + 2;
    const warnings: string[] = [];
    
    // Normalizar Cédula (zfill 10)
    let rawCed = String(empleado.Cedula ?? '').trim().split('.')[0];
    const cedula = rawCed.length <= 10 && rawCed.length > 0 ? rawCed.padStart(10, '0') : rawCed || '0000000000';
    const nombre = String(empleado.Nombre ?? `Colaborador ${index + 1}`).trim();

    try {
      // Normalizar Género
      let genStr = String(empleado.Genero ?? 'M').trim().toUpperCase();
      const genero: 'M' | 'F' = (genStr.startsWith('F') || genStr === 'MUJER') ? 'F' : 'M';

      // Normalizar Edad
      let rawEdad = typeof empleado.Edad === 'number' 
        ? empleado.Edad 
        : parseFloat(String(empleado.Edad || '30').replace(',', '.'));
      if (isNaN(rawEdad) || rawEdad < 18 || rawEdad > 85) {
        warnings.push(`Edad (${rawEdad}) normalizada a rango laboral.`);
        rawEdad = isNaN(rawEdad) ? 35 : Math.max(18, Math.min(80, rawEdad));
      }
      const edad = Math.round(rawEdad);

      // Normalizar Antigüedad
      let rawAntig = typeof empleado.Antiguedad === 'number'
        ? empleado.Antiguedad
        : parseFloat(String(empleado.Antiguedad || '1').replace(',', '.'));
      if (isNaN(rawAntig) || rawAntig < 0 || rawAntig > 60) {
        warnings.push(`Antigüedad (${rawAntig}) ajustada.`);
        rawAntig = isNaN(rawAntig) ? 1 : Math.max(0, Math.min(50, rawAntig));
      }
      const antiguedad = Math.round(rawAntig);

      // Normalizar Sueldo
      let rawSueldo = String(empleado.Sueldo_Actual ?? sbu)
        .replace('$', '')
        .replace('USD', '')
        .trim();
      if (rawSueldo.includes(',') && rawSueldo.includes('.')) {
        rawSueldo = rawSueldo.replace(/,/g, '');
      } else if (rawSueldo.includes(',')) {
        rawSueldo = rawSueldo.replace(',', '.');
      }
      let sueldo = parseFloat(rawSueldo);
      if (isNaN(sueldo) || sueldo <= 0) {
        sueldo = sbu;
        warnings.push(`Sueldo no numérico. Se asignó SBU vigente ($${sbu}).`);
      }

      // --- CÁLCULO EXACTO SEGÚN EL MOTOR ACTUARIAL ---
      const aniosFaltantes = Math.max(0, edadRetiro - edad);
      const antiguedadAlRetiro = antiguedad + aniosFaltantes;

      // 1. CÁLCULO DE DESAHUCIO
      const factorCrecimiento = Math.pow(1 + s, aniosFaltantes);
      const sueldoProyectado = sueldo * factorCrecimiento;
      const beneficioDesahucio = 0.25 * sueldoProyectado * antiguedadAlRetiro;
      const probPermanencia = Math.pow(1 - r, aniosFaltantes);
      const factorDescuento = Math.pow(1 + i, aniosFaltantes);

      const vpoDesahucio = factorDescuento > 0 
        ? (beneficioDesahucio * probPermanencia) / factorDescuento
        : 0;

      // Costo del Servicio Actual (CSC) para Desahucio bajo PUCM:
      // Beneficio atribuible a 1 año de servicio actual
      const cscDesahucio = antiguedadAlRetiro > 0 
        ? (vpoDesahucio / antiguedadAlRetiro) 
        : 0;

      // 2. CÁLCULO DE JUBILACIÓN PATRONAL
      let vpoJubilacion = 0.0;
      let cscJubilacion = 0.0;
      let elegible = false;
      let coefTabla = genero === 'M' ? variables.coeficiente_tabla_m : variables.coeficiente_tabla_f;
      let pensionAnualTeorica = 0.0;
      let pensionMensualTeorica = 0.0;
      let pensionMensual = 0.0;
      let pensionAnualLimite = 0.0;
      let topeAplicado: 'NINGUNO' | 'MINIMO_0.5_SBU' | 'MAXIMO_1.0_SBU' = 'NINGUNO';

      if (antiguedadAlRetiro >= 25) {
        elegible = true;
        coefTabla = genero === 'M' ? variables.coeficiente_tabla_m : variables.coeficiente_tabla_f;
        
        pensionAnualTeorica = (sueldoProyectado * 12 * 0.05) / coefTabla;
        pensionMensualTeorica = pensionAnualTeorica / 12;
        pensionMensual = pensionMensualTeorica;

        const topeMin = sbu * 0.5;
        const topeMax = sbu;

        if (pensionMensual < topeMin) {
          pensionMensual = topeMin;
          topeAplicado = 'MINIMO_0.5_SBU';
        } else if (pensionMensual > topeMax) {
          pensionMensual = topeMax;
          topeAplicado = 'MAXIMO_1.0_SBU';
        } else {
          topeAplicado = 'NINGUNO';
        }

        pensionAnualLimite = pensionMensual * 12;

        vpoJubilacion = factorDescuento > 0
          ? ((pensionAnualLimite * coefTabla) * factorSupervivencia * probPermanencia) / factorDescuento
          : 0;

        // Costo del Servicio Actual (CSC) para Jubilación bajo PUCM:
        cscJubilacion = antiguedadAlRetiro > 0 
          ? (vpoJubilacion / antiguedadAlRetiro) 
          : 0;
      }

      const vpoDesahucioRound = Math.round(vpoDesahucio * 100) / 100;
      const vpoJubilacionRound = Math.round(vpoJubilacion * 100) / 100;
      const vpoTotalRound = Math.round((vpoDesahucioRound + vpoJubilacionRound) * 100) / 100;
      const cscDesahucioRound = Math.round(cscDesahucio * 100) / 100;
      const cscJubilacionRound = Math.round(cscJubilacion * 100) / 100;
      const cscTotalRound = Math.round((cscDesahucioRound + cscJubilacionRound) * 100) / 100;
      const costoInteresInd = Math.round(vpoTotalRound * i * 100) / 100;

      resultados.push({
        id: `${cedula}_${index}`,
        filaOriginal: fila,
        Cedula: cedula,
        Nombre: nombre,
        Genero: genero,
        Edad: edad,
        Antiguedad: antiguedad,
        Sueldo_Actual: Math.round(sueldo * 100) / 100,
        Cargo: empleado.Cargo || 'General',
        anios_faltantes: aniosFaltantes,
        antiguedad_al_retiro: antiguedadAlRetiro,
        sueldo_proyectado: Math.round(sueldoProyectado * 100) / 100,
        beneficio_desahucio: Math.round(beneficioDesahucio * 100) / 100,
        prob_permanencia: Math.round(probPermanencia * 10000) / 10000,
        factor_descuento: Math.round(factorDescuento * 10000) / 10000,
        VPO_Desahucio: vpoDesahucioRound,
        csc_desahucio: cscDesahucioRound,
        elegible_jubilacion: elegible,
        coeficiente_tabla: coefTabla,
        pension_anual_teorica: Math.round(pensionAnualTeorica * 100) / 100,
        pension_mensual_teorica: Math.round(pensionMensualTeorica * 100) / 100,
        pension_mensual: Math.round(pensionMensual * 100) / 100,
        tope_aplicado: topeAplicado,
        pension_anual_limite: Math.round(pensionAnualLimite * 100) / 100,
        VPO_Jubilacion: vpoJubilacionRound,
        csc_jubilacion: cscJubilacionRound,
        VPO_Total: vpoTotalRound,
        csc_total: cscTotalRound,
        costo_interes_individual: costoInteresInd,
        warnings
      });

    } catch (err: any) {
      resultados.push({
        id: `${cedula}_${index}`,
        filaOriginal: fila,
        Cedula: cedula,
        Nombre: nombre,
        Genero: 'M',
        Edad: 30,
        Antiguedad: 0,
        Sueldo_Actual: 0,
        Cargo: 'Error',
        anios_faltantes: 0,
        antiguedad_al_retiro: 0,
        sueldo_proyectado: 0,
        beneficio_desahucio: 0,
        prob_permanencia: 0,
        factor_descuento: 1,
        VPO_Desahucio: 0.0,
        csc_desahucio: 0.0,
        elegible_jubilacion: false,
        coeficiente_tabla: 11.5,
        pension_anual_teorica: 0,
        pension_mensual_teorica: 0,
        pension_mensual: 0,
        tope_aplicado: 'NINGUNO',
        pension_anual_limite: 0,
        VPO_Jubilacion: 0.0,
        csc_jubilacion: 0.0,
        VPO_Total: 0.0,
        csc_total: 0.0,
        costo_interes_individual: 0.0,
        error: String(err.message || err),
        warnings: [`Error en procesamiento: ${err.message}`]
      });
    }
  });

  const totalEmpleados = resultados.length;
  const elegibles = resultados.filter(r => r.elegible_jubilacion);
  const totalDesahucio = resultados.reduce((acc, r) => acc + r.VPO_Desahucio, 0);
  const totalJubilacion = resultados.reduce((acc, r) => acc + r.VPO_Jubilacion, 0);
  const totalVPO = Math.round((totalDesahucio + totalJubilacion) * 100) / 100;
  const totalCSC = Math.round(resultados.reduce((acc, r) => acc + r.csc_total, 0) * 100) / 100;
  const costoInteresEstimado = Math.round(totalVPO * i * 100) / 100;
  const gastoTotalPeriodo = Math.round((totalCSC + costoInteresEstimado) * 100) / 100;
  const totalNomina = resultados.reduce((acc, r) => acc + r.Sueldo_Actual, 0);
  const sumaEdad = resultados.reduce((acc, r) => acc + r.Edad, 0);
  const sumaAntig = resultados.reduce((acc, r) => acc + r.Antiguedad, 0);

  const resumen: ResumenMotor = {
    total_empleados: totalEmpleados,
    empleados_elegibles: elegibles.length,
    porcentaje_elegibles: totalEmpleados > 0 ? Math.round((elegibles.length / totalEmpleados) * 1000) / 10 : 0,
    vpo_desahucio_total: Math.round(totalDesahucio * 100) / 100,
    vpo_jubilacion_total: Math.round(totalJubilacion * 100) / 100,
    vpo_total: totalVPO,
    costo_servicio_actual_total: totalCSC,
    costo_interes_estimado: costoInteresEstimado,
    gasto_total_niif: gastoTotalPeriodo,
    nomina_mensual_total: Math.round(totalNomina * 100) / 100,
    nomina_anual_total: Math.round(totalNomina * 12 * 100) / 100,
    edad_promedio: totalEmpleados > 0 ? Math.round((sumaEdad / totalEmpleados) * 10) / 10 : 0,
    antiguedad_promedio: totalEmpleados > 0 ? Math.round((sumaAntig / totalEmpleados) * 10) / 10 : 0
  };

  return { resultados, resumen };
}

/**
 * Análisis de Sensibilidad Actuarial (Exigencia NIC 19 § 145 / Módulo 3)
 * Variaciones en tasa de descuento (±1%, ±0.5%) y tasa salarial (±1%, ±0.5%)
 */
export function calcularSensibilidadNIIF(
  empleados: EmpleadoInput[],
  variablesBase: VariablesMacro
): ItemSensibilidad[] {
  if (!empleados || empleados.length === 0) return [];

  const { resumen: baseRes } = procesarMotorActuarial(empleados, variablesBase);
  const vpoBase = baseRes.vpo_total;

  const escenarios = [
    { nombre: 'Escenario Base Actual', dI: 0.0, dS: 0.0 },
    { nombre: 'Tasa de Descuento (+1.0%)', dI: 0.010, dS: 0.0 },
    { nombre: 'Tasa de Descuento (-1.0%)', dI: -0.010, dS: 0.0 },
    { nombre: 'Tasa de Incremento Salarial (+1.0%)', dI: 0.0, dS: 0.010 },
    { nombre: 'Tasa de Incremento Salarial (-1.0%)', dI: 0.0, dS: -0.010 },
    { nombre: 'Tasa de Descuento (+0.5%)', dI: 0.005, dS: 0.0 },
    { nombre: 'Tasa de Descuento (-0.5%)', dI: -0.005, dS: 0.0 },
    { nombre: 'Tasa de Incremento Salarial (+0.5%)', dI: 0.0, dS: 0.005 },
    { nombre: 'Tasa de Incremento Salarial (-0.5%)', dI: 0.0, dS: -0.005 },
  ];

  return escenarios.map(esc => {
    const varsEscenario: VariablesMacro = {
      ...variablesBase,
      tasa_descuento: Math.max(0.01, variablesBase.tasa_descuento + esc.dI),
      tasa_incremento_sal: Math.max(0.00, variablesBase.tasa_incremento_sal + esc.dS)
    };

    const { resumen } = procesarMotorActuarial(empleados, varsEscenario);
    const diff = resumen.vpo_total - vpoBase;
    const pct = vpoBase > 0 ? (diff / vpoBase) * 100 : 0;

    return {
      escenario: esc.nombre,
      delta_i: esc.dI,
      delta_s: esc.dS,
      tasa_descuento_pct: Math.round(varsEscenario.tasa_descuento * 10000) / 100,
      tasa_salario_pct: Math.round(varsEscenario.tasa_incremento_sal * 10000) / 100,
      vpo_desahucio: resumen.vpo_desahucio_total,
      vpo_jubilacion: resumen.vpo_jubilacion_total,
      vpo_total: resumen.vpo_total,
      variacion_usd: Math.round(diff * 100) / 100,
      variacion_pct: Math.round(pct * 100) / 100
    };
  });
}

/**
 * Lector flexible de archivos Excel (.xlsx, .xls) y CSV
 */
export function leerArchivoNomina(archivoBuffer: any): EmpleadoInput[] {
  const wb = XLSX.read(archivoBuffer, { type: 'binary' });
  const primerHoja = wb.SheetNames[0];
  const ws = wb.Sheets[primerHoja];
  const rawRows = XLSX.utils.sheet_to_json<any>(ws);

  if (!rawRows || rawRows.length === 0) {
    throw new Error('El archivo no contiene filas de datos en su primera hoja.');
  }

  return rawRows.map((r, idx) => {
    const getField = (...keys: string[]) => {
      for (const k of keys) {
        if (r[k] !== undefined && r[k] !== null && String(r[k]).trim() !== '') return r[k];
        const lowerKey = k.toLowerCase();
        for (const actualKey of Object.keys(r)) {
          if (actualKey.toLowerCase() === lowerKey || actualKey.toLowerCase().replace(/_/g, '') === lowerKey.replace(/_/g, '')) {
            return r[actualKey];
          }
        }
      }
      return undefined;
    };

    return {
      Cedula: getField('Cedula', 'Cédula', 'CEDULA', 'Identificacion', 'DNI') ?? `999${String(idx).padStart(7, '0')}`,
      Nombre: getField('Nombre', 'NOMBRE', 'Colaborador', 'Empleado', 'Nombres') ?? `Colaborador ${idx + 1}`,
      Genero: getField('Genero', 'Género', 'GENERO', 'Sexo') ?? 'M',
      Edad: getField('Edad', 'EDAD', 'Age') ?? 30,
      Antiguedad: getField('Antiguedad', 'Antigüedad', 'ANTIGUEDAD', 'Anios_Servicio', 'Años_Servicio', 'Servicio') ?? 1,
      Sueldo_Actual: getField('Sueldo_Actual', 'Sueldo', 'SUELDO', 'Salario', 'Remuneracion', 'Remuneración') ?? 460.00,
      Cargo: getField('Cargo', 'CARGO', 'Puesto', 'Posicion') ?? 'Colaborador'
    };
  });
}

/**
 * Exportar censo calculado con libro multi-hoja completo (NIIF / NIC 19)
 */
export function exportarResultadosAExcel(
  resultados: EmpleadoProcesado[],
  resumen: ResumenMotor,
  variables: VariablesMacro,
  sensibilidad?: ItemSensibilidad[]
) {
  // Hoja 1: Valuacion Detallada por Empleado
  const filasExcel = resultados.map(r => ({
    'Cedula': r.Cedula,
    'Nombre': r.Nombre,
    'Genero': r.Genero,
    'Edad': r.Edad,
    'Antiguedad': r.Antiguedad,
    'Sueldo_Actual': r.Sueldo_Actual,
    'Anios_Faltantes': r.anios_faltantes,
    'Antiguedad_Al_Retiro': r.antiguedad_al_retiro,
    'Sueldo_Proyectado': r.sueldo_proyectado,
    'VPO_Desahucio': r.VPO_Desahucio,
    'CSC_Desahucio': r.csc_desahucio,
    'Elegible_Jubilacion': r.elegible_jubilacion ? 'SI' : 'NO',
    'Pension_Mensual': r.pension_mensual,
    'Tope_Aplicado': r.tope_aplicado,
    'VPO_Jubilacion': r.VPO_Jubilacion,
    'CSC_Jubilacion': r.csc_jubilacion,
    'VPO_Total_DBO': r.VPO_Total,
    'CSC_Total': r.csc_total,
    'Costo_Interes': r.costo_interes_individual
  }));
  const ws1 = XLSX.utils.json_to_sheet(filasExcel);
  
  // Hoja 2: Resumen NIIF y Conciliación de Balance
  const resumenInfo = [
    { Concepto_Contable: 'NORMATIVA APLICABLE', Valor: 'NIC 19 / IAS 19 - Beneficios por Retiro (Ecuador)' },
    { Concepto_Contable: 'Tasa de Descuento Financiero (i)', Valor: `${(variables.tasa_descuento * 100).toFixed(2)}%` },
    { Concepto_Contable: 'Tasa de Incremento Salarial (s)', Valor: `${(variables.tasa_incremento_sal * 100).toFixed(2)}%` },
    { Concepto_Contable: 'Tasa de Rotacion Anual (r)', Valor: `${(variables.tasa_rotacion * 100).toFixed(2)}%` },
    { Concepto_Contable: 'Salario Basico Unificado (SBU)', Valor: `$ ${variables.sbu_vigente.toFixed(2)}` },
    { Concepto_Contable: 'Edad Ordinaria de Retiro', Valor: `${variables.edad_retiro} años` },
    { Concepto_Contable: 'Total Colaboradores Valuados', Valor: resumen.total_empleados },
    { Concepto_Contable: 'Colaboradores Elegibles Jubilacion Patronal', Valor: resumen.empleados_elegibles },
    { Concepto_Contable: 'Nomina Mensual Evaluada (USD)', Valor: `$ ${resumen.nomina_mensual_total.toLocaleString()}` },
    { Concepto_Contable: 'VPO Desahucio Total (Art. 185) (USD)', Valor: `$ ${resumen.vpo_desahucio_total.toLocaleString()}` },
    { Concepto_Contable: 'VPO Jubilacion Patronal Total (Art. 216) (USD)', Valor: `$ ${resumen.vpo_jubilacion_total.toLocaleString()}` },
    { Concepto_Contable: 'OBLIGACION POR BENEFICIOS DEFINIDOS (DBO TOTAL) (USD)', Valor: `$ ${resumen.vpo_total.toLocaleString()}` },
    { Concepto_Contable: 'Costo del Servicio Actual / Corriente (CSC) (USD)', Valor: `$ ${resumen.costo_servicio_actual_total.toLocaleString()}` },
    { Concepto_Contable: 'Costo por Interes Estimado (Interest Cost) (USD)', Valor: `$ ${resumen.costo_interes_estimado.toLocaleString()}` },
    { Concepto_Contable: 'GASTO TOTAL RECONOCIDO EN RESULTADOS DEL PERIODO (CSC + IC) (USD)', Valor: `$ ${resumen.gasto_total_niif.toLocaleString()}` }
  ];
  const ws2 = XLSX.utils.json_to_sheet(resumenInfo);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws1, 'Valuacion_Detallada');
  XLSX.utils.book_append_sheet(wb, ws2, 'Resumen_NIIF_Contable');

  // Hoja 3: Matriz de Sensibilidad si está disponible
  if (sensibilidad && sensibilidad.length > 0) {
    const ws3 = XLSX.utils.json_to_sheet(sensibilidad.map(s => ({
      'Escenario': s.escenario,
      'Tasa_Descuento_%': s.tasa_descuento_pct,
      'Tasa_Salarial_%': s.tasa_salario_pct,
      'VPO_Desahucio_USD': s.vpo_desahucio,
      'VPO_Jubilacion_USD': s.vpo_jubilacion,
      'DBO_Total_USD': s.vpo_total,
      'Variacion_USD': s.variacion_usd,
      'Variacion_%': s.variacion_pct
    })));
    XLSX.utils.book_append_sheet(wb, ws3, 'Matriz_Sensibilidad_NIC19');
  }

  XLSX.writeFile(wb, 'Valuacion_Actuarial_NIC19_Ecuador.xlsx');
}

/**
 * Plantilla en blanco con las columnas exactas
 */
export function descargarPlantillaOficial() {
  const plantilla = [
    { Cedula: '1712345678', Nombre: 'Juan Perez', Genero: 'M', Edad: 45, Antiguedad: 15, Sueldo_Actual: 1200.00 },
    { Cedula: '0912345678', Nombre: 'Maria Rodriguez', Genero: 'F', Edad: 30, Antiguedad: 5, Sueldo_Actual: 850.00 },
    { Cedula: '0112345678', Nombre: 'Carlos Cueva', Genero: 'M', Edad: 62, Antiguedad: 24, Sueldo_Actual: 2100.00 }
  ];
  const ws = XLSX.utils.json_to_sheet(plantilla);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Plantilla_Nomina');
  XLSX.writeFile(wb, 'Plantilla_Nomina_NIC19_Ecuador.xlsx');
}
