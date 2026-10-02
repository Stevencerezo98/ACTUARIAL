import React, { useState } from 'react';
import { DatosEmpresaEstudio, DEFAULT_EMPRESA_CAJAMARCA } from '../types/actuarial';
import { X, Building, Check, RotateCcw, FileText, Award, Calendar, DollarSign } from 'lucide-react';

interface CompanyConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  empresa: DatosEmpresaEstudio;
  onChangeEmpresa: (nueva: DatosEmpresaEstudio) => void;
}

export const CompanyConfigModal: React.FC<CompanyConfigModalProps> = ({
  isOpen,
  onClose,
  empresa,
  onChangeEmpresa
}) => {
  const [formData, setFormData] = useState<DatosEmpresaEstudio>(empresa);

  if (!isOpen) return null;

  const handleChange = (field: keyof DatosEmpresaEstudio, val: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: val
    }));
  };

  const handleSave = () => {
    onChangeEmpresa(formData);
    onClose();
  };

  const handleResetCajamarca = () => {
    setFormData(DEFAULT_EMPRESA_CAJAMARCA);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-in fade-in">
      <div className="bg-white border border-gray-300 rounded shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Parámetros del Estudio Actuarial y Datos de la Empresa
              </h3>
              <p className="text-[11px] text-gray-500">
                Estos datos se incorporan en la portada, introducción, dictamen y anexos de los informes Word (.docx) y PDF.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs text-gray-700">
          
          {/* Preset Button */}
          <div className="flex items-center justify-between p-2.5 rounded bg-blue-50 border border-blue-200 text-blue-900">
            <div className="flex items-center gap-2 text-xs">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Plantilla oficial disponible: <strong>Cajamarca Protective Services Cía. Ltda.</strong></span>
            </div>
            <button
              onClick={handleResetCajamarca}
              className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] transition cursor-pointer"
            >
              Cargar Preset Cajamarca
            </button>
          </div>

          {/* Sección 1: Datos de la Empresa */}
          <div className="space-y-3">
            <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider border-b border-gray-200 pb-1 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-blue-600" />
              1. Razón Social y Domicilio Legal
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Nombre Legal de la Empresa:</label>
                <input
                  type="text"
                  value={formData.nombre_empresa}
                  onChange={e => handleChange('nombre_empresa', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Nombre Comercial (opcional):</label>
                <input
                  type="text"
                  value={formData.nombre_comercial}
                  onChange={e => handleChange('nombre_comercial', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">RUC:</label>
                <input
                  type="text"
                  value={formData.ruc}
                  onChange={e => handleChange('ruc', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Ciudad Domicilio:</label>
                <input
                  type="text"
                  value={formData.ciudad}
                  onChange={e => handleChange('ciudad', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Objeto Social / Actividad Económica:</label>
                <textarea
                  rows={2}
                  value={formData.objeto_social}
                  onChange={e => handleChange('objeto_social', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Sección 2: Fechas del Estudio */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider border-b border-gray-200 pb-1 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              2. Fechas de Corte y Emisión
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Fecha de Corte Valuación:</label>
                <input
                  type="text"
                  value={formData.fecha_corte_valuacion}
                  onChange={e => handleChange('fecha_corte_valuacion', e.target.value)}
                  placeholder="31 de diciembre de 2023"
                  className="w-full p-2 border border-gray-300 rounded text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Año Evaluado / Anterior:</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={formData.anio_evaluado}
                    onChange={e => handleChange('anio_evaluado', parseInt(e.target.value) || 2023)}
                    className="w-1/2 p-2 border border-gray-300 rounded text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="number"
                    value={formData.anio_anterior}
                    onChange={e => handleChange('anio_anterior', parseInt(e.target.value) || 2022)}
                    className="w-1/2 p-2 border border-gray-300 rounded text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Lugar y Fecha de Emisión:</label>
                <input
                  type="text"
                  value={formData.fecha_emision_informe}
                  onChange={e => handleChange('fecha_emision_informe', e.target.value)}
                  placeholder="Quito, abril de 2024"
                  className="w-full p-2 border border-gray-300 rounded text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Sección 3: Actuario Responsable */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider border-b border-gray-200 pb-1 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-blue-600" />
              3. Perito Actuario Responsable (Dictamen)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Nombre del Actuario:</label>
                <input
                  type="text"
                  value={formData.actuario_nombre}
                  onChange={e => handleChange('actuario_nombre', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Título / Especialidad:</label>
                <input
                  type="text"
                  value={formData.actuario_titulo}
                  onChange={e => handleChange('actuario_titulo', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Registro Superintendencia de Compañías:</label>
                <input
                  type="text"
                  value={formData.actuario_registro_scvs}
                  onChange={e => handleChange('actuario_registro_scvs', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Registro Superintendencia de Bancos:</label>
                <input
                  type="text"
                  value={formData.actuario_registro_sb}
                  onChange={e => handleChange('actuario_registro_sb', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Sección 4: Provisiones del Período Anterior */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider border-b border-gray-200 pb-1 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-blue-600" />
              4. Saldos de Balance Inicial (Año {formData.anio_anterior})
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Provisión Anterior Jubilación Patronal (USD):</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.provision_anterior_jubilacion}
                  onChange={e => handleChange('provision_anterior_jubilacion', parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-gray-300 rounded text-xs text-gray-900 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Provisión Anterior Desahucio (USD):</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.provision_anterior_desahucio}
                  onChange={e => handleChange('provision_anterior_desahucio', parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-gray-300 rounded text-xs text-gray-900 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <button
            onClick={handleResetCajamarca}
            className="text-xs text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Configuración</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
