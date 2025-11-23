const fs = require('fs');
const path = require('path');
const { marked } = require(path.join(__dirname, '../app/node_modules/marked'));

// 配置 marked
marked.setOptions({
  breaks: true,
  gfm: true
});

function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// 自定义渲染器
const renderer = {
  // 代码块渲染
  code(token) {
    const code = token.text;
    const lang = token.lang || 'text';
    return `<pre><code class="language-${lang}">${escapeHtml(code)}</code></pre>`;
  },

  // 链接渲染
  link(token) {
    return `<span class="link">${token.text}</span>`;
  }
};

marked.use({ renderer });

// 读取 tips.json
const tipsPath = path.join(__dirname, '../app/src/assets/data/tips.json');
const tipsData = JSON.parse(fs.readFileSync(tipsPath, 'utf-8'));

// 处理专业术语格式: 【术语(拼音)】解释
function formatTerminology(content) {
  // 匹配 【术语(拼音)】解释 格式
  return content.replace(
    /【([^】]+)】([^\n【]+)/g,
    '<div class="term-item"><span class="term-name">$1</span><span class="term-desc">$2</span></div>'
  );
}

// 处理每个 tip
tipsData.tips = tipsData.tips.map(tip => {
  // 移除开头的一级标题
  let content = tip.content.replace(/^#\s+.+\n+/, '');

  // 检查是否是专业术语文章
  const isTerminology = tip.id === '高级专业术语' || tip.title.includes('专业术语');

  if (isTerminology) {
    // 先处理术语格式，再转换剩余的 markdown
    content = formatTerminology(content);
  }

  // 转换为 HTML
  const htmlContent = marked(content);

  return {
    ...tip,
    htmlContent
  };
});

// 写回文件
fs.writeFileSync(tipsPath, JSON.stringify(tipsData, null, 2), 'utf-8');

console.log(`已处理 ${tipsData.tips.length} 篇文章的 HTML 内容`);
