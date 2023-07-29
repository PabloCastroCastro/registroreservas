import type { Room } from './room'

export type Booking = {
    booking_id: string
    name: string
    surname: string
    identifier: string
    check_in: Date
    check_out: Date
    rooms: Room[]
  }
  
  export type ResponseError = {
    message: string
  }