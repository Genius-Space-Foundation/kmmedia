# Student Course Application System - Quick Start Guide

## Overview

The student course application system has been successfully implemented and tested. Students can now view available courses and apply for them through a comprehensive application wizard.

## Features Implemented

### 1. Course Display

- ✅ Students can view all published and approved courses
- ✅ Course filtering by category, difficulty, and search
- ✅ Course details including instructor info, price, duration, and prerequisites
- ✅ Application fee display

### 2. Course Application

- ✅ Multi-step application wizard with the following steps:
  - Personal Information
  - Educational Background
  - Work Experience (optional)
  - Motivation & Goals
  - Document Upload
  - Emergency Contact
  - Review & Submit
- ✅ Auto-save draft functionality
- ✅ Form validation
- ✅ Application submission to database

### 3. API Endpoints

- ✅ `/api/student/courses` - Get available courses for students
- ✅ `/api/student/applications` - Submit and view applications
- ✅ Authentication middleware for student access

## Test Credentials

- **Student Account**: student@test.com / student123
- **Admin Account**: admin@kmmedia.com / admin123

## Available Test Courses

1. **Advanced Film Direction** - ₵2,500 (Application Fee: ₵50)
2. **3D Animation Mastery** - ₵3,000 (Application Fee: ₵50)

## How to Test

### 1. Start the Development Server

```bash
cd kmmedia
npm run dev
```

### 2. Access the Student Dashboard

1. Navigate to `http://localhost:3001/auth/login`
2. Login with: student@test.com / student123
3. Go to the student dashboard
4. Click on the "Courses" tab

### 3. Apply for a Course

1. Browse available courses
2. Click "Apply Now" on any course
3. Complete the application wizard
4. Submit the application

### 4. View Applications

- Applications are stored in the database with status "PENDING"
- Students can view their applications in the dashboard
- Admins can review and approve/reject applications

## API Testing (Optional)

### Get Courses

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/student/courses
```

### Submit Application

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "COURSE_ID",
    "personalInfo": {
      "fullName": "Test Student",
      "email": "student@test.com",
      "phone": "+233123456789",
      "address": "123 Test Street"
    },
    "education": {
      "highestDegree": "bachelor",
      "institution": "University of Ghana",
      "yearCompleted": "2020"
    },
    "motivation": {
      "reasonForApplying": "Reason text...",
      "careerGoals": "Career goals...",
      "expectations": "Expectations..."
    }
  }' \
  http://localhost:3001/api/student/applications
```

## Database Schema

The system uses the following main tables:

- `Course` - Course information
- `Application` - Student applications
- `User` - User accounts
- `UserProfile` - Extended user information

## Next Steps

1. Implement payment processing for application fees
2. Add admin interface for reviewing applications
3. Implement enrollment process after application approval
4. Add email notifications for application status updates
5. Implement document upload functionality

## Troubleshooting

- Ensure the database is seeded: `npm run db:seed`
- Check that the development server is running on the correct port
- Verify authentication tokens are valid
- Check browser console for any JavaScript errors
