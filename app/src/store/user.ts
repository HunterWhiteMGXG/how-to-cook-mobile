import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User, UserSettings, ShoppingList } from '@/types'

interface UserState {
  // 用户信息
  user: User | null
  isLogin: boolean

  // 设置
  settings: UserSettings

  // 收藏
  favorites: string[]

  // 购物清单
  shoppingList: ShoppingList | null

  // 操作
  setUser: (user: User | null) => void
  updateSettings: (settings: Partial<UserSettings>) => void
  toggleFavorite: (recipeId: string) => void
  setShoppingList: (list: ShoppingList | null) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isLogin: false,
      settings: {
        theme: 'auto',
        keepScreenOn: true,
        enableVoice: false,
        enableNotifications: true,
        language: 'zh-CN',
      },
      favorites: [],
      shoppingList: null,

      setUser: (user) => set({ user, isLogin: !!user }),

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      toggleFavorite: (recipeId) =>
        set((state) => {
          const favorites = state.favorites.includes(recipeId)
            ? state.favorites.filter((id) => id !== recipeId)
            : [...state.favorites, recipeId]
          return { favorites }
        }),

      setShoppingList: (list) => set({ shoppingList: list }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
