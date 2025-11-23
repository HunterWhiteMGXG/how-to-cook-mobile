# HowToCook Mobile App - 技术架构设计

> 基于 Taro 3 + React + TypeScript 的多端应用架构
> 创建日期：2025-11-02

---

## 📐 整体架构

### 架构图

```
┌─────────────────────────────────────────────────┐
│              用户界面层 (UI Layer)                │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│   │ 微信小程序│  │ App (iOS)│  │ App(安卓)│    │
│   └──────────┘  └──────────┘  └──────────┘    │
└───────────────────┬─────────────────────────────┘
                    │ Taro 3 编译层
┌───────────────────▼─────────────────────────────┐
│              业务逻辑层 (Business Layer)          │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│   │ 页面组件  │  │ 业务组件  │  │ 工具函数  │    │
│   └──────────┘  └──────────┘  └──────────┘    │
│   ┌──────────┐  ┌──────────┐                  │
│   │ 状态管理  │  │ 路由管理  │                  │
│   └──────────┘  └──────────┘                  │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│              数据层 (Data Layer)                 │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│   │ IndexedDB│  │  Storage │  │  SQLite  │    │
│   └──────────┘  └──────────┘  └──────────┘    │
│   ┌──────────┐  ┌──────────┐                  │
│   │ JSON数据  │  │ 图片资源  │                  │
│   └──────────┘  └──────────┘                  │
└─────────────────────────────────────────────────┘
```

---

## 🎯 技术栈详解

### 核心框架

#### Taro 3.6+
```json
{
  "@tarojs/taro": "^3.6.0",
  "@tarojs/plugin-platform-weapp": "^3.6.0",
  "@tarojs/plugin-platform-alipay": "^3.6.0",
  "@tarojs/runtime": "^3.6.0"
}
```

**选择理由：**
- 一码多端（小程序 + H5 + React Native）
- React 语法，学习成本低
- 成熟稳定，社区活跃
- 官方支持 TypeScript

#### React 18
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0"
}
```

**使用的 React 特性：**
- Hooks（useState, useEffect, useCallback, useMemo）
- Context API（全局状态共享）
- Suspense（代码分割与懒加载）
- Concurrent Features（并发渲染）

#### TypeScript 5+
```json
{
  "typescript": "^5.0.0"
}
```

**类型定义策略：**
- 严格模式 (`strict: true`)
- 完整的接口定义
- 类型推导优先
- 避免 any 类型

---

## 📁 项目目录结构

```
howtocook-app/
├── config/                      # Taro 配置
│   ├── index.js                # 通用配置
│   ├── dev.js                  # 开发环境配置
│   └── prod.js                 # 生产环境配置
├── src/
│   ├── pages/                  # 页面
│   │   ├── index/             # 首页
│   │   │   ├── index.tsx
│   │   │   ├── index.scss
│   │   │   └── index.config.ts
│   │   ├── recipe-list/       # 菜谱列表
│   │   ├── recipe-detail/     # 菜谱详情
│   │   ├── cooking-mode/      # 卡片式做菜模式
│   │   ├── shopping-list/     # 购物清单
│   │   └── profile/           # 个人中心
│   │
│   ├── components/            # 通用组件
│   │   ├── RecipeCard/       # 菜谱卡片
│   │   ├── StepCard/         # 步骤卡片（核心）
│   │   ├── Timer/            # 计时器
│   │   ├── SearchBar/        # 搜索栏
│   │   └── CategoryNav/      # 分类导航
│   │
│   ├── store/                 # 状态管理
│   │   ├── index.ts          # Store 配置
│   │   ├── recipe.ts         # 菜谱状态
│   │   ├── user.ts           # 用户状态
│   │   └── cooking.ts        # 做菜状态
│   │
│   ├── services/              # 业务服务
│   │   ├── recipe.ts         # 菜谱服务
│   │   ├── storage.ts        # 存储服务
│   │   └── db.ts             # 数据库服务
│   │
│   ├── utils/                 # 工具函数
│   │   ├── index.ts          # 通用工具
│   │   ├── validator.ts      # 验证工具
│   │   ├── formatter.ts      # 格式化工具
│   │   └── calculator.ts     # 计算工具（份量）
│   │
│   ├── hooks/                 # 自定义 Hooks
│   │   ├── useRecipe.ts      # 菜谱 Hook
│   │   ├── useTimer.ts       # 计时器 Hook
│   │   └── useKeepScreenOn.ts # 防息屏 Hook
│   │
│   ├── types/                 # TypeScript 类型定义
│   │   ├── recipe.ts         # 菜谱类型
│   │   ├── user.ts           # 用户类型
│   │   └── common.ts         # 通用类型
│   │
│   ├── constants/             # 常量定义
│   │   ├── index.ts          # 通用常量
│   │   ├── routes.ts         # 路由常量
│   │   └── categories.ts     # 分类常量
│   │
│   ├── assets/                # 静态资源
│   │   ├── images/           # 图片
│   │   ├── icons/            # 图标
│   │   └── data/             # 数据文件
│   │       └── recipes.json  # 菜谱 JSON
│   │
│   ├── styles/                # 全局样式
│   │   ├── variables.scss    # 变量
│   │   ├── mixins.scss       # Mixins
│   │   └── global.scss       # 全局样式
│   │
│   ├── app.tsx                # 应用入口
│   ├── app.scss               # 全局样式
│   └── app.config.ts          # 应用配置
│
├── scripts/                   # 脚本工具
│   ├── parse-markdown.js     # Markdown 解析
│   └── build-data.js         # 数据构建
│
├── package.json
├── tsconfig.json
├── project.config.json        # 小程序配置
└── README.md
```

---

## 🧩 核心模块设计

### 1. 状态管理 - Zustand

#### 为什么选择 Zustand？
- ✅ 轻量级（1kb gzipped）
- ✅ API 简洁，易于使用
- ✅ TypeScript 支持好
- ✅ 无需 Provider 包裹
- ✅ 支持中间件（persist、devtools）

#### Store 设计

**菜谱 Store (`store/recipe.ts`)**
```typescript
interface RecipeState {
  // 数据
  recipes: Recipe[]
  categories: Category[]
  currentRecipe: Recipe | null

