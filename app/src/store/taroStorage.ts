import Taro from '@tarojs/taro'
import type { StateStorage } from 'zustand/middleware'

/**
 * Zustand persist 的跨端存储适配器。
 * 使用 Taro Storage，避免在微信小程序中直接访问 localStorage。
 */
export const taroStorage: StateStorage = {
  getItem: (name) => {
    const value = Taro.getStorageSync<string>(name)
    return typeof value === 'string' ? value : null
  },
  setItem: (name, value) => {
    Taro.setStorageSync(name, value)
  },
  removeItem: (name) => {
    Taro.removeStorageSync(name)
  },
}
