import React from 'react';
import { 
  Calculator, 
  FileCode2, 
  Scale, 
  FileText,
  Database,
  Sliders,
  Activity
} from 'lucide-react';
import { VariablesMacro } from '../types/actuarial';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  variables: VariablesMacro;
  onOpenVariables: () => void;
  isOpen: boolean;
  onCloseMobile: () => void;
  numEmpleados: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  variables,
  onOpenVariables,
  isOpen,
  onCloseMobile,
  numEmpleados
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Cálculo de Nómina', icon: Calculator, badge: numEmpleados > 0 ? `${numEmpleados}` : '0' },
    { id: 'niif', label: 'Reportería NIIF & Sensibilidad', icon: FileText, badge: 'NIC 19' },
    { id: 'mortality', label: 'Tablas Mortalidad IESS', icon: Activity, badge: 'RO 650' },
    { id: 'methodology', label: 'Fórmulas y Base Legal', icon: Scale, badge: 'Ecuador' },
    { id: 'database', label: 'Arquitectura & PostgreSQL', icon: Database, badge: 'SQL' },
    { id: 'python', label: 'Código Python (Pandas)', icon: FileCode2, badge: 'FastAPI' },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      {/* AdminLTE Sidebar Container */}
      <aside className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#343a40] text-gray-300 flex flex-col shadow-lg transition-transform duration-200 lg:static lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Brand Logo Header */}
        <div className="h-14 px-4 border-b border-gray-700/80 flex items-center justify-between bg-[#2a2f35]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-black text-white text-sm shadow-sm">
              NIC
            </div>
            <div>
              <span className="font-bold text-white text-sm tracking-wide block leading-none">
                ACTUARIAL LTE
              </span>
              <span className="text-[10px] text-gray-400">Ecuador • NIC 19</span>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 py-4 px-3 space-y-4 overflow-y-auto">
          
          <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider px-2">
            Módulos del Sistema
          </div>

          <nav className="space-y-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition cursor-pointer ${
                    active
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    active ? 'bg-blue-700 text-white' : 'bg-gray-700 text-gray-300'
                  }`}>
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Macro Variables Box in Sidebar */}
          <div className="pt-4 border-t border-gray-700">
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                Variables de Entrada
              </span>
              <button 
                onClick={onOpenVariables}
                className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
              >
                Editar
              </button>
            </div>

            <div className="bg-[#2a2f35] rounded p-2.5 space-y-1.5 text-[11px] font-mono border border-gray-700">
              <div className="flex justify-between text-gray-300">
                <span className="text-gray-400">Desc. (i):</span>
                <span className="text-emerald-400 font-bold">{(variables.tasa_descuento * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span className="text-gray-400">Salario (s):</span>
                <span className="text-blue-400 font-bold">{(variables.tasa_incremento_sal * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span className="text-gray-400">Rotación (r):</span>
                <span className="text-amber-400 font-bold">{(variables.tasa_rotacion * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span className="text-gray-400">SBU:</span>
                <span className="text-white font-bold">${variables.sbu_vigente.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span className="text-gray-400">Retiro:</span>
                <span className="text-white">{variables.edad_retiro} años</span>
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-gray-700/80 bg-[#2a2f35] text-[10px] text-gray-400 text-center">
          AdminLTE 3 • NIC 19 Ecuador
        </div>

      </aside>
    </>
  );
};
