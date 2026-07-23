# HowToCook Mobile App - 数据库设计

> 本地数据库设计（IndexedDB / Storage）
> 创建日期：2025-11-02

---

## 📊 数据库概述

### 存储方案选择

| 平台 | 方案 | 容量限制 |
|------|------|---------|
| 微信小程序 | Storage API | 10MB |
| H5 | IndexedDB | 无限制（用户授权） |
| App | SQLite / IndexedDB | 无限制 |

### MVP 阶段策略
- 使用 **Storage API**（小程序）
- 使用 **IndexedDB**（H5/App）
- 统一封装数据访问层

---

## 🗄️ IndexedDB 设计

### 数据库信息
```typescript
数据库名称: HowToCookDB
版本: 1.0
```

### Object Stores

#### 1. recipes（菜谱表）

**主键：** `id` (string)

**索引：**
- `category` - 分类索引
- `difficulty` - 难度索引
- `name` - 名称索引（支持搜索）

**字段定义：**
```typescript
interface Recipe {
  // 基本信息
  id: string                    // 唯一标识
  name: string                  // 菜名
  category: string              // 分类 (vegetable_dish, meat_dish, etc.)
  difficulty: number            // 难度 (1-5)
  cookingTime: number           // 烹饪时间（分钟）
  servings: number              // 份数

  // 描述
  introduction: string          // 简介
  coverImage: string            // 封面图
  images: string[]              // 相关图片

  // 食材
  ingredients: Ingredient[]     // 食材列表

  // 步骤
  steps: Step[]                 // 步骤列表

  // 附加信息
  tips: string                  // 小贴士
  variations: string[]          // 变化版本
  nutrition: Nutrition          // 营养信息
  tags: string[]                // 标签

  // 元数据
  source: string                // 来源
  author: string                // 作者
  createdAt: number             // 创建时间
  updatedAt: number             // 更新时间

  // 统计
  viewCount: number             // 浏览次数
  favoriteCount: number         // 收藏次数
}
```

**食材类型：**
```typescript
interface Ingredient {
  name: string                  // 食材名称
  amount: string                // 用量（如 "1个"）
  unit: string                  // 单位
  weight: string                // 重量（如 "约180g"）
  required: boolean             // 是否必需
  category: string              // 分类（蔬菜、肉类、调料等）
}
```

**步骤类型：**
```typescript
interface Step {
  id: number                    // 步骤编号
  title: string                 // 步骤标题
  content: string               // 步骤内容
  image: string                 // 步骤图片
  duration: number              // 预计时长（分钟）
  tips: string                  // 提示
  temperature: string           // 温度（如"中火"）
  tools: string[]               // 所需工具
}
```

**营养信息：**
```typescript
interface Nutrition {
  calories: number              // 卡路里
  protein: number               // 蛋白质（克）
  fat: number                   // 脂肪（克）
  carbohydrate: number          // 碳水化合物（克）
  fiber: number                 // 纤维（克）
  sodium: number                // 钠（毫克）
}
```

---

#### 2. categories（分类表）

**主键：** `id` (string)

```typescript
interface Category {
  id: string                    // 分类 ID
  name: string                  // 分类名称
  nameCN: string                // 中文名称
  icon: string                  // 图标
  color: string                 // 主题色
  description: string           // 描述
  recipeCount: number           // 菜谱数量
  order: number                 // 排序
}
```

**初始数据：**
```json
[
  {
    "id": "vegetable_dish",
    "name": "vegetable_dish",
    "nameCN": "素菜",
    "icon": "🥬",
    "color": "#4CAF50",
    "recipeCount": 56
  },
  {
    "id": "meat_dish",
    "name": "meat_dish",
    "nameCN": "荤菜",
    "icon": "🍖",
    "color": "#FF5722",
    "recipeCount": 99
  },
  {
    "id": "aquatic",
    "name": "aquatic",
    "nameCN": "水产",
    "icon": "🐟",
    "color": "#2196F3",
    "recipeCount": 26
  },
  {
    "id": "breakfast",
    "name": "breakfast",
    "nameCN": "早餐",
    "icon": "🍳",
    "color": "#FF9800",
    "recipeCount": 24
  },
  {
    "id": "staple",
    "name": "staple",
    "nameCN": "主食",
    "icon": "🍚",
    "color": "#FFC107",
    "recipeCount": 49
  },
  {
    "id": "soup",
    "name": "soup",
    "nameCN": "汤与粥",
    "icon": "🍲",
    "color": "#795548",
    "recipeCount": 23
  },
  {
    "id": "drink",
    "name": "drink",
    "nameCN": "饮料",
    "icon": "🍹",
    "color": "#E91E63",
    "recipeCount": 23
  },
  {
    "id": "dessert",
    "name": "dessert",
    "nameCN": "甜品",
    "icon": "🍰",
    "color": "#9C27B0",
    "recipeCount": 20
  }
]
```

