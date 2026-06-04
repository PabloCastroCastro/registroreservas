export const MENU_CATEGORIES = ['Entrante', 'Principal', 'Postre', 'Bebida'] as const;
export type MenuCategory = typeof MENU_CATEGORIES[number];

export type Dish = {
  dish_id: number
  name: string
  description: string | null
  category: MenuCategory
  price_full: number
  price_half: number | null
  observations: string | null
  advance_notice: boolean
  min_persons: number | null
  visible: boolean
}

export type RequestDish = {
  name: string
  description: string | null
  category: MenuCategory
  price_full: number
  price_half: number | null
  observations: string | null
  advance_notice: boolean
  min_persons: number | null
  visible: boolean
}
