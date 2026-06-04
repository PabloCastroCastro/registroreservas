import type { RequestRoom } from './room'

export type BillExtra = {
  descripcion: string
  precio: number
}

export type Bill = {
  numeroFactura: string
  nombre: string
  apellidos: string
  dni: string
  email: string
  direccion?: string
  concepto?: string
  fechaCheckIn: string
  fechaCheckOut: string
  habitaciones: RequestRoom[]
  extras?: BillExtra[]
}
