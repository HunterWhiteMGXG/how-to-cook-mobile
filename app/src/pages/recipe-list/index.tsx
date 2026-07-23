import { View, Text, Input, Image } from '@tarojs/components'
import { useState, useMemo, useEffect } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { useRecipeStore } from '@/store/recipe'
import { ROUTES } from '@/constants'
import './index.scss'

export default function RecipeList() {
  const router = useRouter()
  const { category = 'all' } = router.params
  const {
    recipes,
    categories,
    favorites,
    isDataLoaded,
    loadData,
  } = useRecipeStore()
  const [searchText, setSearchText] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | null>(null)
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())

  // 处理图片加载完成
  const handleImageLoad = (recipeId: string) => {
    setLoadedImages(prev => new Set(prev).add(recipeId))
  }

  // 确保数据已加载
  useEffect(() => {
    loadData()
  }, [loadData])

  // 获取当前分类信息
  const currentCategory = useMemo(() => {
    if (category === 'all') {
      return { id: 'all', nameCN: '全部', icon: '🍽️' }
    }
    if (category === 'favorites') {
      return { id: 'favorites', nameCN: '收藏', icon: '⭐' }
    }
    return categories.find(cat => cat.id === category)
  }, [categories, category])

  // 过滤菜谱：按分类、搜索文本和难度
  const filteredRecipes = useMemo(() => {
    let filtered = recipes

    // 按分类过滤
    if (category === 'favorites') {
      filtered = filtered.filter(recipe => favorites.includes(recipe.id))
    } else if (category && category !== 'all') {
      filtered = filtered.filter(recipe => recipe.category === category)
    }

    // 按搜索文本过滤
    if (searchText) {
      filtered = filtered.filter(recipe =>
        recipe.name.toLowerCase().includes(searchText.toLowerCase())
      )
    }

    // 按难度过滤
    if (selectedDifficulty !== null) {
      filtered = filtered.filter(recipe => recipe.difficulty === selectedDifficulty)
    }

    return filtered
  }, [recipes, category, searchText, selectedDifficulty, favorites])

  // 导航到菜谱详情
  const handleRecipeClick = (recipeId: string) => {
    Taro.navigateTo({
      url: `${ROUTES.RECIPE_DETAIL}?id=${encodeURIComponent(recipeId)}`
    })
  }

  // 获取难度星级
  const getDifficultyStars = (difficulty: number) => {
    return '★'.repeat(difficulty)
  }

  return (
    <View className="recipe-list">
      {currentCategory && (
        <View className="header">
          <View className="category-info">
            <Text className="category-icon">{currentCategory.icon}</Text>
            <Text className="category-name">{currentCategory.nameCN}</Text>
          </View>
          <Text className="recipe-count">{filteredRecipes.length} 道菜谱</Text>
        </View>
      )}

      <View className="search-bar">
        <Input
          className="search-input"
          placeholder="搜索菜谱..."
          value={searchText}
          onInput={(e) => setSearchText(e.detail.value)}
        />
      </View>

      <View className="difficulty-filter">
        <Text className="filter-label">难度：</Text>
        <View className="filter-options">
          <View
            className={`filter-option ${selectedDifficulty === null ? 'active' : ''}`}
            onClick={() => setSelectedDifficulty(null)}
          >
            <Text>全部</Text>
          </View>
          {[1, 2, 3, 4, 5].map((level) => (
            <View
              key={level}
              className={`filter-option ${selectedDifficulty === level ? 'active' : ''}`}
              onClick={() => setSelectedDifficulty(level)}
            >
              <Text>{'★'.repeat(level)}</Text>
            </View>
          ))}
        </View>
      </View>

      {!isDataLoaded ? (
        <View className="empty">
          <Text>加载中...</Text>
        </View>
      ) : filteredRecipes.length > 0 ? (
        <View className="recipe-grid">
          {filteredRecipes.map((recipe) => (
            <View
              key={recipe.id}
              className="recipe-card"
              onClick={() => handleRecipeClick(recipe.id)}
            >
              <View className={`recipe-image ${(recipe.coverImage || recipe.images?.length) ? (loadedImages.has(recipe.id) ? 'loaded' : 'loading') : 'no-image'}`}>
                {recipe.coverImage || (recipe.images && recipe.images.length > 0) ? (
                  <Image
                    src={recipe.coverImage || recipe.images[0]}
                    mode="aspectFill"
                    className={`recipe-image-img ${loadedImages.has(recipe.id) ? 'loaded' : ''}`}
                    lazyLoad
                    onLoad={() => handleImageLoad(recipe.id)}
                  />
                ) : (
                  <Text className="recipe-image-icon">{currentCategory?.icon || '🍳'}</Text>
                )}
              </View>
              <View className="recipe-info">
                <Text className="recipe-name">{recipe.name}</Text>
                <View className="recipe-meta">
                  <View className="meta-item">
                    <Text className="difficulty-stars">{getDifficultyStars(recipe.difficulty)}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View className="empty">
          <Text>暂无菜谱</Text>
        </View>
      )}
    </View>
  )
}
