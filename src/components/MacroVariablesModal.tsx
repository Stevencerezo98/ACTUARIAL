import React from 'react';
import { VariablesMacro } from '../types/actuarial';
import { X, Sliders, RotateCcw, Check } from 'lucide-react';
import { DEFAULT_VARIABLES_MACRO } from '../services/actuarialEngine';

interface MacroVariablesModalProps {
  isOpen: boolean;
  onClose: () => void;
  variables: VariablesMacro;
  onChangeVariables: (vars: VariablesMacro) => void;
}

export const MacroVariablesModal: React.FC<MacroVariablesModalProps> = ({
  isOpen,
  onClose,
  variables,
  onChangeVariables
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-in fade-in">
      <div className="bg-white border border-gray-300 rounded shadow-xl w-full max-w-lg overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h5 className="font-bold text-sm text-gray-800">Variables Macroeconómicas y Actuariales</h5>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Tasa Descuento */}
            <div className="bg-gray-50 p-3 rounded border border-gray-200 space-y-1">
              <div className="flex justify-between items-center">
                <label className="font-bold text-gray-700">Tasa de Descuento (i)</label>
                <span className="font-mono font-bold text-blue-700">
                  {(variables.tasa_descuento * 100).toFixed(2)}%
                </span>
              </div>
              <input
                type="number"
                step="0.001"
                min="0.01"
                max="0.20"
                value={variables.tasa_descuento}
                onChange={e => onChangeVariables({ ...variables, tasa_descuento: parseFloat(e.target.value) || 0.075 })}
                className="w-full px-2.5 py-1.5 rounded bg-white border border-gray-300 text-gray-800 font-mono text-xs focus:border-blue-500 focus:outline-none"
              />
              <span className="text-[10px] text-gray-500 block">Bonos de mercado en USD</span>
            </div>

            {/* Tasa Incremento Salarial */}
            <div className="bg-gray-50 p-3 rounded border border-gray-200 space-y-1">
              <div className="flex justify-between items-center">
                <label className="font-bold text-gray-700">Incremento Salarial (s)</label>
                <span className="font-mono font-bold text-green-700">
                  {(variables.tasa_incremento_sal * 100).toFixed(2)}%
                </span>
              </div>
              <input
                type="number"
                step="0.001"
                min="0.00"
                max="0.15"
                value={variables.tasa_incremento_sal}
                onChange={e => onChangeVariables({ ...variables, tasa_incremento_sal: parseFloat(e.target.value) || 0.03 })}
                className="w-full px-2.5 py-1.5 rounded bg-white border border-gray-300 text-gray-800 font-mono text-xs focus:border-blue-500 focus:outline-none"
              />
              <span className="text-[10px] text-gray-500 block">Inflación / mérito proyectado</span>
            </div>

            {/* Tasa Rotación */}
            <div className="bg-gray-50 p-3 rounded border border-gray-200 space-y-1">
              <div className="flex justify-between items-center">
                <label className="font-bold text-gray-700">Tasa de Rotación (r)</label>
                <span className="font-mono font-bold text-amber-700">
                  {(variables.tasa_rotacion * 100).toFixed(2)}%
                </span>
              </div>
              <input
                type="number"
                step="0.001"
                min="0.00"
                max="0.25"
                value={variables.tasa_rotacion}
                onChange={e => onChangeVariables({ ...variables, tasa_rotacion: parseFloat(e.target.value) || 0.05 })}
                className="w-full px-2.5 py-1.5 rounded bg-white border border-gray-300 text-gray-800 font-mono text-xs focus:border-blue-500 focus:outline-none"
              />
              <span className="text-[10px] text-gray-500 block">Salidas anuales de la empresa</span>
            </div>

            {/* SBU Vigente */}
            <div className="bg-gray-50 p-3 rounded border border-gray-200 space-y-1">
              <div className="flex justify-between items-center">
                <label className="font-bold text-gray-700">SBU Vigente (Ecuador)</label>
                <span className="font-mono font-bold text-gray-900">$ {variables.sbu_vigente.toFixed(2)}</span>
              </div>
              <input
                type="number"
                step="1"
                min="300"
                max="1000"
                value={variables.sbu_vigente}
                onChange={e => onChangeVariables({ ...variables, sbu_vigente: parseFloat(e.target.value) || 460.00 })}
                className="w-full px-2.5 py-1.5 rounded bg-white border border-gray-300 text-gray-800 font-mono text-xs focus:border-blue-500 focus:outline-none"
              />
              <span className="text-[10px] text-gray-500 block">Topes: $ {variables.sbu_vigente * 0.5} a $ {variables.sbu_vigente}</span>
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-gray-200">
            <div>
              <label className="text-gray-700 font-semibold block text-[11px] mb-1">Edad de Retiro</label>
              <input
                type="number"
                value={variables.edad_retiro}
                onChange={e => onChangeVariables({ ...variables, edad_retiro: parseInt(e.target.value) || 65 })}
                className="w-full px-2 py-1 rounded bg-white border border-gray-300 text-gray-800 font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-gray-700 font-semibold block text-[11px] mb-1">Supervivencia</label>
              <input
                type="number"
                step="0.01"
                value={variables.factor_supervivencia}
                onChange={e => onChangeVariables({ ...variables, factor_supervivencia: parseFloat(e.target.value) || 0.85 })}
                className="w-full px-2 py-1 rounded bg-white border border-gray-300 text-gray-800 font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-gray-700 font-semibold block text-[11px] mb-1">Coef. Tabla M / F</label>
              <div className="flex gap-1">
                <input
                  type="number"
                  step="0.1"
                  value={variables.coeficiente_tabla_m}
                  onChange={e => onChangeVariables({ ...variables, coeficiente_tabla_m: parseFloat(e.target.value) || 11.5 })}
                  className="w-1/2 px-1.5 py-1 rounded bg-white border border-gray-300 text-gray-800 font-mono text-xs text-center"
                  title="Hombres"
                />
                <input
                  type="number"
                  step="0.1"
                  value={variables.coeficiente_tabla_f}
                  onChange={e => onChangeVariables({ ...variables, coeficiente_tabla_f: parseFloat(e.target.value) || 13.0 })}
                  className="w-1/2 px-1.5 py-1 rounded bg-white border border-gray-300 text-gray-800 font-mono text-xs text-center"
                  title="Mujeres"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={() => onChangeVariables(DEFAULT_VARIABLES_MACRO)}
            className="text-xs text-gray-600 hover:text-blue-700 flex items-center gap-1 font-medium cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Valores Sugeridos</span>
          </button>
          
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs cursor-pointer"
          >
            Aplicar y Recalcular
          </button>
        </div>

      </div>
    </div>
  );
};
