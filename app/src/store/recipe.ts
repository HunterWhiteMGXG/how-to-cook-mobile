import { create } from 'zustand'
import Taro from '@tarojs/taro'
import type { Recipe, Category } from '@/types'
import { getRecipes, getCategories, getRecipesCached, getCategoriesCached } from '@/services/dataService'
import { STORAGE_KEYS } from '@/constants'

// 从本地存储加载收藏
const loadFavorites = (): string[] => {
  try {
    const stored = Taro.getStorageSync<string[] | string>(
      STORAGE_KEYS.FAVORITES
    )
    if (Array.isArray(stored)) {
      return stored.filter((id): id is string => typeof id === 'string')
    }
    if (typeof stored === 'string') {
      const parsed: unknown = JSON.parse(stored)
      return Array.isArray(parsed)
        ? parsed.filter((id): id is string => typeof id === 'string')
        : []
    }
  } catch {
    // 旧缓存损坏时回退为空列表。
  }

  return []
}

// 保存收藏到本地存储
const saveFavorites = (favorites: string[]) => {
  try {
    Taro.setStorageSync(STORAGE_KEYS.FAVORITES, favorites)
  } catch (e) {
    console.error('保存收藏失败', e)
  }
}

interface RecipeState {
  // 数据
  recipes: Recipe[]
  categories: Category[]
  favorites: string[]

  // 加载状态
  isLoading: boolean
  isDataLoaded: boolean

  // 操作
  toggleFavorite: (recipeId: string) => void
  loadData: () => Promise<void>
}

// 初始化时同步读取缓存
const initialRecipes = getRecipesCached() || []
const initialCategories = getCategoriesCached() || []
const hasInitialData = initialRecipes.length > 0 && initialCategories.length > 0

export const useRecipeStore = create<RecipeState>((set, get) => ({
  recipes: initialRecipes,
  categories: initialCategories,
  favorites: loadFavorites(),
  isLoading: false,
  isDataLoaded: hasInitialData,

  toggleFavorite: (recipeId) => {
    const { favorites } = get()
    const newFavorites = favorites.includes(recipeId)
      ? favorites.filter(id => id !== recipeId)
      : [...favorites, recipeId]
    saveFavorites(newFavorites)
    set({ favorites: newFavorites })
  },
  loadData: async () => {
    const { isLoading } = get()
    if (isLoading) return

    set({ isLoading: true })
    try {
      const [recipes, categories] = await Promise.all([
        getRecipes(),
        getCategories(),
      ])
      set({ recipes, categories, isDataLoaded: true })
    } catch (error) {
      console.error('[RecipeStore] 加载数据失败', error)
    } finally {
      set({ isLoading: false })
    }
  },
}))
