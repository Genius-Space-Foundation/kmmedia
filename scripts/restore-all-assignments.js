const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const srcDir = path.join(projectRoot, 'src');
const srcUnusedDir = path.join(srcDir, '_unused');

// All assignment components referenced in index.ts
const filesToRestore = [
    'components/assignments/InstructorFileAttachment.tsx',
    'components/assignments/AssignmentList.tsx',
    'components/assignments/AssignmentDetail.tsx',
    'components/assignments/SubmissionInterface.tsx',
    'components/assignments/MultiFileUpload.tsx',
    'components/assignments/AssignmentStatusTracker.tsx'
];

console.log('--- Restoring All Assignment Components ---');

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
