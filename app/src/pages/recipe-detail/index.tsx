import { View, Text, Image } from '@tarojs/components'
import { useState, useMemo, useEffect } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { useRecipeStore } from '@/store/recipe'
import { ROUTES } from '@/constants'
import './index.scss'

export default function RecipeDetail() {
  const router = useRouter()
  const { id: encodedId } = router.params
  const id = encodedId ? decodeURIComponent(encodedId) : ''
  const {
    recipes,
    favorites,
    isDataLoaded,
    toggleFavorite,
    loadData,
  } = useRecipeStore()

  // 确保数据已加载
  useEffect(() => {
    loadData()
  }, [loadData])

  // 获取当前菜谱
  const recipe = useMemo(() => {
    return recipes.find(r => r.id === id)
  }, [recipes, id])

  // 检查是否已收藏
  const isFavorite = favorites.includes(id)

  // 食材勾选状态
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set())

  const toggleIngredient = (index: number) => {
    setCheckedIngredients(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  // 开始烹饪
  const handleStartCooking = () => {
    Taro.navigateTo({
      url: `${ROUTES.COOKING_MODE}?id=${encodeURIComponent(id)}`
    })
  }

  // 如果数据还在加载中，显示加载提示
  if (!isDataLoaded) {
    return (
      <View className="recipe-detail">
        <View style={{ padding: '40px 16px', textAlign: 'center' }}>
          <Text style={{ fontSize: '14px', color: '#757575' }}>加载中...</Text>
        </View>
      </View>
    )
  }

  // 如果找不到菜谱，显示不存在提示
  if (!recipe) {
    return (
      <View className="recipe-detail">
        <View style={{ padding: '40px 16px', textAlign: 'center' }}>
          <Text style={{ fontSize: '14px', color: '#757575' }}>菜谱不存在</Text>
        </View>
      </View>
    )
  }

  return (
    <View className="recipe-detail">
      {/* 封面图 */}
      {recipe.coverImage && (
        <View className="cover-image-container">
          <Image
            src={recipe.coverImage}
            mode="aspectFill"
            className="cover-image"
          />
        </View>
      )}

      {/* Hero 区域 */}
      <View className="hero">
        <Text className="recipe-name">{recipe.name}</Text>
        {recipe.introduction && (
          <Text className="recipe-intro">{recipe.introduction}</Text>
        )}
      </View>

      {/* 信息栏 */}
      <View className="info-bar">
        <View className="info-item">
          <Text className="info-label">难度</Text>
          <Text className="info-value">{'★'.repeat(recipe.difficulty)}</Text>
        </View>
        <View
          className={`info-item favorite-btn ${isFavorite ? 'active' : ''}`}
          onClick={() => toggleFavorite(id)}
        >
          <Text className="info-label">收藏</Text>
          <Text className="info-value">{isFavorite ? '⭐' : '☆'}</Text>
        </View>
      </View>

      {/* 内容区域 */}
      <View className="content">
        {/* 分量计算 */}
        {recipe.calculation && (
          <View className="section">
            <Text className="section-title">📊 分量计算</Text>
            <View className="calculation-box">
              <Text className="calculation-text">{recipe.calculation.trim()}</Text>
            </View>
          </View>
        )}

        {/* 食材列表 */}
        <View className="section">
          <Text className="section-title">🥘 食材</Text>
          <View className="ingredients-list">
            {recipe.ingredients.map((ingredient, index) => (
              <View
                key={index}
                className={`ingredient-item ${checkedIngredients.has(index) ? 'checked' : ''}`}
                onClick={() => toggleIngredient(index)}
              >
                <View className="ingredient-checkbox">
                  {checkedIngredients.has(index) ? '✓' : ''}
                </View>
                <Text className={`ingredient-name ${!ingredient.required ? 'optional' : ''}`}>
                  {ingredient.name}
                  {!ingredient.required && ' (可选)'}
                </Text>
                {ingredient.amount && (
                  <Text className="ingredient-amount">{ingredient.amount}</Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* 步骤列表 */}
        <View className="section">
          <Text className="section-title">👨‍🍳 步骤</Text>
          <View className="steps-list">
            {recipe.steps.map((step, index) => (
              <View key={index} className="step-item">
                <Text className="step-number">{index + 1}</Text>
                <Text className="step-text">{step.content}</Text>
                {step.image && (
                  <Image
                    src={step.image}
                    mode="widthFix"
                    className="step-image"
                  />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* 附加内容/小贴士 */}
        {recipe.tips && recipe.tips.length > 0 && (
          <View className="section">
            <Text className="section-title">💡 小贴士</Text>
            <View className="tips-box">
              <Text className="tips-text">{recipe.tips.trim()}</Text>
            </View>
          </View>
        )}

        {/* 图片展示 */}
        {recipe.images && recipe.images.length > 0 && (
          <View className="section">
            <Text className="section-title">📷 图片</Text>
            <View className="images-grid">
              {recipe.images.map((image, index) => (
                <Image
                  key={index}
                  src={image}
                  mode="widthFix"
                  className="recipe-image"
                />
              ))}
            </View>
          </View>
        )}
      </View>

      {/* 底部操作按钮 */}
      <View className="actions">
        <View className="action-btn primary" onClick={handleStartCooking}>
          <Text>开始烹饪</Text>
        </View>
      </View>

      {/* 底部占位，避免被固定按钮遮挡 */}
      <View style={{ height: '70px' }} />
    </View>
  )
}
