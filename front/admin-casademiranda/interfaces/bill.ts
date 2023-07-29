import type { RoomBill } from './roomBill'

export type Bill = {
    numeroFactura: string
    nombre: string
    apellidos: string
    dni: string
    email: string
    fechaCheckIn: string
    fechaCheckOut: string
    habitaciones: RoomBill[]
  }