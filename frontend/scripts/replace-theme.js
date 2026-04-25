const fs = require('fs');
const glob = require('glob'); // Actually let's just pass paths

const files = process.argv.slice(2);

const replacements = [
  { pattern: /\bbg-white\b(?!(\/))/g, replacement: 'bg-surface' },
  { pattern: /\bbg-slate-50\b|bg-slate-100\b/g, replacement: 'bg-surface-2' },
  { pattern: /\bborder-slate-100\b|border-slate-200\b|border-slate-50\b/g, replacement: 'border-theme' },
  { pattern: /\btext-slate-800\b|text-slate-700\b/g, replacement: 'text-theme-primary' },
  { pattern: /\btext-slate-600\b/g, replacement: 'text-theme-secondary' },
  { pattern: /\btext-slate-500\b|text-slate-400\b|text-slate-300\b/g, replacement: 'text-theme-muted' },
  // specific to skeleton backgrounds
  { pattern: /bg-slate-200/g, replacement: 'bg-theme-border' }
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  replacements.forEach(({ pattern, replacement }) => {
    content = content.replace(pattern, replacement);
  });
  fs.writeFileSync(file, content, 'utf8');
  console.log('Updated ' + file);
});
