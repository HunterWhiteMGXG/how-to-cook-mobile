# HowToCook Mobile App - 规划文档

> 基于 HowToCook 开源菜谱的移动端应用完整规划
> 创建日期：2025-11-02

---

## 📚 文档导航

### 1. [项目总规划](./PROJECT_PLAN.md) ⭐

**项目的总纲领性文档**，包含：
- 项目背景与目标
- 功能规划（MVP + 后期扩展）
- 技术选型理由
- 里程碑与交付物
- 成本预估

**适合阅读对象：** 所有人

---

### 2. [技术架构设计](./ARCHITECTURE.md) 🏗️

**系统架构的详细设计**，包含：
- 整体架构图
- Taro 3 + React + TypeScript 技术栈
- 项目目录结构
- 核心模块设计（状态管理、路由、组件）
- 性能优化策略

**适合阅读对象：** 开发者、架构师

---

### 3. [开发排期](./DEVELOPMENT_SCHEDULE.md) 📅

**8周详细开发计划**，包含：
- Phase 1: 环境搭建与数据准备（Week 1-2）
- Phase 2: 核心页面开发（Week 3-4）
- Phase 3: 卡片式做菜模式（Week 5-6）
- Phase 4: 辅助功能与优化（Week 7）
- Phase 5: 测试与发布（Week 8）

**适合阅读对象：** 项目经理、开发者

---

### 4. [数据库设计](./DATABASE_DESIGN.md) 💾

**本地数据库设计方案**，包含：
- IndexedDB 设计（H5/App）
- Storage API 设计（小程序）
- 数据结构定义（Recipe、Category、UserData等）
- 数据访问层封装
- 性能优化策略

**适合阅读对象：** 开发者

---

### 5. [UI/UX 设计](./UI_UX_DESIGN.md) 🎨

**用户界面与交互设计**，包含：
- 设计理念与原则
- 页面流程图
- 详细的页面布局设计
- **卡片式做菜模式设计**（核心创新）
- 视觉设计规范（配色、字体、组件）
- 交互动画设计

**适合阅读对象：** UI/UX 设计师、开发者

---

### 6. [API 设计](./API_DESIGN.md) 🔌

**数据接口设计文档**，包含：
- 本地 API 设计（MVP 阶段）
  - Recipe Service
  - Category Service
  - Favorite Service
  - Shopping List Service
  - Cooking Service
  - Timer Service
- RESTful API 设计（V2.0 阶段）
- 错误处理规范

**适合阅读对象：** 开发者

---

### 7. [代码示例](./CODE_EXAMPLES.md) 💻

**核心功能代码实现参考**，包含：
- Markdown 解析脚本完整代码
- StepCard 组件（卡片式做菜）
- Recipe Service 实现
- Zustand Store 示例
- 自定义 Hooks
- 工具函数

**适合阅读对象：** 开发者

---

### 8. [部署方案](./DEPLOYMENT.md) 🚀

**应用发布与部署指南**，包含：
- 构建配置
- 微信小程序发布流程
- iOS App 发布流程
- Android App 发布流程
- H5 部署方案
- CI/CD 自动化
- 审核注意事项

**适合阅读对象：** 开发者、运维人员

---

## 🎯 快速开始

### 如果你是项目经理
👉 先读：[项目总规划](./PROJECT_PLAN.md) → [开发排期](./DEVELOPMENT_SCHEDULE.md)

### 如果你是开发者
👉 先读：[技术架构设计](./ARCHITECTURE.md) → [代码示例](./CODE_EXAMPLES.md) → [开发排期](./DEVELOPMENT_SCHEDULE.md)

### 如果你是 UI/UX 设计师
👉 先读：[UI/UX 设计](./UI_UX_DESIGN.md) → [项目总规划](./PROJECT_PLAN.md)

### 如果你想直接开始编码
👉 先读：[代码示例](./CODE_EXAMPLES.md) → [数据库设计](./DATABASE_DESIGN.md) → [API 设计](./API_DESIGN.md)

---

## 📊 项目概览

### 核心信息

| 项目 | 信息 |
|------|------|
| **项目名称** | HowToCook Mobile App |
| **技术栈** | Taro 3 + React + TypeScript |
| **目标平台** | 微信小程序 + App (iOS/Android) |
| **开发周期** | 6-8 周（MVP） |
| **开发方式** | AI-Assisted Development |
| **数据方案** | 纯本地（MVP），云端+本地（V2.0） |

### 核心创新

