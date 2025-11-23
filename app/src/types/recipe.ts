/**
 * 食材
 */
export interface Ingredient {
  name: string
  amount?: string
  unit?: string
  weight?: string
  required: boolean
  category?: string
}

/**
 * 步骤
 */
export interface Step {
  id: number
  title?: string
  content: string
  image?: string | null
  duration?: number | null
  tips?: string | null
  temperature?: string
  tools?: string[]
}

/**
 * 营养信息
 */
export interface Nutrition {
  calories?: number
  protein?: number
  fat?: number
  carbohydrate?: number
  fiber?: number
  sodium?: number
}

/**
 * 菜谱
 */
export interface Recipe {
  id: string
  name: string
  category: string
  difficulty: number
  cookingTime: number
  servings: number
  introduction: string
  coverImage: string | null
  images: string[]
  ingredients: Ingredient[]
  steps: Step[]
  tips: string
  calculation?: string
  variations?: string[]
  nutrition?: Nutrition
  tags?: string[]
  source: string
  author?: string
  createdAt: number
  updatedAt: number
  viewCount?: number
  favoriteCount?: number
}

/**
 * 分类
 */
export interface Category {
  id: string
  name: string
  nameCN: string
  icon: string
  color: string
  description?: string
  recipeCount: number
  order: number
}

/**
 * 菜谱筛选条件
 */
export interface RecipeFilters {
  category?: string
  difficulty?: number[]
  cookingTime?: {
    min?: number
    max?: number
  }
  tags?: string[]
}
