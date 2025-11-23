const fs = require('fs');
const path = require('path');

console.log('📋 操作步骤格式案例对比\n');
console.log('='.repeat(70) + '\n');

const examples = [
  {
    type: '无序列表格式（- 短横线）',
    file: 'dishes/aquatic/咖喱炒蟹.md',
    name: '咖喱炒蟹'
  },
  {
    type: '无序列表格式（* 星号）',
    file: 'dishes/aquatic/清蒸生蚝.md',
    name: '清蒸生蚝'
  },
  {
    type: '无序列表格式（+ 加号）',
    file: 'dishes/meat_dish/农家一碗香/农家一碗香.md',
    name: '农家一碗香'
  },
  {
    type: '有序列表格式（1. 2. 3.）',
    file: 'dishes/breakfast/手抓饼.md',
    name: '手抓饼'
  },
  {
    type: '原始格式（段落文本）',
    file: 'dishes/drink/可乐桶.md',
    name: '可乐桶'
  }
];

examples.forEach(({ type, file, name }) => {
  console.log(`【${type}】`);
  console.log(`菜谱：${name}\n`);

  const fullPath = path.join('/Users/hunterwhite/Desktop/Projects/HowToCook', file);

  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');

    let inSection = false;
    let sectionLines = [];
    let count = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (trimmed === '## 操作') {
        inSection = true;
        continue;
      }

      if (inSection) {
        if (trimmed.match(/^##\s/) && !trimmed.startsWith('###')) {
          break;
        }

        if (trimmed) {
          count++;
          if (count <= 3) { // 只显示前3行
            sectionLines.push(line);
          }
        }
      }
    }

    console.log('原始markdown内容（前3行）:');
    sectionLines.forEach(line => {
      console.log('  ' + line);
    });
  }

  // 显示提取后的结果
  const data = require('/Users/hunterwhite/Desktop/Projects/HowToCook/app/src/assets/data/recipes.json');
  const recipe = data.find(r => r.name === name);

  if (recipe && recipe.steps) {
    console.log('\n提取后的结构:');
    console.log('  步骤数量:', recipe.steps.length);
    if (recipe.steps.length > 0) {
      console.log('  第1步:', recipe.steps[0].content.substring(0, 60) + '...');
      if (recipe.steps.length > 1) {
        console.log('  第2步:', recipe.steps[1].content.substring(0, 60) + '...');
      }
    }
  }

  console.log('\n' + '-'.repeat(70) + '\n');
});
