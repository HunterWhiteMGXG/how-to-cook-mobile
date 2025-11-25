import Taro from '@tarojs/taro'

// 检测是否为开发环境
declare const __TARO_ENV_DEV__: boolean | undefined
const isDev = typeof __TARO_ENV_DEV__ !== 'undefined' ? __TARO_ENV_DEV__ : true

// 获取基础 URL
function getBaseUrl(): string {
  // H5 开发环境使用代理
  if (isDev && process.env.TARO_ENV === 'h5') {
    return '/api'
  }
  // 小程序和生产环境直接访问 R2
  return 'https://howtocook.hunter-white.com'
}

// 数据配置
const DATA_CONFIG = {
  // 远程数据 URL - Cloudflare R2 自定义域名
  baseUrl: getBaseUrl(),
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
    console.log('[DataService] Requesting URL:', url)

    // 使用 Taro.request 以兼容小程序和 H5
    const res = await Taro.request({
      url,
      method: 'GET',
      dataType: 'json'
    })

    console.log('[DataService] Request response status:', res.statusCode)

    if (res.statusCode === 200 && res.data) {
      return res.data as T
    }

    console.log('[DataService] Request failed with status:', res.statusCode)
    return null
  } catch (error) {
    console.error('[DataService] Request error:', error)
    return null
  }
}

// 检查远程版本
async function checkRemoteVersion(): Promise<string | null> {
  if (!DATA_CONFIG.baseUrl) return null

  try {
    const res = await Taro.request({
      url: `${DATA_CONFIG.baseUrl}/version.json`,
      method: 'GET',
      dataType: 'json'
    })

    if (res.statusCode === 200 && res.data) {
      return (res.data as any).version || null
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

  console.log('[DataService] getRecipes called, baseUrl:', DATA_CONFIG.baseUrl)

  // 1. 有缓存且不需要更新，直接返回缓存
  const cached = getFromCache<any[]>(cacheKey)
  console.log('[DataService] cached recipes:', cached ? cached.length : 0)

  const needUpdate = await shouldUpdateData()
  console.log('[DataService] shouldUpdateData:', needUpdate)

  if (cached && !needUpdate) {
    console.log('[DataService] Using cached recipes')
    return cached
  }

  // 2. 需要更新或无缓存，尝试远程获取
  if (DATA_CONFIG.baseUrl) {
    console.log('[DataService] Fetching remote recipes from:', `${DATA_CONFIG.baseUrl}/recipes.json`)
    const remote = await fetchRemoteData<any[]>('recipes.json')
    if (remote) {
      console.log('[DataService] Fetched remote recipes:', remote.length)
      saveToCache(cacheKey, remote)
      // 同时更新版本号
      const remoteVersion = await checkRemoteVersion()
      if (remoteVersion) saveVersion(remoteVersion)
      return remote
    } else {
      console.log('[DataService] Failed to fetch remote recipes')
    }
  }

  // 3. 使用缓存（如果有）
  console.log('[DataService] Returning cached or empty array')
  return cached || []
}

// 获取分类数据（立即返回缓存）
export function getCategoriesCached(): any[] | null {
  return getFromCache<any[]>(CACHE_KEYS.categories)
}

// 获取分类数据
export async function getCategories(): Promise<any[]> {
  const cacheKey = CACHE_KEYS.categories

  console.log('[DataService] getCategories called')

  const cached = getFromCache<any[]>(cacheKey)
  console.log('[DataService] cached categories:', cached ? cached.length : 0)

  const needUpdate = await shouldUpdateData()
  if (cached && !needUpdate) {
    console.log('[DataService] Using cached categories')
    return cached
  }

  if (DATA_CONFIG.baseUrl) {
    console.log('[DataService] Fetching remote categories from:', `${DATA_CONFIG.baseUrl}/categories.json`)
    const remote = await fetchRemoteData<any[]>('categories.json')
    if (remote) {
      console.log('[DataService] Fetched remote categories:', remote.length)
      saveToCache(cacheKey, remote)
      return remote
    } else {
      console.log('[DataService] Failed to fetch remote categories')
    }
  }

  console.log('[DataService] Returning cached or empty categories array')
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
    const res = await Taro.request({
      url: `${DATA_CONFIG.baseUrl}/version.json`,
      method: 'GET',
      dataType: 'json'
    })

    if (res.statusCode === 200 && res.data) {
      const remoteVersion = (res.data as any).version
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
