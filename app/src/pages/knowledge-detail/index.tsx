import { View, Text, RichText } from '@tarojs/components'
import { useState, useEffect } from 'react'
import { useRouter } from '@tarojs/taro'
import { getTips } from '@/services/dataService'
import type { Tip } from '@/types'
import './index.scss'

export default function KnowledgeDetail() {
  const router = useRouter()
  const { id: encodedId } = router.params
  const id = encodedId ? decodeURIComponent(encodedId) : ''
  const [tip, setTip] = useState<Tip | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    getTips()
      .then((data) => {
        if (isMounted) {
          setTip(data.tips.find((item) => item.id === id) || null)
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
  }, [id])

  // 使用预渲染的 HTML
  const htmlContent = tip?.htmlContent || ''

  if (isLoading || !tip) {
    return (
      <View className="knowledge-detail">
        <View className="empty">
          <Text>{isLoading ? '加载中...' : '文章不存在'}</Text>
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
