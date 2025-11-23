# HowToCook Mobile App

> 基于 Taro 3 + React + TypeScript 的多端应用
> 程序员做饭指南移动端

---

## 📱 项目简介

这是一个基于 [HowToCook](https://github.com/Anduin2017/HowToCook) 开源菜谱项目的移动端应用，支持：
- 📱 微信小程序
- 📱 支付宝小程序
- 📱 H5
- 📱 React Native (iOS/Android)

### 核心功能

- ✅ 菜谱浏览（300+ 道菜谱）
- ✅ 分类筛选（素菜、荤菜、主食等）
- 🚧 卡片式做菜模式（开发中）
- 🚧 收藏功能（开发中）
- 🚧 购物清单（开发中）

---

## 🛠️ 技术栈

- **框架**: Taro 3.6+
- **UI**: React 18
- **语言**: TypeScript
- **状态管理**: Zustand
- **样式**: Sass

---

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 运行开发环境

#### 微信小程序
```bash
npm run dev:weapp
```
然后使用微信开发者工具打开 `dist` 目录

#### H5
```bash
npm run dev:h5
```
浏览器访问 http://localhost:10086

#### 支付宝小程序
```bash
npm run dev:alipay
```

#### React Native
```bash
npm run dev:rn
```

### 3. 构建生产版本

```bash
# 微信小程序
npm run build:weapp

# H5
npm run build:h5

# 支付宝小程序
npm run build:alipay

# React Native
npm run build:rn
```

---

## 📁 项目结构

```
app/
├── config/                 # Taro 配置
│   ├── index.ts           # 通用配置
│   ├── dev.ts             # 开发环境
│   └── prod.ts            # 生产环境
├── src/
│   ├── pages/             # 页面
│   │   ├── index/        # 首页
│   │   ├── recipe-list/  # 菜谱列表
│   │   ├── recipe-detail/# 菜谱详情
│   │   ├── cooking-mode/ # 卡片式做菜
│   │   ├── shopping-list/# 购物清单
│   │   └── profile/      # 个人中心
│   ├── components/        # 组件
│   ├── store/             # Zustand 状态管理
│   │   ├── recipe.ts     # 菜谱状态
│   │   ├── user.ts       # 用户状态
│   │   └── cooking.ts    # 做菜状态
│   ├── services/          # 业务服务
│   │   ├── recipe.ts     # 菜谱服务
│   │   └── storage.ts    # 存储服务
│   ├── utils/             # 工具函数
│   ├── types/             # TypeScript 类型
│   ├── constants/         # 常量
│   ├── assets/            # 静态资源
│   │   └── data/         # JSON 数据
│   ├── app.tsx            # 应用入口
│   ├── app.config.ts      # 应用配置
│   └── app.scss           # 全局样式
├── package.json
└── tsconfig.json
```

---

## 📊 数据说明

### 数据来源

菜谱数据来自 `../dishes/` 目录中的 Markdown 文件，通过 `../scripts/parse-markdown.js` 脚本转换为 JSON 格式。

### 数据文件

- `src/assets/data/recipes.json` - 所有菜谱数据
- `src/assets/data/categories.json` - 分类数据

### 更新数据

如果菜谱 Markdown 有更新，运行：

```bash
cd ../scripts
npm install
node parse-markdown.js
```

这会重新生成 `src/assets/data/*.json` 文件。

---

## 🎯 开发进度

### ✅ 已完成

- [x] 项目基础架构
- [x] 首页（分类展示）
- [x] 数据加载服务
- [x] 状态管理（Zustand）
- [x] 类型定义

### 🚧 进行中

- [ ] 菜谱列表页
- [ ] 菜谱详情页
- [ ] 卡片式做菜模式
- [ ] 收藏功能
- [ ] 购物清单

### 📅 计划中

- [ ] 搜索功能
- [ ] 计时器
- [ ] 用户系统
- [ ] 社区功能

---

## 📖 开发文档

详细的开发文档请查看 `../docs/` 目录：

- [项目总规划](../docs/PROJECT_PLAN.md)
- [技术架构](../docs/ARCHITECTURE.md)
- [开发排期](../docs/DEVELOPMENT_SCHEDULE.md)
- [UI/UX 设计](../docs/UI_UX_DESIGN.md)
- [数据库设计](../docs/DATABASE_DESIGN.md)
- [API 设计](../docs/API_DESIGN.md)
- [代码示例](../docs/CODE_EXAMPLES.md)
- [部署方案](../docs/DEPLOYMENT.md)

---

## 🤝 贡献指南

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

---

## 📄 许可证

本项目采用 [Unlicense](../LICENSE) 许可证，完全开源免费。

---

## 🙏 致谢

- [HowToCook](https://github.com/Anduin2017/HowToCook) - 提供优质菜谱数据
- [Taro](https://taro.zone/) - 多端开发框架
- [Zustand](https://github.com/pmndrs/zustand) - 状态管理

---

**开发日期：** 2025-11-02
**版本：** v1.0.0 (MVP)
