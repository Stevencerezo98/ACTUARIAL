import { jsPDF } from 'jspdf';
import { EmpleadoProcesado, VariablesMacro } from '../types/actuarial';

/**
 * Generador de Reporte / Ficha Actuarial Individual en formato PDF
 * Cumple con NIC 19 / IAS 19 y Código del Trabajo del Ecuador (Art. 185 y 216)
 * Diseñado para entrega contable, auditoría y expediente individual de recursos humanos.
 */
export function generarFichaActuarialPDF(
  empleado: EmpleadoProcesado,
  variables: VariablesMacro
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  const fmt = (v: number) => `$ ${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const fechaHoy = new Date().toLocaleDateString('es-EC', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let y = 14;

  // --- ENCABEZADO INSTITUCIONAL ---
  doc.setFillColor(30, 58, 138); // Azul institucional #1e3a8a
  doc.rect(margin, y, contentWidth, 20, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('FICHA TÉCNICA ACTUARIAL INDIVIDUAL - NIC 19', margin + 5, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('VALUACIÓN DE BENEFICIOS POR RETIRO • CÓDIGO DEL TRABAJO DEL ECUADOR', margin + 5, y + 13);
  doc.text(`Fecha de Emisión: ${fechaHoy}`, pageWidth - margin - 5, y + 13, { align: 'right' });

  y += 24;

  // --- SECCIÓN 1: DATOS GENERALES DEL TRABAJADOR ---
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y + 6, margin + contentWidth, y + 6);

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('1. INFORMACIÓN DEMOGRÁFICA Y CONTRACTUAL', margin + 3, y + 4.5);

  y += 8;

  // Cuadro de datos del empleado
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, y, contentWidth, 22, 'S');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);

  const col1 = margin + 4;
  const col2 = margin + 48;
  const col3 = margin + 102;
  const col4 = margin + 142;

  // Fila 1
  doc.text('Cédula / ID:', col1, y + 5);
  doc.text('Nombre del Colaborador:', col2, y + 5);
  doc.text('Género:', col4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(String(empleado.Cedula), col1, y + 9.5);
  doc.setFont('helvetica', 'bold');
  doc.text(empleado.Nombre.length > 36 ? empleado.Nombre.substring(0, 36) + '...' : empleado.Nombre, col2, y + 9.5);
  doc.setFont('helvetica', 'normal');
  doc.text(empleado.Genero === 'M' ? 'Masculino (M)' : 'Femenino (F)', col4, y + 9.5);

  // Fila 2
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Edad Actual:', col1, y + 15);
  doc.text('Antigüedad de Servicio:', col2, y + 15);
  doc.text('Cargo / Puesto:', col3, y + 15);
  doc.text('Sueldo Actual Mensual:', col4, y + 15);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${empleado.Edad} años`, col1, y + 19.5);
  doc.text(`${empleado.Antiguedad} años cumplidos`, col2, y + 19.5);
  doc.text(empleado.Cargo || 'Colaborador', col3, y + 19.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 101, 52); // Verde
  doc.text(fmt(empleado.Sueldo_Actual), col4, y + 19.5);

  y += 26;

  // --- SECCIÓN 2: HIPÓTESIS ACTUARIALES Y PROYECCIÓN ---
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.line(margin, y + 6, margin + contentWidth, y + 6);

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('2. PARÁMETROS ACTUARIALES Y PROYECCIÓN AL RETIRO', margin + 3, y + 4.5);

  y += 8;

  // Grid de 6 métricas
  const boxW = (contentWidth - 6) / 4;
  const boxH = 15;

  const metricas = [
    { label: 'Tasa Descuento (i)', val: `${(variables.tasa_descuento * 100).toFixed(2)}%` },
    { label: 'Incremento Salarial (s)', val: `${(variables.tasa_incremento_sal * 100).toFixed(2)}%` },
    { label: 'Tasa Rotación (r)', val: `${(variables.tasa_rotacion * 100).toFixed(2)}%` },
    { label: 'SBU Vigente', val: `$ ${variables.sbu_vigente.toFixed(2)}` },
    { label: 'Años al Retiro (65a)', val: `${empleado.anios_faltantes} años` },
    { label: 'Antigüedad al Retiro', val: `${empleado.antiguedad_al_retiro} años` },
    { label: 'Sueldo Proyectado', val: fmt(empleado.sueldo_proyectado) },
    { label: 'Prob. Permanencia (1-r)ᵗ', val: empleado.prob_permanencia.toFixed(4) },
  ];

  metricas.forEach((m, idx) => {
    const row = Math.floor(idx / 4);
    const col = idx % 4;
    const bx = margin + col * (boxW + 2);
    const by = y + row * (boxH + 2);

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(bx, by, boxW, boxH, 1, 1, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(m.label, bx + boxW / 2, by + 5, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(m.val, bx + boxW / 2, by + 11.5, { align: 'center' });
  });

  y += (boxH + 2) * 2 + 4;

  // --- SECCIÓN 3: CÁLCULO DE DESAHUCIO (ART. 185) ---
  doc.setFillColor(239, 246, 255); // Azul suave
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setDrawColor(191, 219, 254);
  doc.line(margin, y + 6, margin + contentWidth, y + 6);

  doc.setTextColor(29, 78, 216);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('3. BONIFICACIÓN POR DESAHUCIO (ART. 185 DEL CÓDIGO DEL TRABAJO)', margin + 3, y + 4.5);

  y += 8;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 31, 'S');

  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);

  const d1 = y + 5;
  doc.setFont('helvetica', 'normal');
  doc.text('• Base Legal y Beneficio Bruto:', margin + 4, d1);
  doc.setFont('helvetica', 'bold');
  doc.text('25% del Sueldo Proyectado × Años de Antigüedad al Retiro', margin + 55, d1);

  const d2 = y + 10;
  doc.setFont('helvetica', 'normal');
  doc.text('• Fórmula Aplicada:', margin + 4, d2);
  doc.setFont('helvetica', 'bold');
  doc.text(`0.25 × ${fmt(empleado.sueldo_proyectado)} × ${empleado.antiguedad_al_retiro} años = ${fmt(empleado.beneficio_desahucio)}`, margin + 55, d2);

  const d3 = y + 15;
  doc.setFont('helvetica', 'normal');
  doc.text('• Factores Actuariales:', margin + 4, d3);
  doc.text(`Descuento (1+i)ᵗ: ${(empleado.factor_descuento).toFixed(4)}   |   Permanencia (1-r)ᵗ: ${(empleado.prob_permanencia).toFixed(4)}`, margin + 55, d3);

  const d4 = y + 20;
  doc.setFont('helvetica', 'normal');
  doc.text('• Costo Servicio Actual (CSC):', margin + 4, d4);
  doc.setFont('helvetica', 'bold');
  doc.text(`${fmt(empleado.csc_desahucio)} (devengo del ejercicio bajo PUCM)`, margin + 55, d4);

  // Box destacado de VPO Desahucio
  doc.setFillColor(219, 234, 254);
  doc.roundedRect(margin + 4, y + 23, contentWidth - 8, 6.5, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 64, 175);
  doc.text('VALOR PRESENTE DE LA OBLIGACIÓN (VPO DESAHUCIO):', margin + 8, y + 27.5);
  doc.text(fmt(empleado.VPO_Desahucio), pageWidth - margin - 8, y + 27.5, { align: 'right' });

  y += 35;

  // --- SECCIÓN 4: CÁLCULO DE JUBILACIÓN PATRONAL (ART. 216) ---
  doc.setFillColor(250, 245, 255); // Púrpura suave
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setDrawColor(233, 213, 255);
  doc.line(margin, y + 6, margin + contentWidth, y + 6);

  doc.setTextColor(107, 33, 168);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('4. JUBILACIÓN PATRONAL (ART. 216 Y 218 DEL CÓDIGO DEL TRABAJO)', margin + 3, y + 4.5);

  y += 8;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 38, 'S');

  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);

  const j1 = y + 5;
  doc.setFont('helvetica', 'normal');
  doc.text('• Condición de Elegibilidad:', margin + 4, j1);
  doc.setFont('helvetica', 'bold');
  if (empleado.elegible_jubilacion) {
    doc.setTextColor(22, 101, 52);
    doc.text(`ELEGIBLE (Antigüedad al retiro: ${empleado.antiguedad_al_retiro} años ≥ 25 años)`, margin + 55, j1);
  } else {
    doc.setTextColor(185, 28, 28);
    doc.text(`NO ELEGIBLE (Antigüedad al retiro: ${empleado.antiguedad_al_retiro} años < 25 años)`, margin + 55, j1);
  }

  doc.setTextColor(51, 65, 85);
  const j2 = y + 10;
  doc.setFont('helvetica', 'normal');
  doc.text('• Coeficiente Tabla Art. 218:', margin + 4, j2);
  doc.setFont('helvetica', 'bold');
  doc.text(`${empleado.coeficiente_tabla} (para edad 65 y género ${empleado.Genero})`, margin + 55, j2);

  const j3 = y + 15;
  doc.setFont('helvetica', 'normal');
  doc.text('• Pensión Teórica Calculada:', margin + 4, j3);
  doc.text(`Anual: ${fmt(empleado.pension_anual_teorica)}   |   Mensual teórica: ${fmt(empleado.pension_mensual_teorica)}`, margin + 55, j3);

  const j4 = y + 20;
  doc.setFont('helvetica', 'normal');
  doc.text('• Aplicación de Topes SBU:', margin + 4, j4);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(180, 83, 9);
  doc.text(`${empleado.tope_aplicado} ➔ Pensión mensual fijada: ${fmt(empleado.pension_mensual)}`, margin + 55, j4);

  doc.setTextColor(51, 65, 85);
  const j5 = y + 25;
  doc.setFont('helvetica', 'normal');
  doc.text('• Factor Supervivencia y CSC:', margin + 4, j5);
  doc.text(`Factor biológico: ${(variables.factor_supervivencia * 100).toFixed(0)}%   |   CSC Jubilación: ${fmt(empleado.csc_jubilacion)}`, margin + 55, j5);

  // Box destacado de VPO Jubilación
  doc.setFillColor(243, 232, 255);
  doc.roundedRect(margin + 4, y + 29, contentWidth - 8, 6.5, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(107, 33, 168);
  doc.text('VALOR PRESENTE DE LA OBLIGACIÓN (VPO JUBILACIÓN PATRONAL):', margin + 8, y + 33.5);
  doc.text(fmt(empleado.VPO_Jubilacion), pageWidth - margin - 8, y + 33.5, { align: 'right' });

  y += 42;

  // --- SECCIÓN 5: RESUMEN CONSOLIDADO NIIF / BALANCE GENERAL ---
  doc.setFillColor(240, 253, 244); // Verde suave
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(margin, y, contentWidth, 18, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(22, 101, 52);
  doc.text('5. TOTAL PASIVO POR BENEFICIOS DEFINIDOS (DBO CONSOLIDADO)', margin + 5, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`VPO Desahucio (${fmt(empleado.VPO_Desahucio)}) + VPO Jubilación (${fmt(empleado.VPO_Jubilacion)})`, margin + 5, y + 11.5);
  doc.text(`Costo Servicio Total (CSC): ${fmt(empleado.csc_total)}   |   Costo por Interés: ${fmt(empleado.costo_interes_individual)}`, margin + 5, y + 15.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(20, 83, 45);
  doc.text(fmt(empleado.VPO_Total), pageWidth - margin - 5, y + 12, { align: 'right' });

  y += 23;

  // --- SECCIÓN 6: DECLARACIÓN Y FIRMAS DE RESPONSABILIDAD ---
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  const notaLegal = 'Nota: La presente valuación actuarial individual se formula bajo el Método de Unidades de Crédito Proyectadas (PUCM) ' +
    'conforme a la NIC 19 (Beneficios a los Empleados) y las normas vigentes del Código del Trabajo de la República del Ecuador. ' +
    'Los valores representan la provisión técnica acumulada con fines de revelación contable y estados financieros.';
  
  const lineasNota = doc.splitTextToSize(notaLegal, contentWidth);
  doc.text(lineasNota, margin, y);

  y += lineasNota.length * 3.5 + 4;

  // Espacio para firmas contable y actuarial
  const firmaW = (contentWidth - 10) / 2;
  const firmaH = 22;

  // Firma 1: Actuario
  doc.setDrawColor(148, 163, 184);
  doc.line(margin + 10, y + firmaH - 6, margin + firmaW - 10, y + firmaH - 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('ACTUARIO / PERITO MATEMÁTICO', margin + firmaW / 2, y + firmaH - 2, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Valuador Técnico de Pasivos Laborales', margin + firmaW / 2, y + firmaH + 1.5, { align: 'center' });

  // Firma 2: Contador / RRHH
  doc.line(margin + firmaW + 20, y + firmaH - 6, margin + contentWidth - 10, y + firmaH - 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('CONTADOR GENERAL / RECURSOS HUMANOS', margin + firmaW + 10 + firmaW / 2, y + firmaH - 2, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Recepción y Registro Contable NIIF', margin + firmaW + 10 + firmaW / 2, y + firmaH + 1.5, { align: 'center' });

  // --- PIE DE PÁGINA ---
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Sistema de Valuación Actuarial NIC 19 Ecuador • Generado digitalmente para control contable y laboral', margin, pageHeight - 6);
  doc.text(`ID: ${empleado.Cedula} • Pág. 1/1`, pageWidth - margin, pageHeight - 6, { align: 'right' });

  // Guardar archivo
  const nombreLimpio = empleado.Nombre.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 25);
  const fileName = `Ficha_Actuarial_NIC19_${empleado.Cedula}_${nombreLimpio}.pdf`;
  doc.save(fileName);
}
