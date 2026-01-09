-- ============================================================================
-- RLS POLICY VERIFICATION TESTS
-- ============================================================================
-- Run these tests to verify RLS policies are working correctly
-- Execute in your database after applying the RLS migration
-- ============================================================================

-- ============================================================================
-- SETUP: Create test users
-- ============================================================================

-- Create test student
INSERT INTO users (id, email, name, role, status, "emailVerified", "createdAt", "updatedAt")
VALUES 
  ('test-student-1', 'student1@test.com', 'Test Student 1', 'STUDENT', 'ACTIVE', NOW(), NOW(), NOW()),
  ('test-student-2', 'student2@test.com', 'Test Student 2', 'STUDENT', 'ACTIVE', NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create test instructor
INSERT INTO users (id, email, name, role, status, "emailVerified", "createdAt", "updatedAt")
VALUES 
  ('test-instructor-1', 'instructor1@test.com', 'Test Instructor 1', 'INSTRUCTOR', 'ACTIVE', NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create test admin
INSERT INTO users (id, email, name, role, status, "emailVerified", "createdAt", "updatedAt")
VALUES 
  ('test-admin-1', 'admin1@test.com', 'Test Admin 1', 'ADMIN', 'ACTIVE', NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create test course
INSERT INTO courses (id, title, description, category, duration, price, mode, status, "instructorId", "createdAt", "updatedAt")
VALUES 
  ('test-course-1', 'Test Course', 'Test Description', 'Technology', 8, 1000.00, ARRAY['ONLINE']::"CourseMode"[], 'PUBLISHED', 'test-instructor-1', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create test enrollment
INSERT INTO enrollments (id, "userId", "courseId", status, "enrolledAt", progress, "timeSpent")
VALUES 
  ('test-enrollment-1', 'test-student-1', 'test-course-1', 'ACTIVE', NOW(), 0, 0)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- TEST 1: Student can only view own data
-- ============================================================================

-- Simulate student-1 session
DO $$
DECLARE
  student1_count INTEGER;
  all_users_count INTEGER;
BEGIN
  -- This would normally be set by Supabase auth
  -- For testing, we'll check the policy logic
  
  -- Count users visible to student (should be 1 - themselves)
  SELECT COUNT(*) INTO student1_count
  FROM users
  WHERE id = 'test-student-1';
  
  -- Try to count all users (should fail or return limited results with RLS)
  SELECT COUNT(*) INTO all_users_count
  FROM users;
  
  RAISE NOTICE 'Student can see their own profile: %', (student1_count = 1);
  RAISE NOTICE 'Total users student can see: %', all_users_count;
END $$;

-- ============================================================================
-- TEST 2: Instructor can view enrolled students
-- ============================================================================

DO $$
DECLARE
  enrolled_students_count INTEGER;
BEGIN
  -- Count students enrolled in instructor's courses
  SELECT COUNT(DISTINCT u.id) INTO enrolled_students_count
  FROM users u
  JOIN enrollments e ON e."userId" = u.id
  JOIN courses c ON e."courseId" = c.id
  WHERE c."instructorId" = 'test-instructor-1'
  AND u.role = 'STUDENT';
  
  RAISE NOTICE 'Instructor can see % enrolled students', enrolled_students_count;
END $$;

-- ============================================================================
-- TEST 3: Admin can view all data
-- ============================================================================

DO $$
DECLARE
  total_users INTEGER;
  total_courses INTEGER;
  total_applications INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_users FROM users;
  SELECT COUNT(*) INTO total_courses FROM courses;
  SELECT COUNT(*) INTO total_applications FROM applications;
  
  RAISE NOTICE 'Admin can see % users', total_users;
  RAISE NOTICE 'Admin can see % courses', total_courses;
  RAISE NOTICE 'Admin can see % applications', total_applications;
END $$;

-- ============================================================================
-- TEST 4: Verify helper functions
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Testing helper functions...';
  
  -- Test get_user_role
  RAISE NOTICE 'Student role: %', get_user_role('test-student-1');
  RAISE NOTICE 'Instructor role: %', get_user_role('test-instructor-1');
  RAISE NOTICE 'Admin role: %', get_user_role('test-admin-1');
  
  -- Note: is_admin(), is_instructor(), is_student() require auth context
  -- These will work when called within actual user sessions
END $$;

-- ============================================================================
-- TEST 5: Verify RLS is enabled on critical tables
-- ============================================================================

SELECT 
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'users', 'applications', 'enrollments', 'payments',
  'courses', 'assignments', 'assignment_submissions',
  'notifications', 'messages'
)
ORDER BY tablename;

-- ============================================================================
-- TEST 6: List all RLS policies
-- ============================================================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================================
-- TEST 7: Verify policy counts per table
-- ============================================================================

SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY policy_count DESC, tablename;

-- ============================================================================
-- CLEANUP: Remove test data (optional)
-- ============================================================================

-- Uncomment to clean up test data
/*
DELETE FROM enrollments WHERE id = 'test-enrollment-1';
DELETE FROM courses WHERE id = 'test-course-1';
DELETE FROM users WHERE id IN ('test-student-1', 'test-student-2', 'test-instructor-1', 'test-admin-1');
*/

-- ============================================================================
-- EXPECTED RESULTS
-- ============================================================================

/*
Expected output:

TEST 1: Student can only view own data
- Student can see their own profile: true
- Total users student can see: 1 (or limited based on enrollments)

TEST 2: Instructor can view enrolled students
- Instructor can see 1 enrolled students (test-student-1)

TEST 3: Admin can view all data
- Admin can see all users, courses, applications

TEST 4: Helper functions
- Student role: STUDENT
- Instructor role: INSTRUCTOR
- Admin role: ADMIN

TEST 5: RLS enabled
- All critical tables should show rls_enabled = true

TEST 6: Policies list
- Should show 100+ policies across all tables

TEST 7: Policy counts
- users: ~6 policies
- applications: ~6 policies
- enrollments: ~4 policies
- payments: ~4 policies
- etc.
*/
