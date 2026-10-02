/**
 * TABLAS DE MORTALIDAD GENERAL DEL ECUADOR (IESS 2000)
 * Publicadas en el Registro Oficial No. 650 del 28 de Agosto del 2002
 * Elaboradas por LOGARITMO CÍA. LTDA.
 * 
 * Base Técnica y Legal:
 * - Ley de Seguridad Social y Código del Trabajo del Ecuador (Art. 216 al 219)
 * - Acuerdos Ministeriales MDT-2016-0099 y MDT-2018-0118
 * - Resolución No. 07-2021 de la Corte Nacional de Justicia
 * - Norma Internacional de Contabilidad NIC 19 / IAS 19
 */

export interface FilaMortalidad {
  edad: number;
  lx: number;      // Número de personas vivas a edad x
  dx: number;      // Número de defunciones entre x y x+1
  qx: number;      // Probabilidad de fallecer entre x y x+1
  px: number;      // Probabilidad de sobrevivir de x a x+1
  ex: number;      // Esperanza de vida a edad x
  mu_x: number;    // Fuerza de mortalidad
}

export interface ParametrosMakeham {
  c: number;
  g: number;
  s: number;
  K: number;
  ln_c: number;
  ln_g: number;
  ln_s: number;
}

// Parámetros Makeham Hombres (Registro Oficial 650 - Pág. 18-19)
export const MAKEHAM_HOMBRES: ParametrosMakeham = {
  c: 1.107230311825,
  g: 0.999597840052,
  s: 0.997399191007,
  K: 964147,
  ln_c: 0.101861683,
  ln_g: -0.000402241,
  ln_s: -0.002604197
};

// Parámetros Makeham Mujeres (Registro Oficial 650 - Pág. 24-25)
export const MAKEHAM_MUJERES: ParametrosMakeham = {
  c: 1.110372564594,
  g: 0.999782595350,
  s: 0.999336570006,
  K: 990719,
  ln_c: 0.104695603,
  ln_g: -0.000217428,
  ln_s: -0.00066365
};

/**
 * Cálculo exacto de lx por fórmula de Makeham-Gompertz:
 * lx = K * (s^x) * (g^(c^x))
 */
export function calcularLxMakeham(edad: number, params: ParametrosMakeham): number {
  if (edad <= 0) return 1000000;
  if (edad >= 105) return 0;
  const cx = Math.pow(params.c, edad);
  const sx = Math.pow(params.s, edad);
  const g_cx = Math.pow(params.g, cx);
  const lx = params.K * sx * g_cx;
  return Math.max(0, Math.round(lx));
}

/**
 * Genera la tabla actuarial completa desde edad 18 hasta 100 años
 */
export function generarTablaMortalidad(genero: 'M' | 'F'): FilaMortalidad[] {
  const p = genero === 'M' ? MAKEHAM_HOMBRES : MAKEHAM_MUJERES;
  const filas: FilaMortalidad[] = [];

  for (let x = 18; x <= 100; x++) {
    const lx = calcularLxMakeham(x, p);
    const lx_mas1 = calcularLxMakeham(x + 1, p);
    const dx = Math.max(0, lx - lx_mas1);
    const qx = lx > 0 ? dx / lx : 1.0;
    const px = 1.0 - qx;
    
    // Fuerza de mortalidad Makeham: mu_x = -ln(s) - ln(g)*c^x * ln(c)
    const mu_x = -p.ln_s - (p.ln_g * Math.pow(p.c, x) * p.ln_c);

    // Esperanza de vida aproximada sumando lx futuros
    let sumaLx = 0;
    for (let t = x + 1; t <= 105; t++) {
      sumaLx += calcularLxMakeham(t, p);
    }
    const ex = lx > 0 ? (sumaLx / lx) + 0.5 : 0.0;

    filas.push({
      edad: x,
      lx,
      dx,
      qx: Math.round(qx * 1000000) / 1000000,
      px: Math.round(px * 1000000) / 1000000,
      ex: Math.round(ex * 10) / 10,
      mu_x: Math.round(mu_x * 10000000) / 10000000
    });
  }

  return filas;
}

/**
 * Dictamen Técnico Actuarial sobre la vigencia y aplicación de las tablas
 */
export const DICTAMEN_VIGENCIA_TABLAS = {
  registro_oficial: 'Registro Oficial No. 650, de 28 de agosto de 2002',
  entidad_emisora: 'Instituto Ecuatoriano de Seguridad Social (IESS)',
  elaborado_por: 'LOGARITMO CÍA. LTDA. (Actuarios Consultores)',
  estado_vigencia: 'VIGENTE Y APLICABLE PARA JUBILACIÓN PATRONAL DEL CÓDIGO DEL TRABAJO',
  analisis_juridico_actuarial: `
    ¿Aún sirven estas tablas de mortalidad en Ecuador?
    
    SÍ. Para la valuación actuarial de Jubilación Patronal y Desahucio bajo el Código del Trabajo 
    y la norma contable internacional NIC 19 (IAS 19), las tablas publicadas en el Registro Oficial 
    No. 650 de agosto de 2002 continúan siendo la base técnica de conmutación obligatoria.
    
    Fundamentos clave:
    1. Vinculación Legal del Art. 218 del Código del Trabajo: La ley ecuatoriana establece que los 
       coeficientes de renta vitalicia para jubilación patronal están directamente tarifados en el 
       Código del Trabajo.
    2. Acuerdos Ministeriales MDT-2016-0099 y MDT-2018-0118: El Ministerio del Trabajo ratificó que 
       para la determinación del haber individual y fondo global rigen los coeficientes del Código 
       del Trabajo basados en las tablas del IESS 2000 a una tasa técnica del 4.0%.
    3. Resolución No. 07-2021 de la Corte Nacional de Justicia: Establece como jurisprudencia obligatoria 
       la aplicación de los topes sobre la remuneración media y ratifica la vigencia del marco de 
       cálculo actuarial legal.
    4. Práctica de los Peritos Actuarios Calificados (SCVS y SB): Como se constata en el informe oficial 
       de CAJAMARCA PROTECTIVE SERVICES (elaborado por Econ. Hugo Paredes Estrella, Reg. 1-014 SCVS en 
       abril 2024), los actuarios calificados en Ecuador aplican estas tablas combinadas con la tabla de 
       activos del IESS 1995/2000 para el cómputo de la reserva matemática.
  `
};
