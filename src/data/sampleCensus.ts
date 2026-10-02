import { EmpleadoInput } from '../types/actuarial';

// Datos de verificación basados estrictamente en el ejemplo del usuario
export const EJEMPLO_USUARIO_DATA: EmpleadoInput[] = [
  {
    Cedula: "1712345678",
    Nombre: "Juan Perez",
    Genero: "M",
    Edad: 45,
    Antiguedad: 15,
    Sueldo_Actual: 1200.00,
    Cargo: "Especialista Operativo"
  },
  {
    Cedula: "0912345678",
    Nombre: "Maria Rodriguez",
    Genero: "F",
    Edad: 30,
    Antiguedad: 5,
    Sueldo_Actual: 850.00,
    Cargo: "Analista de Finanzas"
  },
  {
    Cedula: "0112345678",
    Nombre: "Carlos Cueva",
    Genero: "M",
    Edad: 62,
    Antiguedad: 24,
    Sueldo_Actual: 2100.00,
    Cargo: "Supervisor de Producción"
  }
];
