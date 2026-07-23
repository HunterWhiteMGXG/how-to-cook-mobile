import { View, Text } from '@tarojs/components'
import { useState, useMemo, useEffect } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { getTips } from '@/services/dataService'
import { ROUTES } from '@/constants'
import type { TipsData } from '@/types'
import './index.scss'

export default function KnowledgeList() {
  const router = useRouter()
  const { category: initialCategory } = router.params
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'basic')
  const [tipsData, setTipsData] = useState<TipsData>({
    tips: [],
    categories: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    getTips()
      .then((data) => {
        if (isMounted) {
          setTipsData(data)
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  // 获取当前分类的文章
  const currentTips = useMemo(() => {
    return tipsData.tips.filter(tip => tip.category === selectedCategory)
  }, [selectedCategory, tipsData])

  // 导航到知识详情
  const handleTipClick = (tipId: string) => {
    Taro.navigateTo({
      url: `${ROUTES.KNOWLEDGE_DETAIL}?id=${encodeURIComponent(tipId)}`
    })
  }

  return (
    <View className="knowledge-list">
      <View className="header">
        <Text className="title">📚 知识库</Text>
        <Text className="subtitle">{tipsData.tips.length} 篇文章</Text>
      </View>

      {/* 分类切换 */}
      <View className="category-tabs">
        {tipsData.categories.map((cat) => (
          <View
            key={cat.id}
            className={`tab-item ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            <Text className="tab-icon">{cat.icon}</Text>
            <Text className="tab-name">{cat.name}</Text>
            <Text className="tab-count">{cat.tips.length}</Text>
          </View>
        ))}
      </View>

      {/* 文章列表 */}
      <View className="tips-list">
        {currentTips.map((tip) => (
          <View
            key={tip.id}
            className="tip-item"
            onClick={() => handleTipClick(tip.id)}
          >
            <Text className="tip-title">{tip.title}</Text>
            <Text className="tip-arrow">›</Text>
          </View>
        ))}
        {isLoading && (
          <View className="empty">
            <Text>加载中...</Text>
          </View>
        )}
        {!isLoading && currentTips.length === 0 && (
          <View className="empty">
            <Text>暂无内容</Text>
          </View>
        )}
      </View>
    </View>
  )
}
