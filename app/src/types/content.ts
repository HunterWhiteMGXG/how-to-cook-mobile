/**
 * 知识库分类
 */
export interface TipCategory {
  id: string
  name: string
  icon: string
  tips: string[]
}

/**
 * 知识库文章
 */
export interface Tip {
  id: string
  title: string
  category: string
  content: string
  htmlContent: string
}

/**
 * 知识库远端数据
 */
export interface TipsData {
  categories: TipCategory[]
  tips: Tip[]
}
