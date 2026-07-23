#!/usr/bin/env node

/**
 * HowToCook Markdown 解析脚本
 * 将所有菜谱 Markdown 文件转换为标准化的 JSON 数据
 */

const fs = require('fs');
const path = require('path');
const { globSync } = require('glob');

// 配置
const CONFIG = {
  dishesDir: path.join(__dirname, '..', 'dishes'),
  outputDir: path.join(__dirname, '..', 'app', 'src', 'assets', 'data'),
  outputFile: 'recipes.json',
  categoriesFile: 'categories.json',
  // 图片CDN配置（使用 Cloudflare R2）
  cdnBaseUrl: 'https://howtocook.hunter-white.com/images/',
};

// 分类映射
const CATEGORIES = {
  vegetable_dish: { nameCN: '素菜', icon: '🥬', color: '#4CAF50' },
  meat_dish: { nameCN: '荤菜', icon: '🍖', color: '#FF5722' },
  aquatic: { nameCN: '水产', icon: '🐟', color: '#2196F3' },
  breakfast: { nameCN: '早餐', icon: '🍳', color: '#FF9800' },
  staple: { nameCN: '主食', icon: '🍚', color: '#FFC107' },
  'semi-finished': { nameCN: '半成品加工', icon: '📦', color: '#9E9E9E' },
  soup: { nameCN: '汤与粥', icon: '🍲', color: '#795548' },
  drink: { nameCN: '饮料', icon: '🍹', color: '#E91E63' },
  condiment: { nameCN: '酱料', icon: '🧂', color: '#607D8B' },
  dessert: { nameCN: '甜品', icon: '🍰', color: '#9C27B0' },
};

/**
 * 从文件路径生成唯一ID
 */
function generateId(filePath) {
  const relative = path.relative(CONFIG.dishesDir, filePath);
  const parts = relative.split(path.sep);

  // 移除文件扩展名
  const filename = path.basename(parts[parts.length - 1], '.md');
  const category = parts[0];

  // 生成 ID: category-filename
  const id = `${category}-${filename}`
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return id;
}

/**
 * 从文件路径获取分类
 */
function getCategoryFromPath(filePath) {
  const relative = path.relative(CONFIG.dishesDir, filePath);
  const category = relative.split(path.sep)[0];
  return category;
}

/**
 * 提取难度星级
 */
function extractDifficulty(content) {
  const match = content.match(/预估烹饪难度[：:]\s*(★+)/);
  if (match) {
    return match[1].length;
  }
  return 0;
}

/**
 * 提取计算章节内容（去除markdown标记，保留纯文本内容）
 */
