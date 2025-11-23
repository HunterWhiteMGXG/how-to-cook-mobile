import { create } from 'zustand'
import Taro from '@tarojs/taro'
import type { Recipe, Category, RecipeFilters } from '@/types'
import { getRecipes, getCategories, getRecipesCached, getCategoriesCached } from '@/services/dataService'

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

// 初始化时同步读取缓存
const initialRecipes = getRecipesCached() || []
const initialCategories = getCategoriesCached() || []
const hasInitialData = initialRecipes.length > 0 && initialCategories.length > 0

export const useRecipeStore = create<RecipeState>((set, get) => ({
  recipes: initialRecipes,
  categories: initialCategories,
  currentRecipe: null,
  favorites: loadFavorites(),
  isLoading: false,
  isDataLoaded: hasInitialData,
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
    const { isLoading } = get()
    if (isLoading) return

    // 后台检查更新（不阻塞 UI）
    Promise.all([
      getRecipes(),
      getCategories(),
    ]).then(([recipes, categories]) => {
      set({ recipes, categories, isDataLoaded: true })
    }).catch(error => {
      console.error('Failed to load data:', error)
    })
  },
}))