  // 筛选与排序
  filters: RecipeFilters
  sortBy: SortType

  // 操作
  loadRecipes: () => Promise<void>
  getRecipeById: (id: string) => Recipe | undefined
  searchRecipes: (keyword: string) => Recipe[]
  filterRecipes: (filters: RecipeFilters) => Recipe[]

  // 收藏
  favorites: string[]
  toggleFavorite: (id: string) => void

  // 历史
  history: string[]
  addToHistory: (id: string) => void
}
```

**做菜状态 Store (`store/cooking.ts`)**
```typescript
interface CookingState {
  // 当前做菜状态
  isActive: boolean
  recipeId: string | null
  currentStep: number
  completedSteps: number[]

  // 计时器
  timers: Timer[]

  // 操作
  startCooking: (recipeId: string) => void
  nextStep: () => void
  prevStep: () => void
  completeStep: (step: number) => void
  endCooking: () => void

  // 计时器操作
  addTimer: (timer: Timer) => void
  removeTimer: (id: string) => void
  updateTimer: (id: string, remaining: number) => void
}
```

**用户 Store (`store/user.ts`)**
```typescript
interface UserState {
  // 用户信息
  user: User | null
  isLogin: boolean

  // 设置
  settings: UserSettings

  // 购物清单
  shoppingList: ShoppingItem[]
  addToShoppingList: (items: ShoppingItem[]) => void
  toggleShoppingItem: (id: string) => void
  clearShoppingList: () => void
}
```

### 2. 数据存储方案

#### 存储层次
```
1. 内存缓存（Zustand Store）
   ↓ 读取优先
2. 本地缓存（IndexedDB / Storage）
   ↓ 持久化
3. 静态资源（Assets）
   ↓ 初始数据
```

#### IndexedDB 设计（H5 / App）

```typescript
// 数据库名称：HowToCookDB
// 版本：1

// Object Store: recipes
interface RecipeStore {
  id: string              // 主键
  name: string
  category: string
  difficulty: number
  cookingTime: number
  ingredients: Ingredient[]
  steps: Step[]
  images: string[]
  createdAt: number
  updatedAt: number
}

// Object Store: user_data
interface UserDataStore {
  key: string             // 主键 (favorites, history, etc.)
  value: any
  updatedAt: number
}

