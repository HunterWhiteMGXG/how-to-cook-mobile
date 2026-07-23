import { View, Text } from "@tarojs/components";
import { useEffect, useState } from "react";
import Taro from "@tarojs/taro";
import { useRecipeStore } from "@/store/recipe";
import { getTips } from "@/services/dataService";
import { ROUTES } from "@/constants";
import "./index.scss";

export default function Index() {
  const { recipes, categories, favorites, loadData } =
    useRecipeStore();
  const [tipsCount, setTipsCount] = useState(0);

  useEffect(() => {
    // 加载菜谱和分类数据
    loadData();

    // 加载 tips 数据获取数量
    getTips().then(data => {
      if (data && data.tips) {
        setTipsCount(data.tips.length);
      }
    });
  }, [loadData]);

  // 点击分类 - 跳转到菜谱列表页
  const handleCategoryClick = (categoryId: string) => {
    Taro.navigateTo({
      url: `${ROUTES.RECIPE_LIST}?category=${categoryId}`,
    });
  };

  // 点击知识 - 跳转到知识列表页
  const handleKnowledgeClick = () => {
    Taro.navigateTo({
      url: ROUTES.KNOWLEDGE_LIST,
    });
  };

  return (
    <View className="index">
      <View className="header">
        <Text className="title">HowToCook</Text>
      </View>

      <View className="categories">
        <Text className="section-title">菜谱分类</Text>
        <View className="category-grid">
          {categories.map((category) => (
            <View
              key={category.id}
              className="category-item"
              onClick={() => handleCategoryClick(category.id)}
            >
              <Text className="category-icon">{category.icon}</Text>
              <Text className="category-name">{category.nameCN}</Text>
              <Text className="category-count">
                {category.recipeCount} 道菜
              </Text>
            </View>
          ))}
          <View
            className="category-item"
            onClick={() => handleCategoryClick("all")}
          >
            <Text className="category-icon">🍽️</Text>
            <Text className="category-name">全部</Text>
            <Text className="category-count">{recipes.length} 道菜</Text>
          </View>
          <View
            className="category-item"
            onClick={() => handleCategoryClick("favorites")}
          >
            <Text className="category-icon">⭐</Text>
            <Text className="category-name">收藏</Text>
            <Text className="category-count">{favorites.length} 道菜</Text>
          </View>
          <View className="category-item" onClick={handleKnowledgeClick}>
            <Text className="category-icon">📚</Text>
            <Text className="category-name">理论</Text>
            <Text className="category-count">{tipsCount} 篇</Text>
          </View>
        </View>
      </View>

      <View className="stats">
        <View className="stat-item">
          <Text className="stat-value">{recipes.length}</Text>
          <Text className="stat-label">总菜谱</Text>
        </View>
        <View className="stat-item">
          <Text className="stat-value">{categories.length}</Text>
          <Text className="stat-label">分类</Text>
        </View>
      </View>
    </View>
  );
}
