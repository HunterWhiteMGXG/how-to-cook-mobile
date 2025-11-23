const data = require('../app/src/assets/data/recipes.json');
const fs = require('fs');
const path = require('path');

const noIngredients = data.filter(r => !r.ingredients || r.ingredients.length === 0);
const noSteps = data.filter(r => !r.steps || r.steps.length === 0);

console.log('🔍 检查缺失字段的菜谱\n');

console.log('📋 没有ingredients的菜谱:', noIngredients.length);
console.log('   示例:');
noIngredients.slice(0, 3).forEach(r => {
  console.log('   -', r.name);

  // 查找对应的markdown
  const dishesDir = path.join(__dirname, '../dishes');
  const mdFile = findMarkdownFile(dishesDir, r.name);

  if (mdFile) {
    const content = fs.readFileSync(mdFile, 'utf8');
    const hasSection = content.includes('## 必备原料和工具');
    console.log('     有"## 必备原料和工具"章节:', hasSection ? '是' : '否');
  }
});

console.log('\n📋 没有steps的菜谱:', noSteps.length);
console.log('   示例:');
noSteps.slice(0, 3).forEach(r => {
  console.log('   -', r.name);

  // 查找对应的markdown
  const dishesDir = path.join(__dirname, '../dishes');
  const mdFile = findMarkdownFile(dishesDir, r.name);

  if (mdFile) {
    const content = fs.readFileSync(mdFile, 'utf8');
    const hasSection = content.includes('## 操作');
    console.log('     有"## 操作"章节:', hasSection ? '是' : '否');
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
