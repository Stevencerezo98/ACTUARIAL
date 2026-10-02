import React, { useState, useMemo } from 'react';
import { EmpleadoProcesado, VariablesMacro } from '../types/actuarial';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart as PieIcon, 
  Filter, 
  Calendar,
  Layers,
  Award
} from 'lucide-react';

interface ActuarialChartsProps {
  resultados: EmpleadoProcesado[];
  variables: VariablesMacro;
}

export const ActuarialCharts: React.FC<ActuarialChartsProps> = ({
  resultados,
  variables
}) => {
  const [generoFiltro, setGeneroFiltro] = useState<'TODOS' | 'M' | 'F'>('TODOS');
  const [horizonteFlujo, setHorizonteFlujo] = useState<number>(15); // 10, 15, 20 años

  // Filtrado reactivo para los gráficos (Slicer interactivo)
  const datosFiltrados = useMemo(() => {
    return resultados.filter(e => {
      if (generoFiltro === 'TODOS') return true;
      return e.Genero === generoFiltro;
    });
  }, [resultados, generoFiltro]);

  // 1. Distribución de Pasivos por Rangos de Edad
  const datosDistribucionEdad = useMemo(() => {
    const rangos = [
      { key: '< 30', label: '< 30 años', min: 0, max: 29 },
      { key: '30-39', label: '30 a 39 años', min: 30, max: 39 },
      { key: '40-49', label: '40 a 49 años', min: 40, max: 49 },
      { key: '50-59', label: '50 a 59 años', min: 50, max: 59 },
      { key: '60+', label: '60+ años', min: 60, max: 120 },
    ];

    return rangos.map(r => {
      const empsEnRango = datosFiltrados.filter(e => e.Edad >= r.min && e.Edad <= r.max);
      const vpoDesahucio = empsEnRango.reduce((acc, e) => acc + e.VPO_Desahucio, 0);
      const vpoJubilacion = empsEnRango.reduce((acc, e) => acc + e.VPO_Jubilacion, 0);
      const vpoTotal = vpoDesahucio + vpoJubilacion;

      return {
        rango: r.key,
        nombreLargo: r.label,
        empleados: empsEnRango.length,
        vpo_desahucio: Math.round(vpoDesahucio * 100) / 100,
        vpo_jubilacion: Math.round(vpoJubilacion * 100) / 100,
        vpo_total: Math.round(vpoTotal * 100) / 100,
      };
    });
  }, [datosFiltrados]);

  // 2. Proyección de Flujo de Pagos de Jubilación Patronal (Cash Flow Proyectado)
  const datosFlujoPagos = useMemo(() => {
    const anioActual = new Date().getFullYear();
    const flujos = [];

    for (let i = 1; i <= horizonteFlujo; i++) {
      const anioFuturo = anioActual + i;
      
      // Jubilados activos en el año i: empleados elegibles que ya habrán cumplido 65 años (anios_faltantes <= i)
      const jubiladosEnAnio = datosFiltrados.filter(e => e.elegible_jubilacion && e.anios_faltantes <= i);
      
      // Flujo de pensiones en ese año (con factor de supervivencia acumulado)
      const flujoAnualJubilacion = jubiladosEnAnio.reduce((acc, e) => {
        const pensionAnual = e.pension_anual_limite;
        const aniosEnJubilacion = i - e.anios_faltantes;
        // Ponderación de supervivencia biológica post-retiro (desvanecimiento natural)
        const factorSobrev = Math.max(0.40, Math.pow(variables.factor_supervivencia, aniosEnJubilacion * 0.35));
        return acc + (pensionAnual * factorSobrev);
      }, 0);

      // Flujo estimado de liquidaciones por desahucio de quienes se retiran exactamente en el año i
      const retirosEnAnio = datosFiltrados.filter(e => e.anios_faltantes === i);
      const flujoDesahucio = retirosEnAnio.reduce((acc, e) => acc + e.beneficio_desahucio, 0);

      flujos.push({
        anio: `Año +${i} (${anioFuturo})`,
        anioNumero: i,
        flujo_jubilacion: Math.round(flujoAnualJubilacion * 100) / 100,
        flujo_desahucio: Math.round(flujoDesahucio * 100) / 100,
        flujo_total: Math.round((flujoAnualJubilacion + flujoDesahucio) * 100) / 100,
        jubilados_beneficiarios: jubiladosEnAnio.length
      });
    }

    return flujos;
  }, [datosFiltrados, horizonteFlujo, variables.factor_supervivencia]);

  // 3. Proporción de la Obligación DBO (Desahucio vs Jubilación)
  const datosPie = useMemo(() => {
    const totalDesahucio = datosFiltrados.reduce((a, b) => a + b.VPO_Desahucio, 0);
    const totalJubilacion = datosFiltrados.reduce((a, b) => a + b.VPO_Jubilacion, 0);
    const total = totalDesahucio + totalJubilacion;

    return [
      { 
        name: 'Desahucio (Art. 185)', 
        value: Math.round(totalDesahucio * 100) / 100,
        porcentaje: total > 0 ? Math.round((totalDesahucio / total) * 1000) / 10 : 0,
        color: '#2563eb' // Azul
      },
      { 
        name: 'Jubilación Patronal (Art. 216)', 
        value: Math.round(totalJubilacion * 100) / 100,
        porcentaje: total > 0 ? Math.round((totalJubilacion / total) * 1000) / 10 : 0,
        color: '#f59e0b' // Ámbar/Naranja
      }
    ];
  }, [datosFiltrados]);

  const fmtMoneda = (val: number) => {
    if (val >= 1000000) return `$ ${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `$ ${(val / 1000).toFixed(1)}k`;
    return `$ ${val.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  };

  const fmtTooltip = (val: any) => {
    const num = Number(val) || 0;
    return [`$ ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, ''];
  };

  return (
    <div className="space-y-4">
      
      {/* Slicers Toolbar (Filtros interactivos de segmentación estilo Excel / AdminLTE) */}
      <div className="bg-white border border-gray-200 rounded p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">
            Segmentadores Actuariales (Slicers):
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          
          {/* Slicer Género */}
          <div className="inline-flex rounded shadow-2xs border border-gray-300 text-xs overflow-hidden">
            <button
              onClick={() => setGeneroFiltro('TODOS')}
              className={`px-3 py-1 font-medium transition cursor-pointer ${
                generoFiltro === 'TODOS' ? 'bg-blue-600 text-white font-bold' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Todos ({resultados.length})
            </button>
            <button
              onClick={() => setGeneroFiltro('M')}
              className={`px-3 py-1 font-medium border-l border-gray-300 transition cursor-pointer ${
                generoFiltro === 'M' ? 'bg-blue-600 text-white font-bold' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Hombres ({resultados.filter(e => e.Genero === 'M').length})
            </button>
            <button
              onClick={() => setGeneroFiltro('F')}
              className={`px-3 py-1 font-medium border-l border-gray-300 transition cursor-pointer ${
                generoFiltro === 'F' ? 'bg-pink-600 text-white font-bold' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Mujeres ({resultados.filter(e => e.Genero === 'F').length})
            </button>
          </div>

          {/* Slicer Horizonte de Flujo */}
          <div className="flex items-center gap-1 text-xs text-gray-600 border-l border-gray-300 pl-3">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-semibold text-gray-700">Horizonte Flujo:</span>
            <select
              value={horizonteFlujo}
              onChange={e => setHorizonteFlujo(parseInt(e.target.value) || 15)}
              className="bg-white border border-gray-300 rounded px-2 py-0.5 text-xs text-gray-800 font-medium focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value={10}>10 Años</option>
              <option value={15}>15 Años</option>
              <option value={20}>20 Años</option>
            </select>
          </div>

        </div>
      </div>

      {/* Grid de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Gráfico 1: Distribución de Pasivos por Rango de Edad (2 Columnas) */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded shadow-xs border-t-4 border-t-blue-600 p-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                Distribución de Pasivos Actuariales por Rango de Edad
              </h4>
            </div>
            <span className="text-[11px] text-gray-500 font-mono">
              VPO Desahucio vs Jubilación
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosDistribucionEdad} margin={{ top: 10, right: 15, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="rango" tick={{ fontSize: 11, fill: '#4b5563' }} />
                <YAxis 
                  tick={{ fontSize: 10, fill: '#4b5563' }} 
                  tickFormatter={fmtMoneda}
                />
                <Tooltip 
                  formatter={fmtTooltip}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#d1d5db', borderRadius: '6px', fontSize: '11px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Bar 
                  dataKey="vpo_desahucio" 
                  name="Desahucio (Art. 185)" 
                  fill="#2563eb" 
                  radius={[3, 3, 0, 0]} 
                />
                <Bar 
                  dataKey="vpo_jubilacion" 
                  name="Jubilación Patronal (Art. 216)" 
                  fill="#f59e0b" 
                  radius={[3, 3, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
            <span>Mayor concentración de pasivo: <strong>{datosDistribucionEdad.reduce((prev, curr) => curr.vpo_total > prev.vpo_total ? curr : prev, datosDistribucionEdad[0])?.nombreLargo}</strong></span>
            <span>Unidades en dólares americanos (USD)</span>
          </div>
        </div>

        {/* Gráfico 2: Composición del DBO Total (Pie Donut Chart) */}
        <div className="bg-white border border-gray-200 rounded shadow-xs border-t-4 border-t-amber-500 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-2">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                Composición DBO
              </h4>
            </div>
            <span className="text-[11px] text-gray-500 font-mono">100% Pasivo</span>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={datosPie}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {datosPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={fmtTooltip}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#d1d5db', borderRadius: '6px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-gray-100 text-xs">
            {datosPie.map((p, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }}></span>
                  <span className="text-gray-700 text-[11px]">{p.name}:</span>
                </div>
                <div className="font-mono font-bold text-gray-900 text-[11px]">
                  $ {p.value.toLocaleString('en-US', { minimumFractionDigits: 2 })} ({p.porcentaje}%)
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Gráfico 3: Proyección de Flujo de Pagos Futuros (Cash Flow de Jubilación Patronal) */}
      <div className="bg-white border border-gray-200 rounded shadow-xs border-t-4 border-t-green-600 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2 mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide">
              Proyección de Flujo de Pagos de Jubilación Patronal y Desahucio (Cash Flow a {horizonteFlujo} Años)
            </h4>
          </div>
          <span className="text-[11px] text-gray-500 font-mono">
            Desembolsos esperados según edad de retiro (65 años)
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={datosFlujoPagos} margin={{ top: 10, right: 15, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorJubilacion" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorDesahucio" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="anio" tick={{ fontSize: 10, fill: '#4b5563' }} />
              <YAxis 
                tick={{ fontSize: 10, fill: '#4b5563' }} 
                tickFormatter={fmtMoneda}
              />
              <Tooltip 
                formatter={fmtTooltip}
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#d1d5db', borderRadius: '6px', fontSize: '11px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
              <Area 
                type="monotone" 
                dataKey="flujo_jubilacion" 
                name="Renta Vitalicia Jubilación Patronal (Flujo Anual)" 
                stroke="#f59e0b" 
                fillOpacity={1} 
                fill="url(#colorJubilacion)" 
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="flujo_desahucio" 
                name="Liquidaciones Desahucio por Retiro (Flujo Anual)" 
                stroke="#2563eb" 
                fillOpacity={1} 
                fill="url(#colorDesahucio)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-gray-500">
          <span>
            Simula las rentas anuales requeridas para jubilados acumulados a medida que alcanzan los 65 años con ≥ 25 años de servicio.
          </span>
          <span className="font-semibold text-gray-700">
            Total Desembolsos Estimados ({horizonteFlujo} años): $ {datosFlujoPagos.reduce((a, b) => a + b.flujo_total, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

    </div>
  );
};
