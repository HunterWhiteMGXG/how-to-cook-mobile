/**
 * 用户信息
 */
export interface User {
  id: string
  nickname: string
  avatar: string
  phone?: string
}

/**
 * 用户设置
 */
export interface UserSettings {
  theme: 'light' | 'dark' | 'auto'
  keepScreenOn: boolean
  enableVoice: boolean
  enableNotifications: boolean
  language: 'zh-CN' | 'en-US'
}

/**
 * 购物清单项
 */
export interface ShoppingItem {
  id: string
  name: string
  amount: string
  category: string
  checked: boolean
  note?: string
}

/**
 * 购物清单
 */
export interface ShoppingList {
  id: string
  name: string
  recipes: string[]
  items: ShoppingItem[]
  createdAt: number
  updatedAt: number
}

/**
 * 历史记录项
 */
export interface HistoryItem {
  recipeId: string
  viewedAt: number
}

/**
 * 计时器
 */
export interface Timer {
  id: string
  label: string
  duration: number
  remaining: number
  startedAt: number
  status: 'running' | 'paused' | 'finished'
}

/**
 * 做菜会话
 */
export interface CookingSession {
  id: string
  recipeId: string
  currentStep: number
  completedSteps: number[]
  timers: Timer[]
  startedAt: number
  pausedAt?: number
  completedAt?: number
  status: 'active' | 'paused' | 'completed'
}
