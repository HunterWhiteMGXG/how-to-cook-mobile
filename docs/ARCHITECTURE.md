# 当前架构

## 应用

应用位于 `app/`，使用 Taro 3.6、React 18、TypeScript、Zustand 和 SCSS。当前持续验证的目标是微信小程序，构建产物位于 `app/dist/`。

页面链路：

```text
首页
├── 菜谱分类 / 全部 / 收藏
│   └── 菜谱列表
│       └── 菜谱详情
│           └── 烹饪模式
└── 理论
    └── 知识列表
        └── 知识详情
```

个人中心和购物清单已经注册页面，但尚未接入正式功能。

## 数据边界

`src/services/dataService.ts` 是菜谱、分类和知识文章的唯一远端数据入口：

1. 请求远端 `version.json`。
2. 对比每项缓存携带的版本。
3. 缓存有效时直接使用 Taro Storage。
4. 版本变化或没有缓存时请求对应 JSON。
5. 请求失败时回退到已有缓存。

同一种数据的并发请求会合并。远端响应和缓存至少经过顶层结构校验，避免非 JSON 或损坏数据直接进入页面。

## 状态与存储

- `useRecipeStore`：菜谱、分类、加载状态和收藏，是当前页面实际使用的主 Store。
- `useCookingStore`：烹饪会话与计时器骨架，尚未接入烹饪页面。
- `useUserStore`：用户设置与购物清单骨架，尚未接入页面。

Zustand 持久化统一通过 Taro Storage 适配器，不直接使用浏览器 `localStorage`。收藏只由 `useRecipeStore` 管理，并兼容早期 JSON 字符串格式。

## 工程检查

`app/package.json` 提供四个主要检查命令：

- `npm run typecheck`
- `npm run lint`
- `npm run build:weapp`
- `npm run check`（依次执行以上三项）
