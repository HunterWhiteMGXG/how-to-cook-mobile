# HowToCook Mobile App - API 设计

> 本地数据接口设计（MVP 阶段）
> 创建日期：2025-11-02

---

## 📋 API 概述

### MVP 阶段（纯本地）
本阶段所有数据来自本地，不涉及网络请求。所有 API 都是对本地数据库的封装。

### V2.0 阶段（云端）
后期将提供 RESTful API 支持实时更新和用户系统。

---

## 🗂️ 数据接口设计（Local API）

### 1. Recipe Service（菜谱服务）

#### 获取所有菜谱
```typescript
/**
 * 获取所有菜谱列表
 * @returns Promise<Recipe[]>
 */
async function getAllRecipes(): Promise<Recipe[]>

// 使用示例
const recipes = await recipeService.getAllRecipes()
```

#### 根据ID获取菜谱
```typescript
/**
 * 根据ID获取单个菜谱
 * @param id 菜谱ID
 * @returns Promise<Recipe | null>
 */
async function getRecipeById(id: string): Promise<Recipe | null>

// 使用示例
const recipe = await recipeService.getRecipeById('tomato-egg')
```

#### 根据分类获取菜谱
```typescript
/**
 * 根据分类获取菜谱列表
 * @param category 分类ID
 * @returns Promise<Recipe[]>
 */
async function getRecipesByCategory(category: string): Promise<Recipe[]>

// 使用示例
const vegetableDishes = await recipeService.getRecipesByCategory('vegetable_dish')
```

#### 搜索菜谱
```typescript
/**
 * 搜索菜谱
 * @param keyword 关键词
 * @returns Promise<Recipe[]>
 */
async function searchRecipes(keyword: string): Promise<Recipe[]>

// 使用示例
const results = await recipeService.searchRecipes('鸡蛋')
```

#### 筛选菜谱
```typescript
interface RecipeFilters {
  category?: string
  difficulty?: number[]    // [1, 2, 3]
  cookingTime?: {
    min?: number
    max?: number
  }
  tags?: string[]
}

/**
 * 根据条件筛选菜谱
 * @param filters 筛选条件
 * @returns Promise<Recipe[]>
 */
async function filterRecipes(filters: RecipeFilters): Promise<Recipe[]>

// 使用示例
const easyRecipes = await recipeService.filterRecipes({
  difficulty: [1, 2],
  cookingTime: { max: 30 }
})
```

#### 分页获取菜谱
```typescript
interface PaginationOptions {
  page: number
  pageSize: number
  filters?: RecipeFilters
  sortBy?: 'name' | 'difficulty' | 'cookingTime' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

interface PaginatedResult<T> {
  data: T[]
  page: number
  pageSize: number
  total: number
  hasMore: boolean
}

/**
 * 分页获取菜谱
 * @param options 分页选项
 * @returns Promise<PaginatedResult<Recipe>>
 */
async function getRecipesPaginated(
  options: PaginationOptions
): Promise<PaginatedResult<Recipe>>

// 使用示例
const result = await recipeService.getRecipesPaginated({
  page: 1,
  pageSize: 20,
  sortBy: 'difficulty',
  sortOrder: 'asc'
})
```

---

### 2. Category Service（分类服务）

#### 获取所有分类
```typescript
/**
 * 获取所有分类
 * @returns Promise<Category[]>
 */
async function getAllCategories(): Promise<Category[]>

// 使用示例
const categories = await categoryService.getAllCategories()
```

#### 获取分类统计
```typescript
interface CategoryStats {
  id: string
  name: string
  nameCN: string
  recipeCount: number
}

/**
 * 获取分类统计信息
 * @returns Promise<CategoryStats[]>
 */
async function getCategoryStats(): Promise<CategoryStats[]>

// 使用示例
const stats = await categoryService.getCategoryStats()
// [{ id: 'vegetable_dish', nameCN: '素菜', recipeCount: 56 }, ...]
```

---

### 3. Favorite Service（收藏服务）

#### 获取收藏列表
```typescript
/**
 * 获取收藏的菜谱列表
 * @returns Promise<Recipe[]>
 */
async function getFavorites(): Promise<Recipe[]>

// 使用示例
const favorites = await favoriteService.getFavorites()
```

#### 添加收藏
```typescript
/**
 * 添加收藏
 * @param recipeId 菜谱ID
 * @returns Promise<void>
 */
async function addFavorite(recipeId: string): Promise<void>

// 使用示例
await favoriteService.addFavorite('tomato-egg')
```

#### 取消收藏
```typescript
/**
 * 取消收藏
 * @param recipeId 菜谱ID
 * @returns Promise<void>
 */
async function removeFavorite(recipeId: string): Promise<void>

// 使用示例
await favoriteService.removeFavorite('tomato-egg')
```

