import { View, Text } from "@tarojs/components";
import { useEffect, useMemo } from "react";
import Taro from "@tarojs/taro";
import { useRecipeStore } from "@/store";
import "./index.scss";

// 内置版本信息
const versionData = require("@/assets/data/version.json");

export default function Index() {
  const { recipes, categories, favorites, isLoading, loadData } =
    useRecipeStore();

  // 格式化更新时间
  const updateTime = useMemo(() => {
    if (versionData.updatedAt) {
      const date = new Date(versionData.updatedAt);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(date.getDate()).padStart(2, "0")}`;
    }
    return "";
  }, []);

  useEffect(() => {
    // 加载菜谱和分类数据
    loadData();
  }, [loadData]);

  // 点击分类 - 跳转到菜谱列表页
  const handleCategoryClick = (categoryId: string) => {
    Taro.navigateTo({
      url: `/pages/recipe-list/index?category=${categoryId}`,
    });
  };

  // 点击知识 - 跳转到知识列表页
  const handleKnowledgeClick = () => {
    Taro.navigateTo({
      url: "/pages/knowledge-list/index",
    });
  };

  return (
    <View className="index">
      <View className="header">
        <Text className="title">HowToCook</Text>
        {updateTime && (
          <Text className="update-time">最近更新：{updateTime}</Text>
        )}
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
            <Text className="category-count">18 篇</Text>
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
