export type Room = {
  name: string
  price: number,
  extra_beds: number,
  price_extra_bed: number
}

export type RequestRoom = {
  habitacion: string
  precio: number
  supletorias: number
  precioSupletoria: number
}
