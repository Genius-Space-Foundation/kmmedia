const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const srcDir = path.join(projectRoot, 'src');
const tsConfigPath = path.join(projectRoot, 'tsconfig.json');

// Read tsconfig to get paths
const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
const pathAliases = tsConfig.compilerOptions.paths || {};

function resolveAlias(importPath) {
  for (const alias in pathAliases) {
    const aliasPrefix = alias.replace('/*', '');
    if (importPath.startsWith(aliasPrefix)) {
      const target = pathAliases[alias][0].replace('/*', '');
      return path.join(projectRoot, target, importPath.substring(aliasPrefix.length));
    }
  }
  return null;
}

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      if (/\.(ts|tsx|js|jsx|css|scss)$/.test(file)) {
        fileList.push(filePath);
      }
    }
  });
  return fileList;
}

const allFiles = getAllFiles(srcDir);
const usedFiles = new Set();

// Mark entry points
allFiles.forEach(file => {
  if (file.includes(path.join(srcDir, 'app')) || file.includes(path.join(srcDir, 'pages')) || file.endsWith('middleware.ts')) {
    usedFiles.add(file);
  }
});

// Regex for imports
const importRegex = /import\s+(?:[\w\s{},*]+from\s+)?['"]([^'"]+)['"]|require\(['"]([^'"]+)['"]\)|import\(['"]([^'"]+)['"]\)/g;

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1] || match[2] || match[3];
    if (!importPath) continue;

    if (importPath.startsWith('.')) {
      // Relative import
      const dir = path.dirname(filePath);
      resolveFile(path.join(dir, importPath));
    } else {
      // Alias or module
      const resolved = resolveAlias(importPath);
      if (resolved) {
        resolveFile(resolved);
      }
    }
  }
}

function resolveFile(basePath) {
  const extensions = ['.ts', '.tsx', '.js', '.jsx', '.css', '.scss', '/index.ts', '/index.tsx', '/index.js', '/index.jsx'];
  
  // Check exact match first (if it has extension)
  if (fs.existsSync(basePath) && fs.statSync(basePath).isFile()) {
     if (allFiles.includes(basePath)) {
         if (!usedFiles.has(basePath)) {
             usedFiles.add(basePath);
             processFile(basePath); // Recurse
         }
     }
     return;
  }

  for (const ext of extensions) {
    const fullPath = basePath + ext;
    if (fs.existsSync(fullPath) && allFiles.includes(fullPath)) {
      if (!usedFiles.has(fullPath)) {
        usedFiles.add(fullPath);
        processFile(fullPath); // Recurse
      }
      return;
    }
  }
}

// Initial pass on entry points
// We need to iterate until no new files are added, but recursion in processFile handles it?
// Actually, processFile calls resolveFile which calls processFile. 
// But we need to start with the initial set of usedFiles (entry points).
// However, the initial usedFiles might not have been processed yet.

const initialEntryPoints = Array.from(usedFiles);
initialEntryPoints.forEach(file => {
    processFile(file);
});

const unusedFiles = allFiles.filter(file => !usedFiles.has(file));

console.log('Total files:', allFiles.length);
console.log('Used files:', usedFiles.size);
console.log('Unused files:', unusedFiles.length);
console.log('--- Unused Files ---');
unusedFiles.forEach(file => console.log(path.relative(projectRoot, file)));
