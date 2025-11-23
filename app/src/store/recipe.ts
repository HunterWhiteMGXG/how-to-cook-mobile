import { create } from 'zustand'
import Taro from '@tarojs/taro'
import type { Recipe, Category, RecipeFilters } from '@/types'
import { getRecipes, getCategories } from '@/services/dataService'

// 从本地存储加载收藏
const loadFavorites = (): string[] => {
  try {
    const stored = Taro.getStorageSync('favorites')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

// 保存收藏到本地存储
const saveFavorites = (favorites: string[]) => {
  try {
    Taro.setStorageSync('favorites', JSON.stringify(favorites))
  } catch (e) {
    console.error('保存收藏失败', e)
  }
}

interface RecipeState {
  // 数据
  recipes: Recipe[]
  categories: Category[]
  currentRecipe: Recipe | null
  favorites: string[]

  // 加载状态
  isLoading: boolean
  isDataLoaded: boolean

  // 筛选与排序
  filters: RecipeFilters
  sortBy: 'name' | 'difficulty' | 'cookingTime' | 'createdAt'
  selectedCategoryId: string | null

  // 操作
  setRecipes: (recipes: Recipe[]) => void
  setCategories: (categories: Category[]) => void
  setCurrentRecipe: (recipe: Recipe | null) => void
  setFilters: (filters: RecipeFilters) => void
  setSortBy: (sortBy: RecipeState['sortBy']) => void
  setSelectedCategoryId: (categoryId: string | null) => void
  toggleFavorite: (recipeId: string) => void
  isFavorite: (recipeId: string) => boolean
  loadData: () => Promise<void>
}

export const useRecipeStore = create<RecipeState>((set, get) => ({
  recipes: [],
  categories: [],
  currentRecipe: null,
  favorites: loadFavorites(),
  isLoading: false,
  isDataLoaded: false,
  filters: {},
  sortBy: 'name',
  selectedCategoryId: null,

  setRecipes: (recipes) => set({ recipes }),
  setCategories: (categories) => set({ categories }),
  setCurrentRecipe: (recipe) => set({ currentRecipe: recipe }),
  setFilters: (filters) => set({ filters }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSelectedCategoryId: (categoryId) => set({ selectedCategoryId: categoryId }),
  toggleFavorite: (recipeId) => {
    const { favorites } = get()
    const newFavorites = favorites.includes(recipeId)
      ? favorites.filter(id => id !== recipeId)
      : [...favorites, recipeId]
    saveFavorites(newFavorites)
    set({ favorites: newFavorites })
  },
  isFavorite: (recipeId) => get().favorites.includes(recipeId),
  loadData: async () => {
    const { isDataLoaded, isLoading } = get()
    if (isDataLoaded || isLoading) return

    set({ isLoading: true })
    try {
      const [recipes, categories] = await Promise.all([
        getRecipes(),
        getCategories(),
      ])
      set({
        recipes,
        categories,
        isDataLoaded: true,
        isLoading: false,
      })
    } catch (error) {
      console.error('Failed to load data:', error)
      set({ isLoading: false })
    }
  },
}))
