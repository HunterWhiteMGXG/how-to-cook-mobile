import Taro from '@tarojs/taro'
import type { Recipe, Category, RecipeFilters } from '@/types'

// 导入数据
import recipesData from '@/assets/data/recipes.json'
import categoriesData from '@/assets/data/categories.json'

class RecipeService {
  private recipes: Recipe[] = []
  private categories: Category[] = []
  private initialized = false

  /**
   * 初始化数据
   */
  async init() {
    if (this.initialized) return

    this.recipes = recipesData as Recipe[]
    this.categories = categoriesData as Category[]
    this.initialized = true

    console.log(`Loaded ${this.recipes.length} recipes`)
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
    return this.recipes.find((r) => r.id === id) || null
  }

  /**
   * 根据分类获取菜谱
   */
  async getRecipesByCategory(category: string): Promise<Recipe[]> {
    await this.init()
    return this.recipes.filter((r) => r.category === category)
  }

  /**
   * 搜索菜谱
   */
  async searchRecipes(keyword: string): Promise<Recipe[]> {
    await this.init()
    const lowerKeyword = keyword.toLowerCase()
    return this.recipes.filter(
      (r) =>
        r.name.toLowerCase().includes(lowerKeyword) ||
        r.introduction.toLowerCase().includes(lowerKeyword) ||
        r.ingredients.some((i) => i.name.includes(keyword))
    )
  }

  /**
   * 筛选菜谱
   */
  async filterRecipes(filters: RecipeFilters): Promise<Recipe[]> {
    await this.init()
    let result = this.recipes

    if (filters.category) {
      result = result.filter((r) => r.category === filters.category)
    }

    if (filters.difficulty) {
      result = result.filter((r) => filters.difficulty!.includes(r.difficulty))
    }

    if (filters.cookingTime) {
      result = result.filter((r) => {
        if (
          filters.cookingTime!.min &&
          r.cookingTime < filters.cookingTime!.min
        ) {
          return false
        }
        if (
          filters.cookingTime!.max &&
          r.cookingTime > filters.cookingTime!.max
        ) {
          return false
        }
        return true
      })
    }

    return result
  }

  /**
   * 获取所有分类
   */
  async getAllCategories(): Promise<Category[]> {
    await this.init()
    return this.categories
  }
}

export default new RecipeService()
