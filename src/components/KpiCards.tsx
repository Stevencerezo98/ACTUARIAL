import React from 'react';
import { ResumenMotor, VariablesMacro } from '../types/actuarial';
import { 
  DollarSign, 
  Users, 
  Award, 
  Layers, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';

interface KpiCardsProps {
  resumen: ResumenMotor;
  variables: VariablesMacro;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ resumen, variables }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* 1. Small Box Blue (Primary): VPO Total / DBO */}
      <div className="bg-blue-600 text-white rounded shadow-sm overflow-hidden relative flex flex-col justify-between">
        <div className="p-4 relative z-10">
          <div className="text-2xl font-bold font-mono tracking-tight">
            {formatCurrency(resumen.vpo_total)}
          </div>
          <p className="text-xs uppercase font-semibold text-blue-100 mt-1">
            Obligación Total DBO (NIC 19)
          </p>
          <span className="text-[10px] text-blue-200 block mt-0.5">
            Pasivo consolidado de balance general
          </span>
        </div>
        <div className="absolute right-3 top-3 text-blue-400/30 z-0">
          <DollarSign className="w-16 h-16" />
        </div>
        <div className="bg-black/15 py-1 px-4 text-[11px] font-medium text-white/90 flex items-center justify-between">
          <span>Desahucio + Jubilación</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* 2. Small Box Green (Success): VPO Desahucio Art. 185 */}
      <div className="bg-green-600 text-white rounded shadow-sm overflow-hidden relative flex flex-col justify-between">
        <div className="p-4 relative z-10">
          <div className="text-2xl font-bold font-mono tracking-tight">
            {formatCurrency(resumen.vpo_desahucio_total)}
          </div>
          <p className="text-xs uppercase font-semibold text-green-100 mt-1">
            VPO Desahucio (Art. 185)
          </p>
          <span className="text-[10px] text-green-200 block mt-0.5">
            25% sueldo proyectado por servicio al retiro
          </span>
        </div>
        <div className="absolute right-3 top-3 text-green-400/30 z-0">
          <Layers className="w-16 h-16" />
        </div>
        <div className="bg-black/15 py-1 px-4 text-[11px] font-medium text-white/90 flex items-center justify-between">
          <span>Factor permanencia (1-r)ᵗ</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* 3. Small Box Yellow/Orange (Warning): VPO Jubilación Patronal Art. 216 */}
      <div className="bg-amber-500 text-white rounded shadow-sm overflow-hidden relative flex flex-col justify-between">
        <div className="p-4 relative z-10">
          <div className="text-2xl font-bold font-mono tracking-tight">
            {formatCurrency(resumen.vpo_jubilacion_total)}
          </div>
          <p className="text-xs uppercase font-semibold text-amber-100 mt-1">
            VPO Jubilación Patronal (Art. 216)
          </p>
          <span className="text-[10px] text-amber-100 block mt-0.5">
            Topes 0.5 - 1.0 SBU (${variables.sbu_vigente * 0.5} a ${variables.sbu_vigente})
          </span>
        </div>
        <div className="absolute right-3 top-3 text-amber-300/30 z-0">
          <Award className="w-16 h-16" />
        </div>
        <div className="bg-black/15 py-1 px-4 text-[11px] font-medium text-white/90 flex items-center justify-between">
          <span>Antigüedad al retiro ≥ 25 años</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* 4. Small Box Red/Info: Colaboradores / Interés */}
      <div className="bg-cyan-600 text-white rounded shadow-sm overflow-hidden relative flex flex-col justify-between">
        <div className="p-4 relative z-10">
          <div className="text-2xl font-bold font-mono tracking-tight">
            {resumen.empleados_elegibles} / {resumen.total_empleados}
          </div>
          <p className="text-xs uppercase font-semibold text-cyan-100 mt-1">
            Elegibles a Jubilación ({resumen.porcentaje_elegibles}%)
          </p>
          <span className="text-[10px] text-cyan-100 block mt-0.5">
            Costo Interés (VPO × i): {formatCurrency(resumen.costo_interes_estimado)}
          </span>
        </div>
        <div className="absolute right-3 top-3 text-cyan-300/30 z-0">
          <Users className="w-16 h-16" />
        </div>
        <div className="bg-black/15 py-1 px-4 text-[11px] font-medium text-white/90 flex items-center justify-between">
          <span>Nómina: {formatCurrency(resumen.nomina_mensual_total)}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>

    </div>
  );
};
