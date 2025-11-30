const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const srcDir = path.join(projectRoot, 'src');
const srcUnusedDir = path.join(srcDir, '_unused');

// Final batch of missing components
const filesToRestore = [
    'components/instructor/dashboard/AssignmentAnalyticsSummary.tsx',
    'components/ui/notification-bell.tsx',
    'lib/accessibility.ts',
    'components/ui/accessible-form.tsx',
    'components/student/dashboard/UpcomingAssignmentsWidget.tsx'
];

console.log('--- Restoring Final Batch ---');

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
