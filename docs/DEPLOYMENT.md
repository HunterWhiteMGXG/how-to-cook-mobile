# HowToCook Mobile App - 部署方案

> 小程序与App发布指南
> 创建日期：2025-11-02

---

## 📦 构建配置

### Taro 配置文件

#### config/index.js（通用配置）
```javascript
const config = {
  projectName: 'howtocook-app',
  date: '2025-11-2',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: [],
  defineConstants: {},
  copy: {
    patterns: [
      { from: 'src/assets/data/', to: 'dist/assets/data/' }
    ],
    options: {}
  },
  framework: 'react',
  compiler: 'webpack5',
  cache: {
    enable: false
  },
  mini: {
    postcss: {
      pxtransform: {
        enable: true,
        config: {}
      }
    }
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    postcss: {
      autoprefixer: {
        enable: true
      }
    }
  }
}

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'))
  }
  return merge({}, config, require('./prod'))
}
```

#### config/prod.js（生产环境）
```javascript
module.exports = {
  env: {
    NODE_ENV: '"production"'
  },
  defineConstants: {
    API_BASE_URL: '"https://api.howtocook.app"'
  },
  mini: {
    minified: true
  },
  h5: {
    publicPath: '/howtocook/'
  }
}
```

---

## 📱 微信小程序发布

### 1. 准备工作

