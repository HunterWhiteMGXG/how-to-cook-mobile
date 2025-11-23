import Taro from '@tarojs/taro'

// 检测是否为开发环境
declare const __TARO_ENV_DEV__: boolean | undefined
const isDev = typeof __TARO_ENV_DEV__ !== 'undefined' ? __TARO_ENV_DEV__ : true

// 数据配置
const DATA_CONFIG = {
  // 远程数据 URL - Cloudflare R2 自定义域名
  // 开发环境通过代理访问，生产环境直接访问 R2
  baseUrl: isDev ? '/api' : 'https://howtocook.hunter-white.com',
  // 缓存版本号
  version: '1.0.0',
  // 缓存有效期（毫秒）- 默认 24 小时
  cacheExpiry: 24 * 60 * 60 * 1000,
}

// 缓存 key
const CACHE_KEYS = {
  recipes: 'htc_recipes_cache',
  categories: 'htc_categories_cache',
  tips: 'htc_tips_cache',
  lastFetch: 'htc_last_fetch',
  version: 'htc_data_version',
}

interface CacheData<T> {
  data: T
  timestamp: number
  version: string
}


// 从缓存获取数据
function getFromCache<T>(cacheKey: string): T | null {
  try {
    const cached = Taro.getStorageSync(cacheKey) as CacheData<T>
    if (cached && cached.data) {
      return cached.data
    }
    return null
  } catch {
    return null
  }
}

// 保存到缓存
function saveToCache<T>(cacheKey: string, data: T): void {
  try {
    const cacheData: CacheData<T> = {
      data,
      timestamp: Date.now(),
      version: DATA_CONFIG.version,
    }
    Taro.setStorageSync(cacheKey, cacheData)
  } catch (error) {
    console.warn('Failed to save to cache:', error)
  }
}

// 从远程获取数据
async function fetchRemoteData<T>(endpoint: string): Promise<T | null> {
  if (!DATA_CONFIG.baseUrl) {
    return null
  }

  try {
    const url = `${DATA_CONFIG.baseUrl}/${endpoint}`
    const res = await fetch(url)
    if (res.ok) {
      return await res.json() as T
    }
    return null
  } catch {
    return null
  }
}

// 检查远程版本
async function checkRemoteVersion(): Promise<string | null> {
  if (!DATA_CONFIG.baseUrl) return null

  try {
    const res = await fetch(`${DATA_CONFIG.baseUrl}/version.json`)
    if (res.ok) {
      const data = await res.json()
      return data.version || null
    }
    return null
  } catch {
    return null
  }
}

// 获取本地缓存的版本号
function getLocalVersion(): string {
  try {
    return Taro.getStorageSync(CACHE_KEYS.version) || ''
  } catch {
    return ''
  }
}

// 缓存版本检查结果（避免重复请求）
let versionCheckPromise: Promise<boolean> | null = null
let versionCheckResult: boolean | null = null

// 判断是否需要更新数据
async function shouldUpdateData(): Promise<boolean> {
  // 已有结果，直接返回
  if (versionCheckResult !== null) {
    return versionCheckResult
  }

  // 已有进行中的检查，等待结果
  if (versionCheckPromise) {
    return versionCheckPromise
  }

  // 发起新的检查
  versionCheckPromise = (async () => {
    const remoteVersion = await checkRemoteVersion()
    if (!remoteVersion) {
      versionCheckResult = false
      return false
    }

    const localVersion = getLocalVersion()
    versionCheckResult = remoteVersion !== localVersion
    return versionCheckResult
  })()

  return versionCheckPromise
}

// 重置版本检查（下次启动时重新检查）
export function resetVersionCheck(): void {
  versionCheckPromise = null
  versionCheckResult = null
}

// 保存版本号
function saveVersion(version: string): void {
  try {
    Taro.setStorageSync(CACHE_KEYS.version, version)
  } catch {
    // ignore
  }
}

// 获取菜谱数据（立即返回缓存）
export function getRecipesCached(): any[] | null {
  return getFromCache<any[]>(CACHE_KEYS.recipes)
}

// 获取菜谱数据
export async function getRecipes(): Promise<any[]> {
  const cacheKey = CACHE_KEYS.recipes

  // 1. 有缓存且不需要更新，直接返回缓存
  const cached = getFromCache<any[]>(cacheKey)
  if (cached && !await shouldUpdateData()) {
    return cached
  }

  // 2. 需要更新或无缓存，尝试远程获取
  if (DATA_CONFIG.baseUrl) {
    const remote = await fetchRemoteData<any[]>('recipes.json')
    if (remote) {
      saveToCache(cacheKey, remote)
      // 同时更新版本号
      const remoteVersion = await checkRemoteVersion()
      if (remoteVersion) saveVersion(remoteVersion)
      return remote
    }
  }

  // 3. 使用缓存（如果有）
  return cached || []
}

// 获取分类数据（立即返回缓存）
export function getCategoriesCached(): any[] | null {
  return getFromCache<any[]>(CACHE_KEYS.categories)
}

// 获取分类数据
export async function getCategories(): Promise<any[]> {
  const cacheKey = CACHE_KEYS.categories

  const cached = getFromCache<any[]>(cacheKey)
  if (cached && !await shouldUpdateData()) {
    return cached
  }

  if (DATA_CONFIG.baseUrl) {
    const remote = await fetchRemoteData<any[]>('categories.json')
    if (remote) {
      saveToCache(cacheKey, remote)
      return remote
    }
  }

  return cached || []
}

// 获取知识文章数据
export async function getTips(): Promise<any> {
  const cacheKey = CACHE_KEYS.tips

  const cached = getFromCache<any>(cacheKey)
  if (cached && !await shouldUpdateData()) {
    return cached
  }

  if (DATA_CONFIG.baseUrl) {
    const remote = await fetchRemoteData<any>('tips.json')
    if (remote) {
      saveToCache(cacheKey, remote)
      return remote
    }
  }

  return cached || {}
}

// 预加载所有数据
export async function preloadData(): Promise<void> {
  await Promise.all([
    getRecipes(),
    getCategories(),
    getTips(),
  ])
}

// 清除缓存
export function clearCache(): void {
  try {
    Object.values(CACHE_KEYS).forEach(key => {
      Taro.removeStorageSync(key)
    })
  } catch (error) {
    console.warn('Failed to clear cache:', error)
  }
}

// 检查是否有更新
export async function checkForUpdates(): Promise<boolean> {
  if (!DATA_CONFIG.baseUrl) return false

  try {
    const res = await fetch(`${DATA_CONFIG.baseUrl}/version.json`)
    if (res.ok) {
      const data = await res.json()
      const remoteVersion = data.version
      const localVersion = Taro.getStorageSync(CACHE_KEYS.version) || ''

      if (remoteVersion !== localVersion) {
        Taro.setStorageSync(CACHE_KEYS.version, remoteVersion)
        clearCache()
        return true
      }
    }
    return false
  } catch {
    return false
  }
}
