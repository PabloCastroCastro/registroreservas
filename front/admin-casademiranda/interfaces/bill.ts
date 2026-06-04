import type { RequestRoom } from './room'

export type BillExtra = {
  descripcion: string
  precio: number
}

export type Bill = {
  tipo: 'personal' | 'empresa'
  numeroFactura: string
  nombre: string
  apellidos: string
  dni: string
  email: string
  // empresa only
  nombreEmpresa?: string
  codigoPostalCiudad?: string
  pais?: string
  // shared optional
  direccion?: string
  concepto?: string
  fechaCheckIn: string
  fechaCheckOut: string
  habitaciones: RequestRoom[]
  extras?: BillExtra[]
}
