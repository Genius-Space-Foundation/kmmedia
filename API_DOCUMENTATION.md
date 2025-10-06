# 📚 KM Media Training Institute - API Documentation

## 🔐 Authentication

All protected endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Authentication Endpoints

#### POST `/api/auth/login`

Login with email and password.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "STUDENT",
    "status": "ACTIVE"
  },
  "tokens": {
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token"
  },
  "message": "Login successful"
}
```

#### POST `/api/auth/register`

Register a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "name": "User Name",
  "password": "password123",
  "phone": "+1234567890",
  "role": "STUDENT"
}
```

**Response:**

```json
{
  "success": true,
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "STUDENT",
    "status": "ACTIVE"
  },
  "message": "Registration successful"
}
```

---

## 📚 Courses

### Public Endpoints

#### GET `/api/courses`

Get all approved courses with optional filtering.

**Query Parameters:**

- `status` - Course status (APPROVED, DRAFT, etc.)
- `category` - Course category
- `limit` - Number of courses per page (default: 20)
- `page` - Page number (default: 1)

**Response:**

```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": "course-id",
        "title": "Course Title",
        "description": "Course description",
        "category": "Technology",
        "duration": 12,
        "price": 299.99,
        "mode": ["ONLINE", "OFFLINE"],
        "status": "APPROVED",
        "applicationFee": 50.0,
        "difficulty": "BEGINNER",
        "prerequisites": ["Basic knowledge"],
        "learningObjectives": ["Learn X", "Master Y"],
        "certificateAwarded": true,
        "instructor": {
          "id": "instructor-id",
          "name": "Instructor Name",
          "email": "instructor@example.com"
        },
        "_count": {
          "enrollments": 25,
          "applications": 50
        },
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 20,
      "pages": 5
    }
  }
}
```

#### GET `/api/courses/cached`

Get cached course data for better performance.

**Query Parameters:** Same as `/api/courses`

#### GET `/api/courses/[id]`

Get a specific course by ID.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "course-id",
    "title": "Course Title",
    "description": "Detailed course description",
    "category": "Technology",
    "duration": 12,
    "price": 299.99,
    "mode": ["ONLINE", "OFFLINE"],
    "status": "APPROVED",
    "applicationFee": 50.0,
    "difficulty": "BEGINNER",
    "prerequisites": ["Basic knowledge"],
    "learningObjectives": ["Learn X", "Master Y"],
    "certificateAwarded": true,
    "instructor": {
      "id": "instructor-id",
      "name": "Instructor Name",
      "email": "instructor@example.com",
      "profile": {
        "avatar": "avatar-url"
      }
    },
    "lessons": [
      {
        "id": "lesson-id",
        "title": "Lesson Title",
        "description": "Lesson description",
        "content": "Lesson content",
        "videoUrl": "video-url",
        "order": 1,
        "type": "VIDEO",
        "duration": 30,
        "isPublished": true
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Instructor Endpoints

#### POST `/api/courses` (Instructor Only)

Create a new course.

**Request Body:**

```json
{
  "title": "Course Title",
  "description": "Course description",
  "category": "Technology",
  "duration": 12,
  "price": 299.99,
  "mode": ["ONLINE", "OFFLINE"],
  "applicationFee": 50.0,
  "installmentEnabled": true,
  "installmentPlan": {
    "upfront": 40,
    "midCourse": 30,
    "completion": 30
  },
  "prerequisites": ["Basic knowledge"],
  "learningObjectives": ["Learn X", "Master Y"],
  "certificateAwarded": true
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "course-id",
    "title": "Course Title",
    "status": "DRAFT",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Course created successfully"
}
```

---

## 📝 Applications

### Student Endpoints

#### POST `/api/applications` (Student Only)

Submit a course application.

**Request Body:**

```json
{
  "courseId": "course-id",
  "formData": {
    "motivation": "Why I want to take this course",
    "experience": "My relevant experience",
    "goals": "What I hope to achieve"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "application-id",
    "status": "PENDING",
    "submittedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Application submitted successfully"
}
```

#### GET `/api/applications` (Student Only)

Get user's applications.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "application-id",
      "status": "PENDING",
      "formData": {...},
      "submittedAt": "2024-01-01T00:00:00.000Z",
      "course": {
        "id": "course-id",
        "title": "Course Title",
        "price": 299.99
      }
    }
  ]
}
```

### Admin Endpoints

#### GET `/api/admin/applications` (Admin Only)

Get all applications with filtering.

**Query Parameters:**

- `status` - Application status
- `courseId` - Filter by course
- `limit` - Results per page
- `page` - Page number

#### PUT `/api/admin/applications/[id]` (Admin Only)

Update application status.

**Request Body:**

```json
{
  "status": "APPROVED",
  "reviewNotes": "Application approved based on strong motivation"
}
```

---

## 💳 Payments

#### POST `/api/payments/initialize` (Authenticated)

Initialize a payment.

**Request Body:**

```json
{
  "type": "APPLICATION_FEE",
  "courseId": "course-id",
  "amount": 50.0
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "authorizationUrl": "https://checkout.paystack.co/...",
    "reference": "KM_1234567890_ABC123",
    "accessCode": "access-code"
  },
  "message": "Payment initialized successfully"
}
```

#### POST `/api/payments/verify`

Verify payment status.

**Request Body:**

```json
{
  "reference": "KM_1234567890_ABC123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "status": "success",
    "reference": "KM_1234567890_ABC123",
    "amount": 50.0,
    "paidAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Payment verified successfully"
}
```

---

## 📁 File Upload

#### POST `/api/upload` (Authenticated)

Upload files to the platform.

**Request:** Multipart form data

- `file` - The file to upload
- `type` - Upload type (course_material, profile_avatar, application_document, lesson_resource)
- `courseId` - Course ID (if applicable)
- `lessonId` - Lesson ID (if applicable)

**Response:**

```json
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/...",
    "publicId": "file-public-id",
    "size": 1024000,
    "format": "pdf",
    "resourceType": "raw"
  },
  "message": "File uploaded successfully"
}
```

---

## 🏥 Health Check

#### GET `/api/health`

Check application health status.

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "database": {
      "status": "healthy",
      "responseTime": 15
    },
    "api": {
      "status": "healthy",
      "responseTime": 25
    }
  },
  "version": "1.0.0",
  "uptime": 3600
}
```

