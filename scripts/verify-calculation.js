const fs = require('fs');
const path = require('path');

/**
 * 验证calculation字段提取的完整性
 */

const recipes = require('../app/src/assets/data/recipes.json');

console.log('🔍 验证calculation字段提取完整性\n');

let totalChecked = 0;
let hasCalculation = 0;
let potentialIssues = [];

for (const recipe of recipes) {
  totalChecked++;

  if (recipe.calculation && recipe.calculation.length > 0) {
    hasCalculation++;

    // 尝试找到对应的markdown文件
    const dishesDir = path.join(__dirname, '../dishes');
    const mdFile = findMarkdownFile(dishesDir, recipe.name);

    if (mdFile) {
      const mdContent = fs.readFileSync(mdFile, 'utf8');
      const lines = mdContent.split('\n');

      // 提取原始markdown的计算部分
      let inSection = false;
      let originalLines = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line === '## 计算') {
          inSection = true;
          continue;
        }

        if (inSection) {
          if (line.match(/^##\s/) && !line.startsWith('###')) {
            break;
          }
          originalLines.push(lines[i].trim());
        }
      }

      // 统计内容量
      const originalText = originalLines.join('').replace(/[-*+]/g, '').replace(/\s/g, '');
      const extractedText = recipe.calculation.replace(/\s/g, '');

      // 比较长度（去除空白后）
      if (originalText.length !== extractedText.length) {
        potentialIssues.push({
          name: recipe.name,
          originalLength: originalText.length,
          extractedLength: extractedText.length,
          diff: Math.abs(originalText.length - extractedText.length)
        });
      }
    }
  }
}

console.log(`✅ 总计检查: ${totalChecked} 个菜谱`);
console.log(`✅ 包含计算信息: ${hasCalculation} 个菜谱`);
console.log(`✅ 提取比例: ${(hasCalculation / totalChecked * 100).toFixed(1)}%\n`);

if (potentialIssues.length > 0) {
  console.log(`⚠️  发现 ${potentialIssues.length} 个可能的问题:\n`);
  potentialIssues.forEach(issue => {
    console.log(`   ${issue.name}`);
    console.log(`   - 原始长度: ${issue.originalLength}`);
    console.log(`   - 提取长度: ${issue.extractedLength}`);
    console.log(`   - 差异: ${issue.diff} 字符\n`);
  });
} else {
  console.log('✅ 所有菜谱的calculation字段都完整提取，无内容丢失！');
}

function findMarkdownFile(dir, recipeName) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      const result = findMarkdownFile(fullPath, recipeName);
      if (result) return result;
    } else if (file.endsWith('.md')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes(`# ${recipeName}的做法`) || content.includes(`# ${recipeName}`)) {
        return fullPath;
      }
    }
  }

  return null;
}
