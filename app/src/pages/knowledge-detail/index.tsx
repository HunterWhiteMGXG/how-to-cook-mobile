import { View, Text, RichText } from '@tarojs/components'
import { useMemo } from 'react'
import { useRouter } from '@tarojs/taro'
import tipsData from '@/assets/data/tips.json'
import './index.scss'

export default function KnowledgeDetail() {
  const router = useRouter()
  const { id: encodedId } = router.params
  const id = encodedId ? decodeURIComponent(encodedId) : ''

  // 获取当前文章
  const tip = useMemo(() => {
    return tipsData.tips.find(t => t.id === id)
  }, [id])

  // 使用预渲染的 HTML
  const htmlContent = tip?.htmlContent || ''

  if (!tip) {
    return (
      <View className="knowledge-detail">
        <View className="empty">
          <Text>文章不存在</Text>
        </View>
      </View>
    )
  }

  return (
    <View className="knowledge-detail">
      <View className="header">
        <Text className="title">{tip.title}</Text>
      </View>

      <View className="content">
        <RichText nodes={htmlContent} />
      </View>
    </View>
  )
}
