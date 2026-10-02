import React from 'react';
import { ResumenMotor, VariablesMacro, ItemSensibilidad, EmpleadoProcesado } from '../types/actuarial';
import { 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  Percent, 
  DollarSign, 
  Layers, 
  Award, 
  Download,
  ShieldCheck,
  Building
} from 'lucide-react';
import { exportarResultadosAExcel } from '../services/actuarialEngine';

interface NiifReportViewProps {
  resultados: EmpleadoProcesado[];
  resumen: ResumenMotor;
  variables: VariablesMacro;
  sensibilidad: ItemSensibilidad[];
}

export const NiifReportView: React.FC<NiifReportViewProps> = ({
  resultados,
  resumen,
  variables,
  sensibilidad
}) => {
  const fmt = (v: number) => `$ ${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-white border border-gray-200 rounded shadow-sm border-t-4 border-t-blue-600 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-gray-900">
              Reportería Ejecutiva Contable NIIF (NIC 19 / IAS 19)
            </h2>
          </div>
          <p className="text-xs text-gray-500">
            Conciliación del Pasivo por Beneficios Definidos, Costo del Servicio Actual, Costo por Interés y Análisis de Sensibilidad.
          </p>
        </div>

        <button
          onClick={() => exportarResultadosAExcel(resultados, resumen, variables, sensibilidad)}
          className="px-3.5 py-2 rounded bg-green-600 hover:bg-green-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Exportar Libro NIIF Excel (3 Hojas)</span>
        </button>
      </div>

      {/* Resumen P&L y Balance General */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Pasivo de Balance (DBO) */}
        <div className="bg-white border border-gray-200 rounded p-4 shadow-xs border-l-4 border-l-blue-600">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
            Pasivo de Balance General (DBO)
          </span>
          <div className="text-2xl font-bold font-mono text-gray-900">
            {fmt(resumen.vpo_total)}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Obligación por Beneficios Definidos acumulada a la fecha de corte.
          </p>
          <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between text-[11px] font-mono text-gray-600">
            <span>Desahucio: {fmt(resumen.vpo_desahucio_total)}</span>
            <span>Jubilación: {fmt(resumen.vpo_jubilacion_total)}</span>
          </div>
        </div>

        {/* Costo del Servicio Actual (CSC) */}
        <div className="bg-white border border-gray-200 rounded p-4 shadow-xs border-l-4 border-l-purple-600">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
            Costo del Servicio Actual (CSC)
          </span>
          <div className="text-2xl font-bold font-mono text-purple-900">
            {fmt(resumen.costo_servicio_actual_total)}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Current Service Cost atribuible estrictamente al ejercicio corriente.
          </p>
          <div className="mt-3 pt-2 border-t border-gray-100 text-[11px] text-gray-500">
            Devengo proporcional bajo PUCM
          </div>
        </div>

        {/* Costo por Interés (IC) */}
        <div className="bg-white border border-gray-200 rounded p-4 shadow-xs border-l-4 border-l-amber-500">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
            Costo por Interés (Interest Cost)
          </span>
          <div className="text-2xl font-bold font-mono text-amber-800">
            {fmt(resumen.costo_interes_estimado)}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Crecimiento del pasivo por el paso del tiempo: <code className="font-mono text-gray-800">DBO × i</code>.
          </p>
          <div className="mt-3 pt-2 border-t border-gray-100 text-[11px] font-mono text-gray-500">
            Tasa descuento: {(variables.tasa_descuento * 100).toFixed(2)}%
          </div>
        </div>

      </div>

      {/* Tabla de Conciliación de Gasto Contable */}
      <div className="bg-white border border-gray-200 rounded shadow-xs overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-bold text-xs text-gray-800 uppercase tracking-wider">
            Conciliación de Gasto NIIF Reconocido en el Estado de Resultados (P&L)
          </h3>
          <span className="text-[11px] text-gray-500 font-mono">NIC 19 § 120</span>
        </div>

        <div className="p-4">
          <table className="w-full text-xs text-left border border-gray-200">
            <thead className="bg-gray-100 font-bold text-gray-700">
              <tr>
                <th className="py-2.5 px-3 border-r border-gray-200">Concepto Contable NIIF</th>
                <th className="py-2.5 px-3 border-r border-gray-200 text-right">Desahucio (Art. 185)</th>
                <th className="py-2.5 px-3 border-r border-gray-200 text-right">Jubilación Patronal (Art. 216)</th>
                <th className="py-2.5 px-3 text-right font-bold text-gray-900 bg-gray-50">Total Consolidado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-mono text-[11px]">
              <tr>
                <td className="py-2.5 px-3 font-sans text-gray-800 font-semibold border-r border-gray-200">
                  Obligación por Beneficios Definidos (DBO)
                </td>
                <td className="py-2.5 px-3 text-right text-blue-700 border-r border-gray-200">
                  {fmt(resumen.vpo_desahucio_total)}
                </td>
                <td className="py-2.5 px-3 text-right text-purple-700 border-r border-gray-200">
                  {fmt(resumen.vpo_jubilacion_total)}
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-gray-900 bg-gray-50">
                  {fmt(resumen.vpo_total)}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans text-gray-800 border-r border-gray-200">
                  (+) Costo del Servicio Actual (Current Service Cost - CSC)
                </td>
                <td className="py-2.5 px-3 text-right text-gray-700 border-r border-gray-200">
                  {fmt(resultados.reduce((a, b) => a + b.csc_desahucio, 0))}
                </td>
                <td className="py-2.5 px-3 text-right text-gray-700 border-r border-gray-200">
                  {fmt(resultados.reduce((a, b) => a + b.csc_jubilacion, 0))}
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-purple-800 bg-gray-50">
                  {fmt(resumen.costo_servicio_actual_total)}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans text-gray-800 border-r border-gray-200">
                  (+) Costo por Interés del Ejercicio (Interest Cost - IC)
                </td>
                <td className="py-2.5 px-3 text-right text-gray-700 border-r border-gray-200">
                  {fmt(Math.round(resumen.vpo_desahucio_total * variables.tasa_descuento * 100) / 100)}
                </td>
                <td className="py-2.5 px-3 text-right text-gray-700 border-r border-gray-200">
                  {fmt(Math.round(resumen.vpo_jubilacion_total * variables.tasa_descuento * 100) / 100)}
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-amber-800 bg-gray-50">
                  {fmt(resumen.costo_interes_estimado)}
                </td>
              </tr>
              <tr className="bg-green-50/60 font-bold">
                <td className="py-2.5 px-3 font-sans text-green-900 border-r border-gray-200">
                  (=) Gasto Total a Reconocer en Resultados (CSC + IC)
                </td>
                <td className="py-2.5 px-3 text-right text-green-900 border-r border-gray-200">
                  {fmt(Math.round((resultados.reduce((a, b) => a + b.csc_desahucio, 0) + (resumen.vpo_desahucio_total * variables.tasa_descuento)) * 100) / 100)}
                </td>
                <td className="py-2.5 px-3 text-right text-green-900 border-r border-gray-200">
                  {fmt(Math.round((resultados.reduce((a, b) => a + b.csc_jubilacion, 0) + (resumen.vpo_jubilacion_total * variables.tasa_descuento)) * 100) / 100)}
                </td>
                <td className="py-2.5 px-3 text-right text-green-900 text-sm">
                  {fmt(resumen.gasto_total_niif)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Matriz de Sensibilidad Actuarial (NIC 19 § 145 / Módulo 3) */}
      <div className="bg-white border border-gray-200 rounded shadow-xs overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Percent className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-xs text-gray-800 uppercase tracking-wider">
              Análisis de Sensibilidad Obligatorio (NIC 19 § 145)
            </h3>
          </div>
          <span className="text-[11px] text-gray-500 font-medium">
            Impacto ante variaciones en tasa de descuento y salario (±1% y ±0.5%)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-gray-100 text-gray-700 font-bold border-b border-gray-300">
              <tr>
                <th className="py-2.5 px-4 border-r border-gray-200">Escenario Evaluado</th>
                <th className="py-2.5 px-3 text-center border-r border-gray-200">Tasa Desc. (i)</th>
                <th className="py-2.5 px-3 text-center border-r border-gray-200">Tasa Sal. (s)</th>
                <th className="py-2.5 px-3 text-right border-r border-gray-200">VPO Desahucio</th>
                <th className="py-2.5 px-3 text-right border-r border-gray-200">VPO Jubilación</th>
                <th className="py-2.5 px-3 text-right font-bold text-gray-900 bg-gray-50 border-r border-gray-200">
                  DBO Total
                </th>
                <th className="py-2.5 px-3 text-right border-r border-gray-200">Variación ($)</th>
                <th className="py-2.5 px-3 text-center">Impacto (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-mono text-[11px]">
              {sensibilidad.map((item, idx) => {
                const isBase = idx === 0;
                const isPositive = item.variacion_usd > 0;
                const isNegative = item.variacion_usd < 0;

                return (
                  <tr 
                    key={idx} 
                    className={`hover:bg-blue-50/40 transition ${
                      isBase ? 'bg-blue-50/70 font-semibold' : idx % 2 === 1 ? 'bg-gray-50/30' : 'bg-white'
                    }`}
                  >
                    <td className="py-2.5 px-4 font-sans text-gray-900 border-r border-gray-200 flex items-center gap-1.5">
                      {isBase ? (
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      ) : isPositive ? (
                        <TrendingUp className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5 text-green-600 shrink-0" />
                      )}
                      <span>{item.escenario}</span>
                    </td>

                    <td className="py-2.5 px-3 text-center border-r border-gray-200">
                      {item.tasa_descuento_pct.toFixed(2)}%
                    </td>

                    <td className="py-2.5 px-3 text-center border-r border-gray-200">
                      {item.tasa_salario_pct.toFixed(2)}%
                    </td>

                    <td className="py-2.5 px-3 text-right text-blue-700 border-r border-gray-200">
                      {fmt(item.vpo_desahucio)}
                    </td>

                    <td className="py-2.5 px-3 text-right text-purple-700 border-r border-gray-200">
                      {fmt(item.vpo_jubilacion)}
                    </td>

                    <td className="py-2.5 px-3 text-right font-bold text-gray-900 bg-gray-50 border-r border-gray-200">
                      {fmt(item.vpo_total)}
                    </td>

                    <td className={`py-2.5 px-3 text-right font-bold border-r border-gray-200 ${
                      isBase ? 'text-gray-400' : isPositive ? 'text-red-700' : 'text-green-700'
                    }`}>
                      {isBase ? '$0.00' : `${isPositive ? '+' : ''}${fmt(item.variacion_usd)}`}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      {isBase ? (
                        <span className="text-gray-400 font-sans text-[10px]">Base</span>
                      ) : (
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          isPositive
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-green-100 text-green-800 border border-green-200'
                        }`}>
                          {isPositive ? '+' : ''}{item.variacion_pct.toFixed(2)}%
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
