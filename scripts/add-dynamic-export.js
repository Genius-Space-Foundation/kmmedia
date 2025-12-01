const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all route.ts files in the api directory
const routeFiles = glob.sync('src/app/api/**/route.ts', {
  cwd: process.cwd(),
  absolute: true
});

console.log(`Found ${routeFiles.length} route files to add dynamic export\n`);

let fixedCount = 0;
let skippedCount = 0;

routeFiles.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.relative(process.cwd(), filePath);

    // Check if already has dynamic export
    if (content.includes("export const dynamic")) {
      let modified = false;
      
      if (!content.includes("export const revalidate")) {
        content = content.replace(
          /export const dynamic = ['"]force-dynamic['"];/g,
          "export const dynamic = 'force-dynamic';\nexport const revalidate = 0;"
        );
        modified = true;
      }
      
      if (!content.includes("export const fetchCache")) {
        content = content.replace(
          /export const revalidate = 0;/g,
          "export const revalidate = 0;\nexport const fetchCache = 'force-no-store';"
        );
        modified = true;
      }
      
      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Added missing exports to ${fileName}`);
        fixedCount++;
      } else {
        console.log(`⏭️  Skipping ${fileName} (already has all exports)`);
        skippedCount++;
      }
      return;
    }

    // Add dynamic export after imports
    const importRegex = /^import\s+.*?;$/gm;
    let lastImportIndex = 0;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      lastImportIndex = match.index + match[0].length;
    }
    
    if (lastImportIndex > 0) {
      content = content.slice(0, lastImportIndex) + 
                "\n\nexport const dynamic = 'force-dynamic';\nexport const revalidate = 0;\nexport const fetchCache = 'force-no-store';" + 
                content.slice(lastImportIndex);
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Added dynamic, revalidate, and fetchCache export to ${fileName}`);
      fixedCount++;
    } else {
      console.log(`⚠️  Could not find imports in ${fileName}`);
      skippedCount++;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log(`\n📊 Summary:`);
console.log(`   Fixed: ${fixedCount} files`);
console.log(`   Skipped: ${skippedCount} files`);
console.log(`   Total: ${routeFiles.length} files`);
