import Taro from '@tarojs/taro'
import type { Category, Recipe, TipsData } from '@/types'

const DATA_CONFIG = {
  baseUrl:
    process.env.NODE_ENV === 'development' && process.env.TARO_ENV === 'h5'
      ? '/api'
      : 'https://howtocook.hunter-white.com',
  // 远端版本接口不可用时，缓存可直接复用的时间。
  cacheExpiry: 24 * 60 * 60 * 1000,
}

const CACHE_KEYS = {
  recipes: 'htc_recipes_cache',
  categories: 'htc_categories_cache',
  tips: 'htc_tips_cache',
} as const
const LEGACY_CACHE_KEYS = ['htc_data_version', 'htc_last_fetch'] as const

interface CacheData<T> {
  data: T
  timestamp: number
  version: string
}

interface VersionData {
  version: string
}

let remoteVersionPromise: Promise<string | null> | null = null
const dataRequestPromises = new Map<string, Promise<unknown>>()

type DataValidator<T> = (value: unknown) => value is T

const isRecipeList: DataValidator<Recipe[]> = Array.isArray
const isCategoryList: DataValidator<Category[]> = Array.isArray
const isTipsData: DataValidator<TipsData> = (value): value is TipsData => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<TipsData>
  return Array.isArray(candidate.categories) && Array.isArray(candidate.tips)
}

function getCacheEntry<T>(
  cacheKey: string,
  validate: DataValidator<T>
): CacheData<T> | null {
  try {
    const cached = Taro.getStorageSync<CacheData<unknown>>(cacheKey)
    if (
      cached &&
      typeof cached === 'object' &&
      'data' in cached &&
      typeof cached.timestamp === 'number' &&
      typeof cached.version === 'string' &&
      validate(cached.data)
    ) {
      return cached as CacheData<T>
    }
  } catch (error) {
    console.warn(`[DataService] 读取缓存失败: ${cacheKey}`, error)
  }

  return null
}

function saveToCache<T>(
  cacheKey: string,
  data: T,
  version: string
): void {
  try {
    const cacheData: CacheData<T> = {
      data,
      timestamp: Date.now(),
      version,
    }
    Taro.setStorageSync(cacheKey, cacheData)
  } catch (error) {
    console.warn(`[DataService] 写入缓存失败: ${cacheKey}`, error)
  }
}

async function fetchRemoteData<T>(endpoint: string): Promise<T | null> {
  try {
    const response = await Taro.request({
      url: `${DATA_CONFIG.baseUrl}/${endpoint}`,
      method: 'GET',
      dataType: 'json',
    })

    if (response.statusCode === 200 && response.data) {
      return response.data as T
    }

    console.warn(
      `[DataService] 请求失败: ${endpoint} (${response.statusCode})`
    )
  } catch (error) {
    console.warn(`[DataService] 请求失败: ${endpoint}`, error)
  }

  return null
}

async function fetchRemoteVersion(): Promise<string | null> {
  const versionData = await fetchRemoteData<unknown>('version.json')
  if (
    versionData &&
    typeof versionData === 'object' &&
    typeof (versionData as VersionData).version === 'string'
  ) {
    return (versionData as VersionData).version
  }

  return null
}

function getRemoteVersion(forceRefresh = false): Promise<string | null> {
  if (forceRefresh || !remoteVersionPromise) {
    remoteVersionPromise = fetchRemoteVersion()
  }

  return remoteVersionPromise
}

function canUseCache<T>(
  cached: CacheData<T>,
  remoteVersion: string | null
): boolean {
  if (remoteVersion) {
    return cached.version === remoteVersion
  }

  return Date.now() - cached.timestamp < DATA_CONFIG.cacheExpiry
}

async function loadRemoteBackedData<T>(
  cacheKey: string,
  endpoint: string,
  fallback: T,
  validate: DataValidator<T>
): Promise<T> {
  const cached = getCacheEntry<T>(cacheKey, validate)
  const remoteVersion = await getRemoteVersion()

  if (cached && canUseCache(cached, remoteVersion)) {
    return cached.data
  }

  const remoteData = await fetchRemoteData<unknown>(endpoint)
  if (validate(remoteData)) {
    const version = remoteVersion || cached?.version || 'unversioned'
    saveToCache(cacheKey, remoteData, version)
    return remoteData
  }

  return cached?.data ?? fallback
}

function getRemoteBackedData<T>(
  cacheKey: string,
  endpoint: string,
  fallback: T,
  validate: DataValidator<T>
): Promise<T> {
  const pendingRequest = dataRequestPromises.get(cacheKey) as
    | Promise<T>
    | undefined
  if (pendingRequest) {
    return pendingRequest
  }

  const request = loadRemoteBackedData(
    cacheKey,
    endpoint,
    fallback,
    validate
  ).finally(() => {
    dataRequestPromises.delete(cacheKey)
  })
  dataRequestPromises.set(cacheKey, request)
  return request
}

export function getRecipesCached(): Recipe[] | null {
  return (
    getCacheEntry<Recipe[]>(CACHE_KEYS.recipes, isRecipeList)?.data ?? null
  )
}

export function getCategoriesCached(): Category[] | null {
  return (
    getCacheEntry<Category[]>(CACHE_KEYS.categories, isCategoryList)?.data ??
    null
  )
}

export function getRecipes(): Promise<Recipe[]> {
  return getRemoteBackedData<Recipe[]>(
    CACHE_KEYS.recipes,
    'recipes.json',
    [],
    isRecipeList
  )
}

export function getCategories(): Promise<Category[]> {
  return getRemoteBackedData<Category[]>(
    CACHE_KEYS.categories,
    'categories.json',
    [],
    isCategoryList
  )
}

export function getTips(): Promise<TipsData> {
  return getRemoteBackedData<TipsData>(
    CACHE_KEYS.tips,
    'tips.json',
    {
      categories: [],
      tips: [],
    },
    isTipsData
  )
}

export async function preloadData(): Promise<void> {
  await Promise.all([getRecipes(), getCategories(), getTips()])
}

export function clearCache(): void {
  try {
    const cacheKeys = [...Object.values(CACHE_KEYS), ...LEGACY_CACHE_KEYS]
    cacheKeys.forEach((key) => {
      Taro.removeStorageSync(key)
    })
  } catch (error) {
    console.warn('[DataService] 清理缓存失败', error)
  } finally {
    remoteVersionPromise = null
    dataRequestPromises.clear()
  }
}

export async function checkForUpdates(): Promise<boolean> {
  const remoteVersion = await getRemoteVersion(true)
  if (!remoteVersion) {
    return false
  }

  const cachedVersions = [
    getCacheEntry<Recipe[]>(CACHE_KEYS.recipes, isRecipeList)?.version,
    getCacheEntry<Category[]>(CACHE_KEYS.categories, isCategoryList)?.version,
    getCacheEntry<TipsData>(CACHE_KEYS.tips, isTipsData)?.version,
  ]
  return cachedVersions.some((version) => version !== remoteVersion)
}
