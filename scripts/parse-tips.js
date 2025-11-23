const fs = require('fs');
const path = require('path');

const TIPS_DIR = path.join(__dirname, '..', 'tips');
const OUTPUT_FILE = path.join(__dirname, '..', 'app', 'src', 'assets', 'data', 'tips.json');

// 知识分类配置
const categories = [
  {
    id: 'basic',
    name: '基础',
    icon: '📚',
    files: [
      '厨房准备.md',
      '如何选择现在吃什么.md',
      '食材相克与禁忌.md'
    ]
  },
  {
    id: 'learn',
    name: '学习',
    icon: '📖',
    dir: 'learn'
  },
  {
    id: 'advanced',
    name: '高级',
    icon: '🎓',
    dir: 'advanced'
  }
];

// 从文件名提取标题
function extractTitle(content, filename) {
  // 尝试从第一个 # 标题提取
  const titleMatch = content.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    return titleMatch[1].trim();
  }
  // 否则使用文件名（去掉 .md）
  return filename.replace('.md', '');
}

// 解析单个 Markdown 文件
function parseTipFile(filePath, filename) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const title = extractTitle(content, filename);

  return {
    id: filename.replace('.md', ''),
    title,
    content: content.trim()
  };
}

// 主函数
function main() {
  const result = {
    categories: [],
    tips: []
  };

  for (const category of categories) {
    const categoryData = {
      id: category.id,
      name: category.name,
      icon: category.icon,
      tips: []
    };

    if (category.files) {
      // 基础分类：指定文件列表
      for (const filename of category.files) {
        const filePath = path.join(TIPS_DIR, filename);
        if (fs.existsSync(filePath)) {
          const tip = parseTipFile(filePath, filename);
          tip.category = category.id;
          result.tips.push(tip);
          categoryData.tips.push(tip.id);
        } else {
          console.warn(`文件不存在: ${filePath}`);
        }
      }
    } else if (category.dir) {
      // 子目录分类
      const dirPath = path.join(TIPS_DIR, category.dir);
      if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));
        for (const filename of files) {
          const filePath = path.join(dirPath, filename);
          const tip = parseTipFile(filePath, filename);
          tip.category = category.id;
          result.tips.push(tip);
          categoryData.tips.push(tip.id);
        }
      }
    }

    result.categories.push(categoryData);
  }

  // 确保输出目录存在
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 写入 JSON 文件
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2), 'utf-8');

  console.log(`解析完成！共 ${result.tips.length} 篇知识文章`);
  console.log(`分类统计：`);
  for (const cat of result.categories) {
    console.log(`  - ${cat.name}: ${cat.tips.length} 篇`);
  }
}

main();
