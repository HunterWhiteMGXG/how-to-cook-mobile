/**
 * 路由常量
 */
export const ROUTES = {
  INDEX: '/pages/index/index',
  RECIPE_LIST: '/pages/recipe-list/index',
  RECIPE_DETAIL: '/pages/recipe-detail/index',
  COOKING_MODE: '/pages/cooking-mode/index',
  SHOPPING_LIST: '/pages/shopping-list/index',
  PROFILE: '/pages/profile/index',
  KNOWLEDGE_LIST: '/pages/knowledge-list/index',
  KNOWLEDGE_DETAIL: '/pages/knowledge-detail/index',
} as const

/**
 * 存储键
 */
export const STORAGE_KEYS = {
  FAVORITES: 'favorites',
  HISTORY: 'history',
  SETTINGS: 'settings',
  SHOPPING_LIST: 'shopping_list',
  COOKING_SESSION: 'cooking_session',
} as const