#### GET `/api/health/db`

Check database connectivity.

**Response:**

```json
{
  "status": "healthy",
  "responseTime": "15ms",
  "data": {
    "connected": true,
    "userCount": 150,
    "courseCount": 25,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## 📊 Dashboard Endpoints

### Admin Dashboard

#### GET `/api/admin/stats` (Admin Only)

Get dashboard statistics.

**Response:**

```json
{
  "success": true,
  "data": {
    "users": {
      "total": 150,
      "students": 120,
      "instructors": 25,
      "admins": 5,
      "newThisMonth": 15
    },
    "courses": {
      "total": 25,
      "published": 20,
      "draft": 3,
      "pending": 2,
      "newThisMonth": 5
    },
    "applications": {
      "total": 200,
      "pending": 15,
      "approved": 150,
      "rejected": 35,
      "newThisMonth": 25
    },
    "payments": {
      "total": 12500.0,
      "thisMonth": 2500.0,
      "pending": 500.0,
      "completed": 12000.0
    }
  }
}
```

### Instructor Dashboard

#### GET `/api/instructor/courses` (Instructor Only)

Get instructor's courses.

#### GET `/api/instructor/students` (Instructor Only)

Get students enrolled in instructor's courses.

### Student Dashboard

#### GET `/api/student/applications` (Student Only)

Get student's applications.

#### GET `/api/student/enrollments` (Student Only)

Get student's enrollments.

---

## 🔒 Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

**Common HTTP Status Codes:**

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `429` - Rate Limited
- `500` - Internal Server Error

---

## 🚀 Rate Limiting

API endpoints are rate limited to prevent abuse:

- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 attempts per 15 minutes
- **File Upload**: 10 uploads per hour
- **Payments**: 3 attempts per minute

Rate limit headers are included in responses:

- `X-RateLimit-Limit` - Request limit
- `X-RateLimit-Remaining` - Remaining requests
- `X-RateLimit-Reset` - Reset timestamp
- `Retry-After` - Seconds to wait before retrying

---

## 📝 Notes

- All timestamps are in ISO 8601 format (UTC)
- File uploads are limited to 10MB
- Supported file types: JPEG, PNG, WebP, MP4, PDF, DOC, DOCX
- JWT tokens expire in 15 minutes (access) and 7 days (refresh)
- Use HTTPS in production
- All endpoints support CORS for configured origins
