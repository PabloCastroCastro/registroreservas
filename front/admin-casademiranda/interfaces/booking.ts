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
    other_platform_reference: string
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