import Taro from '@tarojs/taro'
import { STORAGE_KEYS } from '@/constants'
import type { HistoryItem } from '@/types'
import { clearCache } from './dataService'

const STORE_KEYS = ['user-storage', 'cooking-storage'] as const

class StorageService {
  /**
   * 保存数据
   */
  async set<T>(key: string, value: T): Promise<void> {
    try {
      await Taro.setStorage({
        key,
        data: value,
      })
    } catch (error) {
      console.error('Storage set error:', error)
      throw error
    }
  }

  /**
   * 获取数据
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const res = await Taro.getStorage({ key })
      return res.data as T
    } catch {
      return null
    }
  }

  /**
   * 删除数据
   */
  async remove(key: string): Promise<void> {
    try {
      await Taro.removeStorage({ key })
    } catch (error) {
      console.error('Storage remove error:', error)
    }
  }

  /**
   * 清空所有数据
   */
  async clear(): Promise<void> {
    try {
      const keys = [...Object.values(STORAGE_KEYS), ...STORE_KEYS]
      keys.forEach((key) => Taro.removeStorageSync(key))
      clearCache()
    } catch (error) {
      console.error('Storage clear error:', error)
    }
  }

  /**
   * 获取收藏列表
   */
  async getFavorites(): Promise<string[]> {
    const stored = await this.get<string[] | string>(STORAGE_KEYS.FAVORITES)
    if (Array.isArray(stored)) {
      return stored.filter((id): id is string => typeof id === 'string')
    }
    if (typeof stored === 'string') {
      try {
        const parsed: unknown = JSON.parse(stored)
        return Array.isArray(parsed)
          ? parsed.filter((id): id is string => typeof id === 'string')
          : []
      } catch {
        return []
      }
    }
    return []
  }

  /**
   * 切换收藏状态
   */
  async toggleFavorite(recipeId: string): Promise<boolean> {
    const favorites = await this.getFavorites()
    const index = favorites.indexOf(recipeId)

    if (index > -1) {
      favorites.splice(index, 1)
      await this.set(STORAGE_KEYS.FAVORITES, favorites)
      return false
    } else {
      favorites.push(recipeId)
      await this.set(STORAGE_KEYS.FAVORITES, favorites)
      return true
    }
  }

  /**
   * 添加浏览历史
   */
  async addHistory(recipeId: string): Promise<void> {
    const history =
      (await this.get<HistoryItem[]>(STORAGE_KEYS.HISTORY)) || []
    const newHistory = [
      { recipeId, viewedAt: Date.now() },
      ...history.filter((h) => h.recipeId !== recipeId),
    ].slice(0, 50) // 只保留最近50条

    await this.set(STORAGE_KEYS.HISTORY, newHistory)
  }

  /**
   * 获取浏览历史
   */
  async getHistory(): Promise<HistoryItem[]> {
    return (await this.get<HistoryItem[]>(STORAGE_KEYS.HISTORY)) || []
  }
}

export default new StorageService()
