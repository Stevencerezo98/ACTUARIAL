import React, { useState } from 'react';
import { 
  Database, 
  Copy, 
  Check, 
  Server, 
  Table, 
  Layers, 
  ShieldCheck, 
  Cpu, 
  Terminal
} from 'lucide-react';

export const DatabaseSchemaView: React.FC = () => {
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedApi, setCopiedApi] = useState(false);

  const sqlSchemaCode = `-- ==============================================================================
-- ESQUEMA RELACIONAL POSTGRESQL PARA SISTEMA ACTUARIAL NIC 19 (ECUADOR)
-- Optimizado para trazabilidad histórica, auditoría y cómputo vectorial
-- ==============================================================================

-- 1. Tabla de Empresas / Clientes
CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    ruc VARCHAR(13) UNIQUE NOT NULL,
    razon_social VARCHAR(255) NOT NULL,
    sector_economico VARCHAR(100),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Parámetros Macroeconómicos por Valuación / Período
CREATE TABLE IF NOT EXISTS evaluacion_parametros (
    id SERIAL PRIMARY KEY,
    cliente_id INT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    fecha_valuacion DATE NOT NULL,
    periodo_contable VARCHAR(10) NOT NULL, -- Ej: '2026-FY'
    tasa_descuento NUMERIC(6,4) NOT NULL,  -- Ej. 0.0750 (7.50%)
    tasa_salarial NUMERIC(6,4) NOT NULL,   -- Ej. 0.0300 (3.00%)
    tasa_rotacion NUMERIC(6,4) NOT NULL,   -- Ej. 0.0500 (5.00%)
    sbu NUMERIC(10,2) NOT NULL,            -- Ej. 460.00
    edad_retiro_m INT DEFAULT 65,
    edad_retiro_f INT DEFAULT 65,
    coeficiente_art218_m NUMERIC(5,2) DEFAULT 11.50,
    coeficiente_art218_f NUMERIC(5,2) DEFAULT 13.00,
    factor_supervivencia NUMERIC(5,4) DEFAULT 0.8500,
    creado_por VARCHAR(100),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Registros del Censo de Empleados (Input crudo sanitizado)
CREATE TABLE IF NOT EXISTS censo_empleados (
    id SERIAL PRIMARY KEY,
    evaluacion_id INT NOT NULL REFERENCES evaluacion_parametros(id) ON DELETE CASCADE,
    cedula VARCHAR(10) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    genero CHAR(1) CHECK (genero IN ('M', 'F')),
    edad INT NOT NULL CHECK (edad >= 18 AND edad <= 85),
    antiguedad INT NOT NULL CHECK (antiguedad >= 0),
    sueldo_actual NUMERIC(12,2) NOT NULL CHECK (sueldo_actual > 0),
    cargo VARCHAR(100),
    fecha_ingreso DATE,
    fecha_nacimiento DATE
);

-- 4. Resultados Actuariales Calculados por Colaborador (Output del Motor)
CREATE TABLE IF NOT EXISTS resultados_valuacion (
    id SERIAL PRIMARY KEY,
    evaluacion_id INT NOT NULL REFERENCES evaluacion_parametros(id) ON DELETE CASCADE,
    censo_id INT NOT NULL REFERENCES censo_empleados(id) ON DELETE CASCADE,
    anios_faltantes INT NOT NULL,
    antiguedad_al_retiro INT NOT NULL,
    sueldo_proyectado NUMERIC(12,2) NOT NULL,
    
    -- Desahucio (Art. 185)
    beneficio_desahucio NUMERIC(12,2) NOT NULL,
    vpo_desahucio NUMERIC(12,2) NOT NULL,
    csc_desahucio NUMERIC(12,2) NOT NULL, -- Current Service Cost
    
    -- Jubilación Patronal (Art. 216)
    elegible_jubilacion BOOLEAN NOT NULL,
    pension_mensual_acotada NUMERIC(12,2) NOT NULL,
    tope_aplicado VARCHAR(30), -- 'NINGUNO', 'MINIMO_0.5_SBU', 'MAXIMO_1.0_SBU'
    vpo_jubilacion NUMERIC(12,2) NOT NULL,
    csc_jubilacion NUMERIC(12,2) NOT NULL,
    
    -- Consolidado NIIF
    vpo_total_dbo NUMERIC(12,2) NOT NULL,
    csc_total NUMERIC(12,2) NOT NULL,
    costo_interes NUMERIC(12,2) NOT NULL,
    calculado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices de alto rendimiento para consultas de nómina masiva
CREATE INDEX IF NOT EXISTS idx_censo_evaluacion ON censo_empleados(evaluacion_id);
CREATE INDEX IF NOT EXISTS idx_censo_cedula ON censo_empleados(cedula);
CREATE INDEX IF NOT EXISTS idx_resultados_evaluacion ON resultados_valuacion(evaluacion_id);
`;

  const fastApiCode = `# ==============================================================================
# API FASTAPI PARA MOTOR ACTUARIAL NIC 19 (PYTHON + PANDAS)
# Endpoint para recibir censo en JSON o Excel y retornar DBO y Sensibilidad
# ==============================================================================
from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
import pandas as pd
from actuarial_nic19_ecuador import calcular_motor_actuarial

app = FastAPI(title="Motor Actuarial NIC 19 Ecuador", version="3.0")

class VariablesMacroRequest(BaseModel):
    tasa_descuento: float = Field(0.075, description="i: Tasa de descuento financiero USD")
    tasa_incremento_sal: float = Field(0.030, description="s: Tasa de incremento salarial anual")
    tasa_rotacion: float = Field(0.050, description="r: Tasa de rotación laboral")
    sbu_vigente: float = Field(460.00, description="SBU vigente en Ecuador")
    edad_retiro: int = Field(65, description="Edad ordinaria de retiro")
    factor_supervivencia: float = Field(0.85, description="Factor actuarial de supervivencia")

@app.post("/api/v1/valuacion/calcular")
async def calcular_valuacion(
    file: UploadFile = File(...),
    tasa_descuento: float = 0.075,
    tasa_salarial: float = 0.030,
    tasa_rotacion: float = 0.050,
    sbu: float = 460.00
):
    try:
        # 1. Leer archivo subido con pandas
        if file.filename.endswith('.csv'):
            df = pd.read_csv(file.file)
        else:
            df = pd.read_excel(file.file)
            
        variables = {
            'tasa_descuento': tasa_descuento,
            'tasa_incremento_sal': tasa_salarial,
            'tasa_rotacion': tasa_rotacion,
            'sbu_vigente': sbu,
            'edad_retiro': 65,
            'factor_supervivencia': 0.85
        }
        
        # 2. Ejecutar motor matemático vectorial
        df_resultado = calcular_motor_actuarial(df, variables)
        
        # 3. Retornar métricas consolidadas NIIF
        return {
            "status": "success",
            "total_empleados": len(df_resultado),
            "dbo_total_usd": round(float(df_resultado['VPO_Total'].sum()), 2),
            "desahucio_total_usd": round(float(df_resultado['VPO_Desahucio'].sum()), 2),
            "jubilacion_total_usd": round(float(df_resultado['VPO_Jubilacion'].sum()), 2),
            "detalle": df_resultado.to_dict(orient="records")
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-white border border-gray-200 rounded shadow-sm border-t-4 border-t-blue-600 p-5">
        <div className="flex items-center gap-2 mb-1">
          <Database className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-gray-900">
            Arquitectura de Software y Modelo Relacional PostgreSQL
          </h2>
        </div>
        <p className="text-xs text-gray-600">
          Especificación completa del esquema DDL de base de datos para PostgreSQL y la capa de integración de API con FastAPI y cómputo vectorial en Pandas.
        </p>
      </div>

      {/* Relational Schema Diagram */}
      <div className="bg-white border border-gray-200 rounded shadow-xs p-5 space-y-4">
        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2">
          <Layers className="w-4 h-4 text-blue-600" />
          Diagrama de Entidad-Relación (PostgreSQL)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          
          <div className="border border-blue-200 rounded bg-blue-50/40 p-3 space-y-1">
            <span className="font-bold text-blue-900 block text-[11px] uppercase">
              1. clientes
            </span>
            <ul className="text-[11px] text-gray-600 font-mono space-y-0.5">
              <li>• id (PK)</li>
              <li>• ruc (VARCHAR 13)</li>
              <li>• razon_social</li>
              <li>• creado_en</li>
            </ul>
          </div>

          <div className="border border-purple-200 rounded bg-purple-50/40 p-3 space-y-1">
            <span className="font-bold text-purple-900 block text-[11px] uppercase">
              2. evaluacion_parametros
            </span>
            <ul className="text-[11px] text-gray-600 font-mono space-y-0.5">
              <li>• id (PK)</li>
              <li>• cliente_id (FK)</li>
              <li>• tasa_descuento (i)</li>
              <li>• tasa_salarial (s)</li>
              <li>• tasa_rotacion (r)</li>
              <li>• sbu (NUMERIC)</li>
            </ul>
          </div>

          <div className="border border-amber-200 rounded bg-amber-50/40 p-3 space-y-1">
            <span className="font-bold text-amber-900 block text-[11px] uppercase">
              3. censo_empleados
            </span>
            <ul className="text-[11px] text-gray-600 font-mono space-y-0.5">
              <li>• id (PK)</li>
              <li>• evaluacion_id (FK)</li>
              <li>• cedula (10 dig)</li>
              <li>• nombre, genero</li>
              <li>• edad, antiguedad</li>
              <li>• sueldo_actual</li>
            </ul>
          </div>

          <div className="border border-green-200 rounded bg-green-50/40 p-3 space-y-1">
            <span className="font-bold text-green-900 block text-[11px] uppercase">
              4. resultados_valuacion
            </span>
            <ul className="text-[11px] text-gray-600 font-mono space-y-0.5">
              <li>• id (PK)</li>
              <li>• censo_id (FK)</li>
              <li>• vpo_desahucio</li>
              <li>• vpo_jubilacion</li>
              <li>• vpo_total_dbo</li>
              <li>• csc_total, costo_int</li>
            </ul>
          </div>

        </div>
      </div>

      {/* SQL Script Box */}
      <div className="bg-white border border-gray-200 rounded shadow-xs overflow-hidden">
        <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
            <Table className="w-4 h-4 text-blue-600" />
            <span>Script DDL Completo de Creación de Tablas (PostgreSQL)</span>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(sqlSchemaCode);
              setCopiedSql(true);
              setTimeout(() => setCopiedSql(false), 2000);
            }}
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold cursor-pointer"
          >
            {copiedSql ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSql ? 'Copiado' : 'Copiar DDL SQL'}</span>
          </button>
        </div>

        <pre className="p-4 bg-gray-900 text-gray-100 font-mono text-xs overflow-x-auto max-h-[350px] overflow-y-auto leading-relaxed">
          <code>{sqlSchemaCode}</code>
        </pre>
      </div>

      {/* FastAPI Backend Box */}
      <div className="bg-white border border-gray-200 rounded shadow-xs overflow-hidden">
        <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
            <Server className="w-4 h-4 text-green-600" />
            <span>Backend API FastAPI (Endpoint Vectorial en Python)</span>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(fastApiCode);
              setCopiedApi(true);
              setTimeout(() => setCopiedApi(false), 2000);
            }}
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold cursor-pointer"
          >
            {copiedApi ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedApi ? 'Copiado' : 'Copiar Código API'}</span>
          </button>
        </div>

        <pre className="p-4 bg-gray-900 text-gray-100 font-mono text-xs overflow-x-auto max-h-[350px] overflow-y-auto leading-relaxed">
          <code>{fastApiCode}</code>
        </pre>
      </div>

    </div>
  );
};
