import type { Room, RequestRoom } from './room'

export type Booking = {
    booking_id: string
    confirmation_number: string
    name: string
    surname: string
    identifier: string
    check_in: Date
    check_out: Date
    state: string
    payment_type: string
    other_platform_reference: string
    rooms: Room[]
  }

  export type RequestUpdateBooking = {
    nombre: string
    apellidos: string
    dni: string
    checkInDate: string
    checkOutDate: string
    tipo_pago: string
    referenciaOtraPlataforma: string
  }
  
  export type RequestBooking = {
    nombre: string
    apellido1: string
    apellido2: string | null
    dni: string
    fechaCheckIn: Date
    fechaCheckOut: Date
    email: string
    envioConfirmacion: boolean
    estado: string
    tipo_pago: string
    habitaciones: RequestRoom[]
  }

  export type ResponseError = {
    message: string
  }