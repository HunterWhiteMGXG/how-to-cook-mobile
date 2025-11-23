import { View, Text, RichText } from '@tarojs/components'
import { useState, useEffect } from 'react'
import { useRouter } from '@tarojs/taro'
import { getTips } from '@/services/dataService'
import './index.scss'

export default function KnowledgeDetail() {
  const router = useRouter()
  const { id: encodedId } = router.params
  const id = encodedId ? decodeURIComponent(encodedId) : ''
  const [tip, setTip] = useState<any>(null)

  useEffect(() => {
    getTips().then(data => {
      if (data && data.tips) {
        const found = data.tips.find(t => t.id === id)
        setTip(found)
      }
    })
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
