import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Download, 
  FileCode2, 
  Terminal, 
  ShieldCheck, 
  Layers, 
  Cpu
} from 'lucide-react';
import { PYTHON_SCRIPT_CODE } from '../data/pythonCode';

export const PythonScriptView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [quickSnippetCopied, setQuickSnippetCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(PYTHON_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([PYTHON_SCRIPT_CODE], { type: 'text/x-python;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'actuarial_nic19_ecuador.py');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const quickExampleCode = `# ==============================================================================
# EJEMPLO DE USO CON CUALQUIER ARCHIVO EXCEL DE NÓMINA (PANDAS Y NUMPY)
# ==============================================================================
import pandas as pd
from actuarial_nic19_ecuador import calcular_motor_actuarial

# 1. Definir variables macroeconómicas de Ecuador
variables_ecuador = {
    'tasa_descuento': 0.075,      # 7.5% Tasa de descuento financiero (bonos)
    'tasa_incremento_sal': 0.030,  # 3.0% Inflación / incremento salarial
    'tasa_rotacion': 0.050,        # 5.0% Rotación de personal de la empresa
    'sbu_vigente': 460.00,         # Salario Básico Unificado en Ecuador
    'edad_retiro': 65,             # Edad ordinaria de retiro
    'factor_supervivencia': 0.85   # Factor actuarial de supervivencia
}

# 2. Cargar tu archivo Excel de nómina
df_nomina = pd.read_excel('tu_archivo_nomina.xlsx')

# 3. Ejecutar el motor actuarial bajo NIC 19
df_resultado = calcular_motor_actuarial(df_nomina, variables_ecuador)

# 4. Exportar el resultado con VPO_Desahucio, VPO_Jubilacion y VPO_Total
df_resultado.to_excel('resultado_valuacion_nic19.xlsx', index=False)
print(f"VPO Total Consolidado: USD {df_resultado['VPO_Total'].sum():,.2f}")
`;

  return (
    <div className="space-y-5">
      
      {/* AdminLTE Card Header Banner */}
      <div className="bg-white border border-gray-200 rounded shadow-sm border-t-4 border-t-blue-600 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileCode2 className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-gray-900">
                Script Oficial en Python: <code className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-mono text-xs">actuarial_nic19_ecuador.py</code>
              </h3>
            </div>
            <p className="text-xs text-gray-600 mt-1 max-w-3xl">
              Implementación en <strong>pandas</strong> y <strong>numpy</strong> de la función <code className="font-mono bg-gray-100 px-1 py-0.5 rounded text-gray-800 font-bold">calcular_motor_actuarial(df_excel, variables_macro)</code> bajo el Código del Trabajo del Ecuador y la norma contable NIC 19.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
              <span>{copied ? '¡Copiado!' : 'Copiar Código'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Descargar .py</span>
            </button>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100 text-xs text-gray-600">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-gray-800 block">Manejo de Errores</strong>
              Try/except preventivo por fila para asegurar que celdas vacías o caracteres no rompan el cálculo masivo.
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Cpu className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-gray-800 block">Pandas & Numpy</strong>
              Manipulación eficiente de DataFrames con cálculo matricial de VPO Desahucio y Jubilación.
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Layers className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-gray-800 block">Límites SBU</strong>
              Validación legal de 0.5 SBU a 1.0 SBU mensual según Art. 216 del Código del Trabajo.
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Terminal className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-gray-800 block">Ejecución Autónoma</strong>
              Listo para ejecutar por consola con <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700 font-mono">python actuarial_nic19_ecuador.py</code>.
            </div>
          </div>
        </div>
      </div>

      {/* Snippet box */}
      <div className="bg-white border border-gray-200 rounded shadow-xs overflow-hidden">
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-xs font-semibold text-gray-700">
          <div className="flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-blue-600" />
            <span>Ejemplo de Llamada en tu Proyecto de Python</span>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(quickExampleCode);
              setQuickSnippetCopied(true);
              setTimeout(() => setQuickSnippetCopied(false), 2000);
            }}
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium cursor-pointer"
          >
            {quickSnippetCopied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{quickSnippetCopied ? 'Copiado' : 'Copiar snippet'}</span>
          </button>
        </div>
        <pre className="p-4 bg-gray-900 text-gray-100 font-mono text-xs overflow-x-auto leading-relaxed">
          <code>{quickExampleCode}</code>
        </pre>
      </div>

      {/* Full code box */}
      <div className="bg-white border border-gray-200 rounded shadow-xs overflow-hidden">
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-xs font-bold text-gray-800">
          <div className="flex items-center gap-1.5">
            <FileCode2 className="w-4 h-4 text-blue-600" />
            <span>Código Fuente Completo de la Función</span>
          </div>
          <span className="text-[11px] font-normal text-gray-500">
            Python 3.9+ • pandas • numpy
          </span>
        </div>
        <div className="p-4 bg-gray-950 text-gray-200 font-mono text-xs overflow-x-auto max-h-[500px] overflow-y-auto leading-relaxed">
          <pre>
            <code>{PYTHON_SCRIPT_CODE}</code>
          </pre>
        </div>
      </div>

    </div>
  );
};
