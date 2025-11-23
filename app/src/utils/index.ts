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

/**
 * 获取难度星级
 */
export function getDifficultyStars(difficulty: number): string {
  return '★'.repeat(difficulty) + '☆'.repeat(5 - difficulty)
}

/**
 * 生成唯一ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout | null = null
  let lastTime = 0

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now()

    if (now - lastTime < delay) {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        lastTime = now
        func.apply(this, args)
      }, delay - (now - lastTime))
    } else {
      lastTime = now
      func.apply(this, args)
    }
  }
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout | null = null

  return function (this: any, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer)

    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}