// Object Store: shopping_list
interface ShoppingListStore {
  id: string              // 主键
  recipeId: string
  items: ShoppingItem[]
  createdAt: number
}
```

#### Storage API（小程序）

```typescript
// 使用 Taro.setStorage / Taro.getStorage
const STORAGE_KEYS = {
  RECIPES: 'recipes',
  FAVORITES: 'favorites',
  HISTORY: 'history',
  SHOPPING_LIST: 'shopping_list',
  USER_SETTINGS: 'user_settings'
}
```

### 3. 路由设计

#### 页面路由表
```typescript
const ROUTES = {
  INDEX: '/pages/index/index',
  RECIPE_LIST: '/pages/recipe-list/index',
  RECIPE_DETAIL: '/pages/recipe-detail/index',
  COOKING_MODE: '/pages/cooking-mode/index',
  SHOPPING_LIST: '/pages/shopping-list/index',
  PROFILE: '/pages/profile/index'
}
```

#### Tabbar 配置
```typescript
{
  tabBar: {
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'assets/icons/home.png',
        selectedIconPath: 'assets/icons/home-active.png'
      },
      {
        pagePath: 'pages/recipe-list/index',
        text: '菜谱',
        iconPath: 'assets/icons/recipe.png',
        selectedIconPath: 'assets/icons/recipe-active.png'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: 'assets/icons/profile.png',
        selectedIconPath: 'assets/icons/profile-active.png'
      }
    ]
  }
}
```

### 4. 组件设计

#### 原子组件（Atomic Components）
```
Button/           # 按钮
Input/            # 输入框
Icon/             # 图标
Tag/              # 标签
Badge/            # 徽章
```

#### 分子组件（Molecular Components）
```
SearchBar/        # 搜索栏
RecipeCard/       # 菜谱卡片
IngredientList/   # 食材列表
StepItem/         # 步骤项
Timer/            # 计时器
```

#### 有机组件（Organism Components）
```
CategoryNav/      # 分类导航
RecipeGrid/       # 菜谱网格
StepCard/         # 步骤卡片（核心）
ShoppingCart/     # 购物清单
```

---

## 🎨 UI 组件库选择

### Taro UI

```bash
npm install taro-ui
```

**优势：**
- 官方推荐
- 跨平台兼容性好
- 组件丰富

**使用场景：**
- 基础组件（Button, Input, Icon）
- 表单组件（Form, Checkbox, Radio）
- 反馈组件（Toast, Modal, Loading）

### 自定义组件

**核心业务组件需要自己实现：**
- StepCard（步骤卡片）
- RecipeCard（菜谱卡片）
- Timer（计时器）
- CategoryNav（分类导航）

---

## 🔧 工具与插件

### 开发工具

#### ESLint
```json
{
  "extends": [
    "taro/react",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "react/jsx-uses-react": "off",
    "react/react-in-jsx-scope": "off"
  }
}
```

#### Prettier
```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5"
}
```

### Taro 插件

#### 图片压缩
```bash
npm install @tarojs/plugin-mini-ci
```

#### 分包加载
```javascript
{
  subPackages: [
    {
      root: 'pages/cooking-mode',
      pages: ['index']
    }
  ]
}
```

---

## 📊 性能优化策略

### 1. 首屏加载优化
- **代码分割**：路由级别的懒加载
- **按需加载**：组件按需导入
- **预加载**：关键资源预加载
- **骨架屏**：首屏加载展示骨架屏

### 2. 运行时优化
- **虚拟列表**：长列表使用虚拟滚动
- **图片懒加载**：图片进入视口才加载
- **防抖节流**：搜索、滚动等操作
- **缓存策略**：合理使用 useMemo, useCallback

### 3. 包体积优化
- **Tree Shaking**：移除未使用代码
- **图片压缩**：使用 WebP 格式
- **分包加载**：非核心功能分包
- **CDN**：静态资源走 CDN

### 4. 内存优化
- **及时清理**：组件卸载时清理定时器、监听器
- **避免内存泄漏**：正确使用 useEffect cleanup
- **数据分页**：大数据集分页加载

---

## 🔐 安全设计

### 1. 数据安全
- **本地加密**：敏感数据加密存储
- **输入验证**：表单输入严格验证
- **XSS 防护**：用户输入转义

### 2. 隐私保护
- **权限最小化**：只申请必要权限
- **数据脱敏**：日志中敏感信息脱敏
- **合规性**：遵守相关法律法规

---

## 🧪 测试策略

### 单元测试
```bash
npm install @testing-library/react @testing-library/jest-dom
```

**测试覆盖：**
- 工具函数（utils）
- 自定义 Hooks
- 业务逻辑函数

### 组件测试
- 关键组件的渲染测试
- 交互行为测试
- 快照测试

### E2E 测试
- 核心流程测试（浏览菜谱 → 开始做菜 → 完成）

---

## 📱 多端适配

### 平台差异处理

```typescript
import Taro from '@tarojs/taro'

// 平台判断
if (Taro.getEnv() === Taro.ENV_TYPE.WEAPP) {
  // 微信小程序特殊处理
}

if (Taro.getEnv() === Taro.ENV_TYPE.RN) {
  // React Native 特殊处理
}
```

### 样式适配

```scss
// 使用 Taro 的尺寸单位
.container {
  width: 750px;  // 相当于 100vw
  padding: 20px;  // 自动转换为 rpx
}
```

---

## 🚀 部署架构

### 小程序
```
源码
  ↓ Taro 编译
小程序代码
  ↓ 上传
微信 / 支付宝后台
  ↓ 审核
发布上线
```

### App
```
源码
  ↓ Taro 编译
React Native 代码
  ↓ 打包
iOS (ipa) / Android (apk)
  ↓ 上传
App Store / Google Play
  ↓ 审核
发布上线
```

---

**最后更新：** 2025-11-02
**文档版本：** v1.0