**卡片式做菜模式** - 将做菜步骤以卡片形式呈现，左右滑动查看每一步，特别适合厨房场景：
- 全屏沉浸式体验
- 手势交互流畅
- 防息屏保持
- 计时器集成
- 语音播报（可选）

### 功能清单

#### MVP 核心功能（Week 1-7）
- ✅ 菜谱浏览（首页、列表、详情）
- ✅ 搜索与筛选
- ✅ **卡片式做菜模式**（核心）
- ✅ 收藏功能
- ✅ 购物清单
- ✅ 计时器

#### V2.0 扩展功能（Month 3-6）
- 🎯 用户系统（登录注册）
- 🎯 社区互动（评论、晒图）
- 🎯 智能推荐
- 🎯 营养统计

---

## 🛠️ 技术亮点

### 1. 多端统一开发
- 一套代码，同时生成小程序和 App
- Taro 编译优化，性能接近原生

### 2. 数据离线可用
- 所有菜谱数据内置
- IndexedDB 本地存储
- 无需网络即可使用

### 3. AI 辅助开发
- 使用 AI 生成组件代码
- 快速迭代和调试
- 提高开发效率

### 4. 卡片式交互创新
- 创新的做菜交互体验
- 手势流畅，操作简单
- 厨房友好设计

---

## 📁 项目结构

```
HowToCook/
├── docs/                           # 📚 规划文档（当前目录）
│   ├── README.md                  # 文档索引
│   ├── PROJECT_PLAN.md            # 项目总规划
│   ├── ARCHITECTURE.md            # 技术架构
│   ├── DEVELOPMENT_SCHEDULE.md    # 开发排期
│   ├── DATABASE_DESIGN.md         # 数据库设计
│   ├── UI_UX_DESIGN.md           # UI/UX 设计
│   ├── API_DESIGN.md             # API 设计
│   ├── CODE_EXAMPLES.md          # 代码示例
│   └── DEPLOYMENT.md             # 部署方案
├── scripts/                       # 🔧 脚本工具
│   └── parse-markdown.js         # Markdown 解析脚本
├── dishes/                        # 📖 原始菜谱数据（Markdown）
└── app/                          # 📱 Taro 应用（待创建）
```

---

## 🚀 下一步行动

### Phase 1: 立即可做
1. **安装开发环境**
   ```bash
   npm install -g @tarojs/cli
   ```

2. **运行数据解析脚本**
   ```bash
   cd scripts
   npm install glob
   node parse-markdown.js
   ```

3. **创建 Taro 项目**
   ```bash
   taro init howtocook-app
   # 选择：React + TypeScript
   ```

### Phase 2: 本周目标
- 完成开发环境搭建
- 生成 JSON 菜谱数据
- 创建首页框架

### Phase 3: 本月目标
- 完成核心页面开发
- 实现卡片式做菜模式
- 完成 MVP 功能

---

## 💡 使用建议

### 对于 AI 辅助开发
这些文档非常适合作为 AI（如 Claude、GPT-4）的上下文：

```
提示词示例：

"我正在开发 HowToCook Mobile App，请根据 docs/ARCHITECTURE.md
中的设计，帮我实现 StepCard 组件。"

"请参考 docs/API_DESIGN.md，帮我实现 Recipe Service 的
searchRecipes 方法。"
```

### 对于团队协作
- 每个文档独立，可单独分享
- Markdown 格式，易于版本控制
- 清晰的章节结构，便于快速查找

---

## 📝 文档版本

| 文档 | 版本 | 更新日期 |
|------|------|---------|
| 所有文档 | v1.0 | 2025-11-02 |

---

## 🤝 贡献指南

如果在开发过程中发现文档需要更新：

1. **更新对应的文档**
2. **同步更新版本号**
3. **在文档底部注明更新内容**

---

## 📮 反馈与支持

- **项目问题**：参考具体文档中的解决方案
- **文档问题**：提出改进建议
- **技术支持**：使用 AI 辅助解答

---

## 🎉 开始你的开发之旅

所有规划都已就绪，现在是时候开始实现这个项目了！

**记住：**
- 📖 遇到问题先查阅对应文档
- 💻 参考代码示例快速实现
- 🤖 善用 AI 辅助开发
- ⏰ 按照开发排期稳步推进

祝开发顺利！🚀

---

**创建日期：** 2025-11-02
**文档数量：** 8 个核心文档
**总字数：** 约 50,000+ 字
**代码示例：** 20+ 个
