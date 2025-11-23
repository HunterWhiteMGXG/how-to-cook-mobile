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
}

/**
 * 存储键
 */
export const STORAGE_KEYS = {
  FAVORITES: 'favorites',
  HISTORY: 'history',
  SETTINGS: 'settings',
  SHOPPING_LIST: 'shopping_list',
  COOKING_SESSION: 'cooking_session',
}

/**
 * 分类映射
 */
export const CATEGORY_MAP = {
  vegetable_dish: '素菜',
  meat_dish: '荤菜',
  aquatic: '水产',
  breakfast: '早餐',
  staple: '主食',
  'semi-finished': '半成品加工',
  soup: '汤与粥',
  drink: '饮料',
  condiment: '酱料',
  dessert: '甜品',
}

/**
 * 难度映射
 */
export const DIFFICULTY_MAP = {
  1: '非常简单',
  2: '简单',
  3: '一般',
  4: '较难',
  5: '困难',
}
