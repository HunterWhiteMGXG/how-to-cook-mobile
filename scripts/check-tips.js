const data = require('../app/src/assets/data/recipes.json');
const fs = require('fs');
const path = require('path');

const withoutTips = data.filter(r => !r.tips || r.tips.length === 0);

console.log('📋 没有tips的菜谱数量:', withoutTips.length, '/', data.length);
console.log('   覆盖率:', ((data.length - withoutTips.length) / data.length * 100).toFixed(1) + '%\n');

console.log('随机抽查5个没有tips的菜谱，检查原始markdown:\n');

const samples = withoutTips.slice(0, 5);

samples.forEach(recipe => {
  console.log('📄', recipe.name);

  // 尝试找到对应的markdown文件
  const dishesDir = path.join(__dirname, '../dishes');
  const mdFile = findMarkdownFile(dishesDir, recipe.name);

  if (mdFile) {
    const content = fs.readFileSync(mdFile, 'utf8');
    const hasAdditionalContent = content.includes('## 附加内容');

    console.log('   Markdown文件:', mdFile.replace(dishesDir, 'dishes'));
    console.log('   包含"## 附加内容"章节:', hasAdditionalContent ? '✅ 是' : '❌ 否');

    if (hasAdditionalContent) {
      // 提取附加内容章节
      const lines = content.split('\n');
      let inSection = false;
      let sectionContent = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line === '## 附加内容') {
          inSection = true;
          continue;
        }

        if (inSection) {
          if (line.match(/^##\s/) && !line.startsWith('###')) {
            break;
          }
          if (line.includes('如果您遵循本指南的制作流程而发现有问题')) {
            continue;
          }
          sectionContent.push(line);
        }
      }

      const extractedContent = sectionContent.filter(l => l).join('\n');
      console.log('   实际内容长度:', extractedContent.length, '字符');
      if (extractedContent.length > 0) {
        console.log('   内容预览:', extractedContent.substring(0, 50) + '...');
      }
    }
  } else {
    console.log('   ⚠️  找不到markdown文件');
  }

  console.log();
});

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