#### 注册小程序账号
1. 访问 [微信公众平台](https://mp.weixin.qq.com/)
2. 选择"小程序" → "立即注册"
3. 填写主体信息
4. 完成认证（企业：¥300/年，个人：免费）

#### 获取 AppID
1. 登录小程序后台
2. "开发" → "开发管理" → "开发设置"
3. 复制 AppID

#### 配置 project.config.json
```json
{
  "miniprogramRoot": "dist/",
  "projectname": "HowToCook",
  "description": "程序员做饭指南",
  "appid": "你的AppID",
  "setting": {
    "es6": false,
    "enhance": true,
    "minified": true
  }
}
```

### 2. 本地开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev:weapp

# 打开微信开发者工具
# 导入项目 → 选择 dist 目录
```

### 3. 构建与上传

```bash
# 生产构建
npm run build:weapp

# 使用微信开发者工具上传
# 工具栏 → 上传 → 填写版本号和备注
```

### 4. 提交审核

1. 登录小程序后台
2. "管理" → "版本管理"
3. 选择开发版本 → "提交审核"
4. 填写审核信息：
   - **服务类目**：生活服务 > 美食
   - **标签**：做饭、菜谱、美食
   - **功能页面**：首页、菜谱详情、做菜模式
5. 等待审核（通常1-7天）

### 5. 发布上线

审核通过后：
1. "版本管理" → "审核版本"
2. 点击"发布"
3. 用户即可搜索到小程序

---

## 📱 支付宝小程序发布

### 1. 准备工作

```json
// mini.project.json
{
  "miniprogramRoot": "dist/",
  "appid": "你的AppID"
}
```

### 2. 构建与发布

```bash
# 构建
npm run build:alipay

# 使用支付宝开发者工具上传
```

流程类似微信小程序。

---

## 📱 App 发布

### iOS App 发布

#### 1. 准备工作

**Apple Developer 账号**
- 费用：$99/年（约¥688）
- 注册：[Apple Developer](https://developer.apple.com/)

**证书配置**
1. 生成 CSR 文件
2. 创建 App ID
3. 创建分发证书
4. 创建 Provisioning Profile

#### 2. 构建 iOS App

```bash
# 编译 RN 代码
npm run build:rn -- --platform ios

# 打开 Xcode 项目
cd ios
open HowToCook.xcworkspace

# Xcode 中：
# 1. 选择 Product → Archive
# 2. 等待构建完成
# 3. Distribute App → App Store Connect
# 4. 上传到 App Store Connect
```

#### 3. App Store Connect 配置

1. 登录 [App Store Connect](https://appstoreconnect.apple.com/)
2. "我的 App" → "+" → "新建 App"
3. 填写应用信息：
   - **名称**：HowToCook - 程序员做饭指南
   - **类别**：美食佳饮
   - **价格**：免费
4. 上传截图（必须）：
   - 6.5 英寸（iPhone 14 Pro Max）
   - 5.5 英寸（iPhone 8 Plus）
5. 填写描述与关键词
6. 提交审核

#### 4. 审核要点

- **隐私政策**：必须提供隐私政策URL
- **演示账号**：如需登录，提供测试账号
- **年龄分级**：选择 4+（无不当内容）

---

### Android App 发布

#### 1. 准备工作

**签名密钥**
```bash
# 生成密钥
keytool -genkey -v \
  -keystore howtocook.keystore \
  -alias howtocook \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

**配置 gradle**
```gradle
// android/app/build.gradle
signingConfigs {
    release {
        storeFile file('howtocook.keystore')
        storePassword 'your_password'
        keyAlias 'howtocook'
        keyPassword 'your_password'
    }
}
```

#### 2. 构建 APK

```bash
# 编译
npm run build:rn -- --platform android

# 打包
cd android
./gradlew assembleRelease

# 输出位置
# android/app/build/outputs/apk/release/app-release.apk
```

#### 3. 应用商店发布

**国内应用商店**
- 应用宝（腾讯）
- 华为应用市场
- 小米应用商店
- OPPO 软件商店
- vivo 应用商店

**发布流程**（以应用宝为例）
1. 注册开发者账号
2. "应用管理" → "提交应用"
3. 上传 APK
4. 填写应用信息
5. 提交审核（1-3天）

**Google Play**（海外）
1. [Google Play Console](https://play.google.com/console)
2. 创建应用
3. 上传 AAB 包（推荐）或 APK
4. 填写商店信息
5. 提交审核

---

## 🌐 H5 部署

### 1. 构建

```bash
npm run build:h5
```

### 2. 部署到服务器

#### 使用 Nginx

```nginx
server {
    listen 80;
    server_name howtocook.app;
    root /var/www/howtocook/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 使用 Vercel（推荐）

```json
// vercel.json
{
  "buildCommand": "npm run build:h5",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

```bash
# 部署
vercel --prod
```

---

## 🔄 CI/CD 自动化

### GitHub Actions

#### .github/workflows/deploy.yml

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-weapp:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Build for WeChat
        run: npm run build:weapp

      - name: Upload to WeChat
        uses: actions/upload-artifact@v3
        with:
          name: weapp-dist
          path: dist/

  deploy-h5:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build for H5
        run: npm run build:h5

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 📊 版本管理

### 版本号规范

遵循 [语义化版本](https://semver.org/lang/zh-CN/)：

```
主版本号.次版本号.修订号

1.0.0 - MVP 初始版本
1.1.0 - 新增购物清单功能
1.1.1 - 修复计时器bug
2.0.0 - 添加用户系统（破坏性更新）
```

### package.json

```json
{
  "version": "1.0.0",
  "scripts": {
    "version": "npm run build && git add -A",
    "postversion": "git push && git push --tags"
  }
}
```

---

## 🔍 审核注意事项

### 内容审核

**禁止内容：**
- ❌ 政治敏感内容
- ❌ 色情暴力内容
- ❌ 虚假宣传
- ❌ 侵犯知识产权

**必须提供：**
- ✅ 隐私政策
- ✅ 用户协议
- ✅ 内容安全机制

### 功能审核

**小程序特别注意：**
- 不得包含游戏、直播等未授权功能
- 不得诱导分享
- 不得虚拟支付（需资质）

### 图片审核

- 截图必须真实反映应用功能
- 不得包含其他平台二维码
- 不得使用误导性图片

---

## 📈 发布后运营

### 数据监控

**微信小程序**
- 小程序后台 → 数据分析
- 监控：访问量、用户留存、使用时长

**App Store**
- App Store Connect → 分析
- 监控：下载量、评分、崩溃率

### 版本迭代

```
发布节奏建议：
Week 1-2: 修复紧急bug（v1.0.1）
Month 1: 小功能优化（v1.1.0）
Month 3: 大版本更新（v2.0.0）
```

### 用户反馈

- 建立用户反馈渠道
- 及时响应bug报告
- 收集功能建议

---

## 🛠️ 常见问题

### 小程序审核被拒

**原因1：功能不完善**
- 解决：确保核心功能可用，移除"敬请期待"页面

**原因2：缺少隐私政策**
- 解决：添加隐私政策页面

**原因3：分类选择错误**
- 解决：重新选择正确的服务类目

### App 审核被拒

**iOS常见原因：**
- Guideline 2.1：应用崩溃
- Guideline 4.0：设计过于简陋
- Guideline 5.1：隐私政策缺失

**解决方案：**
- 充分测试，确保稳定性
- 完善UI设计
- 添加必要法律文档

---

## 📝 Checklist

### 发布前检查清单

- [ ] 功能测试完成
- [ ] 真机测试通过
- [ ] 隐私政策已添加
- [ ] 用户协议已添加
- [ ] 应用截图准备就绪
- [ ] 应用描述撰写完成
- [ ] 版本号更新
- [ ] Changelog 编写
- [ ] 备份源代码
- [ ] 生产环境配置检查

---

**最后更新：** 2025-11-02
**文档版本：** v1.0
