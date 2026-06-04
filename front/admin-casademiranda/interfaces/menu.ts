export const MENU_CATEGORIES = ['Entrante', 'Principal', 'Postre', 'Bebida'] as const;
export type MenuCategory = typeof MENU_CATEGORIES[number];

export const ALLERGENS = [
  'Gluten', 'Crustáceos', 'Huevos', 'Pescado', 'Cacahuetes',
  'Soja', 'Lácteos', 'Frutos de cáscara', 'Apio', 'Mostaza',
  'Sésamo', 'Sulfitos', 'Altramuces', 'Moluscos',
] as const;
export type Allergen = typeof ALLERGENS[number];

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
  allergens: Allergen[]
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
  allergens: Allergen[]
}
