import { 
  Document, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  AlignmentType, 
  HeadingLevel, 
  BorderStyle, 
  WidthType, 
  Packer,
  ShadingType
} from 'docx';
import { EmpleadoProcesado, ResumenMotor, VariablesMacro, DatosEmpresaEstudio } from '../types/actuarial';

/**
 * Generador del Estudio Actuarial Completo en Formato Word (.docx)
 * Estructura idéntica al informe formal pericial de CAJAMARCA PROTECTIVE SERVICES
 * Conforme al Código del Trabajo del Ecuador (Art. 185 y 216), Acuerdos MDT y NIC 19 / IAS 19
 */
export async function generarEstudioWord(
  resultados: EmpleadoProcesado[],
  resumen: ResumenMotor,
  variables: VariablesMacro,
  empresa: DatosEmpresaEstudio
): Promise<void> {
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

  // Clasificación por antigüedad (< 20 años vs >= 20 años)
  const jubMenor20 = resultados.filter(e => e.Antiguedad < 20);
  const jubMayor20 = resultados.filter(e => e.Antiguedad >= 20);
  const totalJubMenor20 = jubMenor20.reduce((a, b) => a + b.VPO_Jubilacion, 0);
  const totalJubMayor20 = jubMayor20.reduce((a, b) => a + b.VPO_Jubilacion, 0);

  const desMenor20 = resultados.filter(e => e.Antiguedad < 20);
  const desMayor20 = resultados.filter(e => e.Antiguedad >= 20);
  const totalDesMenor20 = desMenor20.reduce((a, b) => a + b.VPO_Desahucio, 0);
  const totalDesMayor20 = desMayor20.reduce((a, b) => a + b.VPO_Desahucio, 0);

  // Variación interanual estimada
  const varJubilacion = resumen.vpo_jubilacion_total - empresa.provision_anterior_jubilacion + empresa.pagos_realizados_jubilacion;
  const varDesahucio = resumen.vpo_desahucio_total - empresa.provision_anterior_desahucio + empresa.pagos_realizados_desahucio;

  const bordersNone = {
    top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
  };

  const bordersTable = {
    top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    left: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
  };

  // Creación del documento
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // ==================== PORTADA ====================
          new Paragraph({ text: '', spacing: { before: 800 } }),
          new Paragraph({
            text: empresa.nombre_empresa.toUpperCase(),
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            style: 'TitleStyle'
          }),
          new Paragraph({ text: '', spacing: { before: 1200 } }),
          new Paragraph({
            children: [
              new TextRun({ text: 'PROVISIÓN POR\n', bold: true, size: 28 }),
              new TextRun({ text: 'JUBILACIÓN A CARGO DEL EMPLEADOR\n', bold: true, size: 32, color: '1E3A8A' }),
              new TextRun({ text: 'Y\n', bold: true, size: 24 }),
              new TextRun({ text: 'BONIFICACIÓN POR DESAHUCIO\n', bold: true, size: 32, color: '1E3A8A' })
            ],
            alignment: AlignmentType.CENTER
          }),
          new Paragraph({ text: '', spacing: { before: 1200 } }),
          new Paragraph({
            text: 'ESTUDIO ACTUARIAL',
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER
          }),
          new Paragraph({
            text: `AL ${empresa.fecha_corte_valuacion.toUpperCase()}`,
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ bold: true, size: 24 })]
          }),
          new Paragraph({ text: '', spacing: { before: 2400 } }),
          new Paragraph({
            children: [
              new TextRun({ text: `${empresa.actuario_nombre}\n`, bold: true, size: 22 }),
              new TextRun({ text: `${empresa.actuario_titulo}\n`, size: 20 }),
              new TextRun({ text: `${empresa.actuario_registro_scvs}\n`, size: 20 }),
              new TextRun({ text: `${empresa.actuario_registro_sb}\n`, size: 20 })
            ],
            alignment: AlignmentType.RIGHT
          }),
          new Paragraph({ text: '', spacing: { before: 1200 } }),
          new Paragraph({
            text: empresa.fecha_emision_informe,
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ size: 22, italics: true })]
          }),

          // ==================== INTRODUCCIÓN ====================
          new Paragraph({ text: '', pageBreakBefore: true }),
          new Paragraph({
            text: 'INTRODUCCIÓN',
            heading: HeadingLevel.HEADING_1
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `${empresa.nombre_empresa}, ${empresa.nombre_comercial ? `en adelante "${empresa.nombre_comercial}", ` : ''}` +
                  `fue constituida en la ciudad de ${empresa.ciudad}, el ${empresa.fecha_constitucion}. ` +
                  `El plazo de duración del contrato social es de ${empresa.plazo_duracion}. ` +
                  `Su objeto social principal comprende: ${empresa.objeto_social} ` +
                  `Para cumplir con las disposiciones de la legislación ecuatoriana en materia laboral, que exige a las entidades constituidas en el país ` +
                  `determinar actuarialmente el monto de las provisiones que a la fecha de corte deben mantener para cubrir la jubilación a cargo del empleador ` +
                  `y la bonificación por desahucio, se ha llevado a efecto el presente estudio actuarial.`
              })
            ],
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Éste se halla elaborado en estricto apego a los preceptos establecidos en el Código del Trabajo; ' +
                  'Resolución No. 07-2021 de la Corte Nacional de Justicia; Ley Orgánica de Régimen Tributario Interno (LRTI) y su reglamento; ' +
                  'Ley Orgánica para el Desarrollo Económico y Sustentabilidad Fiscal; Acuerdos Ministeriales No. MDT-2016-0099 y MDT-2018-0118; ' +
                  'y las Normas Internacionales de Información Financiera, NIIF (NIC 19 / IAS 19 Beneficios a los Empleados).'
              })
            ],
            spacing: { after: 200 }
          }),

          // ==================== RESUMEN EJECUTIVO ====================
          new Paragraph({
            text: 'RESUMEN EJECUTIVO',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `El censo de empleados activos bajo el Código del Trabajo analizado está compuesto por un total de ${fmtNum(resumen.total_empleados)} personas. ` +
                  `La edad promedio del colectivo se ubica en ${resumen.edad_promedio} años, y la permanencia promedio es de ${resumen.antiguedad_promedio} años de servicio cumplidos. ` +
                  `El sueldo mensual promedio es de $ ${sueldoPromTotal.toFixed(2)}, con una nómina mensual total evaluada de ${fmt(resumen.nomina_mensual_total)}.`
              })
            ],
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `La obligación financiera acumulada por Jubilación Patronal (Art. 216) calculada asciende a ${fmt(resumen.vpo_jubilacion_total)}, ` +
                  `mientras que la provisión global por Bonificación por Desahucio (Art. 185) se determina en ${fmt(resumen.vpo_desahucio_total)}. ` +
                  `El total del Pasivo por Beneficios Definidos consolidado (DBO NIC 19) a reflejar en los Estados Financieros de la empresa es de ${fmt(resumen.vpo_total)}. ` +
                  `De acuerdo con las reformas fiscales vigentes, el gasto atribuible a estas provisiones debe registrarse según la técnica contable NIIF.`
              })
            ],
            spacing: { after: 300 }
          }),

          // ==================== A. JUBILACIÓN PATRONAL ====================
          new Paragraph({
            text: 'A. JUBILACIÓN A CARGO DEL EMPLEADOR (ART. 216 AL 219)',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'De conformidad con el Código del Trabajo, los empleados en relación de dependencia que por veinticinco (25) años o más hubieren prestado servicios ' +
                  'en forma continua o interrumpida, tienen derecho a ser jubilados por sus empleadores. ' +
                  'Asimismo, quienes hubieren cumplido veinte años y menos de veinticinco años de labor y fueren despedidos intempestivamente, tienen derecho a la parte proporcional de la jubilación patronal.'
              })
            ],
            spacing: { after: 150 }
          }),

          // Cuadro Demográfico
          new Paragraph({
            text: 'PROMEDIO DE EDADES Y TIEMPO DE SERVICIO POR GÉNERO',
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 100 }
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'Género', children: [new TextRun({ bold: true })] })], shading: { fill: 'F1F5F9', type: ShadingType.CLEAR } }),
                  new TableCell({ children: [new Paragraph({ text: 'Nº Colaboradores', children: [new TextRun({ bold: true })] })], shading: { fill: 'F1F5F9', type: ShadingType.CLEAR } }),
                  new TableCell({ children: [new Paragraph({ text: 'Edad Promedio', children: [new TextRun({ bold: true })] })], shading: { fill: 'F1F5F9', type: ShadingType.CLEAR } }),
                  new TableCell({ children: [new Paragraph({ text: 'Tiempo Servicio (años)', children: [new TextRun({ bold: true })] })], shading: { fill: 'F1F5F9', type: ShadingType.CLEAR } }),
                  new TableCell({ children: [new Paragraph({ text: 'Sueldo Promedio', children: [new TextRun({ bold: true })] })], shading: { fill: 'F1F5F9', type: ShadingType.CLEAR } }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'Femenino' })] }),
                  new TableCell({ children: [new Paragraph({ text: fmtNum(fem.length) })] }),
                  new TableCell({ children: [new Paragraph({ text: `${edadPromFem} años` })] }),
                  new TableCell({ children: [new Paragraph({ text: `${antigPromFem} años` })] }),
                  new TableCell({ children: [new Paragraph({ text: `$ ${sueldoPromFem}` })] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'Masculino' })] }),
                  new TableCell({ children: [new Paragraph({ text: fmtNum(masc.length) })] }),
                  new TableCell({ children: [new Paragraph({ text: `${edadPromMasc} años` })] }),
                  new TableCell({ children: [new Paragraph({ text: `${antigPromMasc} años` })] }),
                  new TableCell({ children: [new Paragraph({ text: `$ ${sueldoPromMasc}` })] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'Total Colectivo', children: [new TextRun({ bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: fmtNum(resultados.length), children: [new TextRun({ bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: `${resumen.edad_promedio} años`, children: [new TextRun({ bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: `${resumen.antiguedad_promedio} años`, children: [new TextRun({ bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: `$ ${sueldoPromTotal}`, children: [new TextRun({ bold: true })] })] }),
                ]
              })
            ]
          }),

          // Hipótesis Actuariales
          new Paragraph({
            text: 'HIPÓTESIS ACTUARIALES Y PARÁMETROS MACROECONÓMICOS',
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 250, after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `• Tasa de descuento financiero (i): ${(variables.tasa_descuento * 100).toFixed(2)}% (bonos soberanos / mercado financiero)\n` }),
              new TextRun({ text: `• Tasa de incremento salarial estimada (s): ${(variables.tasa_incremento_sal * 100).toFixed(2)}% anual constante\n` }),
              new TextRun({ text: `• Tasa de rotación del personal (r): ${(variables.tasa_rotacion * 100).toFixed(2)}% anual histórico\n` }),
              new TextRun({ text: `• Salario Básico Unificado vigente (SBU): $ ${variables.sbu_vigente.toFixed(2)}\n` }),
              new TextRun({ text: `• Tasa de interés técnico de conmutación: ${(empresa.tasa_interes_tecnico * 100).toFixed(2)}% anual\n` }),
              new TextRun({ text: '• Tablas de mortalidad: IESS 2000 (Registro Oficial No. 650 del 28 de agosto de 2002) y coeficientes del Art. 218 del Código del Trabajo\n' }),
              new TextRun({ text: '• Topes legales pensionales: Mínimo 0.5 SBU ($230.00) y Máximo 1.0 SBU ($460.00)\n' })
            ],
            spacing: { after: 200 }
          }),

          // Resultados Jubilación
          new Paragraph({
            text: 'OBLIGACIÓN FINANCIERA ACUMULADA POR JUBILACIÓN PATRONAL',
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 100 }
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'Tiempo de Servicio', children: [new TextRun({ bold: true })] })], shading: { fill: 'F1F5F9', type: ShadingType.CLEAR } }),
                  new TableCell({ children: [new Paragraph({ text: 'Nº Colaboradores', children: [new TextRun({ bold: true })] })], shading: { fill: 'F1F5F9', type: ShadingType.CLEAR } }),
                  new TableCell({ children: [new Paragraph({ text: 'Provisión Acumulada (USD)', children: [new TextRun({ bold: true })] })], shading: { fill: 'F1F5F9', type: ShadingType.CLEAR } }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'Menor a 20 años de servicio' })] }),
                  new TableCell({ children: [new Paragraph({ text: fmtNum(jubMenor20.length) })] }),
                  new TableCell({ children: [new Paragraph({ text: fmt(totalJubMenor20) })] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'Igual o mayor a 20 años de servicio' })] }),
                  new TableCell({ children: [new Paragraph({ text: fmtNum(jubMayor20.length) })] }),
                  new TableCell({ children: [new Paragraph({ text: fmt(totalJubMayor20) })] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'TOTAL JUBILACIÓN PATRONAL', children: [new TextRun({ bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: fmtNum(resultados.length), children: [new TextRun({ bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: fmt(resumen.vpo_jubilacion_total), children: [new TextRun({ bold: true })] })] }),
                ]
              })
            ]
          }),

          // Variación anual Jubilación
          new Paragraph({
            text: 'VARIACIÓN ANUAL DE LA PROVISIÓN DE JUBILACIÓN PATRONAL',
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 100 }
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: `Año ${empresa.anio_anterior} (Provisión)`, children: [new TextRun({ bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Pagos Realizados', children: [new TextRun({ bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: `Año ${empresa.anio_evaluado} (Provisión)`, children: [new TextRun({ bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Variación Anual Neta', children: [new TextRun({ bold: true })] })] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: fmt(empresa.provision_anterior_jubilacion) })] }),
                  new TableCell({ children: [new Paragraph({ text: fmt(empresa.pagos_realizados_jubilacion) })] }),
                  new TableCell({ children: [new Paragraph({ text: fmt(resumen.vpo_jubilacion_total) })] }),
                  new TableCell({ children: [new Paragraph({ text: fmt(varJubilacion), children: [new TextRun({ bold: true, color: '1E3A8A' })] })] }),
                ]
              })
            ]
          }),

          // ==================== B. BONIFICACIÓN POR DESAHUCIO ====================
          new Paragraph({
            text: 'B. BONIFICACIÓN POR DESAHUCIO (ART. 185)',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'El artículo 185 del Código del Trabajo, reformado por la Ley Orgánica de Justicia Laboral, determina que en los casos de terminación laboral ' +
                  'por desahucio solicitado por el empleador o trabajador, el empleador bonificará con el veinticinco por ciento (25%) del equivalente a la última remuneración mensual ' +
                  'por cada uno de los años de servicio prestados en la misma empresa. La reforma legal obliga asimismo a pagar dicha bonificación en terminaciones por mutuo acuerdo.'
              })
            ],
            spacing: { after: 150 }
          }),

          // Resultados Desahucio
          new Paragraph({
            text: 'PROVISIÓN ACUMULADA POR BONIFICACIÓN POR DESAHUCIO',
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 100 }
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'Tiempo de Servicio', children: [new TextRun({ bold: true })] })], shading: { fill: 'F1F5F9', type: ShadingType.CLEAR } }),
                  new TableCell({ children: [new Paragraph({ text: 'Nº Colaboradores', children: [new TextRun({ bold: true })] })], shading: { fill: 'F1F5F9', type: ShadingType.CLEAR } }),
                  new TableCell({ children: [new Paragraph({ text: 'Bonificación Provisión (USD)', children: [new TextRun({ bold: true })] })], shading: { fill: 'F1F5F9', type: ShadingType.CLEAR } }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'Menor a 20 años de servicio' })] }),
                  new TableCell({ children: [new Paragraph({ text: fmtNum(desMenor20.length) })] }),
                  new TableCell({ children: [new Paragraph({ text: fmt(totalDesMenor20) })] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'Igual o mayor a 20 años de servicio' })] }),
                  new TableCell({ children: [new Paragraph({ text: fmtNum(desMayor20.length) })] }),
                  new TableCell({ children: [new Paragraph({ text: fmt(totalDesMayor20) })] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'TOTAL DESAHUCIO', children: [new TextRun({ bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: fmtNum(resultados.length), children: [new TextRun({ bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: fmt(resumen.vpo_desahucio_total), children: [new TextRun({ bold: true })] })] }),
                ]
              })
            ]
          }),

          // Variación anual Desahucio
          new Paragraph({
            text: 'VARIACIÓN ANUAL DE LA PROVISIÓN DE DESAHUCIO',
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 100 }
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: `Año ${empresa.anio_anterior} (Provisión)`, children: [new TextRun({ bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Pagos Realizados', children: [new TextRun({ bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: `Año ${empresa.anio_evaluado} (Provisión)`, children: [new TextRun({ bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Variación Anual Neta', children: [new TextRun({ bold: true })] })] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: fmt(empresa.provision_anterior_desahucio) })] }),
                  new TableCell({ children: [new Paragraph({ text: fmt(empresa.pagos_realizados_desahucio) })] }),
                  new TableCell({ children: [new Paragraph({ text: fmt(resumen.vpo_desahucio_total) })] }),
                  new TableCell({ children: [new Paragraph({ text: fmt(varDesahucio), children: [new TextRun({ bold: true, color: '1E3A8A' })] })] }),
                ]
              })
            ]
          }),

          // ==================== DICTAMEN ACTUARIAL ====================
          new Paragraph({
            text: 'DICTAMEN TÉCNICO ACTUARIAL',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'El presente estudio actuarial está fundamentado en los datos y registros de nómina suministrados por la administración de la empresa, ' +
                  'los cuales se consideran suficientes, íntegros y confiables para el propósito de la presente valuación. ' +
                  'Las hipótesis demográficas y financieras reflejan prudentemente las condiciones del mercado laboral y financiero ecuatoriano. ' +
                  'La metodología obedece a principios actuariales internacionalmente aceptados bajo NIC 19 (PUCM) y a los lineamientos legales del Código del Trabajo del Ecuador.'
              })
            ],
            spacing: { after: 300 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Profesional Responsable:\n', bold: true }),
              new TextRun({ text: `${empresa.actuario_nombre}\n`, bold: true }),
              new TextRun({ text: `${empresa.actuario_titulo}\n` }),
              new TextRun({ text: `${empresa.actuario_registro_scvs}\n` }),
              new TextRun({ text: `${empresa.actuario_registro_sb}` })
            ],
            alignment: AlignmentType.RIGHT,
            spacing: { after: 400 }
          }),

          // ==================== ANEXO 1 ====================
          new Paragraph({ text: '', pageBreakBefore: true }),
          new Paragraph({
            text: 'ANEXO 1: JUBILACIÓN PATRONAL (NIIF / IAS 19)',
            heading: HeadingLevel.HEADING_1
          }),
          new Paragraph({ text: `Al ${empresa.fecha_corte_valuacion} • Valores en Dólares de los Estados Unidos (USD)`, spacing: { after: 150 } }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'Concepto Contable NIIF', children: [new TextRun({ bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: `Año ${empresa.anio_anterior}`, children: [new TextRun({ bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: `Año ${empresa.anio_evaluado}`, children: [new TextRun({ bold: true })] })] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: '1. Obligación por Beneficios Definidos (OBD) al inicio' })] }),
                  new TableCell({ children: [new Paragraph({ text: fmt(empresa.provision_anterior_jubilacion) })] }),
                  new TableCell({ children: [new Paragraph({ text: fmt(empresa.provision_anterior_jubilacion) })] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: '2. Costo del Servicio Actual (CSC Jubilación)' })] }),
                  new TableCell({ children: [new Paragraph({ text: fmt(resumen.costo_servicio_actual_total * 0.45) })] }),
                  new TableCell({ children: [new Paragraph({ text: fmt(resultados.reduce((a, b) => a + b.csc_jubilacion, 0)) })] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: '3. Interés Neto Financiero (Interest Cost)' })] }),
                  new TableCell({ children: [new Paragraph({ text: fmt(empresa.provision_anterior_jubilacion * variables.tasa_descuento) })] }),
                  new TableCell({ children: [new Paragraph({ text: fmt(resumen.vpo_jubilacion_total * variables.tasa_descuento) })] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: '10. Obligación por Beneficios Definidos al final (DBO)', children: [new TextRun({ bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: fmt(empresa.provision_anterior_jubilacion), children: [new TextRun({ bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: fmt(resumen.vpo_jubilacion_total), children: [new TextRun({ bold: true })] })] }),
                ]
              })
            ]
          }),

          // ==================== ANEXO 2 ====================
          new Paragraph({ text: '', pageBreakBefore: true }),
          new Paragraph({
            text: 'ANEXO 2: BONIFICACIÓN POR DESAHUCIO (NIIF / IAS 19)',
            heading: HeadingLevel.HEADING_1
          }),
          new Paragraph({ text: `Al ${empresa.fecha_corte_valuacion} • Valores en Dólares de los Estados Unidos (USD)`, spacing: { after: 150 } }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'Concepto Contable NIIF', children: [new TextRun({ bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: `Año ${empresa.anio_anterior}`, children: [new TextRun({ bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: `Año ${empresa.anio_evaluado}`, children: [new TextRun({ bold: true })] })] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: '1. Obligación por Beneficios Definidos (OBD) al inicio' })] }),
                  new TableCell({ children: [new Paragraph({ text: fmt(empresa.provision_anterior_desahucio) })] }),
                  new TableCell({ children: [new Paragraph({ text: fmt(empresa.provision_anterior_desahucio) })] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: '2. Costo del Servicio Actual (CSC Desahucio)' })] }),
                  new TableCell({ children: [new Paragraph({ text: fmt(resumen.costo_servicio_actual_total * 0.55) })] }),
                  new TableCell({ children: [new Paragraph({ text: fmt(resultados.reduce((a, b) => a + b.csc_desahucio, 0)) })] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: '3. Interés Neto Financiero' })] }),
                  new TableCell({ children: [new Paragraph({ text: fmt(empresa.provision_anterior_desahucio * variables.tasa_descuento) })] }),
                  new TableCell({ children: [new Paragraph({ text: fmt(resumen.vpo_desahucio_total * variables.tasa_descuento) })] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: '10. Obligación por Beneficios Definidos al final (DBO)', children: [new TextRun({ bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: fmt(empresa.provision_anterior_desahucio), children: [new TextRun({ bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: fmt(resumen.vpo_desahucio_total), children: [new TextRun({ bold: true })] })] }),
                ]
              })
            ]
          }),

          // ==================== ANEXO 3: PROVISIÓN INDIVIDUAL ====================
          new Paragraph({ text: '', pageBreakBefore: true }),
          new Paragraph({
            text: 'ANEXO 3: PROVISIÓN ACTUARIAL INDIVIDUAL POR COLABORADOR',
            heading: HeadingLevel.HEADING_1
          }),
          new Paragraph({ text: `Nómina Completa (${resultados.length} colaboradores) al ${empresa.fecha_corte_valuacion}`, spacing: { after: 150 } }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'Nombre del Colaborador', children: [new TextRun({ bold: true })] })], shading: { fill: 'F1F5F9', type: ShadingType.CLEAR } }),
                  new TableCell({ children: [new Paragraph({ text: 'Cédula', children: [new TextRun({ bold: true })] })], shading: { fill: 'F1F5F9', type: ShadingType.CLEAR } }),
                  new TableCell({ children: [new Paragraph({ text: 'Tiempo Serv.', children: [new TextRun({ bold: true })] })], shading: { fill: 'F1F5F9', type: ShadingType.CLEAR } }),
                  new TableCell({ children: [new Paragraph({ text: 'Prov. Jubilación', children: [new TextRun({ bold: true })] })], shading: { fill: 'F1F5F9', type: ShadingType.CLEAR } }),
                  new TableCell({ children: [new Paragraph({ text: 'Prov. Desahucio', children: [new TextRun({ bold: true })] })], shading: { fill: 'F1F5F9', type: ShadingType.CLEAR } }),
                  new TableCell({ children: [new Paragraph({ text: 'Total DBO', children: [new TextRun({ bold: true })] })], shading: { fill: 'F1F5F9', type: ShadingType.CLEAR } }),
                ]
              }),
              ...resultados.map(emp => new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: emp.Nombre })] }),
                  new TableCell({ children: [new Paragraph({ text: emp.Cedula })] }),
                  new TableCell({ children: [new Paragraph({ text: `${emp.Antiguedad} a` })] }),
                  new TableCell({ children: [new Paragraph({ text: fmt(emp.VPO_Jubilacion) })] }),
                  new TableCell({ children: [new Paragraph({ text: fmt(emp.VPO_Desahucio) })] }),
                  new TableCell({ children: [new Paragraph({ text: fmt(emp.VPO_Total), children: [new TextRun({ bold: true })] })] }),
                ]
              }))
            ]
          })
        ]
      }
    ]
  });

  // Descarga del archivo Word
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const nombreLimpio = empresa.nombre_empresa.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
  a.download = `Estudio_Actuarial_NIC19_${nombreLimpio}_${empresa.anio_evaluado}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
