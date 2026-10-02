import React, { useState, useRef } from 'react';
import { EmpleadoInput, VariablesMacro } from '../types/actuarial';
import { leerArchivoNomina, descargarPlantillaOficial } from '../services/actuarialEngine';
import { EJEMPLO_USUARIO_DATA } from '../data/sampleCensus';
import { 
  Upload, 
  FileSpreadsheet, 
  Download, 
  Sliders, 
  CheckCircle2, 
  ClipboardPaste, 
  Layers,
  Award,
  Scale,
  FileCheck
} from 'lucide-react';

interface EmptyStateDropzoneProps {
  onLoadData: (data: EmpleadoInput[]) => void;
  onOpenVariables: () => void;
  variables: VariablesMacro;
}

export const EmptyStateDropzone: React.FC<EmptyStateDropzoneProps> = ({
  onLoadData,
  onOpenVariables,
  variables
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processBuffer = (buffer: any) => {
    try {
      setErrorMsg(null);
      const rows = leerArchivoNomina(buffer);
      if (rows.length === 0) {
        setErrorMsg('El archivo no contiene filas válidas.');
        return;
      }
      onLoadData(rows);
    } catch (err: any) {
      setErrorMsg(`Error procesando el archivo: ${err.message}`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      processBuffer(evt.target?.result);
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      processBuffer(evt.target?.result);
    };
    reader.readAsBinaryString(file);
  };

  const handleProcessPasted = () => {
    if (!pasteText.trim()) return;
    try {
      setErrorMsg(null);
      const lines = pasteText.trim().split('\n');
      if (lines.length < 2) {
        setErrorMsg('Pegue al menos una fila de encabezados y una fila de datos.');
        return;
      }

      const sep = lines[0].includes('\t') ? '\t' : lines[0].includes(';') ? ';' : ',';
      const headers = lines[0].split(sep).map(h => h.trim().replace(/"/g, ''));

      const rows: EmpleadoInput[] = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(sep).map(p => p.trim().replace(/"/g, ''));
        if (parts.length >= 4) {
          const rowObj: any = {};
          headers.forEach((h, hIdx) => {
            rowObj[h] = parts[hIdx] ?? '';
          });

          rows.push({
            Cedula: rowObj['Cedula'] || rowObj['Cédula'] || parts[0] || '',
            Nombre: rowObj['Nombre'] || parts[1] || `Colaborador ${i}`,
            Genero: rowObj['Genero'] || rowObj['Género'] || parts[2] || 'M',
            Edad: rowObj['Edad'] || parts[3] || 35,
            Antiguedad: rowObj['Antiguedad'] || rowObj['Antigüedad'] || parts[4] || 1,
            Sueldo_Actual: rowObj['Sueldo_Actual'] || rowObj['Sueldo'] || parts[5] || 460
          });
        }
      }

      if (rows.length === 0) {
        setErrorMsg('No se pudieron leer filas válidas.');
        return;
      }

      onLoadData(rows);
    } catch (err: any) {
      setErrorMsg(`Error al procesar el texto: ${err.message}`);
    }
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      
      {/* AdminLTE Card: Macro Variables Bar */}
      <div className="bg-white border border-gray-200 rounded shadow-xs p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
          <span className="text-xs font-bold text-gray-700">Parámetros Actuariales de Entrada (Ecuador):</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-gray-700">
          <span className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200">
            Desc. (i): <strong>{(variables.tasa_descuento * 100).toFixed(2)}%</strong>
          </span>
          <span className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200">
            Salario (s): <strong>{(variables.tasa_incremento_sal * 100).toFixed(2)}%</strong>
          </span>
          <span className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200">
            Rotación (r): <strong>{(variables.tasa_rotacion * 100).toFixed(2)}%</strong>
          </span>
          <span className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200">
            SBU: <strong>${variables.sbu_vigente.toFixed(2)}</strong>
          </span>
          <span className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200">
            Retiro: <strong>{variables.edad_retiro} años</strong>
          </span>
        </div>

        <button
          onClick={onOpenVariables}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Configurar</span>
        </button>
      </div>

      {/* AdminLTE Card with Primary Top Border: Upload Dropzone */}
      <div className="bg-white border border-gray-200 rounded shadow-sm border-t-4 border-t-blue-600 overflow-hidden">
        
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-gray-800">
              Cargar Nómina de Colaboradores (Excel o CSV)
            </h3>
          </div>
          <span className="text-[11px] text-gray-500 font-medium">
            Sin datos precargados • Esperando archivo
          </span>
        </div>

        <div className="p-8 sm:p-12 text-center">
          
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 sm:p-10 transition-all ${
              dragOver
                ? 'border-blue-500 bg-blue-50/50'
                : 'border-gray-300 bg-gray-50/40 hover:border-blue-400 hover:bg-white'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <Upload className="w-7 h-7" />
            </div>

            <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-1">
              Arrastra tu archivo Excel aquí o haz clic para subirlo
            </h4>
            <p className="text-xs text-gray-500 max-w-md mx-auto mb-5">
              Acepta formatos <strong>.xlsx</strong>, <strong>.xls</strong> o <strong>.csv</strong>. El motor procesará automáticamente los cálculos de Desahucio (Art. 185) y Jubilación Patronal (Art. 216 con límites de SBU).
            </p>

            {errorMsg && (
              <div className="mb-4 p-2.5 rounded bg-red-50 border border-red-200 text-red-700 text-xs max-w-md mx-auto">
                {errorMsg}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Seleccionar Archivo de mi PC</span>
              </button>

              <button
                onClick={() => setPasteOpen(!pasteOpen)}
                className="px-3.5 py-2 rounded bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 font-medium text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <ClipboardPaste className="w-4 h-4 text-gray-600" />
                <span>Pegar Datos de Excel</span>
              </button>

              <button
                onClick={() => onLoadData(EJEMPLO_USUARIO_DATA)}
                className="px-3.5 py-2 rounded bg-green-50 hover:bg-green-100 text-green-700 border border-green-300 font-medium text-xs transition flex items-center gap-1.5 cursor-pointer"
                title="Cargar los 3 casos de verificación del prompt: Juan Perez, Maria Rodriguez, Carlos Cueva"
              >
                <FileCheck className="w-4 h-4 text-green-600" />
                <span>Probar Ejemplo del Prompt (3 Casos)</span>
              </button>
            </div>
          </div>

          {/* Paste area */}
          {pasteOpen && (
            <div className="mt-6 pt-5 border-t border-gray-200 text-left max-w-xl mx-auto space-y-2">
              <label className="text-xs font-bold text-gray-700 block">
                Pega aquí las celdas copiadas directamente de tu Excel:
              </label>
              <textarea
                rows={5}
                value={pasteText}
                onChange={e => setPasteText(e.target.value)}
                placeholder="Cedula&#9;Nombre&#9;Genero&#9;Edad&#9;Antiguedad&#9;Sueldo_Actual&#10;1712345678&#9;Juan Perez&#9;M&#9;45&#9;15&#9;1200.00&#10;0912345678&#9;Maria Rodriguez&#9;F&#9;30&#9;5&#9;850.00"
                className="w-full p-2.5 rounded bg-white border border-gray-300 text-xs font-mono text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setPasteOpen(false)}
                  className="px-3 py-1.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleProcessPasted}
                  className="px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs"
                >
                  Procesar Tabla
                </button>
              </div>
            </div>
          )}

          {/* Template download link */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
            <button
              onClick={descargarPlantillaOficial}
              className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar Plantilla Oficial Excel (.xlsx)</span>
            </button>
            <span>•</span>
            <span>Columnas: Cedula, Nombre, Genero, Edad, Antiguedad, Sueldo_Actual</span>
          </div>

        </div>
      </div>

      {/* Info Cards: AdminLTE Callout style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-white border-l-4 border-l-blue-600 p-4 rounded shadow-xs border border-gray-200">
          <h5 className="font-bold text-xs text-blue-900 mb-1 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-600" />
            1. Desahucio (Art. 185)
          </h5>
          <p className="text-[11px] text-gray-600 leading-relaxed">
            25% del sueldo proyectado al retiro multiplicado por los años de servicio proyectados, ponderado por permanencia <code className="bg-gray-100 px-1 py-0.5 rounded text-blue-800">(1-r)ᵗ</code> y descuento financiero <code className="bg-gray-100 px-1 py-0.5 rounded text-blue-800">(1+i)ᵗ</code>.
          </p>
        </div>

        <div className="bg-white border-l-4 border-l-amber-500 p-4 rounded shadow-xs border border-gray-200">
          <h5 className="font-bold text-xs text-amber-900 mb-1 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-600" />
            2. Jubilación Patronal (Art. 216)
          </h5>
          <p className="text-[11px] text-gray-600 leading-relaxed">
            Aplica únicamente si la antigüedad al retiro es ≥ 25 años. Valida topes legales: mínimo 0.5 SBU ($230) y máximo 1.0 SBU ($460).
          </p>
        </div>

        <div className="bg-white border-l-4 border-l-green-600 p-4 rounded shadow-xs border border-gray-200">
          <h5 className="font-bold text-xs text-green-900 mb-1 flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-green-600" />
            3. Cumplimiento NIC 19
          </h5>
          <p className="text-[11px] text-gray-600 leading-relaxed">
            Genera la Obligación por Beneficios Definidos (DBO), el costo de interés proyectado y permite exportar la nómina con todas las columnas a Excel.
          </p>
        </div>

      </div>

    </div>
  );
};
