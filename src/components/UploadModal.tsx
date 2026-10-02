import React, { useState, useRef } from 'react';
import { EmpleadoInput } from '../types/actuarial';
import { leerArchivoNomina, descargarPlantillaOficial } from '../services/actuarialEngine';
import { EJEMPLO_USUARIO_DATA } from '../data/sampleCensus';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  Download, 
  ClipboardPaste, 
  AlertCircle,
  FileCheck
} from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadData: (data: EmpleadoInput[]) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onLoadData
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [activeTab, setActiveTab] = useState<'file' | 'paste'>('file');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const processBuffer = (buffer: any) => {
    try {
      setErrorMsg(null);
      const rows = leerArchivoNomina(buffer);
      if (rows.length === 0) {
        setErrorMsg('El archivo no contiene filas válidas.');
        return;
      }
      onLoadData(rows);
      onClose();
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
      onClose();
    } catch (err: any) {
      setErrorMsg(`Error al procesar el texto: ${err.message}`);
    }
  };

  const handleLoadPromptSample = () => {
    onLoadData(EJEMPLO_USUARIO_DATA);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-in fade-in">
      <div className="bg-white border border-gray-300 rounded shadow-xl w-full max-w-lg overflow-hidden">
        
        {/* Bootstrap Modal Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-blue-600" />
            <h5 className="font-bold text-sm text-gray-800">Cargar Archivo de Nómina</h5>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Bootstrap Nav Tabs */}
        <div className="px-5 pt-3 flex gap-4 border-b border-gray-200 bg-gray-50/50">
          <button
            onClick={() => setActiveTab('file')}
            className={`pb-2 text-xs font-bold border-b-2 transition ${
              activeTab === 'file'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Subir Archivo Excel/CSV
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`pb-2 text-xs font-bold border-b-2 transition ${
              activeTab === 'paste'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Pegar desde Portapapeles
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          
          {errorMsg && (
            <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'file' ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
                dragOver
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 bg-gray-50 hover:bg-white hover:border-blue-500'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-800">
                  Arrastra tu archivo aquí o <span className="text-blue-600 underline">haz clic para examinar</span>
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Formatos permitidos: .xlsx, .xls o .csv
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-xs">
              <label className="text-gray-700 block font-semibold">
                Pega aquí las filas copiadas desde Excel (incluye encabezados):
              </label>
              <textarea
                rows={5}
                value={pasteText}
                onChange={e => setPasteText(e.target.value)}
                placeholder="Cedula&#9;Nombre&#9;Genero&#9;Edad&#9;Antiguedad&#9;Sueldo_Actual&#10;1712345678&#9;Juan Perez&#9;M&#9;45&#9;15&#9;1200.00"
                className="w-full p-2.5 rounded bg-white border border-gray-300 text-xs font-mono text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleProcessPasted}
                  className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-2xs"
                >
                  Procesar Tabla
                </button>
              </div>
            </div>
          )}

          {/* Quick buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-gray-200 text-xs">
            <button
              onClick={handleLoadPromptSample}
              className="text-green-700 hover:text-green-800 hover:underline flex items-center gap-1 font-semibold"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Cargar ejemplo de verificación (3 casos)</span>
            </button>

            <button
              onClick={descargarPlantillaOficial}
              className="text-gray-600 hover:text-blue-700 flex items-center gap-1 font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Plantilla Excel</span>
            </button>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-2.5 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-medium"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
