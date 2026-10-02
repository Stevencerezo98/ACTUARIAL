import React from 'react';
import { 
  FileCode2, 
  Download, 
  Upload, 
  Sliders, 
  Trash2, 
  Scale, 
  Calculator, 
  BookOpen, 
  FileSpreadsheet, 
  Menu,
  Building,
  FileText,
  FileDown
} from 'lucide-react';
import { exportarResultadosAExcel, descargarPlantillaOficial } from '../services/actuarialEngine';
import { EmpleadoProcesado, ResumenMotor, VariablesMacro, ItemSensibilidad } from '../types/actuarial';
import { PYTHON_SCRIPT_CODE } from '../data/pythonCode';

interface HeaderProps {
  resultados: EmpleadoProcesado[];
  resumen: ResumenMotor;
  variables: VariablesMacro;
  sensibilidad?: ItemSensibilidad[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenUpload: () => void;
  onOpenVariables: () => void;
  onOpenCompanyConfig: () => void;
  onDownloadWord: () => void;
  onDownloadStudyPdf: () => void;
  onClearData: () => void;
  hasData: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
}

export const Header: React.FC<HeaderProps> = ({
  resultados,
  resumen,
  variables,
  sensibilidad,
  activeTab,
  setActiveTab,
  onOpenUpload,
  onOpenVariables,
  onOpenCompanyConfig,
  onDownloadWord,
  onDownloadStudyPdf,
  onClearData,
  hasData,
  sidebarOpen,
  setSidebarOpen
}) => {

  const handleDownloadPython = () => {
    const blob = new Blob([PYTHON_SCRIPT_CODE], { type: 'text/x-python;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'actuarial_nic19_ecuador.py');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
      <div className="px-4 py-2.5 flex items-center justify-between">
        
        {/* Left: Sidebar toggle & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(prev => !prev)}
            className="p-1.5 rounded text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition focus:outline-none"
            title="Alternar menú lateral (AdminLTE)"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-800 text-sm sm:text-base hidden sm:inline">
              Valuador NIC 19
            </span>
            <span className="bg-blue-100 text-blue-800 text-[11px] font-semibold px-2 py-0.5 rounded border border-blue-200">
              Ecuador • Art. 185 y 216
            </span>
          </div>
        </div>

        {/* Center / Right: Bootstrap-style Action Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          
          <button
            onClick={onOpenCompanyConfig}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium border border-gray-300 transition shadow-xs cursor-pointer"
            title="Configurar datos de la empresa para la portada y el estudio"
          >
            <Building className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Empresa</span>
          </button>

          <button
            onClick={onOpenVariables}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium border border-gray-300 transition shadow-xs cursor-pointer"
            title="Variables macroeconómicas (i, s, r, SBU)"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Variables</span>
          </button>

          <button
            onClick={onOpenUpload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Subir Archivo</span>
          </button>

          {hasData && (
            <>
              {/* Descargar Estudio Word (Formato Cajamarca) */}
              <button
                onClick={onDownloadWord}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#1e3a8a] hover:bg-blue-900 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                title="Generar y descargar Estudio Actuarial formal en Word (.docx) editable"
              >
                <FileText className="w-3.5 h-3.5 text-blue-200" />
                <span className="hidden md:inline">Estudio Word (.docx)</span>
              </button>

              {/* Descargar Estudio PDF (Formato Cajamarca) */}
              <button
                onClick={onDownloadStudyPdf}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                title="Generar y descargar Estudio Actuarial formal en PDF"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Estudio PDF</span>
              </button>

              <button
                onClick={() => exportarResultadosAExcel(resultados, resumen, variables, sensibilidad)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-green-600 hover:bg-green-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                title="Exportar libro de trabajo Excel (.xlsx) con 3 hojas NIIF"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Excel</span>
              </button>

              <button
                onClick={onClearData}
                className="inline-flex items-center gap-1 px-2 py-1.5 rounded bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-medium transition cursor-pointer"
                title="Limpiar datos de la tabla"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Limpiar</span>
              </button>
            </>
          )}

          <button
            onClick={handleDownloadPython}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-300 text-xs font-medium transition cursor-pointer"
            title="Descargar script en Python"
          >
            <FileCode2 className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden lg:inline">Script .py</span>
          </button>

        </div>
      </div>
    </nav>
  );
};