#### 检查是否已收藏
```typescript
/**
 * 检查是否已收藏
 * @param recipeId 菜谱ID
 * @returns Promise<boolean>
 */
async function isFavorite(recipeId: string): Promise<boolean>

// 使用示例
const isFav = await favoriteService.isFavorite('tomato-egg')
```

#### 切换收藏状态
```typescript
/**
 * 切换收藏状态
 * @param recipeId 菜谱ID
 * @returns Promise<boolean> 返回新状态
 */
async function toggleFavorite(recipeId: string): Promise<boolean>

// 使用示例
const newState = await favoriteService.toggleFavorite('tomato-egg')
```

---

### 4. History Service（历史服务）

#### 获取浏览历史
```typescript
interface HistoryItem {
  recipeId: string
  recipe: Recipe
  viewedAt: number
}

/**
 * 获取浏览历史
 * @param limit 数量限制
 * @returns Promise<HistoryItem[]>
 */
async function getHistory(limit?: number): Promise<HistoryItem[]>

// 使用示例
const history = await historyService.getHistory(20)
```

#### 添加历史记录
```typescript
/**
 * 添加浏览历史
 * @param recipeId 菜谱ID
 * @returns Promise<void>
 */
async function addHistory(recipeId: string): Promise<void>

// 使用示例
await historyService.addHistory('tomato-egg')
```

#### 清空历史
```typescript
/**
 * 清空浏览历史
 * @returns Promise<void>
 */
async function clearHistory(): Promise<void>

// 使用示例
await historyService.clearHistory()
```

---

### 5. Shopping List Service（购物清单服务）

#### 获取购物清单
```typescript
/**
 * 获取当前购物清单
 * @returns Promise<ShoppingList>
 */
async function getShoppingList(): Promise<ShoppingList>

// 使用示例
const list = await shoppingListService.getShoppingList()
```

#### 从菜谱生成清单
```typescript
/**
 * 从菜谱生成购物清单项
 * @param recipeId 菜谱ID
 * @param servings 份数（可选，默认为1）
 * @returns Promise<ShoppingItem[]>
 */
async function generateFromRecipe(
  recipeId: string,
  servings?: number
): Promise<ShoppingItem[]>

// 使用示例
const items = await shoppingListService.generateFromRecipe('tomato-egg', 2)
```

#### 添加购物项
```typescript
/**
 * 添加购物项
 * @param items 购物项数组
 * @returns Promise<void>
 */
async function addItems(items: ShoppingItem[]): Promise<void>

// 使用示例
await shoppingListService.addItems([
  { name: '西红柿', amount: '2个', checked: false }
])
```

#### 切换购物项状态
```typescript
/**
 * 切换购物项的勾选状态
 * @param itemId 购物项ID
 * @returns Promise<void>
 */
async function toggleItem(itemId: string): Promise<void>

// 使用示例
await shoppingListService.toggleItem('item-123')
```

#### 删除购物项
```typescript
/**
 * 删除购物项
 * @param itemId 购物项ID
 * @returns Promise<void>
 */
async function removeItem(itemId: string): Promise<void>

// 使用示例
await shoppingListService.removeItem('item-123')
```

#### 清空购物清单
```typescript
/**
 * 清空购物清单
 * @returns Promise<void>
 */
async function clearList(): Promise<void>

// 使用示例
await shoppingListService.clearList()
```

---

### 6. Cooking Service（做菜服务）

#### 开始做菜
```typescript
/**
 * 开始做菜会话
 * @param recipeId 菜谱ID
 * @returns Promise<CookingSession>
 */
async function startCooking(recipeId: string): Promise<CookingSession>

// 使用示例
const session = await cookingService.startCooking('tomato-egg')
```

#### 获取当前会话
```typescript
/**
 * 获取当前做菜会话
 * @returns Promise<CookingSession | null>
 */
async function getCurrentSession(): Promise<CookingSession | null>

// 使用示例
const session = await cookingService.getCurrentSession()
```

#### 更新步骤
```typescript
/**
 * 跳转到下一步
 * @returns Promise<void>
 */
async function nextStep(): Promise<void>

/**
 * 返回上一步
 * @returns Promise<void>
 */
async function prevStep(): Promise<void>

/**
 * 跳转到指定步骤
 * @param step 步骤编号
 * @returns Promise<void>
 */
async function goToStep(step: number): Promise<void>

// 使用示例
await cookingService.nextStep()
```

#### 完成步骤
```typescript
/**
 * 标记步骤为已完成
 * @param step 步骤编号
 * @returns Promise<void>
 */
async function completeStep(step: number): Promise<void>

// 使用示例
await cookingService.completeStep(2)
```

