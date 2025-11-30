const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const srcDir = path.join(projectRoot, 'src');
const srcUnusedDir = path.join(srcDir, '_unused');

// Student dashboard and payment components
const filesToRestore = [
    'components/student/dashboard/AssignmentDeadlineReminders.tsx',
    'components/student/dashboard/RecentGradesWidget.tsx',
    'components/student/dashboard/AssignmentProgressWidget.tsx',
    'components/student/payments/PaymentTransactions.tsx',
    'components/student/payments/PaymentReminder.tsx'
];

console.log('--- Restoring Student Components ---');

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
