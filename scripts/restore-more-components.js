const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const srcDir = path.join(projectRoot, 'src');
const srcUnusedDir = path.join(srcDir, '_unused');

// Additional missing components from latest build
const filesToRestore = [
    'components/admin/theme/ThemeToggle.tsx',
    'components/ui/empty-state.tsx',
    'components/ui/modern-badge.tsx',
    'components/instructor/dashboard/AssignmentManagementWidget.tsx',
    'components/instructor/dashboard/PendingGradingNotifications.tsx'
];

console.log('--- Restoring Additional Missing Components ---');

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
