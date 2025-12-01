const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all route.ts files in the api directory
const routeFiles = glob.sync('src/app/api/**/route.ts', {
  cwd: process.cwd(),
  absolute: true
});

console.log(`Found ${routeFiles.length} route files to check\n`);

let fixedCount = 0;
let skippedCount = 0;

routeFiles.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    const fileName = path.relative(process.cwd(), filePath);

    // Check if file has dynamic segments (contains [id] or similar in path)
    const hasDynamicSegment = filePath.includes('[') && filePath.includes(']');
    
    if (!hasDynamicSegment) {
      console.log(`⏭️  Skipping ${fileName} (no dynamic segments)`);
      skippedCount++;
      return;
    }

    // Add dynamic export if not present
    if (!content.includes("export const dynamic")) {
      // Find the position after imports
      const importRegex = /^import\s+.*?;$/gm;
      let lastImportIndex = 0;
      let match;
      
      while ((match = importRegex.exec(content)) !== null) {
        lastImportIndex = match.index + match[0].length;
      }
      
      if (lastImportIndex > 0) {
        content = content.slice(0, lastImportIndex) + 
                  "\n\nexport const dynamic = 'force-dynamic';" + 
                  content.slice(lastImportIndex);
        modified = true;
      }
    }

    // Fix params type in function signatures
    // Pattern: { params }: { params: { id: string } }
    const paramsTypeRegex = /\{\s*params\s*\}\s*:\s*\{\s*params:\s*\{([^}]+)\}\s*\}/g;
    if (paramsTypeRegex.test(content)) {
      content = content.replace(
        /\{\s*params\s*\}\s*:\s*\{\s*params:\s*\{([^}]+)\}\s*\}/g,
        '{ params }: { params: Promise<{$1}> }'
      );
      modified = true;
    }

    // Fix params access patterns
    // Pattern: const { id } = params;
    // Pattern: const id = params.id;
    const paramsAccessRegex1 = /const\s+\{\s*([^}]+)\s*\}\s*=\s*params;/g;
    const paramsAccessRegex2 = /const\s+(\w+)\s*=\s*params\.(\w+);/g;
    
    if (paramsAccessRegex1.test(content)) {
      content = content.replace(
        /const\s+\{\s*([^}]+)\s*\}\s*=\s*params;/g,
        'const { $1 } = await params;'
      );
      modified = true;
    }
    
    // Reset regex lastIndex
    paramsAccessRegex2.lastIndex = 0;
    if (paramsAccessRegex2.test(content)) {
      content = content.replace(
        /const\s+(\w+)\s*=\s*params\.(\w+);/g,
        'const $1 = (await params).$2;'
      );
      modified = true;
    }

    // Add GET handler for routes that only have POST, PUT, DELETE, PATCH
    const hasGetHandler = /export\s+(const\s+GET|async\s+function\s+GET)/g.test(content);
    const hasOtherHandlers = /export\s+(const\s+(POST|PUT|DELETE|PATCH)|async\s+function\s+(POST|PUT|DELETE|PATCH))/g.test(content);
    
    if (!hasGetHandler && hasOtherHandlers) {
      // Add GET handler at the end
      content += `\nexport async function GET() {
  return NextResponse.json(
    { success: false, message: "Method not allowed" },
    { status: 405 }
  );
}\n`;
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed ${fileName}`);
      fixedCount++;
    } else {
      console.log(`⏭️  No changes needed for ${fileName}`);
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
