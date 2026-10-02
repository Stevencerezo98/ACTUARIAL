/**
 * Tipos de datos para el Motor de Valuación Actuarial NIC 19 (Ecuador)
 * Adaptado a la arquitectura de 4 componentes:
 * 1. Arquitectura Técnica (Frontend, Backend FastAPI, PostgreSQL)
 * 2. Reglas de Negocio / Actuariales (Desahucio Art. 185, Jubilación Art. 216)
 * 3. Reportería NIIF (DBO, CSC, Costo por Interés, Sensibilidad ±1%)
 * 4. Infraestructura y Base de Datos
 */

export interface VariablesMacro {
  tasa_descuento: number;      // i: ej. 0.075 (7.5%)
  tasa_incremento_sal: number;  // s: ej. 0.03 (3.0%)
  tasa_rotacion: number;        // r: ej. 0.05 (5.0%)
  sbu_vigente: number;          // SBU: ej. 460.00
  edad_retiro: number;          // ej. 65
  factor_supervivencia: number; // ej. 0.85
  coeficiente_tabla_m: number;  // ej. 11.5
  coeficiente_tabla_f: number;  // ej. 13.0
}

export interface EmpleadoInput {
  Cedula: string | number;
  Nombre: string;
  Genero: string;
  Edad: number | string;
  Antiguedad: number | string;
  Sueldo_Actual: number | string;
  Cargo?: string;
}

export interface EmpleadoProcesado {
  id: string;
  filaOriginal: number;
  Cedula: string;
  Nombre: string;
  Genero: 'M' | 'F';
  Edad: number;
  Antiguedad: number;
  Sueldo_Actual: number;
  Cargo?: string;
  
  // Variables calculadas según el motor
  anios_faltantes: number;
  antiguedad_al_retiro: number;
  sueldo_proyectado: number;
  beneficio_desahucio: number;
  prob_permanencia: number;
  factor_descuento: number;
  
  // Desahucio (Art. 185)
  VPO_Desahucio: number;
  csc_desahucio: number; // Current Service Cost (Costo del Servicio Actual)
  
  // Jubilación Patronal (Art. 216)
  elegible_jubilacion: boolean;
  coeficiente_tabla: number;
  pension_anual_teorica: number;
  pension_mensual_teorica: number;
  pension_mensual: number;
  tope_aplicado: 'NINGUNO' | 'MINIMO_0.5_SBU' | 'MAXIMO_1.0_SBU';
  pension_anual_limite: number;
  VPO_Jubilacion: number;
  csc_jubilacion: number; // Current Service Cost
  
  // Consolidado
  VPO_Total: number;
  csc_total: number; // Current Service Cost Total
  costo_interes_individual: number; // Interest Cost (VPO * i)
  
  // Control de calidad
  error?: string;
  warnings: string[];
}

export interface ResumenMotor {
  total_empleados: number;
  empleados_elegibles: number;
  porcentaje_elegibles: number;
  vpo_desahucio_total: number;
  vpo_jubilacion_total: number;
  vpo_total: number; // DBO Total
  costo_servicio_actual_total: number; // Current Service Cost (CSC)
  costo_interes_estimado: number; // Interest Cost (IC) = DBO * i
  gasto_total_niif: number; // CSC + IC
  nomina_mensual_total: number;
  nomina_anual_total: number;
  edad_promedio: number;
  antiguedad_promedio: number;
}

export interface ItemSensibilidad {
  escenario: string;
  delta_i: number;
  delta_s: number;
  tasa_descuento_pct: number;
  tasa_salario_pct: number;
  vpo_desahucio: number;
  vpo_jubilacion: number;
  vpo_total: number;
  variacion_usd: number;
  variacion_pct: number;
}

export interface DatosEmpresaEstudio {
  nombre_empresa: string;
  nombre_comercial: string;
  ruc: string;
  ciudad: string;
  fecha_constitucion: string;
  plazo_duracion: string;
  objeto_social: string;
  mision: string;
  vision: string;
  fecha_corte_valuacion: string; // ej. "31 de diciembre de 2023"
  anio_evaluado: number;         // ej. 2023
  anio_anterior: number;         // ej. 2022
  fecha_emision_informe: string; // ej. "Quito, abril de 2024"
  actuario_nombre: string;       // ej. "Econ. Hugo Paredes Estrella"
  actuario_titulo: string;       // ej. "Servicios Actuariales"
  actuario_registro_scvs: string;// ej. "Registro No. 1-014 SCVS"
  actuario_registro_sb: string;  // ej. "Registro No. PEA-2007-005 SB"
  tasa_interes_tecnico: number;  // 0.04 (4.0% anual)
  inflacion: number;             // 0.022 (2.2% anual)
  provision_anterior_jubilacion: number;
  provision_anterior_desahucio: number;
  pagos_realizados_jubilacion: number;
  pagos_realizados_desahucio: number;
}

export const DEFAULT_EMPRESA_CAJAMARCA: DatosEmpresaEstudio = {
  nombre_empresa: 'CAJAMARCA PROTECTIVE SERVICES CÍA. LTDA.',
  nombre_comercial: 'CAJAPROTSERV',
  ruc: '0992804561001',
  ciudad: 'Guayaquil',
  fecha_constitucion: '6 de mayo de 2013',
  plazo_duracion: '50 años (hasta el 6 de mayo de 2063)',
  objeto_social: 'Proveer de servicios complementarios de vigilancia, sistemas de alarma, servicios de custodia, servicios de guardianía de seguridad y servicios de seguridad física privada mediante un sistema de gestión de calidad.',
  mision: 'Desarrollar a su gente, innovar en tecnología y estructurar una operación eficaz para alcanzar niveles de seguridad nunca antes vistos.',
  vision: 'Ser la empresa de seguridad con mayor facturación en Ecuador, y hacer de la empresa su familia y su hogar.',
  fecha_corte_valuacion: '31 de diciembre de 2023',
  anio_evaluado: 2023,
  anio_anterior: 2022,
  fecha_emision_informe: 'Quito, abril de 2024',
  actuario_nombre: 'Econ. Hugo Paredes Estrella',
  actuario_titulo: 'Servicios Actuariales',
  actuario_registro_scvs: 'Registro No. 1-014 SCVS',
  actuario_registro_sb: 'Registro No. PEA-2007-005 SB',
  tasa_interes_tecnico: 0.04,
  inflacion: 0.022,
  provision_anterior_jubilacion: 628717.06,
  provision_anterior_desahucio: 402791.62,
  pagos_realizados_jubilacion: 0.00,
  pagos_realizados_desahucio: 89444.12
};