#### 结束做菜
```typescript
/**
 * 结束做菜会话
 * @returns Promise<void>
 */
async function endCooking(): Promise<void>

// 使用示例
await cookingService.endCooking()
```

---

### 7. Timer Service（计时器服务）

#### 添加计时器
```typescript
interface TimerOptions {
  label: string         // 标签（如"煮面"）
  duration: number      // 时长（秒）
}

/**
 * 添加计时器
 * @param options 计时器选项
 * @returns Promise<Timer>
 */
async function addTimer(options: TimerOptions): Promise<Timer>

// 使用示例
const timer = await timerService.addTimer({
  label: '煮面',
  duration: 180  // 3分钟
})
```

#### 获取所有计时器
```typescript
/**
 * 获取所有计时器
 * @returns Promise<Timer[]>
 */
async function getTimers(): Promise<Timer[]>

// 使用示例
const timers = await timerService.getTimers()
```

#### 开始/暂停计时器
```typescript
/**
 * 开始计时器
 * @param timerId 计时器ID
 * @returns Promise<void>
 */
async function startTimer(timerId: string): Promise<void>

/**
 * 暂停计时器
 * @param timerId 计时器ID
 * @returns Promise<void>
 */
async function pauseTimer(timerId: string): Promise<void>

// 使用示例
await timerService.startTimer('timer-123')
```

#### 删除计时器
```typescript
/**
 * 删除计时器
 * @param timerId 计时器ID
 * @returns Promise<void>
 */
async function removeTimer(timerId: string): Promise<void>

// 使用示例
await timerService.removeTimer('timer-123')
```

---

### 8. Settings Service（设置服务）

#### 获取设置
```typescript
interface UserSettings {
  theme: 'light' | 'dark' | 'auto'
  keepScreenOn: boolean
  enableVoice: boolean
  enableNotifications: boolean
  language: 'zh-CN' | 'en-US'
}

/**
 * 获取用户设置
 * @returns Promise<UserSettings>
 */
async function getSettings(): Promise<UserSettings>

// 使用示例
const settings = await settingsService.getSettings()
```

#### 更新设置
```typescript
/**
 * 更新用户设置
 * @param settings 部分设置
 * @returns Promise<void>
 */
async function updateSettings(settings: Partial<UserSettings>): Promise<void>

// 使用示例
await settingsService.updateSettings({
  keepScreenOn: true,
  theme: 'dark'
})
```

---

## 🌐 RESTful API 设计（V2.0）

### Base URL
```
https://api.howtocook.app/v1
```

### Authentication
```
Authorization: Bearer {token}
```

### 菜谱相关接口

#### GET /recipes
```typescript
// 获取菜谱列表
GET /recipes?page=1&pageSize=20&category=vegetable_dish

Response: {
  data: Recipe[],
  page: number,
  pageSize: number,
  total: number
}
```

#### GET /recipes/:id
```typescript
// 获取单个菜谱
GET /recipes/tomato-egg

Response: Recipe
```

#### GET /recipes/search
```typescript
// 搜索菜谱
GET /recipes/search?keyword=鸡蛋

Response: {
  data: Recipe[],
  total: number
}
```

### 用户相关接口

#### POST /auth/login
```typescript
// 用户登录
POST /auth/login
Body: {
  phone: string,
  code: string
}

Response: {
  token: string,
  user: User
}
```

#### GET /user/favorites
```typescript
// 获取收藏
GET /user/favorites

Response: {
  data: Recipe[]
}
```

#### POST /user/favorites
```typescript
// 添加收藏
POST /user/favorites
Body: {
  recipeId: string
}

Response: { success: boolean }
```

### 社区相关接口

#### POST /comments
```typescript
// 发表评论
POST /comments
Body: {
  recipeId: string,
  content: string,
  rating: number
}

Response: Comment
```

#### POST /posts
```typescript
// 发布晒图
POST /posts
Body: {
  recipeId: string,
  images: string[],
  content: string
}

Response: Post
```

---

## 🔔 错误处理

### 错误码定义
```typescript
enum ErrorCode {
  NOT_FOUND = 'NOT_FOUND',
  INVALID_PARAM = 'INVALID_PARAM',
  DB_ERROR = 'DB_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED'
}

interface ApiError {
  code: ErrorCode
  message: string
  details?: any
}
```

### 错误处理示例
```typescript
try {
  const recipe = await recipeService.getRecipeById('invalid-id')
} catch (error) {
  if (error.code === ErrorCode.NOT_FOUND) {
    showToast('菜谱不存在')
  } else {
    showToast('加载失败，请重试')
  }
}
```

---

**最后更新：** 2025-11-02
**文档版本：** v1.0