---

#### 3. user_data（用户数据表）

**主键：** `key` (string)

```typescript
interface UserData {
  key: string                   // 数据键
  value: any                    // 数据值
  updatedAt: number             // 更新时间
}
```

**存储内容：**
```typescript
// 收藏列表
{
  key: 'favorites',
  value: ['recipe-id-1', 'recipe-id-2'],
  updatedAt: 1699999999999
}

// 浏览历史
{
  key: 'history',
  value: [
    { id: 'recipe-id-1', viewedAt: 1699999999999 },
    { id: 'recipe-id-2', viewedAt: 1699999999998 }
  ],
  updatedAt: 1699999999999
}

// 做菜记录
{
  key: 'cooking_records',
  value: [
    { recipeId: 'recipe-id-1', completedAt: 1699999999999, duration: 25 }
  ],
  updatedAt: 1699999999999
}

// 用户设置
{
  key: 'settings',
  value: {
    theme: 'light',
    notifications: true,
    keepScreenOn: true
  },
  updatedAt: 1699999999999
}
```

---

#### 4. shopping_list（购物清单表）

**主键：** `id` (string)

```typescript
interface ShoppingList {
  id: string                    // 清单 ID
  name: string                  // 清单名称
  recipes: string[]             // 关联菜谱 ID
  items: ShoppingItem[]         // 清单项
  createdAt: number             // 创建时间
  updatedAt: number             // 更新时间
}

interface ShoppingItem {
  id: string                    // 项目 ID
  name: string                  // 食材名称
  amount: string                // 数量
  category: string              // 分类
  checked: boolean              // 是否已购买
  note: string                  // 备注
}
```

---

#### 5. cooking_sessions（做菜会话表）

**主键：** `id` (string)

```typescript
interface CookingSession {
  id: string                    // 会话 ID
  recipeId: string              // 菜谱 ID
  currentStep: number           // 当前步骤
  completedSteps: number[]      // 已完成步骤
  timers: Timer[]               // 计时器列表
  startedAt: number             // 开始时间
  pausedAt: number              // 暂停时间
  completedAt: number           // 完成时间
  status: 'active' | 'paused' | 'completed'
}

interface Timer {
  id: string                    // 计时器 ID
  label: string                 // 标签（如"煮面"）
  duration: number              // 总时长（秒）
  remaining: number             // 剩余时长（秒）
  startedAt: number             // 开始时间
  status: 'running' | 'paused' | 'finished'
}
```

---

## 💾 Storage API 设计（小程序）

### 存储键定义
```typescript
const STORAGE_KEYS = {
  // 菜谱数据（预加载）
  RECIPES: 'howtocook:recipes',
  CATEGORIES: 'howtocook:categories',

  // 用户数据
  FAVORITES: 'howtocook:favorites',
  HISTORY: 'howtocook:history',
  SETTINGS: 'howtocook:settings',

  // 做菜数据
  COOKING_SESSION: 'howtocook:cooking_session',
  SHOPPING_LIST: 'howtocook:shopping_list',

  // 缓存
  SEARCH_CACHE: 'howtocook:search_cache',
  FILTER_CACHE: 'howtocook:filter_cache'
}
```

### 数据压缩策略
由于小程序 Storage 限制 10MB，需要压缩策略：

```typescript
// 1. 只缓存必要字段
interface RecipeCache {
  id: string
  name: string
  category: string
  difficulty: number
  coverImage: string
}

// 2. 详情按需加载
// 首次加载只存储 RecipeCache
// 详情页打开时再加载完整数据
```

---

## 🔄 数据同步策略

### 初始化流程
```
App 启动
  ↓
检查本地数据
  ↓
是否存在？
  ├─ 是 → 直接使用
  └─ 否 → 从 Assets 加载
           ↓
         解析 JSON
           ↓
         写入数据库
           ↓
         完成初始化
```

