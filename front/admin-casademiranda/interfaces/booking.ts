import type { Room, RequestRoom } from './room'

export type Booking = {
    booking_id: string
    name: string
    surname: string
    identifier: string
    check_in: Date
    check_out: Date
    rooms: Room[]
  }
  
  export type RequestBooking = {
    nombre: string
    apellidos: string
    dni: string
    fechaCheckIn: Date
    fechaCheckOut: Date
    email: string
    envioConfirmacion: boolean
    habitaciones: RequestRoom[]
  }

  export type ResponseError = {
    message: string
  }