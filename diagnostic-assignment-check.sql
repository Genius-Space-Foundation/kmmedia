-- Diagnostic Query: Check Assignment Visibility Issue
-- Replace the placeholders with actual values

-- 1. Check student's enrollments
SELECT 
  e.id as enrollment_id,
  e.status as enrollment_status,
  e.userId as student_id,
  u.name as student_name,
  u.email as student_email,
  c.id as course_id,
  c.title as course_title
FROM "Enrollment" e
JOIN "User" u ON u.id = e.userId
JOIN "Course" c ON c.id = e.courseId
WHERE u.email = 'STUDENT_EMAIL_HERE'  -- Replace with actual student email
  OR u.id = 'STUDENT_ID_HERE';        -- Or replace with actual student ID

-- 2. Check published assessments (type: ASSIGNMENT) for the course
SELECT 
  a.id as assessment_id,
  a.title,
  a.type,
  a.isPublished,
  a.dueDate,
  a.courseId,
  c.title as course_title,
  c.instructorId
FROM "Assessment" a
JOIN "Course" c ON c.id = a.courseId
WHERE a.type = 'ASSIGNMENT'
  AND c.id = 'COURSE_ID_HERE'         -- Replace with actual course ID
ORDER BY a.createdAt DESC;

-- 3. Check if student has submissions for these assessments
SELECT 
  asub.id as submission_id,
  asub.assessmentId,
  a.title as assessment_title,
  asub.status,
  asub.submittedAt,
  asub.studentId,
  u.name as student_name
FROM "AssessmentSubmission" asub
JOIN "Assessment" a ON a.id = asub.assessmentId
JOIN "User" u ON u.id = asub.studentId
WHERE asub.studentId = 'STUDENT_ID_HERE'  -- Replace with actual student ID
  AND a.type = 'ASSIGNMENT'
ORDER BY asub.submittedAt DESC;

-- 4. Combined check: What assignments SHOULD the student see?
SELECT 
  a.id as assessment_id,
  a.title,
  a.isPublished,
  a.dueDate,
  c.title as course_title,
  e.status as enrollment_status,
  CASE 
    WHEN a.isPublished = true AND e.status = 'ACTIVE' THEN 'SHOULD BE VISIBLE'
    WHEN a.isPublished = false THEN 'NOT PUBLISHED'
    WHEN e.status != 'ACTIVE' THEN 'NOT ENROLLED OR INACTIVE'
    ELSE 'CHECK OTHER CONDITIONS'
  END as visibility_status
FROM "Assessment" a
JOIN "Course" c ON c.id = a.courseId
LEFT JOIN "Enrollment" e ON e.courseId = c.id 
  AND e.userId = 'STUDENT_ID_HERE'    -- Replace with actual student ID
WHERE a.type = 'ASSIGNMENT'
  AND c.id = 'COURSE_ID_HERE'         -- Replace with actual course ID
ORDER BY a.createdAt DESC;
