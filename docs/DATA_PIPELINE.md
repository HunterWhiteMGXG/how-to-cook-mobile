# 数据管线

菜谱和知识内容来自 [Anduin2017/HowToCook](https://github.com/Anduin2017/HowToCook)，不随小程序代码打包。

## 自动同步

`.github/workflows/update-data.yml` 每天检查一次上游 HEAD：

1. 从已发布的 `version.json` 读取 `upstreamCommit`。
2. 上游变化时克隆 `dishes/` 和 `tips/`。
3. 运行 `scripts/` 中的数据构建命令。
4. 校验所有生成的 JSON。
5. 收集菜谱图片。
6. 将 JSON 和图片上传至 Cloudflare R2。

同步状态保存在远端版本文件中，不再通过自动提交状态文件污染应用代码历史。

## 本地生成

数据生成需要临时存在的上游 `dishes/` 和 `tips/` 目录：

```bash
cd scripts
npm ci
npm run build:data
```

输出位于 `app/src/assets/data/`，该目录用于工作流上传，不是应用的运行时内置数据。

## 脚本

- `parse-markdown.js`：生成 `recipes.json` 和 `categories.json`
- `parse-tips.js`：生成 `tips.json`
- `render-tips-html.js`：为知识文章生成小程序可渲染的 HTML
