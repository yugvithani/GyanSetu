const fs = require('fs');

const files = process.argv.slice(2);

const replacements = [
  { pattern: /\bbg-white\b(?!(\/))/g, replacement: 'bg-surface' },
  { pattern: /\bbg-slate-50\b|\bbg-slate-100\b/g, replacement: 'bg-surface-2' },
  { pattern: /\bborder-slate-100\b|\bborder-slate-200\b|\bborder-slate-50\b/g, replacement: 'border-theme' },
  { pattern: /\btext-slate-800\b|\btext-slate-700\b/g, replacement: 'text-theme-primary' },
  { pattern: /\btext-slate-600\b/g, replacement: 'text-theme-secondary' },
  { pattern: /\btext-slate-500\b|\btext-slate-400\b|\btext-slate-300\b/g, replacement: 'text-theme-muted' },
  { pattern: /\bbg-slate-200\b/g, replacement: 'bg-theme-border' }
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  replacements.forEach(({ pattern, replacement }) => {
    content = content.replace(pattern, replacement);
  });
  fs.writeFileSync(file, content, 'utf8');
  console.log('Updated ' + file);
});
