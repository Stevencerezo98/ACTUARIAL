import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { KpiCards } from './components/KpiCards';
import { EmployeeTable } from './components/EmployeeTable';
import { EmptyStateDropzone } from './components/EmptyStateDropzone';
import { NiifReportView } from './components/NiifReportView';
import { DatabaseSchemaView } from './components/DatabaseSchemaView';
import { PythonScriptView } from './components/PythonScriptView';
import { LegalMethodology } from './components/LegalMethodology';
import { ActuarialCharts } from './components/ActuarialCharts';
import { MortalityTablesView } from './components/MortalityTablesView';
import { EmployeeDetailModal } from './components/EmployeeDetailModal';
import { UploadModal } from './components/UploadModal';
import { MacroVariablesModal } from './components/MacroVariablesModal';
import { CompanyConfigModal } from './components/CompanyConfigModal';

import { EmpleadoInput, EmpleadoProcesado, VariablesMacro, DatosEmpresaEstudio, DEFAULT_EMPRESA_CAJAMARCA } from './types/actuarial';
import { DEFAULT_VARIABLES_MACRO, procesarMotorActuarial, calcularSensibilidadNIIF } from './services/actuarialEngine';
import { generarEstudioWord } from './services/wordReportGenerator';
import { generarEstudioCompletoPDF } from './services/cajamarcaPdfReportGenerator';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  
  // DATOS INICIALES VACÍOS: Se eliminaron los datos de prueba a solicitud del usuario
  const [censusInput, setCensusInput] = useState<EmpleadoInput[]>([]);
  const [variables, setVariables] = useState<VariablesMacro>(DEFAULT_VARIABLES_MACRO);

  // Modales
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isVariablesOpen, setIsVariablesOpen] = useState<boolean>(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmpleadoProcesado | null>(null);

  // Procesamiento del motor actuarial
  const { resultados, resumen } = useMemo(() => {
    return procesarMotorActuarial(censusInput, variables);
  }, [censusInput, variables]);

  // Análisis de sensibilidad NIIF
  const sensibilidad = useMemo(() => {
    return calcularSensibilidadNIIF(censusInput, variables);
  }, [censusInput, variables]);

  const handleLoadData = (newData: EmpleadoInput[]) => {
    setCensusInput(newData);
    setActiveTab('dashboard');
  };

  const handleClearData = () => {
    setCensusInput([]);
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-gray-800 flex font-sans antialiased">
      
      {/* AdminLTE Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        variables={variables}
        onOpenVariables={() => setIsVariablesOpen(true)}
        isOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
        numEmpleados={censusInput.length}
      />

      {/* Main Content Wrapper (AdminLTE content-wrapper) */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* AdminLTE Navbar */}
        <Header
          resultados={resultados}
          resumen={resumen}
          variables={variables}
          sensibilidad={sensibilidad}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenUpload={() => setIsUploadOpen(true)}
          onOpenVariables={() => setIsVariablesOpen(true)}
          onClearData={handleClearData}
          hasData={censusInput.length > 0}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* AdminLTE Content Header (Breadcrumbs & Page Title) */}
        <div className="px-4 sm:px-6 pt-4 pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-200/80 bg-white/70">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-800 tracking-tight">
              {activeTab === 'dashboard' && 'Cálculo y Valuación Actuarial de Nómina (NIC 19)'}
              {activeTab === 'niif' && 'Módulo 3: Reportería Contable NIIF & Sensibilidad (NIC 19 § 145)'}
              {activeTab === 'database' && 'Modelo de Datos PostgreSQL & Backend FastAPI'}
              {activeTab === 'python' && 'Módulo de Funciones en Python (pandas & numpy)'}
              {activeTab === 'methodology' && 'Marco Jurídico & Metodología Actuarial'}
            </h1>
            <p className="text-xs text-gray-500">
              Desahucio (Art. 185) y Jubilación Patronal (Art. 216 con límites de SBU en Ecuador)
            </p>
          </div>

          <nav className="text-xs text-gray-500 flex items-center gap-1.5 font-medium">
            <span className="text-blue-600">Inicio</span>
            <span>/</span>
            <span className="text-gray-800 font-semibold">
              {activeTab === 'dashboard' && 'Nómina'}
              {activeTab === 'niif' && 'Reportes NIIF'}
              {activeTab === 'database' && 'PostgreSQL'}
              {activeTab === 'python' && 'Python'}
              {activeTab === 'methodology' && 'Metodología'}
            </span>
          </nav>
        </div>

        {/* AdminLTE Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 space-y-5">
          
          {/* Tab 1: Dashboard / Valuación */}
          {activeTab === 'dashboard' && (
            censusInput.length === 0 ? (
              <EmptyStateDropzone
                onLoadData={handleLoadData}
                onOpenVariables={() => setIsVariablesOpen(true)}
                variables={variables}
              />
            ) : (
              <div className="space-y-5">
                
                {/* Status Callout (Bootstrap alert style) */}
                <div className="bg-white border-l-4 border-l-green-600 p-3.5 rounded shadow-2xs border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                    <span className="text-gray-700">
                      Archivo procesado correctamente: <strong className="text-gray-900">{censusInput.length} colaboradores</strong> evaluados bajo NIC 19.
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveTab('niif')}
                      className="text-purple-600 hover:text-purple-800 font-bold hover:underline cursor-pointer"
                    >
                      Ver Reporte NIIF y Sensibilidad
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => setIsUploadOpen(true)}
                      className="text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer"
                    >
                      Subir otro archivo
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={handleClearData}
                      className="text-red-600 hover:text-red-800 hover:underline cursor-pointer"
                    >
                      Limpiar
                    </button>
                  </div>
                </div>

                {/* Small Box KPI Cards */}
                <KpiCards resumen={resumen} variables={variables} />

                {/* Gráficos Interactivos Recharts (Distribución de Pasivos y Flujo de Jubilación) */}
                <ActuarialCharts resultados={resultados} variables={variables} />

                {/* Employee Table */}
                <EmployeeTable
                  resultados={resultados}
                  resumen={resumen}
                  variables={variables}
                  sensibilidad={sensibilidad}
                  onSelectEmployee={setSelectedEmployee}
                  onOpenUpload={() => setIsUploadOpen(true)}
                  onClearData={handleClearData}
                />
              </div>
            )
          )}

          {/* Tab 2: Reportería NIIF y Sensibilidad */}
          {activeTab === 'niif' && (
            <NiifReportView
              resultados={resultados}
              resumen={resumen}
              variables={variables}
              sensibilidad={sensibilidad}
            />
          )}

          {/* Tab 3: Base de Datos PostgreSQL y Arquitectura */}
          {activeTab === 'database' && (
            <DatabaseSchemaView />
          )}

          {/* Tab 4: Python Script View */}
          {activeTab === 'python' && (
            <PythonScriptView />
          )}

          {/* Tab 5: Legal & Methodology */}
          {activeTab === 'methodology' && (
            <LegalMethodology />
          )}

        </main>

        {/* AdminLTE Footer */}
        <footer className="bg-white border-t border-gray-200 px-4 sm:px-6 py-3 text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>Sistema Actuarial NIC 19 Ecuador</strong> &copy; 2026 • Código del Trabajo (Art. 185 y 216).
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] text-gray-500">
            <span>i = {(variables.tasa_descuento * 100).toFixed(1)}%</span>
            <span>•</span>
            <span>s = {(variables.tasa_incremento_sal * 100).toFixed(1)}%</span>
            <span>•</span>
            <span>r = {(variables.tasa_rotacion * 100).toFixed(1)}%</span>
            <span>•</span>
            <span>SBU = ${variables.sbu_vigente}</span>
          </div>
        </footer>

      </div>

      {/* Modales */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onLoadData={handleLoadData}
      />

      <MacroVariablesModal
        isOpen={isVariablesOpen}
        onClose={() => setIsVariablesOpen(false)}
        variables={variables}
        onChangeVariables={setVariables}
      />

      <EmployeeDetailModal
        empleado={selectedEmployee}
        variables={variables}
        onClose={() => setSelectedEmployee(null)}
      />

    </div>
  );
}
