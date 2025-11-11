const fs = require('fs');
const path = require('path');

const TARGET_DIRS = [
  // "src/app/",
  "backend-module/demo/",
  // "backend-module/demo/src/main/resources/",
  // "backend-module/demo/src/main/java/com/example/demo",
  // "frontend/src/",
];

const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.vue', '.json', '.md', '.html', '.css', '.java', '.yml', '.sql', '.gradle'];

function isTestFile(file) {
  return file.endsWith('.spec.ts') || file.endsWith('.spec.tsx') || file.endsWith('.test.ts');
}

function walk(dir, depth = 0) {
  const files = fs.readdirSync(dir);
  let output = '';

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      output += `${'  '.repeat(depth)}- ${file}/\n`;
      output += walk(fullPath, depth + 1);
    } else {
      const ext = path.extname(file);
      if (!EXTENSIONS.includes(ext)) continue;
      if (isTestFile(file)) continue;

      const indent = '  '.repeat(depth);
      const content = fs.readFileSync(fullPath, 'utf-8');
      output += `${indent}- ${file}\n`;
      output += `${indent}  \`\`\`${ext.substring(1)}\n${content}\n${indent}  \`\`\`\n`;
    }
  }

  return output;
}

// 👇 Processar apenas backend/src e frontend/src
let finalOutput = '';

for (const baseDir of TARGET_DIRS) {
  const fullPath = path.resolve(baseDir);
  if (fs.existsSync(fullPath)) {
    finalOutput += `\n📁 ${baseDir}/\n`;
    finalOutput += walk(fullPath, 1);
  }
}

fs.writeFileSync('project-export.txt', finalOutput);
console.log('✅ Export completed to project-export.txt');
