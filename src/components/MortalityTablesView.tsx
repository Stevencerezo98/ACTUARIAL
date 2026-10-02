import React, { useState, useMemo } from 'react';
import { 
  MAKEHAM_HOMBRES, 
  MAKEHAM_MUJERES, 
  generarTablaMortalidad, 
  DICTAMEN_VIGENCIA_TABLAS,
  FilaMortalidad 
} from '../data/mortalityTables';
import { 
  Scale, 
  BookOpen, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  TrendingDown,
  Layers,
  Search
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

export const MortalityTablesView: React.FC = () => {
  const [genero, setGenero] = useState<'M' | 'F'>('M');
  const [searchEdad, setSearchEdad] = useState<string>('');

  const tabla = useMemo(() => {
    return generarTablaMortalidad(genero);
  }, [genero]);

  const datosFiltrados = useMemo(() => {
    if (!searchEdad) return tabla;
    const num = parseInt(searchEdad);
    if (isNaN(num)) return tabla;
    return tabla.filter(f => f.edad === num);
  }, [tabla, searchEdad]);

  // Datos para el gráfico de supervivencia lx
  const chartData = useMemo(() => {
    const tablaM = generarTablaMortalidad('M');
    const tablaF = generarTablaMortalidad('F');
    return tablaM.map((item, idx) => ({
      edad: item.edad,
      lx_hombres: item.lx,
      lx_mujeres: tablaF[idx]?.lx ?? 0,
      qx_hombres: Math.round(item.qx * 10000) / 100,
      qx_mujeres: Math.round((tablaF[idx]?.qx ?? 0) * 10000) / 100,
    }));
  }, []);

  const paramsActivos = genero === 'M' ? MAKEHAM_HOMBRES : MAKEHAM_MUJERES;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Banner de Dictamen Jurídico y Técnico */}
      <div className="bg-white border border-gray-200 rounded shadow-sm border-t-4 border-t-blue-600 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-gray-900">
              Tablas de Mortalidad General del IESS (Registro Oficial No. 650 de 2002)
            </h2>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-green-100 text-green-800 text-xs font-bold border border-green-200">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            VIGENTES Y APLICABLES EN ECUADOR
          </span>
        </div>

        <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded text-xs text-blue-950 space-y-2 leading-relaxed">
          <p className="font-bold flex items-center gap-1.5 text-blue-900">
            <BookOpen className="w-4 h-4 text-blue-600" />
            Dictamen Actuarial sobre la consulta: ¿Aún sirven estas tablas de mortalidad?
          </p>
          <p>
            <strong>SÍ, SON LAS TABLAS OFICIALES DE REFERENCIA EN ECUADOR.</strong> Para la valuación actuarial de 
            <strong> Jubilación Patronal (Art. 216) y Bonificación por Desahucio (Art. 185)</strong> bajo el Código del Trabajo y la norma 
            <strong> NIC 19 (IAS 19)</strong>, los peritos actuarios calificados por la Superintendencia de Compañías (SCVS) 
            y la Superintendencia de Bancos (como se evidencia en el estudio de <em>Cajamarca Protective Services</em> de abril de 2024) 
            aplican las <strong>Tablas de Mortalidad General IESS 2000 publicadas en el Registro Oficial No. 650 del 28 de agosto del 2002</strong>, 
            elaboradas por Logaritmo Cía. Ltda., junto con los coeficientes del <strong>artículo 218 del Código del Trabajo</strong>.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-blue-200/80 text-[11px]">
            <div>
              <strong>1. Marco Ministerial:</strong> Acuerdos Ministeriales <em>MDT-2016-0099</em> y <em>MDT-2018-0118</em> disponen 
              el uso de las tablas del Código del Trabajo basadas en IESS 2000 a una tasa técnica del 4.0%.
            </div>
            <div>
              <strong>2. Jurisprudencia Obligatoria:</strong> La Corte Nacional de Justicia (Resolución 07-2021) ratificó 
              el cálculo de la renta constante y límites del salario básico unificado.
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Curva de Supervivencia lx y Mortalidad qx */}
      <div className="bg-white border border-gray-200 rounded shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-xs text-gray-800 uppercase tracking-wider">
              Curvas de Supervivencia Biológica Actuarial (lx: Vivos por cada 1,000,000)
            </h3>
          </div>
          <span className="text-[11px] text-gray-500 font-mono">
            Hombres vs. Mujeres (Modelo Makeham-Gompertz)
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="edad" tick={{ fontSize: 10, fill: '#475569' }} />
              <YAxis 
                tick={{ fontSize: 10, fill: '#475569' }} 
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} 
              />
              <Tooltip 
                formatter={(val: any) => [Number(val).toLocaleString(), 'Vivos (lx)']}
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '6px', fontSize: '11px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
              <Line 
                type="monotone" 
                dataKey="lx_hombres" 
                name="Hombres (RO 650)" 
                stroke="#2563eb" 
                strokeWidth={2} 
                dot={false} 
              />
              <Line 
                type="monotone" 
                dataKey="lx_mujeres" 
                name="Mujeres (RO 650)" 
                stroke="#db2777" 
                strokeWidth={2} 
                dot={false} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Parámetros Makeham Oficiales del Registro Oficial 650 */}
      <div className="bg-white border border-gray-200 rounded shadow-xs p-5 space-y-3">
        <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wider">
          Parámetros Matemáticos Makeham-Gompertz (Fórmula: lx = K · sˣ · g^(cˣ))
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-gray-50 p-2.5 rounded border border-gray-200">
            <span className="text-[10px] text-gray-500 block">Parámetro c (H / M)</span>
            <span className="font-bold text-gray-900 block">{MAKEHAM_HOMBRES.c.toFixed(6)} / {MAKEHAM_MUJERES.c.toFixed(6)}</span>
          </div>
          <div className="bg-gray-50 p-2.5 rounded border border-gray-200">
            <span className="text-[10px] text-gray-500 block">Parámetro g (H / M)</span>
            <span className="font-bold text-gray-900 block">{MAKEHAM_HOMBRES.g.toFixed(6)} / {MAKEHAM_MUJERES.g.toFixed(6)}</span>
          </div>
          <div className="bg-gray-50 p-2.5 rounded border border-gray-200">
            <span className="text-[10px] text-gray-500 block">Parámetro s (H / M)</span>
            <span className="font-bold text-gray-900 block">{MAKEHAM_HOMBRES.s.toFixed(6)} / {MAKEHAM_MUJERES.s.toFixed(6)}</span>
          </div>
          <div className="bg-gray-50 p-2.5 rounded border border-gray-200">
            <span className="text-[10px] text-gray-500 block">Radix K (Base)</span>
            <span className="font-bold text-blue-700 block">{MAKEHAM_HOMBRES.K.toLocaleString()} / {MAKEHAM_MUJERES.K.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Tabla de Conmutación Interactiva */}
      <div className="bg-white border border-gray-200 rounded shadow-xs overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">
              Tabla Actuarial Completa:
            </span>
            <div className="inline-flex rounded border border-gray-300 text-xs overflow-hidden">
              <button
                onClick={() => setGenero('M')}
                className={`px-3 py-1 font-semibold transition cursor-pointer ${
                  genero === 'M' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Hombres (RO 650)
              </button>
              <button
                onClick={() => setGenero('F')}
                className={`px-3 py-1 font-semibold border-l border-gray-300 transition cursor-pointer ${
                  genero === 'F' ? 'bg-pink-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Mujeres (RO 650)
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por edad exacta..."
              value={searchEdad}
              onChange={e => setSearchEdad(e.target.value)}
              className="pl-8 pr-3 py-1 rounded bg-white border border-gray-300 text-xs text-gray-800 placeholder-gray-400 w-44 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead className="bg-gray-100 text-gray-700 font-bold sticky top-0 border-b border-gray-300 text-[11px]">
              <tr>
                <th className="py-2.5 px-3 border-r border-gray-200 text-center">Edad (x)</th>
                <th className="py-2.5 px-3 border-r border-gray-200 text-right">Vivos (lx)</th>
                <th className="py-2.5 px-3 border-r border-gray-200 text-right">Fallecidos (dx)</th>
                <th className="py-2.5 px-3 border-r border-gray-200 text-right">Mortalidad (qx)</th>
                <th className="py-2.5 px-3 border-r border-gray-200 text-right">Supervivencia (px)</th>
                <th className="py-2.5 px-3 border-r border-gray-200 text-center">Esperanza (e°x)</th>
                <th className="py-2.5 px-3 text-right">Fuerza (μx)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-[11px]">
              {datosFiltrados.map((fila) => {
                const isRetiro = fila.edad === 65;
                return (
                  <tr 
                    key={fila.edad}
                    className={`hover:bg-blue-50/50 transition ${
                      isRetiro ? 'bg-amber-50 font-bold text-amber-950' : fila.edad % 2 === 1 ? 'bg-gray-50/30' : 'bg-white'
                    }`}
                  >
                    <td className="py-2 px-3 text-center border-r border-gray-200 font-sans font-bold">
                      {fila.edad} {isRetiro && <span className="text-[10px] text-amber-700">(Retiro 65a)</span>}
                    </td>
                    <td className="py-2 px-3 text-right border-r border-gray-200 text-blue-900 font-semibold">
                      {fila.lx.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right border-r border-gray-200 text-gray-600">
                      {fila.dx.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right border-r border-gray-200 text-red-700">
                      {fila.qx.toFixed(6)}
                    </td>
                    <td className="py-2 px-3 text-right border-r border-gray-200 text-green-700">
                      {fila.px.toFixed(6)}
                    </td>
                    <td className="py-2 px-3 text-center border-r border-gray-200 font-bold text-gray-800">
                      {fila.ex} años
                    </td>
                    <td className="py-2 px-3 text-right text-gray-500">
                      {fila.mu_x.toFixed(7)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