function extractCalculation(lines, startIndex) {
  const calculation = [];
  let inSection = false;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    if (trimmedLine === '## 计算') {
      inSection = true;
      continue;
    }

    if (inSection) {
      // 遇到下一个章节标题时停止
      if (trimmedLine.match(/^##\s/) && !trimmedLine.startsWith('###')) {
        break;
      }

      // 去除markdown格式标记，保留内容
      let content = line;

      // 去除列表标记 (-, *, +)
      if (trimmedLine.match(/^[-*+]\s/)) {
        content = trimmedLine.replace(/^[-*+]\s+/, '');
      }
      // 去除有序列表标记 (1. 2. 3.)
      else if (trimmedLine.match(/^\d+\.\s/)) {
        content = trimmedLine.replace(/^\d+\.\s+/, '');
      }
      // 去除标题标记 (###)
      else if (trimmedLine.match(/^#{3,}\s/)) {
        content = trimmedLine.replace(/^#{3,}\s+/, '');
      }
      // 空行保留
      else if (trimmedLine === '') {
        content = '';
      }
      // 普通行保持原样
      else {
        content = trimmedLine;
      }

      calculation.push(content);
    }
  }

  return calculation.join('\n').trim();
}

/**
 * 提取附加内容章节（去除markdown标记，保留纯文本内容）
 */
function extractTips(lines, startIndex) {
  const tips = [];
  let inSection = false;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    if (trimmedLine === '## 附加内容') {
      inSection = true;
      continue;
    }

    if (inSection) {
      // 遇到下一个章节标题时停止
      if (trimmedLine.match(/^##\s/) && !trimmedLine.startsWith('###')) {
        break;
      }

      // 跳过固定的结束语
      if (trimmedLine.includes('如果您遵循本指南的制作流程而发现有问题')) {
        continue;
      }

      // 去除markdown格式标记，保留内容
      let content = line;

      // 去除列表标记 (-, *, +)
      if (trimmedLine.match(/^[-*+]\s/)) {
        content = trimmedLine.replace(/^[-*+]\s+/, '');
      }
      // 去除有序列表标记 (1. 2. 3.)
      else if (trimmedLine.match(/^\d+\.\s/)) {
        content = trimmedLine.replace(/^\d+\.\s+/, '');
      }
      // 去除标题标记 (###)
      else if (trimmedLine.match(/^#{3,}\s/)) {
        content = trimmedLine.replace(/^#{3,}\s+/, '');
      }
      // 保留图片、链接等markdown语法
      // 空行保留
      else if (trimmedLine === '') {
        content = '';
      }
      // 普通行保持原样
      else {
        content = trimmedLine;
      }

      tips.push(content);
    }
  }

  return tips.join('\n').trim();
}

/**
 * 提取食材列表
 */
function extractIngredients(lines, startIndex) {
  const ingredients = [];
  let inSection = false;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line === '## 必备原料和工具') {
      inSection = true;
      continue;
    }

    if (inSection) {
      // 只在遇到同级标题（##）时停止，三级标题（###）继续处理
      if (line.match(/^##\s/) && !line.startsWith('###')) {
        break; // 进入下一章节
      }

      // 支持 -, * 和 + 三种列表标记
      if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('+ ')) {
        const text = line.substring(2).trim();

        // 跳过注释和空行
        if (!text || text.startsWith('<!--') || text.includes('推荐品牌')) {
          continue;
        }

        const optional = text.includes('（可选）') || text.includes('(可选)');
        const name = text
          .replace(/（可选）|\(可选\)/g, '')
          .trim();

        if (name) {
          ingredients.push({
            name,
            required: !optional,
            amount: '', // 将在后续处理
          });
        }
      }
    }
  }

  return ingredients;
}

/**
 * 提取步骤列表（支持有序列表、无序列表和原始格式）
 */
function extractSteps(lines, startIndex) {
  const steps = [];
  let inSection = false;
  let stepId = 0;
  let rawContent = []; // 保存原始内容，用于格式特殊的情况

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    if (trimmedLine === '## 操作') {
      inSection = true;
      continue;
    }

    if (inSection) {
      // 只在遇到同级或更高级的标题时停止（## 但不是 ###）
      if (trimmedLine.match(/^##\s/) && !trimmedLine.startsWith('###')) {
        break; // 进入下一章节
      }

      // 保存所有非空内容，用于备用
      rawContent.push(line);

      // 支持无序列表标记（-, *, +）
      if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ') || trimmedLine.startsWith('+ ')) {
        stepId++;
        const content = trimmedLine.substring(2).trim();

        steps.push({
          id: stepId,
          title: `步骤 ${stepId}`,
          content,
          image: null,
          duration: null,
          tips: null,
        });
      }
      // 支持有序列表（1. 2. 3.）
      else if (trimmedLine.match(/^\d+\.\s/)) {
        stepId++;
        const content = trimmedLine.replace(/^\d+\.\s+/, '').trim();

        steps.push({
          id: stepId,
          title: `步骤 ${stepId}`,
          content,
          image: null,
          duration: null,
          tips: null,
        });
      }
    }
  }

  // 如果没有提取到任何步骤，但有原始内容，则将原始内容作为单一步骤
  if (steps.length === 0 && rawContent.length > 0) {
    const rawText = rawContent
      .map(line => {
        const trimmed = line.trim();
        // 去除markdown标记但保留内容
        if (trimmed.match(/^#{3,}\s/)) {
          return trimmed.replace(/^#{3,}\s+/, ''); // 去除三级标题标记
        }
        if (trimmed.match(/^\*\*(.+)\*\*$/)) {
          return trimmed.replace(/^\*\*(.+)\*\*$/, '$1'); // 去除加粗标记
        }
        return trimmed;
      })
      .filter(line => line) // 过滤空行
      .join('\n');

    if (rawText) {
      steps.push({
        id: 1,
        title: '操作步骤',
        content: rawText,
        image: null,
        duration: null,
        tips: null,
      });
    }
  }

  return steps;
}

/**
 * 提取图片路径并转换为CDN链接
 */
function extractImages(content, filePath) {
  const images = [];
  // 匹配到图片扩展名为止，解决文件名包含括号的问题
  const imagePattern = /!\[.*?\]\((.+?\.(?:jpg|jpeg|png|gif|webp|svg|bmp))\)/gi;
  let match;

  // Helper function to encode URL path with Chinese characters
  function encodeUrlPath(url) {
    // Split URL into base and path
    const baseUrl = CONFIG.cdnBaseUrl;
    if (url.startsWith(baseUrl)) {
      const path = url.substring(baseUrl.length);
      // Encode each path segment to handle Chinese characters
      const encodedPath = path.split('/').map(segment => encodeURIComponent(segment)).join('/');
      return baseUrl + encodedPath;
    }
    return url;
  }

  while ((match = imagePattern.exec(content)) !== null) {
    const imagePath = match[1];

    // 处理绝对URL（http/https）
    if (imagePath.startsWith('http')) {
      images.push(imagePath);
    }
    // 处理相对路径（./ 或 ../ 或纯文件名）
    else if (imagePath.startsWith('./') || imagePath.startsWith('../') || !imagePath.startsWith('/')) {
      // 所有相对路径都相对于markdown文件所在目录
      const fullPath = path.join(path.dirname(filePath), imagePath);
      const relativePath = path.relative(CONFIG.dishesDir, fullPath);
      // 转换为CDN URL并编码中文字符
      const cdnUrl = CONFIG.cdnBaseUrl + relativePath.replace(/\\/g, '/');
      images.push(encodeUrlPath(cdnUrl));
    }
    // 处理绝对路径（从dishes目录开始）
    else {
      const cdnUrl = CONFIG.cdnBaseUrl + imagePath.substring(1).replace(/\\/g, '/');
      images.push(encodeUrlPath(cdnUrl));
    }
  }

  return images;
}

/**
 * 解析单个菜谱文件
 */
function parseRecipe(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    // 提取标题
    let name = '';
    for (const line of lines) {
      if (line.startsWith('# ')) {
        name = line.replace('# ', '').replace('的做法', '').trim();
        break;
      }
    }

    if (!name) {
      console.warn(`⚠️  No title found: ${filePath}`);
      return null;
    }

    // 提取简介（第一段正文）
    let introduction = '';
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line && !line.startsWith('#') && !line.startsWith('!') && !line.includes('预估烹饪难度')) {
        introduction = line;
        break;
      }
    }

    const recipe = {
      id: generateId(filePath),
      name,
      category: getCategoryFromPath(filePath),
      difficulty: extractDifficulty(content),
      cookingTime: 0,
      servings: 1,
      introduction,
      calculation: extractCalculation(lines, 0),
      coverImage: null,
      images: extractImages(content, filePath),
      ingredients: extractIngredients(lines, 0),
      steps: extractSteps(lines, 0),
      tips: extractTips(lines, 0),
      source: 'HowToCook',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // 设置封面图
    if (recipe.images.length > 0) {
      recipe.coverImage = recipe.images[0];
    }

    return recipe;
  } catch (error) {
    console.error(`❌ Error parsing ${filePath}:`, error.message);
    return null;
  }
}

/**
 * 生成分类统计数据
 */
function generateCategoryStats(recipes) {
  const stats = {};

  // 初始化所有分类
  for (const [key, value] of Object.entries(CATEGORIES)) {
    stats[key] = {
      id: key,
      name: key,
      nameCN: value.nameCN,
      icon: value.icon,
      color: value.color,
      recipeCount: 0,
      order: Object.keys(CATEGORIES).indexOf(key),
    };
  }

  // 统计每个分类的菜谱数量
  recipes.forEach((recipe) => {
    if (stats[recipe.category]) {
      stats[recipe.category].recipeCount++;
    }
  });

  return Object.values(stats);
}

/**
 * 主函数
 */
function main() {
  console.log('🍳 HowToCook Markdown Parser\n');

  // 查找所有 Markdown 文件
  const pattern = path.join(CONFIG.dishesDir, '**', '*.md');
  const mdFiles = globSync(pattern, {
    ignore: ['**/README.md', '**/template/**', '**/node_modules/**'],
  });

  console.log(`📁 Found ${mdFiles.length} recipe files\n`);

  // 解析所有菜谱
  const recipes = [];
  mdFiles.forEach((file, index) => {
    const progress = `[${index + 1}/${mdFiles.length}]`;
    const relativePath = path.relative(process.cwd(), file);

    process.stdout.write(`${progress} Parsing: ${relativePath}...`);

    const recipe = parseRecipe(file);
    if (recipe) {
      recipes.push(recipe);
      process.stdout.write(' ✓\n');
    } else {
      process.stdout.write(' ✗\n');
    }
  });

  console.log(`\n✅ Successfully parsed ${recipes.length} recipes\n`);

  // 生成分类统计
  const categories = generateCategoryStats(recipes);

  // 确保输出目录存在
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  // 保存菜谱数据
  const recipesPath = path.join(CONFIG.outputDir, CONFIG.outputFile);
  fs.writeFileSync(recipesPath, JSON.stringify(recipes, null, 2));
  console.log(`💾 Saved recipes to: ${recipesPath}`);

  // 保存分类数据
  const categoriesPath = path.join(CONFIG.outputDir, CONFIG.categoriesFile);
  fs.writeFileSync(categoriesPath, JSON.stringify(categories, null, 2));
  console.log(`💾 Saved categories to: ${categoriesPath}`);

  // 统计信息
  console.log('\n📊 Statistics:');
  console.log(`   Total recipes: ${recipes.length}`);

  console.log('\n   By category:');
  categories.forEach((cat) => {
    if (cat.recipeCount > 0) {
      console.log(`   ${cat.icon} ${cat.nameCN}: ${cat.recipeCount}`);
    }
  });

  console.log('\n   By difficulty:');
  const byDifficulty = {};
  recipes.forEach((r) => {
    byDifficulty[r.difficulty] = (byDifficulty[r.difficulty] || 0) + 1;
  });
  Object.entries(byDifficulty).sort().forEach(([diff, count]) => {
    const stars = '★'.repeat(parseInt(diff));
    console.log(`   ${stars} (${diff}星): ${count}`);
  });

  console.log('\n🎉 Done!\n');
}

// 执行
main();
