export type RoomBasePrice = {
  id: number
  room_name: string
  season: 'low' | 'high'
  price: number
  price_extra_bed: number
}

export type SeasonConfig = {
  high_season_start: string  // MM-DD
  high_season_end: string    // MM-DD
}

export type BasePricesResponse = {
  prices: RoomBasePrice[]
  seasonConfig: SeasonConfig
}
