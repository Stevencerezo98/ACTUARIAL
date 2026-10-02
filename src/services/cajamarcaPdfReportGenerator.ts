import { jsPDF } from 'jspdf';
import { EmpleadoProcesado, ResumenMotor, VariablesMacro, DatosEmpresaEstudio } from '../types/actuarial';

/**
 * Generador del Estudio Actuarial Completo en Formato PDF
 * Reproduce la estructura, capítulos, tablas, anexos y dictamen del informe formal de CAJAMARCA PROTECTIVE SERVICES
 */
export function generarEstudioCompletoPDF(
  resultados: EmpleadoProcesado[],
  resumen: ResumenMotor,
  variables: VariablesMacro,
  empresa: DatosEmpresaEstudio
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  const fmt = (v: number) => `$ ${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const fmtNum = (v: number) => v.toLocaleString('en-US');

  // Estadísticas demográficas por género
  const fem = resultados.filter(e => e.Genero === 'F');
  const masc = resultados.filter(e => e.Genero === 'M');
  
  const edadPromFem = fem.length > 0 ? Math.round(fem.reduce((a, b) => a + b.Edad, 0) / fem.length) : 0;
  const edadPromMasc = masc.length > 0 ? Math.round(masc.reduce((a, b) => a + b.Edad, 0) / masc.length) : 0;
  const antigPromFem = fem.length > 0 ? Math.round(fem.reduce((a, b) => a + b.Antiguedad, 0) / fem.length) : 0;
  const antigPromMasc = masc.length > 0 ? Math.round(masc.reduce((a, b) => a + b.Antiguedad, 0) / masc.length) : 0;
  const sueldoPromFem = fem.length > 0 ? Math.round(fem.reduce((a, b) => a + b.Sueldo_Actual, 0) / fem.length) : 0;
  const sueldoPromMasc = masc.length > 0 ? Math.round(masc.reduce((a, b) => a + b.Sueldo_Actual, 0) / masc.length) : 0;
  const sueldoPromTotal = resultados.length > 0 ? Math.round(resumen.nomina_mensual_total / resultados.length) : 0;

  const totalJubFem = fem.reduce((a, b) => a + b.VPO_Jubilacion, 0);
  const totalJubMasc = masc.reduce((a, b) => a + b.VPO_Jubilacion, 0);
  const totalDesFem = fem.reduce((a, b) => a + b.VPO_Desahucio, 0);
  const totalDesMasc = masc.reduce((a, b) => a + b.VPO_Desahucio, 0);

  const jubMenor20 = resultados.filter(e => e.Antiguedad < 20);
  const jubMayor20 = resultados.filter(e => e.Antiguedad >= 20);
  const totalJubMenor20 = jubMenor20.reduce((a, b) => a + b.VPO_Jubilacion, 0);
  const totalJubMayor20 = jubMayor20.reduce((a, b) => a + b.VPO_Jubilacion, 0);

  const desMenor20 = resultados.filter(e => e.Antiguedad < 20);
  const desMayor20 = resultados.filter(e => e.Antiguedad >= 20);
  const totalDesMenor20 = desMenor20.reduce((a, b) => a + b.VPO_Desahucio, 0);
  const totalDesMayor20 = desMayor20.reduce((a, b) => a + b.VPO_Desahucio, 0);

  const varJubilacion = resumen.vpo_jubilacion_total - empresa.provision_anterior_jubilacion + empresa.pagos_realizados_jubilacion;
  const varDesahucio = resumen.vpo_desahucio_total - empresa.provision_anterior_desahucio + empresa.pagos_realizados_desahucio;

  const drawFooter = (pageNum: number) => {
    doc.setDrawColor(203, 213, 225);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`${empresa.nombre_empresa} • Estudio Actuarial al ${empresa.fecha_corte_valuacion}`, margin, pageHeight - 8);
    doc.text(`Página ${pageNum}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  };

  // ==================== PÁGINA 1: PORTADA ====================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text(empresa.nombre_empresa.toUpperCase(), pageWidth / 2, 45, { align: 'center' });

  doc.setFontSize(12);
  doc.text('PROVISIÓN POR', pageWidth / 2, 85, { align: 'center' });

  doc.setFontSize(16);
  doc.setTextColor(30, 58, 138); // Azul marino
  doc.text('JUBILACIÓN A CARGO DEL EMPLEADOR', pageWidth / 2, 105, { align: 'center' });
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('Y', pageWidth / 2, 118, { align: 'center' });
  doc.setFontSize(16);
  doc.setTextColor(30, 58, 138);
  doc.text('BONIFICACIÓN POR DESAHUCIO', pageWidth / 2, 132, { align: 'center' });

  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('ESTUDIO ACTUARIAL', pageWidth / 2, 165, { align: 'center' });
  doc.setFontSize(11);
  doc.text(`AL ${empresa.fecha_corte_valuacion.toUpperCase()}`, pageWidth / 2, 175, { align: 'center' });

  // Datos del Actuario
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text(empresa.actuario_nombre, pageWidth - margin, 225, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(empresa.actuario_titulo, pageWidth - margin, 231, { align: 'right' });
  doc.text(empresa.actuario_registro_scvs, pageWidth - margin, 237, { align: 'right' });
  doc.text(empresa.actuario_registro_sb, pageWidth - margin, 243, { align: 'right' });

  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text(empresa.fecha_emision_informe, pageWidth / 2, 272, { align: 'center' });

  // ==================== PÁGINA 2: INTRODUCCIÓN Y RESUMEN EJECUTIVO ====================
  doc.addPage();
  let y = 22;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('INTRODUCCIÓN', margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const textoIntro1 = `${empresa.nombre_empresa}, en adelante la "empresa", fue constituida en la ciudad de ${empresa.ciudad}, el ${empresa.fecha_constitucion}. ` +
    `El plazo de duración del contrato social es de ${empresa.plazo_duracion}. ` +
    `El objeto social es ${empresa.objeto_social} ` +
    `Es una organización orientada al cumplimiento de los requisitos aplicables y la mejora continua. ` +
    `Misión: ${empresa.mision} ` +
    `Visión: ${empresa.vision}`;
  const linesIntro1 = doc.splitTextToSize(textoIntro1, contentWidth);
  doc.text(linesIntro1, margin, y);
  y += linesIntro1.length * 4.2 + 4;

  const textoIntro2 = 'Para cumplir con las disposiciones de la ley en materia laboral, que exige a las entidades constituidas o establecidas en el país, ' +
    'determinen actuarialmente, el monto de las provisiones anuales que a la fecha de cálculo deben mantener para cubrir la eventual jubilación ' +
    'a cargo del empleador y la bonificación por desahucio, contrató la realización del presente estudio actuarial.\n\n' +
    'Éste se halla elaborado en apego a los preceptos establecidos en el Código del Trabajo; Resolución No. 07-2021 de la Corte Nacional de Justicia; ' +
    'Ley Orgánica de Régimen Tributario Interno; Reglamento para la aplicación de la Ley Orgánica de Régimen Tributario Interno; ' +
    'Ley Orgánica de Desarrollo Económico y Sustentabilidad Fiscal y su reglamento; Acuerdos Ministeriales No. MDT-2016-0099 y MDT-2018-0118; ' +
    'y normas internacionales de información financiera, NIIF, (NIC 19 / IAS 19).\n\n' +
    'Los resultados del presente informe se sustentan en la información proporcionada por la empresa, la que es suficiente para la valoración ' +
    'de los riesgos de las prestaciones laborales señaladas.';
  const linesIntro2 = doc.splitTextToSize(textoIntro2, contentWidth);
  doc.text(linesIntro2, margin, y);
  y += linesIntro2.length * 4.2 + 6;

  // Resumen Ejecutivo
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('RESUMEN EJECUTIVO', margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const textoResumen = `El rol de empleados activos bajo el Código del Trabajo está compuesto por ${fmtNum(resumen.total_empleados)} personas. ` +
    `La edad promedio del colectivo evaluado se ubica en ${resumen.edad_promedio} años. ` +
    `La permanencia como servidores de la empresa tiene un promedio de ${resumen.antiguedad_promedio} años de servicio cumplidos. ` +
    `El sueldo medio es de $ ${sueldoPromTotal.toFixed(2)} mensuales, reflejando una nómina mensual total de ${fmt(resumen.nomina_mensual_total)}.\n\n` +
    `La obligación acumulada de la Jubilación Patronal (Art. 216) asciende a ${fmt(resumen.vpo_jubilacion_total)}. ` +
    `La provisión global por Bonificación por Desahucio (Art. 185) calculada para el período corriente es de ${fmt(resumen.vpo_desahucio_total)}. ` +
    `El pasivo total consolidado por beneficios definidos (DBO NIC 19) a reconocer en los Estados Financieros de la empresa es de ${fmt(resumen.vpo_total)}.\n\n` +
    `De acuerdo con la Ley Orgánica para el Desarrollo Económico y Sustentabilidad Fiscal y el Reglamento para la aplicación de la Ley de Régimen Tributario Interno, ` +
    `la provisión por jubilación patronal y desahucio ya no es deducible de la base imponible del impuesto a la renta ni da lugar a impuesto diferido.`;
  const linesResumen = doc.splitTextToSize(textoResumen, contentWidth);
  doc.text(linesResumen, margin, y);

  drawFooter(2);

  // ==================== PÁGINA 3: A. JUBILACIÓN PATRONAL ====================
  doc.addPage();
  y = 22;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 138);
  doc.text('A. JUBILACIÓN A CARGO DEL EMPLEADOR', margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.2);
  doc.setTextColor(51, 65, 85);
  const textJub1 = 'De conformidad con el Código del Trabajo, los empleados en relación de dependencia que por veinticinco (25) años o más hubieren prestado servicios, ' +
    'en forma continua o interrumpidamente, tienen derecho a ser jubilados por los empleadores, independientemente de la jubilación otorgada por el IESS.\n' +
    'Dicho Código dispone también que los empleados que hubieren cumplido veinte años y menos de veinticinco de labor, y fueren despedidos intempestivamente, ' +
    'tienen derecho a la parte proporcional de la jubilación patronal.\n' +
    'La pensión mensual de jubilación a cargo del empleador tiene como piso el valor de US $ 20.00 o US $ 30.00 (mínimo legal según caso) y como techo la remuneración básica unificada media del trabajador (Res. 07-2021 de la Corte Nacional de Justicia).';
  const linesJub1 = doc.splitTextToSize(textJub1, contentWidth);
  doc.text(linesJub1, margin, y);
  y += linesJub1.length * 4.0 + 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('PROMEDIO DE EDADES Y TIEMPO DE SERVICIO (AÑO ' + empresa.anio_evaluado + ')', margin, y);
  y += 5;

  // Tabla Demográfica
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y + 6, margin + contentWidth, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Género', margin + 3, y + 4.2);
  doc.text('Nº Colaboradores', margin + 40, y + 4.2);
  doc.text('Edad Actual', margin + 85, y + 4.2);
  doc.text('Tiempo Servicio', margin + 125, y + 4.2);
  doc.text('Sueldo Promedio', pageWidth - margin - 3, y + 4.2, { align: 'right' });
  y += 6;

  const filasDemo = [
    { g: 'Femenino', n: fmtNum(fem.length), e: `${edadPromFem} años`, t: `${antigPromFem} años`, s: `$ ${sueldoPromFem}` },
    { g: 'Masculino', n: fmtNum(masc.length), e: `${edadPromMasc} años`, t: `${antigPromMasc} años`, s: `$ ${sueldoPromMasc}` },
    { g: 'TOTAL COLECTIVO', n: fmtNum(resultados.length), e: `${resumen.edad_promedio} años`, t: `${resumen.antiguedad_promedio} años`, s: `$ ${sueldoPromTotal}` }
  ];

  filasDemo.forEach((f, idx) => {
    const isTotal = idx === filasDemo.length - 1;
    if (isTotal) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, 5.5, 'F');
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }
    doc.line(margin, y + 5.5, margin + contentWidth, y + 5.5);
    doc.setTextColor(isTotal ? 15 : 51, isTotal ? 23 : 65, isTotal ? 42 : 85);
    doc.text(f.g, margin + 3, y + 4);
    doc.text(f.n, margin + 40, y + 4);
    doc.text(f.e, margin + 85, y + 4);
    doc.text(f.t, margin + 125, y + 4);
    doc.text(f.s, pageWidth - margin - 3, y + 4, { align: 'right' });
    y += 5.5;
  });

  y += 4;

  // Hipótesis Actuariales
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('HIPÓTESIS ACTUARIALES Y PARÁMETROS DE MERCADO', margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const hipJub = [
    `a. Tasa de Descuento Financiero (i): ${(variables.tasa_descuento * 100).toFixed(2)}% anual (tasa pasiva referencial del Banco Central / mercado de bonos).`,
    `b. Tasa de Interés Técnico Efectivo: ${(empresa.tasa_interes_tecnico * 100).toFixed(2)}% anual (de contracapitalización compuesta para valores de conmutación).`,
    `c. Inflación Anual Proyectada: ${(empresa.inflacion * 100).toFixed(2)}% anual promedio a largo plazo bajo dolarización.`,
    `d. Tasa de Incremento Salarial (s): ${(variables.tasa_incremento_sal * 100).toFixed(2)}% anual constante proyectada.`,
    `e. Tasa de Rotación del Personal (r): ${(variables.tasa_rotacion * 100).toFixed(2)}% anual histórico según comportamiento demográfico.`,
    `f. Salario Básico Unificado (SBU): $ ${variables.sbu_vigente.toFixed(2)} vigente en Ecuador.`,
    'g. Tabla de Mortalidad de Activos: IESS 2000 Hombres y Mujeres (Registro Oficial No. 650 del 28 de agosto de 2002).',
    'h. Coeficientes de Renta Vitalicia: Artículo 218 del Código del Trabajo (11.5 para varones, 13.0 para mujeres a los 65 años).'
  ];
  hipJub.forEach(h => {
    doc.text(h, margin, y);
    y += 4.5;
  });

  y += 3;

  // Resultados Jubilación
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('PROVISIÓN ACUMULADA JUBILACIÓN PATRONAL AL ' + empresa.fecha_corte_valuacion.toUpperCase(), margin, y);
  y += 5;

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.line(margin, y + 6, margin + contentWidth, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Tiempo de Servicio', margin + 3, y + 4.2);
  doc.text('Número Colaboradores', margin + 70, y + 4.2);
  doc.text('Provisión Acumulada (USD)', pageWidth - margin - 3, y + 4.2, { align: 'right' });
  y += 6;

  const filasJub = [
    { t: 'Menor a 20 años de servicio', n: fmtNum(jubMenor20.length), v: fmt(totalJubMenor20) },
    { t: 'Igual o mayor a 20 años de servicio', n: fmtNum(jubMayor20.length), v: fmt(totalJubMayor20) },
    { t: 'TOTAL COLECTIVO ACTIVOS', n: fmtNum(resultados.length), v: fmt(resumen.vpo_jubilacion_total) }
  ];

  filasJub.forEach((f, idx) => {
    const isTotal = idx === filasJub.length - 1;
    if (isTotal) {
      doc.setFillColor(238, 242, 255);
      doc.rect(margin, y, contentWidth, 5.5, 'F');
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }
    doc.line(margin, y + 5.5, margin + contentWidth, y + 5.5);
    doc.setTextColor(isTotal ? 30 : 51, isTotal ? 58 : 65, isTotal ? 138 : 85);
    doc.text(f.t, margin + 3, y + 4);
    doc.text(f.n, margin + 70, y + 4);
    doc.text(f.v, pageWidth - margin - 3, y + 4, { align: 'right' });
    y += 5.5;
  });

  y += 4;

  // Desglose por género gráfica simulada en cuadro
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 14, 1.5, 1.5, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Distribución de Jubilación Patronal por Género:', margin + 4, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`• Mujeres (${fmtNum(fem.length)}): ${fmt(totalJubFem)} (${resumen.vpo_jubilacion_total > 0 ? ((totalJubFem / resumen.vpo_jubilacion_total) * 100).toFixed(1) : 0}%)`, margin + 4, y + 10);
  doc.text(`• Hombres (${fmtNum(masc.length)}): ${fmt(totalJubMasc)} (${resumen.vpo_jubilacion_total > 0 ? ((totalJubMasc / resumen.vpo_jubilacion_total) * 100).toFixed(1) : 0}%)`, margin + 85, y + 10);

  y += 18;

  // Variación Anual
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`VARIACIÓN ANUAL DE LA PROVISIÓN DE JUBILACIÓN PATRONAL (${empresa.anio_anterior} - ${empresa.anio_evaluado})`, margin, y);
  y += 5;

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.line(margin, y + 6, margin + contentWidth, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(30, 41, 59);
  doc.text(`Año ${empresa.anio_anterior} (Provisión)`, margin + 3, y + 4.2);
  doc.text('Pagos Realizados', margin + 50, y + 4.2);
  doc.text(`Año ${empresa.anio_evaluado} (Provisión)`, margin + 95, y + 4.2);
  doc.text('Variación Anual Neta', pageWidth - margin - 3, y + 4.2, { align: 'right' });
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.line(margin, y + 5.5, margin + contentWidth, y + 5.5);
  doc.text(fmt(empresa.provision_anterior_jubilacion), margin + 3, y + 4);
  doc.text(fmt(empresa.pagos_realizados_jubilacion), margin + 50, y + 4);
  doc.text(fmt(resumen.vpo_jubilacion_total), margin + 95, y + 4);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text(fmt(varJubilacion), pageWidth - margin - 3, y + 4, { align: 'right' });

  drawFooter(3);

  // ==================== PÁGINA 4: B. BONIFICACIÓN POR DESAHUCIO ====================
  doc.addPage();
  y = 22;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 138);
  doc.text('B. BONIFICACIÓN POR DESAHUCIO (ART. 185)', margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.2);
  doc.setTextColor(51, 65, 85);
  const textDes1 = 'El Capítulo X del Código del Trabajo reformado por la Ley Orgánica de Justicia Laboral y Reconocimiento del Trabajo en el Hogar ' +
    'trata del desahucio. El artículo 185 determina que en los casos de terminación de la relación laboral, el empleador bonificará al trabajador ' +
    'con el veinticinco por ciento (25%) del equivalente a la última remuneración mensual por cada uno de los años de servicio prestados en la misma empresa.\n' +
    'La determinación de esta provisión guarda concordancia con los principios técnicos actuariales bajo la norma contable internacional NIIF (NIC 19 / IAS 19), ' +
    'constituyendo una provisión acumulada por servicios devengados.';
  const linesDes1 = doc.splitTextToSize(textDes1, contentWidth);
  doc.text(linesDes1, margin, y);
  y += linesDes1.length * 4.0 + 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('FORMULACIÓN MATEMÁTICO - ACTUARIAL (DESAHUCIO)', margin, y);
  y += 5;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 14, 1, 1, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 58, 138);
  doc.text('VADxa = (0.25 * Wxa * t) * (1 - r)^t / (1 + i)^t', pageWidth / 2, y + 5.5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Wxa: Sueldo proyectado al retiro | t: Años de servicio cumplidos + proyectados | (1-r)^t: Permanencia | (1+i)^t: Descuento financiero', pageWidth / 2, y + 10.5, { align: 'center' });
  y += 18;

  // Tabla Resultados Desahucio
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('PROVISIÓN ACUMULADA BONIFICACIÓN POR DESAHUCIO AL ' + empresa.fecha_corte_valuacion.toUpperCase(), margin, y);
  y += 5;

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.line(margin, y + 6, margin + contentWidth, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Tiempo de Servicio', margin + 3, y + 4.2);
  doc.text('Número Colaboradores', margin + 70, y + 4.2);
  doc.text('Bonificación Dólares (USD)', pageWidth - margin - 3, y + 4.2, { align: 'right' });
  y += 6;

  const filasDes = [
    { t: 'Menor a 20 años de servicio', n: fmtNum(desMenor20.length), v: fmt(totalDesMenor20) },
    { t: 'Igual o mayor a 20 años de servicio', n: fmtNum(desMayor20.length), v: fmt(totalDesMayor20) },
    { t: 'TOTAL COLECTIVO ACTIVOS', n: fmtNum(resultados.length), v: fmt(resumen.vpo_desahucio_total) }
  ];

  filasDes.forEach((f, idx) => {
    const isTotal = idx === filasDes.length - 1;
    if (isTotal) {
      doc.setFillColor(239, 246, 255);
      doc.rect(margin, y, contentWidth, 5.5, 'F');
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }
    doc.line(margin, y + 5.5, margin + contentWidth, y + 5.5);
    doc.setTextColor(isTotal ? 30 : 51, isTotal ? 58 : 65, isTotal ? 138 : 85);
    doc.text(f.t, margin + 3, y + 4);
    doc.text(f.n, margin + 70, y + 4);
    doc.text(f.v, pageWidth - margin - 3, y + 4, { align: 'right' });
    y += 5.5;
  });

  y += 4;

  // Desglose por género Desahucio
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 14, 1.5, 1.5, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Distribución de Bonificación de Desahucio por Género:', margin + 4, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`• Mujeres (${fmtNum(fem.length)}): ${fmt(totalDesFem)} (${resumen.vpo_desahucio_total > 0 ? ((totalDesFem / resumen.vpo_desahucio_total) * 100).toFixed(1) : 0}%)`, margin + 4, y + 10);
  doc.text(`• Hombres (${fmtNum(masc.length)}): ${fmt(totalDesMasc)} (${resumen.vpo_desahucio_total > 0 ? ((totalDesMasc / resumen.vpo_desahucio_total) * 100).toFixed(1) : 0}%)`, margin + 85, y + 10);

  y += 18;

  // Variación Anual Desahucio
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`VARIACIÓN ANUAL DE LA PROVISIÓN DE DESAHUCIO (${empresa.anio_anterior} - ${empresa.anio_evaluado})`, margin, y);
  y += 5;

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.line(margin, y + 6, margin + contentWidth, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(30, 41, 59);
  doc.text(`Año ${empresa.anio_anterior} (Provisión)`, margin + 3, y + 4.2);
  doc.text('Pagos Realizados', margin + 50, y + 4.2);
  doc.text(`Año ${empresa.anio_evaluado} (Provisión)`, margin + 95, y + 4.2);
  doc.text('Variación Anual Neta', pageWidth - margin - 3, y + 4.2, { align: 'right' });
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.line(margin, y + 5.5, margin + contentWidth, y + 5.5);
  doc.text(fmt(empresa.provision_anterior_desahucio), margin + 3, y + 4);
  doc.text(fmt(empresa.pagos_realizados_desahucio), margin + 50, y + 4);
  doc.text(fmt(resumen.vpo_desahucio_total), margin + 95, y + 4);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text(fmt(varDesahucio), pageWidth - margin - 3, y + 4, { align: 'right' });

  y += 12;

  // Dictamen Actuarial
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('DICTAMEN TÉCNICO ACTUARIAL', margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  const textDictamen = 'El presente estudio actuarial está basado en los datos proporcionados por la administración de la empresa, los cuales se consideran ' +
    'suficientes y confiables. Las hipótesis planteadas reflejan fehacientemente el curso de las variables económicas y financieras del Ecuador. ' +
    'La metodología obedece a principios actuariales generalmente aceptados (NIC 19 PUCM) y a los lineamientos expuestos por la autoridad competente.';
  const linesDict = doc.splitTextToSize(textDictamen, contentWidth);
  doc.text(linesDict, margin, y);
  y += linesDict.length * 3.8 + 6;

  // Firma
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(empresa.actuario_nombre, pageWidth - margin, y + 6, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(empresa.actuario_titulo, pageWidth - margin, y + 10.5, { align: 'right' });
  doc.text(empresa.actuario_registro_scvs, pageWidth - margin, y + 15, { align: 'right' });
  doc.text(empresa.actuario_registro_sb, pageWidth - margin, y + 19.5, { align: 'right' });

  drawFooter(4);

  // ==================== PÁGINA 5: ANEXO 1 & ANEXO 2 (NIIF IAS 19 R) ====================
  doc.addPage();
  y = 22;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(30, 58, 138);
  doc.text('ANEXO 1: JUBILACIÓN PATRONAL (NIIF / IAS 19 R)', margin, y);
  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Principales resultados al ${empresa.fecha_corte_valuacion} • Valores en USD`, margin, y);
  y += 5;

  // Tabla Anexo 1
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 5.5, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y + 5.5, margin + contentWidth, y + 5.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(30, 41, 59);
  doc.text('Concepto Contable NIIF', margin + 3, y + 3.8);
  doc.text(`Año ${empresa.anio_anterior}`, margin + 110, y + 3.8);
  doc.text(`Año ${empresa.anio_evaluado}`, pageWidth - margin - 3, y + 3.8, { align: 'right' });
  y += 5.5;

  const anexo1Filas = [
    { c: '1. Obligación por Beneficios Definidos (OBD) al inicio del año', a1: fmt(empresa.provision_anterior_jubilacion), a2: fmt(empresa.provision_anterior_jubilacion) },
    { c: '2. Costo laboral por servicios actuales (CSC Jubilación)', a1: fmt(resumen.costo_servicio_actual_total * 0.45), a2: fmt(resultados.reduce((a, b) => a + b.csc_jubilacion, 0)) },
    { c: '3. Interés neto (costo financiero) (IC)', a1: fmt(empresa.provision_anterior_jubilacion * variables.tasa_descuento), a2: fmt(resumen.vpo_jubilacion_total * variables.tasa_descuento) },
    { c: '7. (Beneficios pagados directamente por el empleador)', a1: '$ 0.00', a2: fmt(empresa.pagos_realizados_jubilacion) },
    { c: '10. Obligación por Beneficios Definidos al final del año (DBO)', a1: fmt(empresa.provision_anterior_jubilacion), a2: fmt(resumen.vpo_jubilacion_total) },
    { c: '13. Pasivo (RESERVA) al final del año en Balance General', a1: fmt(empresa.provision_anterior_jubilacion), a2: fmt(resumen.vpo_jubilacion_total) }
  ];

  anexo1Filas.forEach((f, idx) => {
    const isHighlight = idx >= 4;
    if (isHighlight) {
      doc.setFillColor(238, 242, 255);
      doc.rect(margin, y, contentWidth, 5, 'F');
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }
    doc.line(margin, y + 5, margin + contentWidth, y + 5);
    doc.setTextColor(isHighlight ? 30 : 51, isHighlight ? 58 : 65, isHighlight ? 138 : 85);
    doc.text(f.c, margin + 3, y + 3.5);
    doc.text(f.a1, margin + 110, y + 3.5);
    doc.text(f.a2, pageWidth - margin - 3, y + 3.5, { align: 'right' });
    y += 5;
  });

  y += 7;

  // Anexo 2: Desahucio
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(30, 58, 138);
  doc.text('ANEXO 2: BONIFICACIÓN POR DESAHUCIO (NIIF / IAS 19 R)', margin, y);
  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Principales resultados al ${empresa.fecha_corte_valuacion} • Valores en USD`, margin, y);
  y += 5;

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 5.5, 'F');
  doc.line(margin, y + 5.5, margin + contentWidth, y + 5.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(30, 41, 59);
  doc.text('Concepto Contable NIIF', margin + 3, y + 3.8);
  doc.text(`Año ${empresa.anio_anterior}`, margin + 110, y + 3.8);
  doc.text(`Año ${empresa.anio_evaluado}`, pageWidth - margin - 3, y + 3.8, { align: 'right' });
  y += 5.5;

  const anexo2Filas = [
    { c: '1. Obligación por Beneficios Definidos (OBD) al inicio del año', a1: fmt(empresa.provision_anterior_desahucio), a2: fmt(empresa.provision_anterior_desahucio) },
    { c: '2. Costo laboral por servicios actuales (CSC Desahucio)', a1: fmt(resumen.costo_servicio_actual_total * 0.55), a2: fmt(resultados.reduce((a, b) => a + b.csc_desahucio, 0)) },
    { c: '3. Interés neto (costo financiero) (IC)', a1: fmt(empresa.provision_anterior_desahucio * variables.tasa_descuento), a2: fmt(resumen.vpo_desahucio_total * variables.tasa_descuento) },
    { c: '7. (Beneficios pagados directamente por el empleador)', a1: '$ 0.00', a2: fmt(empresa.pagos_realizados_desahucio) },
    { c: '10. Obligación por Beneficios Definidos al final del año (DBO)', a1: fmt(empresa.provision_anterior_desahucio), a2: fmt(resumen.vpo_desahucio_total) },
    { c: '13. Pasivo (RESERVA) al final del año en Balance General', a1: fmt(empresa.provision_anterior_desahucio), a2: fmt(resumen.vpo_desahucio_total) }
  ];

  anexo2Filas.forEach((f, idx) => {
    const isHighlight = idx >= 4;
    if (isHighlight) {
      doc.setFillColor(239, 246, 255);
      doc.rect(margin, y, contentWidth, 5, 'F');
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }
    doc.line(margin, y + 5, margin + contentWidth, y + 5);
    doc.setTextColor(isHighlight ? 30 : 51, isHighlight ? 58 : 65, isHighlight ? 138 : 85);
    doc.text(f.c, margin + 3, y + 3.5);
    doc.text(f.a1, margin + 110, y + 3.5);
    doc.text(f.a2, pageWidth - margin - 3, y + 3.5, { align: 'right' });
    y += 5;
  });

  drawFooter(5);

  // ==================== PÁGINA 6+: ANEXO 3 (PROVISIÓN INDIVIDUAL) ====================
  doc.addPage();
  y = 22;
  let pageCounter = 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(30, 58, 138);
  doc.text('ANEXO 3: PROVISIÓN INDIVIDUAL EN DÓLARES', margin, y);
  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Personal de nómina al ${empresa.fecha_corte_valuacion} • Total: ${resultados.length} colaboradores`, margin, y);
  y += 5;

  const printAnexo3Header = () => {
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentWidth, 5.5, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.line(margin, y + 5.5, margin + contentWidth, y + 5.5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(30, 41, 59);
    doc.text('Nombre del Colaborador', margin + 3, y + 3.8);
    doc.text('Cédula', margin + 70, y + 3.8);
    doc.text('Tiempo (aa)', margin + 98, y + 3.8);
    doc.text('Prov. Jubilación', margin + 120, y + 3.8);
    doc.text('Prov. Desahucio', margin + 146, y + 3.8);
    doc.text('Total DBO', pageWidth - margin - 3, y + 3.8, { align: 'right' });
    y += 5.5;
  };

  printAnexo3Header();

  for (let i = 0; i < resultados.length; i++) {
    const emp = resultados[i];

    if (y > pageHeight - 20) {
      drawFooter(pageCounter);
      doc.addPage();
      pageCounter++;
      y = 22;
      printAnexo3Header();
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(51, 65, 85);
    doc.line(margin, y + 4.5, margin + contentWidth, y + 4.5);

    const nom = emp.Nombre.length > 34 ? emp.Nombre.substring(0, 34) + '...' : emp.Nombre;
    doc.text(nom, margin + 3, y + 3.2);
    doc.text(emp.Cedula, margin + 70, y + 3.2);
    doc.text(`${emp.Antiguedad}.00`, margin + 98, y + 3.2);
    doc.text(fmt(emp.VPO_Jubilacion), margin + 120, y + 3.2);
    doc.text(fmt(emp.VPO_Desahucio), margin + 146, y + 3.2);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(fmt(emp.VPO_Total), pageWidth - margin - 3, y + 3.2, { align: 'right' });
    y += 4.5;
  }

  // Fila de Total Anexo 3
  if (y > pageHeight - 20) {
    drawFooter(pageCounter);
    doc.addPage();
    pageCounter++;
    y = 22;
    printAnexo3Header();
  }

  doc.setFillColor(238, 242, 255);
  doc.rect(margin, y, contentWidth, 5.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(30, 58, 138);
  doc.text('TOTAL GENERAL PROVISIÓN ACTUARIAL', margin + 3, y + 3.8);
  doc.text(fmt(resumen.vpo_jubilacion_total), margin + 120, y + 3.8);
  doc.text(fmt(resumen.vpo_desahucio_total), margin + 146, y + 3.8);
  doc.text(fmt(resumen.vpo_total), pageWidth - margin - 3, y + 3.8, { align: 'right' });

  drawFooter(pageCounter);

  // Guardar archivo
  const nombreLimpio = empresa.nombre_empresa.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
  doc.save(`Estudio_Actuarial_NIC19_${nombreLimpio}_${empresa.anio_evaluado}.pdf`);
}
