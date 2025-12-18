const fs = require('fs');
const path = require('path');

// CONFIG: Folders to ignore to keep the output clean
const IGNORED_FOLDERS = [
  'node_modules', 
  '.git', 
  '.next', 
  'dist', 
  'build', 
  'coverage', 
  '.vscode',
  '.idea'
];

// CONFIG: File extensions to ignore (optional, keeps it less noisy)
const IGNORED_EXTENSIONS = [
  '.log', 
  '.DS_Store'
];

function getStructure(dir, prefix = '') {
  let output = '';
  const files = fs.readdirSync(dir);

  // Sort: Folders first, then files
  files.sort((a, b) => {
    const aPath = path.join(dir, a);
    const bPath = path.join(dir, b);
    const aIsDir = fs.statSync(aPath).isDirectory();
    const bIsDir = fs.statSync(bPath).isDirectory();

    if (aIsDir && !bIsDir) return -1;
    if (!aIsDir && bIsDir) return 1;
    return a.localeCompare(b);
  });

  files.forEach((file, index) => {
    if (IGNORED_FOLDERS.includes(file)) return;
    if (IGNORED_EXTENSIONS.includes(path.extname(file))) return;

    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    const isLast = index === files.length - 1;
    const marker = isLast ? '└── ' : '├── ';
    
    output += `${prefix}${marker}${file}\n`;

    if (stats.isDirectory()) {
      const newPrefix = prefix + (isLast ? '    ' : '│   ');
      output += getStructure(filePath, newPrefix);
    }
  });

  return output;
}

const rootDir = process.cwd();
console.log('🔍 Scanning project structure...');
const structure = getStructure(rootDir);

const outputFile = 'project_structure.txt';
fs.writeFileSync(outputFile, structure);

console.log(`✅ Structure saved to: ${outputFile}`);
console.log('👉 Please upload this file or copy its content to the chat.');