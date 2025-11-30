# 🚀 Quick Start Guide - Instructor Dashboard

## ⚡ **Get Started in 5 Minutes**

### **Step 1: Database Setup** (Required - One Time)

**Stop the dev server first**, then run:

```bash
cd kmmedia
npx prisma generate
npx prisma db push
```

**This will:**

- Generate Prisma client with new profile fields
- Update database schema
- Add profile image fields
- Enable profile management

---

### **Step 2: Start Development Server**

```bash
npm run dev
```

Access at: `http://localhost:3001/dashboards/instructor`

---

### **Step 3: Update Your Profile**

1. Click on your **avatar** in the sidebar (bottom)
2. Upload a **profile picture**
3. Fill in your **bio** and credentials
4. Add **social media links**
5. Click **"Save Changes"**

Your profile picture will now appear everywhere!

---

## 📚 **Quick Feature Guide**

### **1. Create a Course**

- Go to **Course Management** tab
- Click **"Create Course Wizard"**
- Follow the 7-step wizard
- Review and publish

### **2. Add Lessons**

- From Course Management, click **"Lessons"** on a course
- Click **"Add New Lesson"**
- Choose type (Video, Text, Quiz, Assignment)
- Drag to reorder
- Click publish when ready

### **3. Create Assessments**

- From Course Management, click **"Assessments"** on a course
- Click **"Create Assessment"**
- Choose question types
- Add questions
- Configure settings
- Save and publish

### **4. Grade Students**

- From Course Management, click **"Gradebook"** on a course
- View all submissions
- Create custom grading rubrics
- Add grades and feedback
- Export reports

### **5. Track Progress**

- Go to **Student Analytics** tab
- View individual student progress
- Identify at-risk students
- Send interventions
- Export progress reports

---

## 🎨 **Navigation Map**

```
Instructor Dashboard
│
├── Overview (Quick stats and widgets)
│
├── Course Management
│   ├── Create Course Wizard
│   ├── Lessons (per course)
│   ├── Assessments (per course)
│   └── Gradebook (per course)
│
├── Student Analytics
│   └── Progress Tracking
│
├── Assessment Center
│   └── Assessment Builder
│
├── Communication Hub
│   ├── Announcements
│   ├── Messages
│   └── Live Sessions
│
├── AI Assistant
│   └── Content Generation
│
├── Analytics
│   └── Advanced Reporting
│
└── Profile Settings (Click avatar)
    ├── Personal Info
    ├── Professional Info
    ├── Social Links
    └── Preferences
```

---

## 🔑 **Key Features Overview**

### **Course Creation Wizard:**

- 7 steps: Info → Pricing → Prerequisites → Outline → Media → Settings → Review
- Upload thumbnail and promotional video
- Set pricing and installment plans
- Add learning objectives
- Configure delivery mode
- Review before publishing

### **Lesson Management:**

- Drag-and-drop to reorder
- Video, Text, Quiz, Assignment types
- Rich content editor
- Publish/unpublish toggle
- Resource attachments
- Progress tracking

### **Assessment Builder:**

- 7 question types
- Multiple choice, True/False, Fill blanks, Short answer, Essay, Matching, Ordering
- Time limits and attempts
- Randomization options
- Auto-grading support
- Detailed explanations

### **Gradebook:**

- Letter grades (A+ to F)
- Custom rubrics with criteria
- Performance levels
- Grade analytics
- Student feedback
- Export grades

### **Progress Tracking:**

- Individual student cards
- Status: Excelling, On Track, At Risk, Needs Attention
- Engagement scores
- Time tracking
- Intervention system
- Detailed reports

### **Profile Management:**

- Profile picture upload
- Cover image
- Bio and credentials
- Social media links
- Notification preferences
- Timezone and language

---

## 💡 **Pro Tips**

### **Best Practices:**

1. **Upload a profile picture** - Builds trust with students
2. **Fill out bio completely** - Shows expertise
3. **Add social links** - Professional networking
4. **Use rubrics** - Consistent grading
5. **Monitor progress** - Early intervention
6. **Export data regularly** - Backup and analysis

### **Keyboard Shortcuts:**

- **Tab** - Navigate between fields
- **Enter** - Submit forms (when in input)
- **Esc** - Close dialogs
- **Ctrl/Cmd + S** - Save (where implemented)

### **Mobile Usage:**

- **Swipe** sidebar from left edge
- **Tap** avatar for profile
- **Pull down** to refresh
- All features work on mobile!

---

## 🆘 **Troubleshooting**

### **Common Issues:**

**Q: Profile picture not uploading?**

- Check file size (< 5MB)
- Check format (JPG, PNG, WebP only)
- Check internet connection
- Check Cloudinary credentials

**Q: Avatars not showing?**

- Run `npx prisma generate`
- Restart dev server
- Clear browser cache
- Check profileImage field in database

**Q: Changes not saving?**

- Check console for errors
- Verify you're logged in
- Check network tab
- Try again with refresh

**Q: Database errors?**

- Stop dev server
- Run `npx prisma generate`
- Run `npx prisma db push`
- Restart server

---

## 📞 **Support**

### **Resources:**

- **Documentation:** See markdown files in project root
- **Component Docs:** Check inline TypeScript comments
- **API Docs:** See API route files

### **File Locations:**

- **Components:** `src/components/instructor/`
- **Pages:** `src/app/dashboards/instructor/`
- **API:** `src/app/api/instructor/`
- **Database:** `prisma/schema.prisma`

---

## ✅ **Feature Checklist**

After database migration, test these:

- [ ] Login as instructor
- [ ] View dashboard
- [ ] Click avatar → go to profile
- [ ] Upload profile picture
- [ ] Fill in bio and credentials
- [ ] Save profile changes
- [ ] Verify avatar in sidebar
- [ ] Verify avatar in header
- [ ] Create a new course
- [ ] Add lessons to course
- [ ] Create an assessment
- [ ] Grade a submission
- [ ] View student progress
- [ ] Export a report

---

## 🎯 **Quick Reference**

### **Important URLs:**

- Dashboard: `/dashboards/instructor`
- Profile: `/dashboards/instructor/profile`
- Course Creation: `/dashboards/instructor/course-creation`
- Lesson Management: `/dashboards/instructor/lesson-management?course=ID`
- Assessments: `/dashboards/instructor/assessment-builder?course=ID`
- Gradebook: `/dashboards/instructor/gradebook?course=ID`
- Progress: `/dashboards/instructor/progress-tracking?course=ID`

### **API Endpoints:**

- Profile: `/api/instructor/profile`
- Upload: `/api/instructor/profile/upload-image`
- Courses: `/api/instructor/courses`
- Lessons: `/api/instructor/courses/[courseId]/lessons`
- Assessments: `/api/instructor/courses/[courseId]/assessments`
- Grades: `/api/instructor/courses/[courseId]/grades`

---

## 🚀 **You're All Set!**

Your instructor dashboard is **production-ready** with all core features implemented:

✅ Course creation and management
✅ Lesson organization
✅ Assessment building
✅ Grade tracking
✅ Student monitoring
✅ **Profile management with pictures**

**Happy Teaching! 🎓**

---

**Last Updated:** January 8, 2025
**Version:** 1.0.0
**Status:** Production Ready 🚀
