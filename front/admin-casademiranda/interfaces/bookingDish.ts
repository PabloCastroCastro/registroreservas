export type BookingDish = {
  booking_dish_id: number
  dish_id: number
  dish_name: string
  portion_type: 'full' | 'half'
  price: number
  quantity: number
  dinner_date: string
  created_at: string
}

export type RequestBookingDish = {
  dish_id: number
  portion_type: 'full' | 'half'
  quantity: number
  dinner_date: string
}
