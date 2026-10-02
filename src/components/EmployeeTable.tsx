import React, { useState, useMemo } from 'react';
import { EmpleadoProcesado, VariablesMacro, ResumenMotor, ItemSensibilidad } from '../types/actuarial';
import { 
  Search, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Upload, 
  Download, 
  Trash2, 
  FileSpreadsheet,
  AlertTriangle,
  FileDown,
  CheckSquare,
  Square
} from 'lucide-react';
import { exportarResultadosAExcel } from '../services/actuarialEngine';
import { generarFichaActuarialPDF } from '../services/pdfReportGenerator';

interface EmployeeTableProps {
  resultados: EmpleadoProcesado[];
  resumen: ResumenMotor;
  variables: VariablesMacro;
  sensibilidad?: ItemSensibilidad[];
  onSelectEmployee: (emp: EmpleadoProcesado) => void;
  onOpenUpload: () => void;
  onClearData: () => void;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  resultados,
  resumen,
  variables,
  sensibilidad,
  onSelectEmployee,
  onOpenUpload,
  onClearData
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'eligible' | 'not_eligible' | 'capped'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filteredData = useMemo(() => {
    return resultados.filter(emp => {
      const term = searchTerm.toLowerCase();
      const matchSearch = 
        emp.Nombre.toLowerCase().includes(term) || 
        emp.Cedula.includes(term) ||
        (emp.Cargo && emp.Cargo.toLowerCase().includes(term));

      if (!matchSearch) return false;

      if (filterType === 'eligible') return emp.elegible_jubilacion;
      if (filterType === 'not_eligible') return !emp.elegible_jubilacion;
      if (filterType === 'capped') return emp.tope_aplicado !== 'NINGUNO';

      return true;
    });
  }, [resultados, searchTerm, filterType]);

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredData.length && filteredData.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredData.map(e => e.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleDownloadSelectedPDFs = () => {
    const seleccionados = resultados.filter(e => selectedIds.has(e.id));
    if (seleccionados.length === 0) return;
    
    seleccionados.forEach((emp, index) => {
      setTimeout(() => {
        generarFichaActuarialPDF(emp, variables);
      }, index * 200);
    });
  };

  const fmt = (v: number) => `$ ${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="bg-white border border-gray-200 rounded shadow-sm border-t-4 border-t-blue-600 overflow-hidden">
      
      {/* AdminLTE Card Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-gray-50/70">
        
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-gray-800">
            Tabla de Valuación Actuarial por Colaborador
          </h3>
          <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2 py-0.5 rounded ml-1">
            {resultados.length} filas
          </span>
        </div>

        {/* Card Tools & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Search Box (Bootstrap Input Group style) */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por cédula o nombre..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1 rounded bg-white border border-gray-300 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-48 sm:w-60"
            />
          </div>

          {/* Filter button group */}
          <div className="inline-flex rounded shadow-2xs border border-gray-300 text-xs overflow-hidden">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 font-medium transition ${
                filterType === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType('eligible')}
              className={`px-2.5 py-1 font-medium border-l border-gray-300 transition ${
                filterType === 'eligible' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Elegibles ({resultados.filter(r => r.elegible_jubilacion).length})
            </button>
            <button
              onClick={() => setFilterType('capped')}
              className={`px-2.5 py-1 font-medium border-l border-gray-300 transition ${
                filterType === 'capped' ? 'bg-amber-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Con Topes SBU
            </button>
          </div>

          {selectedIds.size > 0 && (
            <button
              onClick={handleDownloadSelectedPDFs}
              className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-2xs flex items-center gap-1 cursor-pointer transition animate-in fade-in"
              title="Descargar Ficha Actuarial en PDF de los colaboradores seleccionados"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>PDF ({selectedIds.size})</span>
            </button>
          )}

          <button
            onClick={() => exportarResultadosAExcel(resultados, resumen, variables, sensibilidad)}
            className="px-2.5 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-xs font-semibold shadow-2xs flex items-center gap-1 cursor-pointer"
            title="Exportar archivo Excel con 3 hojas contables NIIF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>

          <button
            onClick={onOpenUpload}
            className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs flex items-center gap-1 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Subir Otro</span>
          </button>
        </div>
      </div>

      {/* Bootstrap Light Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-gray-100 text-gray-700 uppercase font-bold text-[10px] tracking-wider border-b border-gray-300">
            <tr>
              <th className="py-2.5 px-2 text-center border-r border-gray-200 w-8">
                <input
                  type="checkbox"
                  checked={filteredData.length > 0 && selectedIds.size === filteredData.length}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  title="Seleccionar / Deseleccionar todos"
                />
              </th>
              <th className="py-2.5 px-3 border-r border-gray-200">Cédula / Colaborador</th>
              <th className="py-2.5 px-2 text-center border-r border-gray-200">Gen</th>
              <th className="py-2.5 px-2 text-center border-r border-gray-200">Edad / Antig.</th>
              <th className="py-2.5 px-2 text-center border-r border-gray-200">Años Falt.</th>
              <th className="py-2.5 px-2 text-center border-r border-gray-200">Antig. Retiro</th>
              <th className="py-2.5 px-3 text-right border-r border-gray-200">Sueldo Actual</th>
              <th className="py-2.5 px-3 text-right border-r border-gray-200">Sueldo Proy.</th>
              <th className="py-2.5 px-3 text-right text-blue-800 font-bold bg-blue-50/50 border-r border-gray-200">
                VPO Desahucio (Art. 185)
              </th>
              <th className="py-2.5 px-2 text-center border-r border-gray-200">Jubilación (≥25a)</th>
              <th className="py-2.5 px-3 text-right border-r border-gray-200">Pensión Acotada</th>
              <th className="py-2.5 px-3 text-right text-purple-900 font-bold bg-purple-50/40 border-r border-gray-200">
                VPO Jubilación (Art. 216)
              </th>
              <th className="py-2.5 px-3 text-right text-gray-900 font-bold bg-green-50/50 border-r border-gray-200">
                VPO Total (DBO)
              </th>
              <th className="py-2.5 px-3 text-center whitespace-nowrap">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-800 font-mono text-[11px]">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={14} className="py-8 text-center text-gray-500 font-sans text-xs">
                  No se encontraron colaboradores que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              filteredData.map((emp, idx) => (
                <tr 
                  key={emp.id} 
                  className={`hover:bg-blue-50/60 transition ${
                    selectedIds.has(emp.id) ? 'bg-blue-50/80 font-medium' : idx % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'
                  }`}
                >
                  
                  {/* Checkbox Selector */}
                  <td className="py-2 px-2 text-center border-r border-gray-200">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(emp.id)}
                      onChange={() => toggleSelectOne(emp.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </td>

                  {/* Cédula y Nombre */}
                  <td className="py-2 px-3 border-r border-gray-200">
                    <div className="font-semibold text-gray-900 font-sans flex items-center gap-1">
                      {emp.Nombre}
                      {emp.warnings && emp.warnings.length > 0 && (
                        <span title={emp.warnings.join(' | ')} className="text-amber-500 cursor-help">
                          <AlertTriangle className="w-3.5 h-3.5 inline" />
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-500">{emp.Cedula}</div>
                  </td>

                  {/* Género */}
                  <td className="py-2 px-2 text-center border-r border-gray-200">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      emp.Genero === 'F' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {emp.Genero}
                    </span>
                  </td>

                  {/* Edad / Antigüedad */}
                  <td className="py-2 px-2 text-center whitespace-nowrap border-r border-gray-200">
                    <span className="font-bold text-gray-800">{emp.Edad}a</span>
                    <span className="text-gray-400 mx-1">/</span>
                    <span className="text-gray-600">{emp.Antiguedad}a</span>
                  </td>

                  {/* Años Faltantes */}
                  <td className="py-2 px-2 text-center text-gray-600 border-r border-gray-200">
                    {emp.anios_faltantes}
                  </td>

                  {/* Antigüedad al Retiro */}
                  <td className="py-2 px-2 text-center border-r border-gray-200">
                    <span className={`font-bold ${
                      emp.antiguedad_al_retiro >= 25 ? 'text-green-700' : 'text-gray-500'
                    }`}>
                      {emp.antiguedad_al_retiro}a
                    </span>
                  </td>

                  {/* Sueldo Actual */}
                  <td className="py-2 px-3 text-right text-gray-900 border-r border-gray-200">
                    {fmt(emp.Sueldo_Actual)}
                  </td>

                  {/* Sueldo Proyectado */}
                  <td className="py-2 px-3 text-right text-gray-600 border-r border-gray-200">
                    {fmt(emp.sueldo_proyectado)}
                  </td>

                  {/* VPO Desahucio */}
                  <td className="py-2 px-3 text-right text-blue-700 font-bold bg-blue-50/50 border-r border-gray-200">
                    {fmt(emp.VPO_Desahucio)}
                  </td>

                  {/* Elegibilidad Jubilación */}
                  <td className="py-2 px-2 text-center border-r border-gray-200">
                    {emp.elegible_jubilacion ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-200 font-sans">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                        SÍ ({emp.antiguedad_al_retiro}a)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 font-sans">
                        <XCircle className="w-3 h-3" />
                        NO
                      </span>
                    )}
                  </td>

                  {/* Pensión Mensual Acotada */}
                  <td className="py-2 px-3 text-right border-r border-gray-200">
                    {emp.elegible_jubilacion ? (
                      <div>
                        <span className="text-purple-800 font-semibold">{fmt(emp.pension_mensual)}</span>
                        {emp.tope_aplicado !== 'NINGUNO' && (
                          <span className="block text-[9px] font-sans font-bold text-amber-700">
                            {emp.tope_aplicado === 'MINIMO_0.5_SBU' ? 'Tope 0.5 SBU' : 'Tope 1.0 SBU'}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>

                  {/* VPO Jubilación */}
                  <td className="py-2 px-3 text-right text-purple-800 font-bold bg-purple-50/40 border-r border-gray-200">
                    {emp.elegible_jubilacion ? fmt(emp.VPO_Jubilacion) : <span className="text-gray-400">$0.00</span>}
                  </td>

                  {/* VPO Total */}
                  <td className="py-2 px-3 text-right text-gray-900 font-bold bg-green-50/60 border-r border-gray-200 text-xs">
                    {fmt(emp.VPO_Total)}
                  </td>

                  {/* Acciones */}
                  <td className="py-2 px-2 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onSelectEmployee(emp)}
                        className="p-1 rounded text-blue-600 hover:text-blue-800 hover:bg-blue-100 transition cursor-pointer"
                        title="Ver memoria de cálculo y fórmulas exactas de este colaborador"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          generarFichaActuarialPDF(emp, variables);
                        }}
                        className="p-1 rounded text-red-600 hover:text-red-800 hover:bg-red-100 transition cursor-pointer"
                        title="Descargar Ficha Técnica Actuarial en PDF"
                      >
                        <FileDown className="w-4 h-4" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* AdminLTE Card Footer */}
      <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-600 gap-2">
        <div>
          Mostrando <strong className="text-gray-900">{filteredData.length}</strong> de <strong className="text-gray-900">{resultados.length}</strong> colaboradores calculados
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px] text-gray-500">
          <span>Desc. i = <strong>{(variables.tasa_descuento * 100).toFixed(1)}%</strong></span>
          <span>Sal. s = <strong>{(variables.tasa_incremento_sal * 100).toFixed(1)}%</strong></span>
          <span>Rot. r = <strong>{(variables.tasa_rotacion * 100).toFixed(1)}%</strong></span>
          <span>SBU = <strong>${variables.sbu_vigente}</strong></span>
        </div>
      </div>

    </div>
  );
};
