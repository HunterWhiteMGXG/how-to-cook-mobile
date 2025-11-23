const data = require('../app/src/assets/data/recipes.json');
const fs = require('fs');
const path = require('path');

const noSteps = data.filter(r => !r.steps || r.steps.length === 0);

console.log('🔍 检查格式特殊的菜谱\n');
console.log('没有steps的菜谱数量:', noSteps.length, '\n');

noSteps.slice(0, 5).forEach(recipe => {
  console.log('📄', recipe.name);

  const dishesDir = path.join(__dirname, '../dishes');
  const mdFile = findMarkdownFile(dishesDir, recipe.name);

  if (mdFile) {
    const content = fs.readFileSync(mdFile, 'utf8');
    const lines = content.split('\n');

    // 查找"## 操作"章节
    let inSection = false;
    let sectionContent = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      if (trimmedLine === '## 操作') {
        inSection = true;
        continue;
      }

      if (inSection) {
        if (trimmedLine.match(/^##\s/) && !trimmedLine.startsWith('###')) {
          break;
        }
        sectionContent.push(line);
      }
    }

    console.log('   操作章节内容长度:', sectionContent.join('\n').trim().length, '字符');
    console.log('   内容预览:');
    console.log('   ---');
    sectionContent.slice(0, 10).forEach(line => {
      console.log('   ' + line);
    });
    console.log('   ---\n');
  }
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
