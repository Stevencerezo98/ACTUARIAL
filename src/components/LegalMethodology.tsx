import React from 'react';
import { 
  Scale, 
  BookOpen, 
  Layers, 
  Award, 
  FileText, 
  Cpu, 
  ShieldCheck, 
  Calculator, 
  ArrowRight,
  Database,
  FileSpreadsheet
} from 'lucide-react';

export const LegalMethodology: React.FC = () => {
  return (
    <div className="space-y-6 text-gray-700 text-xs leading-relaxed max-w-5xl mx-auto">
      
      {/* Banner Principal */}
      <div className="bg-white border border-gray-200 rounded shadow-sm border-t-4 border-t-blue-600 p-5">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-gray-900">
            Documentación Técnica y Metodología Actuarial (NIC 19 - Ecuador)
          </h2>
        </div>
        <p className="text-gray-600">
          Esta documentación detalla la arquitectura de software, las fórmulas matemáticas de matemática actuarial y financiera aplicadas, y la fundamentación jurídica según el <strong>Código del Trabajo de la República del Ecuador</strong> (Art. 185 y Art. 216) y la <strong>Norma Internacional de Contabilidad 19 (NIC 19 / IAS 19 Employee Benefits)</strong>.
        </p>
      </div>

      {/* 1. Arquitectura del Sistema */}
      <div className="bg-white border border-gray-200 rounded shadow-xs p-5 space-y-4">
        <div className="flex items-center gap-2 text-blue-800 font-bold text-sm border-b border-gray-100 pb-2">
          <Cpu className="w-4 h-4 text-blue-600" />
          <h3>1. Arquitectura y Flujo de Procesamiento del Sistema</h3>
        </div>

        {/* Diagrama de Flujo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-center">
          
          <div className="p-3 bg-gray-50 border border-gray-200 rounded">
            <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-2">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <strong className="block text-gray-900 font-bold mb-1">Paso 1: Ingesta</strong>
            <p className="text-[11px] text-gray-500">
              Lectura de Excel (.xlsx, .xls) o CSV con campos: Cedula, Nombre, Genero, Edad, Antiguedad, Sueldo_Actual.
            </p>
          </div>

          <div className="p-3 bg-gray-50 border border-gray-200 rounded">
            <div className="w-8 h-8 rounded bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-2">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <strong className="block text-gray-900 font-bold mb-1">Paso 2: Sanitización</strong>
            <p className="text-[11px] text-gray-500">
              Tratamiento de comas decimales, símbolos $, ceros perdidos en cédula (Módulo 10) y bloques try/except defensivos.
            </p>
          </div>

          <div className="p-3 bg-gray-50 border border-gray-200 rounded">
            <div className="w-8 h-8 rounded bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-2">
              <Calculator className="w-4 h-4" />
            </div>
            <strong className="block text-gray-900 font-bold mb-1">Paso 3: Motor Actuarial</strong>
            <p className="text-[11px] text-gray-500">
              Proyección salarial nominal, cálculo de años al retiro, descuento financiero (1+i)ᵗ, permanencia (1-r)ᵗ y topes SBU.
            </p>
          </div>

          <div className="p-3 bg-gray-50 border border-gray-200 rounded">
            <div className="w-8 h-8 rounded bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-2">
              <FileText className="w-4 h-4" />
            </div>
            <strong className="block text-gray-900 font-bold mb-1">Paso 4: Salida NIIF</strong>
            <p className="text-[11px] text-gray-500">
              Consolidación de DBO, VPO Desahucio, VPO Jubilación, Costo de Interés y exportación masiva a Excel.
            </p>
          </div>

        </div>
      </div>

      {/* 2. Variables Macroeconómicas */}
      <div className="bg-white border border-gray-200 rounded shadow-xs p-5 space-y-3">
        <div className="flex items-center gap-2 text-gray-900 font-bold text-sm border-b border-gray-100 pb-2">
          <Database className="w-4 h-4 text-blue-600" />
          <h3>2. Variables Macroeconómicas de Entrada (Variables Globales)</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border border-gray-200 text-xs">
            <thead className="bg-gray-100 text-gray-700 font-bold">
              <tr>
                <th className="py-2 px-3 border-b border-gray-200">Variable</th>
                <th className="py-2 px-3 border-b border-gray-200">Símbolo</th>
                <th className="py-2 px-3 border-b border-gray-200">Valor Típico (Ecuador)</th>
                <th className="py-2 px-3 border-b border-gray-200">Fundamento y Propósito</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="py-2 px-3 font-semibold text-gray-800">Tasa de Descuento Financiero</td>
                <td className="py-2 px-3 font-mono text-blue-700 font-bold">i</td>
                <td className="py-2 px-3 font-mono font-bold">7.50% (0.075)</td>
                <td className="py-2 px-3 text-gray-600">
                  Rendimiento de mercado de bonos de alta calidad o bonos soberanos en USD (NIC 19 § 83).
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-gray-800">Tasa de Incremento Salarial</td>
                <td className="py-2 px-3 font-mono text-green-700 font-bold">s</td>
                <td className="py-2 px-3 font-mono font-bold">3.00% (0.030)</td>
                <td className="py-2 px-3 text-gray-600">
                  Expectativa de inflación nominal a largo plazo y mérito laboral en Ecuador.
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-gray-800">Tasa de Rotación Laboral</td>
                <td className="py-2 px-3 font-mono text-amber-700 font-bold">r</td>
                <td className="py-2 px-3 font-mono font-bold">5.00% (0.050)</td>
                <td className="py-2 px-3 text-gray-600">
                  Probabilidad anual de terminación laboral (renuncias o despidos) antes de alcanzar los 25 años.
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-gray-800">Salario Básico Unificado</td>
                <td className="py-2 px-3 font-mono text-gray-800 font-bold">SBU</td>
                <td className="py-2 px-3 font-mono font-bold">$ 460.00</td>
                <td className="py-2 px-3 text-gray-600">
                  Remuneración básica legal vigente en Ecuador para acotar topes pensionales.
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-gray-800">Edad Ordinaria de Retiro</td>
                <td className="py-2 px-3 font-mono text-gray-800 font-bold">Edad_Retiro</td>
                <td className="py-2 px-3 font-mono font-bold">65 años</td>
                <td className="py-2 px-3 text-gray-600">
                  Edad estándar legal de retiro para jubilación ordinaria en Ecuador.
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-gray-800">Factor de Supervivencia</td>
                <td className="py-2 px-3 font-mono text-gray-800 font-bold">px</td>
                <td className="py-2 px-3 font-mono font-bold">0.85</td>
                <td className="py-2 px-3 text-gray-600">
                  Probabilidad actuarial promedio de supervivencia del trabajador hasta la edad de retiro.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Fórmulas de Desahucio (Art. 185) */}
      <div className="bg-white border border-gray-200 rounded shadow-xs p-5 space-y-3">
        <div className="flex items-center gap-2 text-blue-800 font-bold text-sm border-b border-gray-100 pb-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <h3>3. Módulo de Desahucio (Art. 185 del Código del Trabajo)</h3>
        </div>

        <p className="text-gray-600">
          El Art. 185 establece que el empleador bonificará al trabajador con el <strong>25% de la última remuneración mensual por cada uno de los años de servicio</strong>. Bajo la metodología actuarial de la NIC 19 (PUCM):
        </p>

        <div className="bg-blue-50/60 p-4 rounded border border-blue-200 space-y-2 font-mono text-xs">
          <div>
            <span className="text-gray-500">// 1. Años faltantes al retiro (t):</span>
            <div className="text-blue-900 font-bold">t = max(0, Edad_Retiro - Edad_Actual)</div>
          </div>
          <div>
            <span className="text-gray-500">// 2. Antigüedad proyectada al retiro:</span>
            <div className="text-blue-900 font-bold">Antiguedad_Retiro = Antiguedad_Actual + t</div>
          </div>
          <div>
            <span className="text-gray-500">// 3. Sueldo proyectado al retiro:</span>
            <div className="text-blue-900 font-bold">Sueldo_Proyectado = Sueldo_Actual × (1 + s)ᵗ</div>
          </div>
          <div>
            <span className="text-gray-500">// 4. Beneficio bruto proyectado (BP):</span>
            <div className="text-blue-900 font-bold">BP = 0.25 × Sueldo_Proyectado × Antiguedad_Retiro</div>
          </div>
          <div>
            <span className="text-gray-500">// 5. Valor Presente de la Obligación (VPO Desahucio):</span>
            <div className="text-green-800 font-bold bg-white p-2 rounded border border-blue-200">
              VPO_Desahucio = [BP × (1 - r)ᵗ] / (1 + i)ᵗ
            </div>
          </div>
        </div>

        <div className="p-3 bg-gray-50 rounded border border-gray-200 text-xs text-gray-600 space-y-1">
          <strong className="text-gray-800 block">Ejemplo Práctico (Juan Perez):</strong>
          <p>
            Edad = 45 años, Antigüedad = 15 años, Sueldo = $1,200.00, i = 7.5%, s = 3.0%, r = 5.0%.<br/>
            • Años faltantes: <code className="bg-white px-1 font-mono">t = 65 - 45 = 20 años</code>.<br/>
            • Antigüedad al retiro: <code className="bg-white px-1 font-mono">15 + 20 = 35 años</code>.<br/>
            • Sueldo proyectado: <code className="bg-white px-1 font-mono">1,200 × (1.03)²⁰ = $2,167.33</code>.<br/>
            • Beneficio bruto: <code className="bg-white px-1 font-mono">0.25 × 2,167.33 × 35 = $18,964.16</code>.<br/>
            • Permanencia: <code className="bg-white px-1 font-mono">(1 - 0.05)²⁰ = 0.3585</code> | Descuento: <code className="bg-white px-1 font-mono">(1 + 0.075)²⁰ = 4.2479</code>.<br/>
            • <strong className="text-blue-800 font-mono">VPO Desahucio = ($18,964.16 × 0.3585) / 4.2479 = $1,600.41</strong>.
          </p>
        </div>
      </div>

      {/* 4. Fórmulas de Jubilación Patronal (Art. 216) */}
      <div className="bg-white border border-gray-200 rounded shadow-xs p-5 space-y-3">
        <div className="flex items-center gap-2 text-purple-900 font-bold text-sm border-b border-gray-100 pb-2">
          <Award className="w-4 h-4 text-purple-600" />
          <h3>4. Módulo de Jubilación Patronal (Art. 216 del Código del Trabajo)</h3>
        </div>

        <p className="text-gray-600">
          El Art. 216 consagra el derecho a la pensión vitalicia mensual para trabajadores con 25 años o más de servicio continuo o interrumpido en la empresa:
        </p>

        <div className="bg-purple-50/60 p-4 rounded border border-purple-200 space-y-2 font-mono text-xs">
          <div>
            <span className="text-gray-500">// 1. Condición Estricta de Elegibilidad:</span>
            <div className="text-purple-900 font-bold">
              SI Antiguedad_Retiro &lt; 25 ENTONCES: VPO_Jubilacion = 0.00
            </div>
          </div>
          <div>
            <span className="text-gray-500">// 2. Coeficiente según tabla del Art. 218:</span>
            <div className="text-purple-900 font-bold">
              Coeficiente = 11.5 (si Genero == 'M') sino 13.0 (si Genero == 'F')
            </div>
          </div>
          <div>
            <span className="text-gray-500">// 3. Pensión anual teórica:</span>
            <div className="text-purple-900 font-bold">
              Pension_Anual_Teorica = (Sueldo_Proyectado × 12 × 0.05) / Coeficiente
            </div>
          </div>
          <div>
            <span className="text-gray-500">// 4. Mensualización y Aplicación Estricta de Topes SBU (Art. 216 incisos finales):</span>
            <div className="text-purple-900 font-bold">Pension_Mensual = Pension_Anual_Teorica / 12</div>
            <div className="text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200">
              SI Pension_Mensual &lt; (0.5 × SBU) ➔ Pension_Mensual = 0.5 × SBU ($230.00)<br/>
              SINO SI Pension_Mensual &gt; SBU ➔ Pension_Mensual = 1.0 × SBU ($460.00)
            </div>
          </div>
          <div>
            <span className="text-gray-500">// 5. Valor Presente de la Obligación (VPO Jubilación Patronal):</span>
            <div className="text-purple-900 font-bold bg-white p-2 rounded border border-purple-200">
              Pension_Anual_Limite = Pension_Mensual × 12<br/>
              VPO_Jubilacion = [(Pension_Anual_Limite × Coeficiente) × 0.85 × (1 - r)ᵗ] / (1 + i)ᵗ
            </div>
          </div>
        </div>

        <div className="p-3 bg-gray-50 rounded border border-gray-200 text-xs text-gray-600 space-y-1">
          <strong className="text-gray-800 block">Ejemplo Práctico (Juan Perez):</strong>
          <p>
            Hombre (M), Antigüedad al retiro = 35 años (≥ 25 años ➔ ELEGIBLE). Coeficiente = 11.5.<br/>
            • Pensión anual teórica: <code className="bg-white px-1 font-mono">(2,167.33 × 12 × 0.05) / 11.5 = $113.08 / año</code>.<br/>
            • Pensión mensual teórica: <code className="bg-white px-1 font-mono">$113.08 / 12 = $9.42 / mes</code>.<br/>
            • <strong>Aplicación de tope mínimo legal (0.5 SBU)</strong>: Como $9.42 &lt; $230.00, se eleva a <code className="bg-white px-1 font-mono font-bold text-amber-800">$230.00 / mes</code>.<br/>
            • Pensión anual límite: <code className="bg-white px-1 font-mono">230.00 × 12 = $2,760.00 / año</code>.<br/>
            • Renta actuarial al retiro: <code className="bg-white px-1 font-mono">2,760.00 × 11.5 = $31,740.00</code>.<br/>
            • <strong className="text-purple-900 font-mono">VPO Jubilación = ($31,740 × 0.85 × 0.3585) / 4.2479 = $2,276.51</strong>.
          </p>
        </div>
      </div>

      {/* 5. Consolidación NIIF (NIC 19) */}
      <div className="bg-white border border-gray-200 rounded shadow-xs p-5 space-y-3">
        <div className="flex items-center gap-2 text-green-900 font-bold text-sm border-b border-gray-100 pb-2">
          <Scale className="w-4 h-4 text-green-600" />
          <h3>5. Consolidación de Resultados para Revelaciones NIIF (NIC 19)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-green-50/50 rounded border border-green-200">
            <strong className="text-green-900 block mb-1 font-bold">Obligación por Beneficios Definidos (DBO)</strong>
            <p className="text-[11px] text-gray-600">
              Es la suma consolidada de pasivos que la entidad debe reflejar en su Estado de Situación Financiera:<br/>
              <code className="font-mono font-bold text-green-800">DBO = Σ VPO_Desahucio + Σ VPO_Jubilación</code>.
            </p>
          </div>

          <div className="p-3 bg-blue-50/50 rounded border border-blue-200">
            <strong className="text-blue-900 block mb-1 font-bold">Costo por Interés (Interest Cost)</strong>
            <p className="text-[11px] text-gray-600">
              Refleja el incremento en el valor presente del pasivo debido a que los beneficios están un período más cerca del vencimiento:<br/>
              <code className="font-mono font-bold text-blue-800">Costo_Interes = DBO_Inicial × i</code>.
            </p>
          </div>

          <div className="p-3 bg-purple-50/50 rounded border border-purple-200">
            <strong className="text-purple-900 block mb-1 font-bold">Costo del Servicio Corriente</strong>
            <p className="text-[11px] text-gray-600">
              El incremento en el valor presente de la obligación resultante de los servicios prestados por los empleados en el período en curso.
            </p>
          </div>
        </div>
      </div>

      {/* 6. Robustez y Tratamiento de Errores de Excel */}
      <div className="bg-white border border-gray-200 rounded shadow-xs p-5 space-y-3">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-sm border-b border-gray-100 pb-2">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <h3>6. Tratamiento de Datos Corruptos y Manejo Defensivo (Data Hygiene)</h3>
        </div>

        <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-600">
          <li>
            <strong>Pérdida de ceros a la izquierda en cédulas ecuatorianas</strong>: Cuando Excel lee una cédula como número (ej. <code className="bg-gray-100 px-1 font-mono">912345678</code>), el sistema aplica automáticamente <code className="bg-gray-100 px-1 font-mono">zfill(10)</code> para restaurar <code className="bg-gray-100 px-1 font-mono">'0912345678'</code>.
          </li>
          <li>
            <strong>Formato monetario sucio</strong>: Celdas que contengan texto como <code className="bg-gray-100 px-1 font-mono">"$1,200.50"</code> o <code className="bg-gray-100 px-1 font-mono">"1200,50"</code> se limpian removiendo símbolos y unificando el separador decimal a punto float.
          </li>
          <li>
            <strong>Valores nulos o vacíos</strong>: Se capturan con bloques <code className="bg-gray-100 px-1 font-mono">try/except</code> individuales por fila, evitando que una fila con celdas corruptas aborte el cálculo del resto de la nómina.
          </li>
          <li>
            <strong>Topes lógicos</strong>: Las edades se acotan al rango laboral productivo legal (18 a 80 años) y la antigüedad se valida para que sea consistente con la edad.
          </li>
        </ul>
      </div>

    </div>
  );
};
