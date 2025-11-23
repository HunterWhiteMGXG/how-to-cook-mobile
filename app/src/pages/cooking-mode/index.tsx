import { View, Text } from '@tarojs/components'
import { useState, useMemo, useEffect, useRef } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { useRecipeStore } from '@/store'
import './index.scss'

export default function CookingMode() {
  const router = useRouter()
  const { id: encodedId } = router.params
  const id = encodedId ? decodeURIComponent(encodedId) : ''
  const { recipes, loadData } = useRecipeStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [showIngredients, setShowIngredients] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const touchStartX = useRef(0)

  // 确保数据已加载
  useEffect(() => {
    loadData()
  }, [loadData])

  // 获取当前菜谱
  const recipe = useMemo(() => {
    return recipes.find(r => r.id === id)
  }, [recipes, id])

  // 如果数据还在加载中，显示加载提示
  if (recipes.length === 0) {
    return (
      <View className="cooking-mode">
        <View style={{ padding: '40px 16px', textAlign: 'center' }}>
          <Text style={{ fontSize: '14px', color: '#757575' }}>加载中...</Text>
        </View>
      </View>
    )
  }

  // 如果找不到菜谱，显示不存在提示
  if (!recipe) {
    return (
      <View className="cooking-mode">
        <View style={{ padding: '40px 16px', textAlign: 'center' }}>
          <Text style={{ fontSize: '14px', color: '#757575' }}>菜谱不存在</Text>
        </View>
      </View>
    )
  }

  // 如果菜谱没有步骤，显示错误提示
  if (!recipe.steps || recipe.steps.length === 0) {
    return (
      <View className="cooking-mode">
        <View style={{ padding: '40px 16px', textAlign: 'center' }}>
          <Text style={{ fontSize: '14px', color: '#757575' }}>该菜谱暂无步骤</Text>
        </View>
      </View>
    )
  }

  const totalSteps = recipe.steps.length
  const step = recipe.steps[currentStep]
  const progress = ((currentStep + 1) / totalSteps) * 100

  // 上一步（带动画）
  const handlePrevStep = () => {
    if (currentStep > 0) {
      setSwipeDirection('right')
      setTimeout(() => {
        setCurrentStep(currentStep - 1)
        setSwipeDirection(null)
      }, 300)
    }
  }

  // 下一步（带动画）
  const handleNextStep = () => {
    if (currentStep < totalSteps - 1) {
      setSwipeDirection('left')
      setTimeout(() => {
        setCurrentStep(currentStep + 1)
        setSwipeDirection(null)
      }, 300)
    } else {
      // 完成烹饪 - 显示庆祝
      setSwipeDirection('left')
      setTimeout(() => {
        setShowCelebration(true)
      }, 300)
    }
  }

  // 触摸事件处理
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
    setIsDragging(true)
    setDragX(0)
  }

  const handleTouchMove = (e) => {
    if (!isDragging) return
    const currentX = e.touches[0].clientX
    const diff = currentX - touchStartX.current
    setDragX(diff)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    const threshold = 80 // 滑动阈值

    if (Math.abs(dragX) > threshold) {
      if (dragX < 0) {
        // 向左滑动 -> 下一步
        handleNextStep()
      } else {
        // 向右滑动 -> 上一步
        handlePrevStep()
      }
    }
    setDragX(0)
  }

  // 计算卡片变换
  const getCardStyle = () => {
    if (swipeDirection === 'left') {
      return {
        transform: 'translateX(-120%) rotate(-15deg)',
        opacity: 0,
        transition: 'all 0.3s ease-out'
      }
    }
    if (swipeDirection === 'right') {
      return {
        transform: 'translateX(120%) rotate(15deg)',
        opacity: 0,
        transition: 'all 0.3s ease-out'
      }
    }
    if (isDragging && dragX !== 0) {
      const rotation = dragX * 0.05
      return {
        transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
        transition: 'none'
      }
    }
    return {
      transform: 'translateX(0) rotate(0)',
      transition: 'all 0.3s ease-out'
    }
  }

  // 庆祝页面
  if (showCelebration) {
    return (
      <View className="cooking-mode celebration">
        <View className="confetti">
          {[...Array(20)].map((_, i) => (
            <View key={i} className={`confetti-piece confetti-${i % 5}`} />
          ))}
        </View>
        <View className="celebration-content">
          <Text className="celebration-emoji">🎉</Text>
          <Text className="celebration-title">恭喜完成！</Text>
          <Text className="celebration-subtitle">{recipe.name}</Text>
          <View className="celebration-btn" onClick={() => {
            Taro.navigateBack()
          }}>
            <Text>返回菜谱</Text>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View className="cooking-mode">
      {/* 顶部信息 */}
      <View className="header">
        <Text className="recipe-name">{recipe.name}</Text>
        <Text className="step-indicator">
          步骤 {currentStep + 1} / {totalSteps}
        </Text>
      </View>

      {/* 进度条 */}
      <View className="progress-bar">
        <View className="progress-fill" style={{ width: `${progress}%` }} />
      </View>

      {/* 卡片区域 */}
      <View className="card-container">
        {/* 下一张卡片预览（如果有） */}
        {currentStep < totalSteps - 1 && (
          <View className="card card-next">
            <View className="step-number">
              <Text>{currentStep + 2}</Text>
            </View>
            <Text className="step-text">{recipe.steps[currentStep + 1].content}</Text>
          </View>
        )}

        {/* 当前卡片 */}
        <View
          key={currentStep}
          className="card card-current"
          style={getCardStyle()}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <View className="step-number">
            <Text>{currentStep + 1}</Text>
          </View>
          <Text className="step-text">{step.content}</Text>

          {/* 滑动提示 */}
          {dragX < -30 && (
            <View className="swipe-hint swipe-next">
              <Text>下一步 →</Text>
            </View>
          )}
          {dragX > 30 && currentStep > 0 && (
            <View className="swipe-hint swipe-prev">
              <Text>← 上一步</Text>
            </View>
          )}
        </View>

        {/* 左右点击区域 */}
        <View
          className={`tap-zone tap-left ${currentStep === 0 ? 'disabled' : ''}`}
          onClick={handlePrevStep}
        >
          <Text>‹</Text>
        </View>
        <View
          className="tap-zone tap-right"
          onClick={handleNextStep}
        >
          <Text>{currentStep === totalSteps - 1 ? '✓' : '›'}</Text>
        </View>
      </View>

      {/* 底部提示 */}
      <View className="swipe-guide">
        <Text>← 滑动切换步骤 →</Text>
      </View>

      {/* 食材按钮 */}
      <View className="ingredients-btn" onClick={() => setShowIngredients(!showIngredients)}>
        <Text>🥘 查看食材</Text>
      </View>

      {/* 食材列表（弹出） */}
      {showIngredients && (
        <View className="ingredients-overlay" onClick={() => setShowIngredients(false)}>
          <View className="ingredients-panel" onClick={(e) => e.stopPropagation()}>
            <Text className="panel-title">食材清单</Text>
            <View className="ingredients-list">
              {recipe.ingredients.map((ingredient, index) => (
                <View key={index} className="ingredient-item">
                  <Text className="ingredient-name">
                    {ingredient.name}
                    {!ingredient.required && ' (可选)'}
                  </Text>
                  {ingredient.amount && (
                    <Text className="ingredient-amount">{ingredient.amount}</Text>
                  )}
                </View>
              ))}
            </View>
            <View className="close-btn" onClick={() => setShowIngredients(false)}>
              <Text>关闭</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
