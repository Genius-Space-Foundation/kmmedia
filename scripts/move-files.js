const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const unusedFilesListPath = path.join(projectRoot, 'unused_files.txt');
const srcDir = path.join(projectRoot, 'src');
const srcUnusedDir = path.join(srcDir, '_unused');
const docsDir = path.join(projectRoot, 'docs');
const docsArchiveDir = path.join(docsDir, 'archive');

// Ensure directories exist
if (!fs.existsSync(srcUnusedDir)) fs.mkdirSync(srcUnusedDir, { recursive: true });
if (!fs.existsSync(docsArchiveDir)) fs.mkdirSync(docsArchiveDir, { recursive: true });

// 1. Move Documentation Files
const docsToMove = [
    'ADMIN_COMPONENT_MAP.md',
    'ADMIN_FEATURES_COMPLETE.md',
    'ADMIN_IMPLEMENTATION_COMPLETE.md',
    'ADMIN_PROFILE_FEATURE.md',
    'ASSIGNMENT_CREATION_INTERFACE.md',
    'AUTO_FILL_FEATURE_COMPLETE.md',
    'AUTO_FILL_TESTING_GUIDE.md',
    'AUTO_FILL_VISUAL_GUIDE.md',
    'AUTO_SAVE_IMPLEMENTATION.md',
    'BEFORE_AFTER_COMPARISON.md',
    'BUILD_FIX_SUMMARY.md',
    'BUTTON_LINK_FIX.md',
    'CODEBASE_ANALYSIS_REPORT.md',
    'COMPLETED_FEATURES_UPDATE.md',
    'COMPLETE_IMPLEMENTATION_SUMMARY.md',
    'COMPLETE_SYSTEM_STATUS.md',
    'DEPLOYMENT_CHECKLIST.md',
    'DEPLOYMENT_GUIDE.md',
    'DEPLOYMENT_SUMMARY.md',
    'DOCUMENT_UPLOAD_SYSTEM.md',
    'FEATURES_IMPLEMENTATION_STATUS.md',
    'FINAL_FIX_COMPLETE.md',
    'FINAL_FIX_SUMMARY.md',
    'IMPLEMENTATION_COMPLETE_SUMMARY.md',
    'IMPLEMENTATION_SUMMARY.md',
    'IMPROVEMENTS_IMPLEMENTED.md',
    'INSTRUCTOR_MICRO_FUNCTIONALITIES_STATUS.md',
    'INSTRUCTOR_PROFILE_SYSTEM_COMPLETE.md',
    'JWT_SECRETS.md',
    'LOGIN_CREDENTIALS.md',
    'MISSION_ACCOMPLISHED.md',
    'MOBILE_QUICK_REFERENCE.md',
    'MOBILE_RESPONSIVE_IMPLEMENTATION_SUMMARY.md',
    'PROFILE_DESIGN_SHOWCASE.md',
    'PROFILE_LAYOUT_REVIEW.md',
    'PROFILE_QUICK_START.md',
    'PROFILE_REDESIGN_COMPLETE.md',
    'QUICK_START_AUTO_FILL.md',
    'QUICK_START_GUIDE.md',
    'README_ADMIN.md',
    'README_PROFILE_REDESIGN.md',
    'REGISTRATION_ENHANCEMENTS.md',
    'STUDENT_COURSE_APPLICATION_GUIDE.md',
    'TASK_33_IMPLEMENTATION_SUMMARY.md',
    'TASK_36_MOBILE_RESPONSIVE_SUMMARY.md',
    'TASK_4_IMPLEMENTATION_SUMMARY.md'
];

console.log('--- Moving Documentation ---');
docsToMove.forEach(file => {
    const srcPath = path.join(projectRoot, file);
    const destPath = path.join(docsArchiveDir, file);
    if (fs.existsSync(srcPath)) {
        fs.renameSync(srcPath, destPath);
        console.log(`Moved ${file} to docs/archive/`);
    } else {
        console.log(`Skipped ${file} (not found)`);
    }
});

// 2. Move Unused Source Files
console.log('\n--- Moving Unused Source Files ---');
if (fs.existsSync(unusedFilesListPath)) {
    const content = fs.readFileSync(unusedFilesListPath, 'utf8');
    const lines = content.split('\n');
    let startProcessing = false;

    lines.forEach(line => {
        line = line.trim();
        if (line === '--- Unused Files ---') {
            startProcessing = true;
            return;
        }
        if (!startProcessing || !line) return;

        // line is relative path like src\components\foo.tsx
        const relativePath = line;
        const fullSrcPath = path.join(projectRoot, relativePath);
        
        // We want to move it to src/_unused/...
        // But relativePath includes 'src\'. We need to strip 'src\' or handle it.
        // If relativePath is 'src\components\foo.tsx', we want 'src\_unused\components\foo.tsx'
        
        let pathInsideSrc = relativePath;
        if (relativePath.startsWith('src' + path.sep)) {
            pathInsideSrc = relativePath.substring(4); // remove 'src\'
        } else if (relativePath.startsWith('src/')) {
            pathInsideSrc = relativePath.substring(4);
        }

        const fullDestPath = path.join(srcUnusedDir, pathInsideSrc);
        const destDir = path.dirname(fullDestPath);

        if (fs.existsSync(fullSrcPath)) {
            if (!fs.existsSync(destDir)) {
                fs.mkdirSync(destDir, { recursive: true });
            }
            fs.renameSync(fullSrcPath, fullDestPath);
            console.log(`Moved ${relativePath} to src/_unused/${pathInsideSrc}`);
        } else {
             console.log(`Skipped ${relativePath} (not found)`);
        }
    });
} else {
    console.error('unused_files.txt not found!');
}
