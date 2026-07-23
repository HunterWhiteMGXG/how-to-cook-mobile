# 爱学做菜

爱学做菜是一款基于 [HowToCook](https://github.com/Anduin2017/HowToCook) 内容制作的微信小程序。项目使用 Taro、React 和 TypeScript 开发，当前以微信小程序端为主要交付目标。

## 已实现

- 菜谱分类、搜索和难度筛选
- 菜谱详情、食材勾选和本地收藏
- 卡片式烹饪步骤与完成反馈
- 理论知识库及富文本文章
- 远端数据版本检查和本地缓存

个人中心和购物清单目前为占位页面。

## 开发

要求 Node.js 22。

```bash
cd app
npm ci
npm run dev:weapp
```

开发模式会持续编译到 `app/dist/`。使用微信开发者工具导入 `app/` 目录，项目配置会将小程序目录指向该输出目录。

常用命令：

```bash
npm run typecheck
npm run lint
npm run build:weapp
npm run check
```

## 项目结构

```text
app/                  Taro 应用
  src/pages/          小程序页面
  src/services/       远端数据和本地存储
  src/store/          Zustand 状态
  src/types/          业务类型
scripts/              HowToCook Markdown 数据转换
docs/                 当前架构说明和历史规划归档
.github/workflows/    应用 CI 与数据同步
```

## 数据

运行时从 `https://howtocook.hunter-white.com` 获取菜谱、分类、知识文章和版本信息，并使用 Taro Storage 缓存。首次安装没有本地菜谱兜底，因此需要网络；微信小程序后台也需要将该域名配置为合法的 request/download 域名。

定时工作流会检测 HowToCook 上游变化，解析 Markdown、生成 JSON，并上传至 Cloudflare R2。详细流程见 [数据管线](docs/DATA_PIPELINE.md)。

## 文档

- [当前架构](docs/ARCHITECTURE.md)
- [数据管线](docs/DATA_PIPELINE.md)
- [历史规划归档](docs/archive/2025-initial-plan/README.md)

历史规划仅用于追溯，不代表当前实现。
