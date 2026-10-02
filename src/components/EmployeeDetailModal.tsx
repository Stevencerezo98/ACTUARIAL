import React from 'react';
import { EmpleadoProcesado, VariablesMacro } from '../types/actuarial';
import { X, Layers, Award, Scale, CheckCircle2, FileDown } from 'lucide-react';
import { generarFichaActuarialPDF } from '../services/pdfReportGenerator';

interface EmployeeDetailModalProps {
  empleado: EmpleadoProcesado | null;
  variables: VariablesMacro;
  onClose: () => void;
}

export const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({
  empleado,
  variables,
  onClose
}) => {
  if (!empleado) return null;

  const fmt = (v: number) => `$ ${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-in fade-in">
      <div className="bg-white border border-gray-300 rounded shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-gray-200 text-gray-700 font-bold">
                Cédula: {empleado.Cedula}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                empleado.elegible_jubilacion
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-gray-100 text-gray-600 border border-gray-200'
              }`}>
                {empleado.elegible_jubilacion ? 'Elegible Jubilación (≥25a)' : 'No Elegible (<25a)'}
              </span>
            </div>
            <h4 className="text-base font-bold text-gray-900 mt-1">{empleado.Nombre}</h4>
            <p className="text-xs text-gray-500">
              Género: <strong>{empleado.Genero === 'M' ? 'Masculino' : 'Femenino'}</strong> | Edad: <strong>{empleado.Edad} años</strong> | Antigüedad actual: <strong>{empleado.Antiguedad} años</strong> | Sueldo: <strong className="text-green-700">{fmt(empleado.Sueldo_Actual)}</strong>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => generarFichaActuarialPDF(empleado, variables)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              title="Descargar Ficha Actuarial en PDF"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exportar PDF</span>
            </button>
            <button onClick={onClose} className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs text-gray-700">

          {/* 1. Proyecciones Temporales */}
          <div className="bg-gray-50 border border-gray-200 rounded p-3.5 space-y-2">
            <h5 className="font-bold text-gray-700 uppercase tracking-wider text-[11px]">
              1. Proyección Temporal al Retiro (Edad {variables.edad_retiro} años)
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="bg-white p-2 rounded border border-gray-200">
                <span className="text-[10px] text-gray-500 block">Años Faltantes</span>
                <span className="text-sm font-bold text-gray-900 font-mono">{empleado.anios_faltantes}</span>
              </div>
              <div className="bg-white p-2 rounded border border-gray-200">
                <span className="text-[10px] text-gray-500 block">Antigüedad Retiro</span>
                <span className="text-sm font-bold text-gray-900 font-mono">{empleado.antiguedad_al_retiro} años</span>
              </div>
              <div className="bg-white p-2 rounded border border-gray-200">
                <span className="text-[10px] text-gray-500 block">Sueldo Proyectado</span>
                <span className="text-sm font-bold text-blue-700 font-mono">{fmt(empleado.sueldo_proyectado)}</span>
              </div>
              <div className="bg-white p-2 rounded border border-gray-200">
                <span className="text-[10px] text-gray-500 block">Permanencia (1-r)ᵗ</span>
                <span className="text-sm font-bold text-gray-800 font-mono">{empleado.prob_permanencia.toFixed(4)}</span>
              </div>
            </div>
          </div>

          {/* 2. Desahucio Art. 185 */}
          <div className="border border-blue-200 bg-blue-50/30 rounded p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-blue-800 font-bold text-xs">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>2. Desahucio (Art. 185 del Código del Trabajo)</span>
              </div>
              <span className="text-sm font-bold text-blue-800 font-mono bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                VPO = {fmt(empleado.VPO_Desahucio)}
              </span>
            </div>

            <div className="p-3 bg-white rounded border border-blue-100 font-mono text-[11px] text-gray-800 space-y-1">
              <div className="flex justify-between">
                <span>Beneficio = 0.25 × Sueldo_Proy × Antig_Retiro:</span>
                <span className="font-bold">0.25 × {fmt(empleado.sueldo_proyectado)} × {empleado.antiguedad_al_retiro} = {fmt(empleado.beneficio_desahucio)}</span>
              </div>
              <div className="flex justify-between">
                <span>Factor Descuento (1 + i)ᵗ (i = {(variables.tasa_descuento * 100).toFixed(1)}%):</span>
                <span>{(1 + variables.tasa_descuento).toFixed(3)}^{empleado.anios_faltantes} = {empleado.factor_descuento.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span>Prob. Permanencia (1 - r)ᵗ (r = {(variables.tasa_rotacion * 100).toFixed(1)}%):</span>
                <span>{(1 - variables.tasa_rotacion).toFixed(3)}^{empleado.anios_faltantes} = {empleado.prob_permanencia.toFixed(4)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-gray-200 text-blue-800 font-bold">
                <span>VPO_Desahucio = (Beneficio × Permanencia) / Descuento:</span>
                <span>{fmt(empleado.VPO_Desahucio)}</span>
              </div>
            </div>
          </div>

          {/* 3. Jubilación Patronal Art. 216 */}
          <div className="border border-purple-200 bg-purple-50/30 rounded p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-purple-900 font-bold text-xs">
                <Award className="w-4 h-4 text-purple-600" />
                <span>3. Jubilación Patronal (Art. 216 del Código del Trabajo)</span>
              </div>
              <span className="text-sm font-bold text-purple-800 font-mono bg-purple-100 px-2 py-0.5 rounded border border-purple-200">
                VPO = {fmt(empleado.VPO_Jubilacion)}
              </span>
            </div>

            {empleado.elegible_jubilacion ? (
              <div className="p-3 bg-white rounded border border-purple-100 font-mono text-[11px] text-gray-800 space-y-1">
                <div className="flex justify-between">
                  <span>Coeficiente Tabla Art. 218 (Género {empleado.Genero}):</span>
                  <span className="font-bold">{empleado.coeficiente_tabla}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pensión Anual Teórica = (Sueldo_Proy × 12 × 0.05) / Coef:</span>
                  <span>{fmt(empleado.pension_anual_teorica)} / año ({fmt(empleado.pension_mensual_teorica)}/mes)</span>
                </div>
                <div className="flex justify-between text-amber-800 bg-amber-50 p-1 rounded font-bold">
                  <span>Límites SBU (Mín $230 - Máx $460):</span>
                  <span>{empleado.tope_aplicado} ➔ Pensión = {fmt(empleado.pension_mensual)}/mes</span>
                </div>
                <div className="flex justify-between">
                  <span>Pensión Anual Límite = {fmt(empleado.pension_mensual)} × 12:</span>
                  <span>{fmt(empleado.pension_anual_limite)} / año</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-gray-200 text-purple-900 font-bold">
                  <span>VPO_Jubilación = (Pensión × Coef × {variables.factor_supervivencia} × Perm.) / Desc.:</span>
                  <span>{fmt(empleado.VPO_Jubilacion)}</span>
                </div>
              </div>
            ) : (
              <div className="p-2.5 bg-white rounded text-gray-500 border border-gray-200">
                Antigüedad proyectada al retiro ({empleado.antiguedad_al_retiro} años) es menor a 25 años. No genera obligación. <strong>VPO = $0.00</strong>.
              </div>
            )}
          </div>

          {/* Consolidado */}
          <div className="bg-green-50 border border-green-300 rounded p-3.5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-green-900 uppercase tracking-wider block">
                VPO Total Consolidado (DBO NIC 19)
              </span>
              <span className="text-[11px] text-gray-600">Suma de Desahucio + Jubilación Patronal</span>
            </div>
            <span className="text-xl font-bold text-green-900 font-mono">
              {fmt(empleado.VPO_Total)}
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <button
            onClick={() => generarFichaActuarialPDF(empleado, variables)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            <span>Descargar Ficha Técnica PDF (Art. 185 y 216)</span>
          </button>
          
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