### 数据更新流程（V2.0）
```
检查更新
  ↓
对比版本号
  ↓
有更新？
  ├─ 是 → 下载差异数据
  │        ↓
  │      合并本地数据
  │        ↓
  │      更新版本号
  └─ 否 → 无需更新
```

---

## 🛠️ 数据访问层封装

### Database Service
```typescript
// services/db.ts

class DatabaseService {
  private db: IDBDatabase | null = null

  // 初始化数据库
  async init(): Promise<void>

  // 菜谱操作
  async getRecipe(id: string): Promise<Recipe>
  async getRecipes(filters?: RecipeFilters): Promise<Recipe[]>
  async searchRecipes(keyword: string): Promise<Recipe[]>

  // 收藏操作
  async getFavorites(): Promise<string[]>
  async addFavorite(id: string): Promise<void>
  async removeFavorite(id: string): Promise<void>

  // 历史操作
  async addHistory(id: string): Promise<void>
  async getHistory(limit?: number): Promise<HistoryItem[]>

  // 购物清单操作
  async getShoppingList(): Promise<ShoppingList>
  async addShoppingItems(items: ShoppingItem[]): Promise<void>
  async toggleShoppingItem(id: string): Promise<void>

  // 做菜会话操作
  async saveCookingSession(session: CookingSession): Promise<void>
  async getCookingSession(id: string): Promise<CookingSession>
  async deleteCookingSession(id: string): Promise<void>
}
```

### Storage Service（小程序）
```typescript
// services/storage.ts

class StorageService {
  // 通用存储
  async set(key: string, value: any): Promise<void>
  async get<T>(key: string): Promise<T | null>
  async remove(key: string): Promise<void>
  async clear(): Promise<void>

  // 菜谱操作
  async getRecipes(): Promise<Recipe[]>
  async getRecipe(id: string): Promise<Recipe>

  // 收藏操作
  async getFavorites(): Promise<string[]>
  async toggleFavorite(id: string): Promise<void>

  // ... 其他操作
}
```

---

## 📈 性能优化

### 1. 索引优化
```typescript
// 为常用查询创建索引
objectStore.createIndex('category', 'category', { unique: false })
objectStore.createIndex('difficulty', 'difficulty', { unique: false })
objectStore.createIndex('name', 'name', { unique: false })
```

### 2. 批量操作
```typescript
// 批量插入
async bulkInsert(recipes: Recipe[]): Promise<void> {
  const transaction = db.transaction(['recipes'], 'readwrite')
  const store = transaction.objectStore('recipes')

  for (const recipe of recipes) {
    store.add(recipe)
  }

  return transaction.complete
}
```

### 3. 缓存策略
```typescript
// 内存缓存热门数据
class CacheManager {
  private cache = new Map<string, Recipe>()
  private maxSize = 50

  get(id: string): Recipe | undefined {
    return this.cache.get(id)
  }

  set(id: string, recipe: Recipe): void {
    if (this.cache.size >= this.maxSize) {
      // LRU 淘汰
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    this.cache.set(id, recipe)
  }
}
```

### 4. 分页加载
```typescript
// 分页查询
async getRecipesByPage(
  page: number,
  pageSize: number,
  filters?: RecipeFilters
): Promise<Recipe[]> {
  const offset = (page - 1) * pageSize
  // 使用 cursor 遍历
  const results: Recipe[] = []
  let count = 0

  // ... cursor 遍历逻辑

  return results
}
```

---

## 🔒 数据迁移

### 版本升级策略
```typescript
// 数据库版本管理
const DB_VERSION = 1

db.onupgradeneeded = (event) => {
  const db = event.target.result
  const oldVersion = event.oldVersion

  if (oldVersion < 1) {
    // 初始化
    createObjectStores(db)
  }

  if (oldVersion < 2) {
    // 添加新字段
    // 迁移旧数据
  }
}
```

---

## 📊 数据统计

### 统计维度
```typescript
interface Statistics {
  // 菜谱统计
  totalRecipes: number
  recipesByCategory: Record<string, number>
  recipesByDifficulty: Record<number, number>

  // 用户行为统计
  totalViews: number
  totalFavorites: number
  totalCookingSessions: number

  // 时间统计
  averageCookingTime: number
  totalCookingTime: number
}
```

---

**最后更新：** 2025-11-02
**文档版本：** v1.0
