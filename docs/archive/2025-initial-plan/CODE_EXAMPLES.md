# HowToCook Mobile App - 代码示例

> 核心功能代码实现参考
> 创建日期：2025-11-02

---

## 📚 目录

1. [Markdown 解析脚本](#markdown-解析脚本)
2. [StepCard 组件](#stepcard-组件)
3. [Recipe Service](#recipe-service)
4. [Zustand Store](#zustand-store)
5. [自定义 Hooks](#自定义-hooks)
6. [工具函数](#工具函数)

---

## 1. Markdown 解析脚本

### parse-markdown.js

```javascript
const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * 解析单个菜谱 Markdown 文件
 */
function parseRecipe(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const recipe = {
    id: generateId(filePath),
    name: '',
    category: getCategoryFromPath(filePath),
    difficulty: 0,
    cookingTime: 0,
    servings: 1,
    introduction: '',
    ingredients: [],
    steps: [],
    tips: '',
    images: [],
  };

  let currentSection = '';
  let stepCounter = 0;

  lines.forEach((line, index) => {
    // 解析标题
    if (line.startsWith('# ')) {
      recipe.name = line.replace('# ', '').replace('的做法', '').trim();
    }

    // 解析难度
    if (line.includes('预估烹饪难度：')) {
      const stars = (line.match(/★/g) || []).length;
      recipe.difficulty = stars;
    }

    // 解析简介
    if (!currentSection && line && !line.startsWith('#') && !line.startsWith('预估')) {
      if (recipe.introduction) {
        recipe.introduction += '\n' + line;
      } else if (line.trim()) {
        recipe.introduction = line.trim();
      }
    }

    // 识别章节
    if (line === '## 必备原料和工具') {
      currentSection = 'ingredients';
    } else if (line === '## 计算') {
      currentSection = 'calculation';
    } else if (line === '## 操作') {
      currentSection = 'steps';
    } else if (line === '## 附加内容') {
      currentSection = 'tips';
    }

    // 解析食材
    if (currentSection === 'ingredients' && line.startsWith('- ')) {
      const ingredient = line.replace('- ', '').trim();
      if (ingredient && !ingredient.startsWith('(')) {
        const optional = ingredient.includes('（可选）') || ingredient.includes('(可选)');
        recipe.ingredients.push({
          name: ingredient.replace(/（可选）|\(可选\)/g, '').trim(),
          required: !optional,
        });
      }
    }

    // 解析步骤
    if (currentSection === 'steps' && line.startsWith('- ')) {
      stepCounter++;
      const stepContent = line.replace('- ', '').trim();
      recipe.steps.push({
        id: stepCounter,
        content: stepContent,
        completed: false,
      });
    }

    // 解析提示
    if (currentSection === 'tips' && line.trim() && !line.startsWith('##')) {
      recipe.tips += line + '\n';
    }
  });

  // 提取图片
  const imagePattern = /!\[.*?\]\((.*?)\)/g;
  const images = [];
  let match;
  while ((match = imagePattern.exec(content)) !== null) {
    images.push(match[1]);
  }
  recipe.images = images;

  // 设置封面图
  if (images.length > 0) {
    recipe.coverImage = images[0];
  }

  return recipe;
}

/**
 * 从文件路径生成ID
 */
function generateId(filePath) {
  const filename = path.basename(filePath, '.md');
  const category = getCategoryFromPath(filePath);
  return `${category}-${filename}`.toLowerCase().replace(/\s+/g, '-');
}

/**
 * 从文件路径获取分类
 */
function getCategoryFromPath(filePath) {
  const parts = filePath.split(path.sep);
  const dishesIndex = parts.indexOf('dishes');
  if (dishesIndex !== -1 && parts.length > dishesIndex + 1) {
    return parts[dishesIndex + 1];
  }
  return 'unknown';
}

/**
 * 批量转换所有菜谱
 */
function convertAllRecipes() {
  const mdFiles = glob.sync('dishes/**/*.md', {
    ignore: ['**/README.md', '**/template/**']
  });

  console.log(`Found ${mdFiles.length} recipe files`);

  const recipes = mdFiles.map((file, index) => {
    console.log(`[${index + 1}/${mdFiles.length}] Parsing: ${file}`);
    try {
      return parseRecipe(file);
    } catch (error) {
      console.error(`Error parsing ${file}:`, error.message);
      return null;
    }
  }).filter(Boolean);

  // 保存为JSON
  const outputPath = 'src/assets/data/recipes.json';
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(recipes, null, 2));

  console.log(`\nConverted ${recipes.length} recipes`);
  console.log(`Output: ${outputPath}`);

  // 生成统计信息
  const stats = {
    total: recipes.length,
    byCategory: {},
    byDifficulty: {}
  };

  recipes.forEach(recipe => {
    stats.byCategory[recipe.category] = (stats.byCategory[recipe.category] || 0) + 1;
    stats.byDifficulty[recipe.difficulty] = (stats.byDifficulty[recipe.difficulty] || 0) + 1;
  });

  console.log('\nStatistics:');
  console.log('By Category:', stats.byCategory);
  console.log('By Difficulty:', stats.byDifficulty);
}

// 执行转换
convertAllRecipes();
```

---

## 2. StepCard 组件

### components/StepCard/index.tsx

```typescript
import { View, Image, Text, Swiper, SwiperItem } from '@tarojs/components'
import { useEffect, useState } from 'react'
import { useCookingStore } from '@/store/cooking'
import './index.scss'

interface StepCardProps {
  recipeId: string
  steps: Step[]
}

export default function StepCard({ recipeId, steps }: StepCardProps) {
  const {
    currentStep,
    completedSteps,
    nextStep,
    prevStep,
    completeStep
  } = useCookingStore()

  const [current, setCurrent] = useState(0)

  useEffect(() => {
    setCurrent(currentStep)
  }, [currentStep])

  const handleComplete = () => {
    completeStep(current)
    if (current < steps.length - 1) {
      nextStep()
    }
  }

  const handleSwiperChange = (e) => {
    const { current } = e.detail
    setCurrent(current)
  }

  return (
    <View className="step-card-container">
      {/* 顶部状态栏 */}
      <View className="step-header">
        <View className="step-back" onClick={() => prevStep()}>
          ⬅
        </View>
        <View className="step-progress">
          步骤 {current + 1}/{steps.length}
        </View>
        <View className="step-menu">☰</View>
      </View>

      {/* 卡片轮播 */}
      <Swiper
        className="step-swiper"
        current={current}
        onChange={handleSwiperChange}
        duration={300}
      >
        {steps.map((step, index) => (
          <SwiperItem key={step.id}>
            <View className="step-card">
              {/* 步骤图片 */}
              {step.image && (
                <View className="step-image">
                  <Image src={step.image} mode="aspectFill" />
                </View>
              )}

              {/* 步骤内容 */}
              <View className="step-content">
                <Text className="step-title">
                  {step.id}. {step.title}
                </Text>
                <Text className="step-text">{step.content}</Text>

                {/* 提示 */}
                {step.tips && (
                  <View className="step-tips">
                    <Text className="tips-icon">💡</Text>
                    <Text className="tips-text">{step.tips}</Text>
                  </View>
                )}

                {/* 时长 */}
                {step.duration && (
                  <View className="step-duration">
                    <Text>⏱ 预计 {step.duration} 分钟</Text>
                  </View>
                )}
              </View>

              {/* 完成按钮 */}
              <View className="step-actions">
                {completedSteps.includes(index) ? (
                  <View className="step-completed">
                    <Text>✓ 已完成</Text>
                  </View>
                ) : (
                  <View className="step-complete-btn" onClick={handleComplete}>
                    <Text>✓ 完成，下一步</Text>
                  </View>
                )}
              </View>
            </View>
          </SwiperItem>
        ))}
      </Swiper>

      {/* 进度指示器 */}
      <View className="step-indicators">
        {steps.map((_, index) => (
          <View
            key={index}
            className={`indicator ${
              completedSteps.includes(index)
                ? 'completed'
                : index === current
                ? 'current'
                : ''
            }`}
          />
        ))}
      </View>
    </View>
  )
}
```

### components/StepCard/index.scss

```scss
.step-card-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff;

  .step-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 32px 32px 16px;
    font-size: 32px;

    .step-back {
      width: 80px;
    }

    .step-progress {
      font-weight: 600;
      color: #212121;
    }

    .step-menu {
      width: 80px;
      text-align: right;
    }
  }

  .step-swiper {
    flex: 1;
  }

  .step-card {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 0 32px;

    .step-image {
      width: 100%;
      height: 400px;
      border-radius: 16px;
      overflow: hidden;
      margin-bottom: 32px;

      image {
        width: 100%;
        height: 100%;
      }
    }

    .step-content {
      flex: 1;

      .step-title {
        font-size: 40px;
        font-weight: 600;
        color: #212121;
        margin-bottom: 24px;
        display: block;
      }

      .step-text {
        font-size: 32px;
        line-height: 1.6;
        color: #424242;
        display: block;
      }

      .step-tips {
        display: flex;
        align-items: flex-start;
        padding: 24px;
        background: #FFF3E0;
        border-radius: 12px;
        margin-top: 24px;

        .tips-icon {
          font-size: 36px;
          margin-right: 16px;
        }

        .tips-text {
          flex: 1;
          font-size: 28px;
          color: #E65100;
          line-height: 1.5;
        }
      }

      .step-duration {
        margin-top: 16px;
        color: #757575;
        font-size: 28px;
      }
    }

    .step-actions {
      padding: 32px 0;

      .step-complete-btn {
        height: 96px;
        background: #FF6B35;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;

        text {
          font-size: 32px;
          font-weight: 600;
          color: #fff;
        }
      }

      .step-completed {
        height: 96px;
        background: #E8F5E9;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;

        text {
          font-size: 32px;
          font-weight: 600;
          color: #4CAF50;
        }
      }
    }
  }

  .step-indicators {
    display: flex;
    justify-content: center;
    padding: 24px 0;
    gap: 12px;

    .indicator {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #E0E0E0;
      transition: all 0.3s;

      &.current {
        width: 32px;
        border-radius: 8px;
        background: #FF6B35;
      }

      &.completed {
        background: #4CAF50;
      }
    }
  }
}
```

---

## 3. Recipe Service

### services/recipe.ts

```typescript
import Taro from '@tarojs/taro'
import recipesData from '@/assets/data/recipes.json'

class RecipeService {
  private recipes: Recipe[] = []
  private initialized = false

  /**
   * 初始化数据
   */
  async init() {
    if (this.initialized) return

    try {
      // 尝试从缓存读取
      const cached = await Taro.getStorage({ key: 'recipes' })
      this.recipes = cached.data
    } catch {
      // 缓存不存在，使用内置数据
      this.recipes = recipesData as Recipe[]
      // 保存到缓存
      await Taro.setStorage({
        key: 'recipes',
        data: this.recipes
      })
    }

    this.initialized = true
  }

  /**
   * 获取所有菜谱
   */
  async getAllRecipes(): Promise<Recipe[]> {
    await this.init()
    return this.recipes
  }

  /**
   * 根据ID获取菜谱
   */
  async getRecipeById(id: string): Promise<Recipe | null> {
    await this.init()
    return this.recipes.find(r => r.id === id) || null
  }

  /**
   * 根据分类获取菜谱
   */
  async getRecipesByCategory(category: string): Promise<Recipe[]> {
    await this.init()
    return this.recipes.filter(r => r.category === category)
  }

  /**
   * 搜索菜谱
   */
  async searchRecipes(keyword: string): Promise<Recipe[]> {
    await this.init()
    const lowerKeyword = keyword.toLowerCase()
    return this.recipes.filter(r =>
      r.name.toLowerCase().includes(lowerKeyword) ||
      r.introduction.toLowerCase().includes(lowerKeyword) ||
      r.ingredients.some(i => i.name.includes(keyword))
    )
  }

  /**
   * 筛选菜谱
   */
  async filterRecipes(filters: RecipeFilters): Promise<Recipe[]> {
    await this.init()
    let result = this.recipes

    if (filters.category) {
      result = result.filter(r => r.category === filters.category)
    }

    if (filters.difficulty) {
      result = result.filter(r => filters.difficulty!.includes(r.difficulty))
    }

    if (filters.cookingTime) {
      result = result.filter(r => {
        if (filters.cookingTime!.min && r.cookingTime < filters.cookingTime!.min) {
          return false
        }
        if (filters.cookingTime!.max && r.cookingTime > filters.cookingTime!.max) {
          return false
        }
        return true
      })
    }

    return result
  }
}

export default new RecipeService()
```

---

## 4. Zustand Store

### store/cooking.ts

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CookingState {
  // 状态
  isActive: boolean
  recipeId: string | null
  currentStep: number
  completedSteps: number[]
  timers: Timer[]

  // 操作
  startCooking: (recipeId: string) => void
  endCooking: () => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void
  completeStep: (step: number) => void
  addTimer: (timer: Timer) => void
  removeTimer: (id: string) => void
}

export const useCookingStore = create<CookingState>()(
  persist(
    (set, get) => ({
      isActive: false,
      recipeId: null,
      currentStep: 0,
      completedSteps: [],
      timers: [],

      startCooking: (recipeId) => {
        set({
          isActive: true,
          recipeId,
          currentStep: 0,
          completedSteps: []
        })
      },

      endCooking: () => {
        set({
          isActive: false,
          recipeId: null,
          currentStep: 0,
          completedSteps: [],
          timers: []
        })
      },

      nextStep: () => {
        const { currentStep } = get()
        set({ currentStep: currentStep + 1 })
      },

      prevStep: () => {
        const { currentStep } = get()
        if (currentStep > 0) {
          set({ currentStep: currentStep - 1 })
        }
      },

      goToStep: (step) => {
        set({ currentStep: step })
      },

      completeStep: (step) => {
        const { completedSteps } = get()
        if (!completedSteps.includes(step)) {
          set({ completedSteps: [...completedSteps, step] })
        }
      },

      addTimer: (timer) => {
        const { timers } = get()
        set({ timers: [...timers, timer] })
      },

      removeTimer: (id) => {
        const { timers } = get()
        set({ timers: timers.filter(t => t.id !== id) })
      }
    }),
    {
      name: 'cooking-storage'
    }
  )
)
```

---

## 5. 自定义 Hooks

### hooks/useKeepScreenOn.ts

```typescript
import { useEffect } from 'react'
import Taro from '@tarojs/taro'

/**
 * 防息屏 Hook
 */
export function useKeepScreenOn(enabled: boolean = true) {
  useEffect(() => {
    if (enabled) {
      Taro.setKeepScreenOn({
        keepScreenOn: true
      })
    }

    return () => {
      Taro.setKeepScreenOn({
        keepScreenOn: false
      })
    }
  }, [enabled])
}
```

### hooks/useTimer.ts

```typescript
import { useState, useEffect, useRef } from 'react'

interface UseTimerOptions {
  duration: number  // 秒
  onFinish?: () => void
}

export function useTimer({ duration, onFinish }: UseTimerOptions) {
  const [remaining, setRemaining] = useState(duration)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (isRunning && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 1) {
            setIsRunning(false)
            onFinish?.()
            return 0
          }
          return r - 1
        })
      }, 1000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, remaining, onFinish])

  const start = () => setIsRunning(true)
  const pause = () => setIsRunning(false)
  const reset = () => {
    setRemaining(duration)
    setIsRunning(false)
  }

  return {
    remaining,
    isRunning,
    start,
    pause,
    reset
  }
}
```

---

## 6. 工具函数

### utils/calculator.ts

```typescript
/**
 * 计算调整后的食材用量
 */
export function calculateIngredients(
  ingredients: Ingredient[],
  servings: number,
  baseServings: number = 1
): Ingredient[] {
  const ratio = servings / baseServings

  return ingredients.map(ingredient => {
    // 解析数量
    const amountMatch = ingredient.amount.match(/(\d+\.?\d*)/);
    if (!amountMatch) {
      return ingredient
    }

    const baseAmount = parseFloat(amountMatch[1])
    const newAmount = (baseAmount * ratio).toFixed(1)
    const newAmountStr = ingredient.amount.replace(amountMatch[1], newAmount)

    return {
      ...ingredient,
      amount: newAmountStr
    }
  })
}

/**
 * 格式化时间
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}分钟`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`
}

/**
 * 获取难度文本
 */
export function getDifficultyText(difficulty: number): string {
  const texts = ['', '非常简单', '简单', '一般', '较难', '困难']
  return texts[difficulty] || '未知'
}
```

---

**最后更新：** 2025-11-02
**文档版本：** v1.0
