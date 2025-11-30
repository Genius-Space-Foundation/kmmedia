const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const srcDir = path.join(projectRoot, 'src');
const srcUnusedDir = path.join(srcDir, '_unused');

// Lib dependencies
const filesToRestore = [
    'lib/hooks/useDebounce.ts',
    'lib/assignments/assignment-validation.ts',
    'lib/notifications/assignment-email-templates.ts'
];

console.log('--- Restoring Lib Dependencies ---');

filesToRestore.forEach(relativePath => {
    const unusedPath = path.join(srcUnusedDir, relativePath);
    const originalPath = path.join(srcDir, relativePath);
    
    if (fs.existsSync(unusedPath)) {
        const destDir = path.dirname(originalPath);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }
        fs.renameSync(unusedPath, originalPath);
        console.log(`Restored ${relativePath}`);
    } else {
        console.log(`Could not find ${relativePath} in _unused`);
    }
});
