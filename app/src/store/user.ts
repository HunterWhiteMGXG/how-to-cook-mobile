import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User, UserSettings, ShoppingList } from '@/types'
import { taroStorage } from './taroStorage'

interface UserState {
  // 用户信息
  user: User | null
  isLogin: boolean

  // 设置
  settings: UserSettings

  // 购物清单
  shoppingList: ShoppingList | null

  // 操作
  setUser: (user: User | null) => void
  updateSettings: (settings: Partial<UserSettings>) => void
  setShoppingList: (list: ShoppingList | null) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isLogin: false,
      settings: {
        theme: 'auto',
        keepScreenOn: true,
        enableVoice: false,
        enableNotifications: true,
        language: 'zh-CN',
      },
      shoppingList: null,

      setUser: (user) => set({ user, isLogin: !!user }),

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      setShoppingList: (list) => set({ shoppingList: list }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => taroStorage),
    }
  )
)
