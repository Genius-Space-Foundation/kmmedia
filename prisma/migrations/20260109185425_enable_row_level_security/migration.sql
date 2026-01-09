-- ============================================================================
-- ROW LEVEL SECURITY (RLS) MIGRATION
-- ============================================================================
-- This migration enables Row Level Security on all sensitive tables and
-- creates policies to enforce role-based access control.
--
-- IMPORTANT: This migration assumes you're using Supabase with auth.uid()
-- If using a different auth system, modify the helper functions accordingly.
-- ============================================================================

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get current user ID from Supabase auth
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS TEXT AS $$
BEGIN
  RETURN auth.uid()::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id TEXT)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM users WHERE id = user_id;
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role(current_user_id()) = 'ADMIN';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user is instructor
CREATE OR REPLACE FUNCTION is_instructor()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role(current_user_id()) = 'INSTRUCTOR';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user is student
CREATE OR REPLACE FUNCTION is_student()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role(current_user_id()) = 'STUDENT';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- USERS TABLE
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "users_select_own"
ON users FOR SELECT
USING (id = current_user_id());

-- Admins can view all users
CREATE POLICY "users_select_admin"
ON users FOR SELECT
USING (is_admin());

-- Instructors can view students enrolled in their courses
CREATE POLICY "users_select_instructor_students"
ON users FOR SELECT
USING (
  is_instructor() AND
  role = 'STUDENT' AND
  EXISTS (
    SELECT 1 FROM enrollments e
    JOIN courses c ON e."courseId" = c.id
    WHERE e."userId" = users.id
    AND c."instructorId" = current_user_id()
  )
);

-- Users can update their own profile (but not role/status)
CREATE POLICY "users_update_own"
ON users FOR UPDATE
USING (id = current_user_id())
WITH CHECK (
  id = current_user_id() AND
  role = (SELECT role FROM users WHERE id = current_user_id()) AND
  status = (SELECT status FROM users WHERE id = current_user_id())
);

-- Admins can update any user
CREATE POLICY "users_update_admin"
ON users FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

-- Admins can insert users
CREATE POLICY "users_insert_admin"
ON users FOR INSERT
WITH CHECK (is_admin());

-- Admins can delete users
CREATE POLICY "users_delete_admin"
ON users FOR DELETE
USING (is_admin());

-- ============================================================================
-- USER PROFILES TABLE
-- ============================================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "user_profiles_select_own"
ON user_profiles FOR SELECT
USING ("userId" = current_user_id());

-- Admins can view all profiles
CREATE POLICY "user_profiles_select_admin"
ON user_profiles FOR SELECT
USING (is_admin());

-- Instructors can view enrolled students' profiles
CREATE POLICY "user_profiles_select_instructor_students"
ON user_profiles FOR SELECT
USING (
  is_instructor() AND
  EXISTS (
    SELECT 1 FROM users u
    JOIN enrollments e ON e."userId" = u.id
    JOIN courses c ON e."courseId" = c.id
    WHERE u.id = user_profiles."userId"
    AND u.role = 'STUDENT'
    AND c."instructorId" = current_user_id()
  )
);

-- Users can update their own profile
CREATE POLICY "user_profiles_update_own"
ON user_profiles FOR UPDATE
USING ("userId" = current_user_id())
WITH CHECK ("userId" = current_user_id());

-- Users can insert their own profile
CREATE POLICY "user_profiles_insert_own"
ON user_profiles FOR INSERT
WITH CHECK ("userId" = current_user_id());

-- Admins can manage all profiles
CREATE POLICY "user_profiles_all_admin"
ON user_profiles FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- ============================================================================
-- APPLICATIONS TABLE
-- ============================================================================

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Students can view their own applications
CREATE POLICY "applications_select_own"
ON applications FOR SELECT
USING ("userId" = current_user_id());

-- Students can create their own applications
CREATE POLICY "applications_insert_own"
ON applications FOR INSERT
WITH CHECK ("userId" = current_user_id());

-- Students can update their own pending applications
CREATE POLICY "applications_update_own"
ON applications FOR UPDATE
USING ("userId" = current_user_id() AND status = 'PENDING')
WITH CHECK ("userId" = current_user_id());

-- Admins can view all applications
CREATE POLICY "applications_select_admin"
ON applications FOR SELECT
USING (is_admin());

-- Admins can update all applications
CREATE POLICY "applications_update_admin"
ON applications FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

-- Instructors can view applications for their courses
CREATE POLICY "applications_select_instructor"
ON applications FOR SELECT
USING (
  is_instructor() AND
  EXISTS (
    SELECT 1 FROM courses c
    WHERE c.id = applications."courseId"
    AND c."instructorId" = current_user_id()
  )
);

-- ============================================================================
-- APPLICATION DRAFTS TABLE
-- ============================================================================

ALTER TABLE application_drafts ENABLE ROW LEVEL SECURITY;

-- Users can manage their own drafts
CREATE POLICY "application_drafts_all_own"
ON application_drafts FOR ALL
USING ("userId" = current_user_id())
WITH CHECK ("userId" = current_user_id());

-- Admins can view all drafts
CREATE POLICY "application_drafts_select_admin"
ON application_drafts FOR SELECT
USING (is_admin());

-- ============================================================================
-- ENROLLMENTS TABLE
-- ============================================================================

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Students can view their own enrollments
CREATE POLICY "enrollments_select_own"
ON enrollments FOR SELECT
USING ("userId" = current_user_id());

-- Instructors can view enrollments for their courses
CREATE POLICY "enrollments_select_instructor"
ON enrollments FOR SELECT
USING (
  is_instructor() AND
  EXISTS (
    SELECT 1 FROM courses c
    WHERE c.id = enrollments."courseId"
    AND c."instructorId" = current_user_id()
  )
);

-- Instructors can update enrollments for their courses (e.g., progress tracking)
CREATE POLICY "enrollments_update_instructor"
ON enrollments FOR UPDATE
USING (
  is_instructor() AND
  EXISTS (
    SELECT 1 FROM courses c
    WHERE c.id = enrollments."courseId"
    AND c."instructorId" = current_user_id()
  )
)
WITH CHECK (
  is_instructor() AND
  EXISTS (
    SELECT 1 FROM courses c
    WHERE c.id = enrollments."courseId"
    AND c."instructorId" = current_user_id()
  )
);

-- Admins can manage all enrollments
CREATE POLICY "enrollments_all_admin"
ON enrollments FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- ============================================================================
-- PAYMENTS TABLE
-- ============================================================================

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own payments
CREATE POLICY "payments_select_own"
ON payments FOR SELECT
USING ("userId" = current_user_id());

-- Users can create their own payments
CREATE POLICY "payments_insert_own"
ON payments FOR INSERT
WITH CHECK ("userId" = current_user_id());

-- Admins can manage all payments
CREATE POLICY "payments_all_admin"
ON payments FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Instructors can view payments for their courses (read-only)
CREATE POLICY "payments_select_instructor"
ON payments FOR SELECT
USING (
  is_instructor() AND
  EXISTS (
    SELECT 1 FROM enrollments e
    JOIN courses c ON e."courseId" = c.id
    WHERE e.id = payments."enrollmentId"
    AND c."instructorId" = current_user_id()
  )
);

-- ============================================================================
-- PAYMENT PLANS TABLE
-- ============================================================================

ALTER TABLE payment_plans ENABLE ROW LEVEL SECURITY;

-- Users can view their own payment plans
CREATE POLICY "payment_plans_select_own"
ON payment_plans FOR SELECT
USING ("userId" = current_user_id());

-- Admins can manage all payment plans
CREATE POLICY "payment_plans_all_admin"
ON payment_plans FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- ============================================================================
-- PAYMENT INSTALLMENTS TABLE
-- ============================================================================

ALTER TABLE payment_installments ENABLE ROW LEVEL SECURITY;

-- Users can view their own installments
CREATE POLICY "payment_installments_select_own"
ON payment_installments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM payment_plans pp
    WHERE pp.id = payment_installments."paymentPlanId"
    AND pp."userId" = current_user_id()
  )
);

-- Admins can manage all installments
CREATE POLICY "payment_installments_all_admin"
ON payment_installments FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- ============================================================================
-- COURSES TABLE
-- ============================================================================

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view published courses
CREATE POLICY "courses_select_published"
ON courses FOR SELECT
USING (status = 'PUBLISHED');

-- Instructors can view their own courses (any status)
CREATE POLICY "courses_select_own_instructor"
ON courses FOR SELECT
USING (
  is_instructor() AND
  "instructorId" = current_user_id()
);

-- Instructors can manage their own courses
CREATE POLICY "courses_all_own_instructor"
ON courses FOR ALL
USING ("instructorId" = current_user_id())
WITH CHECK ("instructorId" = current_user_id());

-- Admins can manage all courses
CREATE POLICY "courses_all_admin"
ON courses FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- ============================================================================
-- COURSE TEMPLATES TABLE
-- ============================================================================

ALTER TABLE course_templates ENABLE ROW LEVEL SECURITY;

-- Instructors can view public templates
CREATE POLICY "course_templates_select_public"
ON course_templates FOR SELECT
USING ("isPublic" = true);

-- Instructors can manage their own templates
CREATE POLICY "course_templates_all_own"
ON course_templates FOR ALL
USING ("instructorId" = current_user_id())
WITH CHECK ("instructorId" = current_user_id());

-- Admins can manage all templates
CREATE POLICY "course_templates_all_admin"
ON course_templates FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- ============================================================================
-- LESSONS TABLE
-- ============================================================================

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Students can view lessons for enrolled courses
CREATE POLICY "lessons_select_enrolled"
ON lessons FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM enrollments e
    WHERE e."courseId" = lessons."courseId"
    AND e."userId" = current_user_id()
    AND e.status = 'ACTIVE'
  )
);

-- Instructors can view lessons for published courses
CREATE POLICY "lessons_select_published_courses"
ON lessons FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM courses c
    WHERE c.id = lessons."courseId"
    AND c.status = 'PUBLISHED'
  )
);

-- Instructors can manage lessons for their courses
CREATE POLICY "lessons_all_instructor"
ON lessons FOR ALL
USING (
  is_instructor() AND
  EXISTS (
    SELECT 1 FROM courses c
    WHERE c.id = lessons."courseId"
    AND c."instructorId" = current_user_id()
  )
)
WITH CHECK (
  is_instructor() AND
  EXISTS (
    SELECT 1 FROM courses c
    WHERE c.id = lessons."courseId"
    AND c."instructorId" = current_user_id()
  )
);

-- Admins can manage all lessons
CREATE POLICY "lessons_all_admin"
ON lessons FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- ============================================================================
-- RESOURCES TABLE
-- ============================================================================

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Students can view resources for enrolled courses
CREATE POLICY "resources_select_enrolled"
ON resources FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM lessons l
    JOIN enrollments e ON e."courseId" = l."courseId"
    WHERE l.id = resources."lessonId"
    AND e."userId" = current_user_id()
    AND e.status = 'ACTIVE'
  )
);

-- Instructors can manage resources for their courses
CREATE POLICY "resources_all_instructor"
ON resources FOR ALL
USING (
  is_instructor() AND
  EXISTS (
    SELECT 1 FROM lessons l
    JOIN courses c ON c.id = l."courseId"
    WHERE l.id = resources."lessonId"
    AND c."instructorId" = current_user_id()
  )
)
WITH CHECK (
  is_instructor() AND
  EXISTS (
    SELECT 1 FROM lessons l
    JOIN courses c ON c.id = l."courseId"
    WHERE l.id = resources."lessonId"
    AND c."instructorId" = current_user_id()
  )
);

-- Admins can manage all resources
CREATE POLICY "resources_all_admin"
ON resources FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- ============================================================================
-- LESSON COMPLETIONS TABLE
-- ============================================================================

ALTER TABLE lesson_completions ENABLE ROW LEVEL SECURITY;

-- Students can view their own completions
CREATE POLICY "lesson_completions_select_own"
ON lesson_completions FOR SELECT
USING ("userId" = current_user_id());

-- Students can create their own completions
CREATE POLICY "lesson_completions_insert_own"
ON lesson_completions FOR INSERT
WITH CHECK ("userId" = current_user_id());

-- Instructors can view completions for their courses
CREATE POLICY "lesson_completions_select_instructor"
ON lesson_completions FOR SELECT
USING (
  is_instructor() AND
  EXISTS (
    SELECT 1 FROM lessons l
    JOIN courses c ON c.id = l."courseId"
    WHERE l.id = lesson_completions."lessonId"
    AND c."instructorId" = current_user_id()
  )
);

-- Admins can view all completions
CREATE POLICY "lesson_completions_select_admin"
ON lesson_completions FOR SELECT
USING (is_admin());

-- ============================================================================
-- ASSIGNMENTS TABLE
-- ============================================================================

ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- Students can view published assignments for enrolled courses
CREATE POLICY "assignments_select_enrolled"
ON assignments FOR SELECT
USING (
  "isPublished" = true AND
  EXISTS (
    SELECT 1 FROM enrollments e
    WHERE e."courseId" = assignments."courseId"
    AND e."userId" = current_user_id()
    AND e.status = 'ACTIVE'
  )
);

-- Instructors can manage their own course assignments
CREATE POLICY "assignments_all_instructor"
ON assignments FOR ALL
USING ("instructorId" = current_user_id())
WITH CHECK ("instructorId" = current_user_id());

-- Admins can manage all assignments
CREATE POLICY "assignments_all_admin"
ON assignments FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- ============================================================================
-- ASSIGNMENT SUBMISSIONS TABLE
-- ============================================================================

ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;

-- Students can manage their own submissions
CREATE POLICY "assignment_submissions_all_own"
ON assignment_submissions FOR ALL
USING ("studentId" = current_user_id())
WITH CHECK ("studentId" = current_user_id());

-- Instructors can view and grade submissions for their assignments
CREATE POLICY "assignment_submissions_all_instructor"
ON assignment_submissions FOR ALL
USING (
  is_instructor() AND
  EXISTS (
    SELECT 1 FROM assignments a
    WHERE a.id = assignment_submissions."assignmentId"
    AND a."instructorId" = current_user_id()
  )
)
WITH CHECK (
  is_instructor() AND
  EXISTS (
    SELECT 1 FROM assignments a
    WHERE a.id = assignment_submissions."assignmentId"
    AND a."instructorId" = current_user_id()
  )
);

-- Admins can manage all submissions
CREATE POLICY "assignment_submissions_all_admin"
ON assignment_submissions FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- ============================================================================
-- ASSIGNMENT EXTENSIONS TABLE
-- ============================================================================

ALTER TABLE assignment_extensions ENABLE ROW LEVEL SECURITY;

-- Students can view their own extensions
CREATE POLICY "assignment_extensions_select_own"
ON assignment_extensions FOR SELECT
USING ("studentId" = current_user_id());

-- Instructors can manage extensions for their assignments
CREATE POLICY "assignment_extensions_all_instructor"
ON assignment_extensions FOR ALL
USING (
  is_instructor() AND
  EXISTS (
    SELECT 1 FROM assignments a
    WHERE a.id = assignment_extensions."assignmentId"
    AND a."instructorId" = current_user_id()
  )
)
WITH CHECK (
  is_instructor() AND
  EXISTS (
    SELECT 1 FROM assignments a
    WHERE a.id = assignment_extensions."assignmentId"
    AND a."instructorId" = current_user_id()
  )
);

-- Admins can manage all extensions
CREATE POLICY "assignment_extensions_all_admin"
ON assignment_extensions FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- ============================================================================
-- GRADING HISTORY TABLE
-- ============================================================================

ALTER TABLE grading_history ENABLE ROW LEVEL SECURITY;

-- Students can view their own grading history
CREATE POLICY "grading_history_select_own"
ON grading_history FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM assignment_submissions asub
    WHERE asub.id = grading_history."submissionId"
    AND asub."studentId" = current_user_id()
  )
);

-- Instructors can view and create history for their assignments
CREATE POLICY "grading_history_all_instructor"
ON grading_history FOR ALL
USING (
  is_instructor() AND
  EXISTS (
    SELECT 1 FROM assignment_submissions asub
    JOIN assignments a ON a.id = asub."assignmentId"
    WHERE asub.id = grading_history."submissionId"
    AND a."instructorId" = current_user_id()
  )
)
WITH CHECK (
  is_instructor() AND
  EXISTS (
    SELECT 1 FROM assignment_submissions asub
    JOIN assignments a ON a.id = asub."assignmentId"
    WHERE asub.id = grading_history."submissionId"
    AND a."instructorId" = current_user_id()
  )
);

-- Admins can view all grading history
CREATE POLICY "grading_history_select_admin"
ON grading_history FOR SELECT
USING (is_admin());

-- ============================================================================
-- ASSIGNMENT REMINDERS TABLE
-- ============================================================================

ALTER TABLE assignment_reminders ENABLE ROW LEVEL SECURITY;

-- Instructors can manage reminders for their assignments
CREATE POLICY "assignment_reminders_all_instructor"
ON assignment_reminders FOR ALL
USING (
  is_instructor() AND
  EXISTS (
    SELECT 1 FROM assignments a
    WHERE a.id = assignment_reminders."assignmentId"
    AND a."instructorId" = current_user_id()
  )
)
WITH CHECK (
  is_instructor() AND
  EXISTS (
    SELECT 1 FROM assignments a
    WHERE a.id = assignment_reminders."assignmentId"
    AND a."instructorId" = current_user_id()
  )
);

-- Admins can manage all reminders
CREATE POLICY "assignment_reminders_all_admin"
ON assignment_reminders FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- ============================================================================
-- ASSESSMENTS TABLE
-- ============================================================================

ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- Students can view published assessments for enrolled courses
CREATE POLICY "assessments_select_enrolled"
ON assessments FOR SELECT
USING (
  "isPublished" = true AND
  EXISTS (
    SELECT 1 FROM enrollments e
    WHERE e."courseId" = assessments."courseId"
    AND e."userId" = current_user_id()
    AND e.status = 'ACTIVE'
  )
);

-- Instructors can manage their own course assessments
CREATE POLICY "assessments_all_instructor"
ON assessments FOR ALL
USING ("instructorId" = current_user_id())
WITH CHECK ("instructorId" = current_user_id());

-- Admins can manage all assessments
CREATE POLICY "assessments_all_admin"
ON assessments FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- ============================================================================
-- QUESTIONS TABLE
-- ============================================================================

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Students can view questions for published assessments they're enrolled in
CREATE POLICY "questions_select_enrolled"
ON questions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM assessments a
    JOIN enrollments e ON e."courseId" = a."courseId"
    WHERE a.id = questions."assessmentId"
    AND a."isPublished" = true
    AND e."userId" = current_user_id()
    AND e.status = 'ACTIVE'
  )
);

-- Instructors can manage questions for their assessments
CREATE POLICY "questions_all_instructor"
ON questions FOR ALL
USING (
  is_instructor() AND
  EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = questions."assessmentId"
    AND a."instructorId" = current_user_id()
  )
)
WITH CHECK (
  is_instructor() AND
  EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = questions."assessmentId"
    AND a."instructorId" = current_user_id()
  )
);

-- Admins can manage all questions
CREATE POLICY "questions_all_admin"
ON questions FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- ============================================================================
-- ASSESSMENT SUBMISSIONS TABLE
-- ============================================================================

ALTER TABLE assessment_submissions ENABLE ROW LEVEL SECURITY;

-- Students can manage their own submissions
CREATE POLICY "assessment_submissions_all_own"
ON assessment_submissions FOR ALL
USING ("studentId" = current_user_id())
WITH CHECK ("studentId" = current_user_id());

-- Instructors can view and grade submissions for their assessments
CREATE POLICY "assessment_submissions_all_instructor"
ON assessment_submissions FOR ALL
USING (
  is_instructor() AND
  EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = assessment_submissions."assessmentId"
    AND a."instructorId" = current_user_id()
  )
)
WITH CHECK (
  is_instructor() AND
  EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = assessment_submissions."assessmentId"
    AND a."instructorId" = current_user_id()
  )
);

-- Admins can manage all submissions
CREATE POLICY "assessment_submissions_all_admin"
ON assessment_submissions FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- ============================================================================
-- ANSWERS TABLE
-- ============================================================================

ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- Students can manage their own answers
CREATE POLICY "answers_all_own"
ON answers FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM assessment_submissions asub
    WHERE asub.id = answers."submissionId"
    AND asub."studentId" = current_user_id()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM assessment_submissions asub
    WHERE asub.id = answers."submissionId"
    AND asub."studentId" = current_user_id()
  )
);

-- Instructors can view answers for their assessments
CREATE POLICY "answers_select_instructor"
ON answers FOR SELECT
USING (
  is_instructor() AND
  EXISTS (
    SELECT 1 FROM assessment_submissions asub
    JOIN assessments a ON a.id = asub."assessmentId"
    WHERE asub.id = answers."submissionId"
    AND a."instructorId" = current_user_id()
  )
);

-- Admins can view all answers
CREATE POLICY "answers_select_admin"
ON answers FOR SELECT
USING (is_admin());

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "notifications_select_own"
ON notifications FOR SELECT
USING ("userId" = current_user_id());

-- Users can update their own notifications (mark as read)
CREATE POLICY "notifications_update_own"
ON notifications FOR UPDATE
USING ("userId" = current_user_id())
WITH CHECK ("userId" = current_user_id());

-- Users can delete their own notifications
CREATE POLICY "notifications_delete_own"
ON notifications FOR DELETE
USING ("userId" = current_user_id());

-- Admins can manage all notifications
CREATE POLICY "notifications_all_admin"
ON notifications FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- System can insert notifications (handled via service role)

-- ============================================================================
-- USER NOTIFICATION SETTINGS TABLE
-- ============================================================================

ALTER TABLE user_notification_settings ENABLE ROW LEVEL SECURITY;

-- Users can manage their own notification settings
CREATE POLICY "user_notification_settings_all_own"
ON user_notification_settings FOR ALL
USING ("userId" = current_user_id())
WITH CHECK ("userId" = current_user_id());

-- Admins can view all settings
CREATE POLICY "user_notification_settings_select_admin"
ON user_notification_settings FOR SELECT
USING (is_admin());

-- ============================================================================
-- MESSAGES TABLE
-- ============================================================================

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages they sent or received
CREATE POLICY "messages_select_own"
ON messages FOR SELECT
USING (
  "senderId" = current_user_id() OR
  "recipientId" = current_user_id()
);

-- Users can send messages
CREATE POLICY "messages_insert_own"
ON messages FOR INSERT
WITH CHECK ("senderId" = current_user_id());

-- Users can update messages they sent
CREATE POLICY "messages_update_own"
ON messages FOR UPDATE
USING ("senderId" = current_user_id())
WITH CHECK ("senderId" = current_user_id());

-- Admins can manage all messages
CREATE POLICY "messages_all_admin"
ON messages FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- ============================================================================
-- ANNOUNCEMENTS TABLE
-- ============================================================================

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Students can view published announcements for enrolled courses
CREATE POLICY "announcements_select_enrolled"
ON announcements FOR SELECT
USING (
  "isPublished" = true AND
  (
    "targetAudience" = 'ALL_STUDENTS' OR
    EXISTS (
      SELECT 1 FROM enrollments e
      WHERE e."courseId" = announcements."courseId"
      AND e."userId" = current_user_id()
      AND e.status = 'ACTIVE'
    )
  )
);

-- Instructors can manage their own announcements
CREATE POLICY "announcements_all_instructor"
ON announcements FOR ALL
USING ("instructorId" = current_user_id())
WITH CHECK ("instructorId" = current_user_id());

-- Admins can manage all announcements
CREATE POLICY "announcements_all_admin"
ON announcements FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- ============================================================================
-- REVIEWS TABLE
-- ============================================================================

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- All users can view reviews for published courses
CREATE POLICY "reviews_select_published_courses"
ON reviews FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM courses c
    WHERE c.id = reviews."courseId"
    AND c.status = 'PUBLISHED'
  )
);

-- Students can create reviews for courses they're enrolled in
CREATE POLICY "reviews_insert_enrolled"
ON reviews FOR INSERT
WITH CHECK (
  "userId" = current_user_id() AND
  EXISTS (
    SELECT 1 FROM enrollments e
    WHERE e."courseId" = reviews."courseId"
    AND e."userId" = current_user_id()
  )
);

-- Users can update their own reviews
CREATE POLICY "reviews_update_own"
ON reviews FOR UPDATE
USING ("userId" = current_user_id())
WITH CHECK ("userId" = current_user_id());

-- Users can delete their own reviews
CREATE POLICY "reviews_delete_own"
ON reviews FOR DELETE
USING ("userId" = current_user_id());

-- Admins can manage all reviews
CREATE POLICY "reviews_all_admin"
ON reviews FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- ============================================================================
-- CERTIFICATES TABLE
-- ============================================================================

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Users can view their own certificates
CREATE POLICY "certificates_select_own"
ON certificates FOR SELECT
USING ("userId" = current_user_id());

-- Admins can manage all certificates
CREATE POLICY "certificates_all_admin"
ON certificates FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- System can insert certificates (handled via service role)

-- ============================================================================
-- SUPPORT TICKETS TABLE
-- ============================================================================

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Users can manage their own tickets
CREATE POLICY "support_tickets_all_own"
ON support_tickets FOR ALL
USING ("userId" = current_user_id())
WITH CHECK ("userId" = current_user_id());

-- Admins can manage all tickets
CREATE POLICY "support_tickets_all_admin"
ON support_tickets FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Instructors can view tickets from their students
CREATE POLICY "support_tickets_select_instructor_students"
ON support_tickets FOR SELECT
USING (
  is_instructor() AND
  EXISTS (
    SELECT 1 FROM users u
    JOIN enrollments e ON e."userId" = u.id
    JOIN courses c ON e."courseId" = c.id
    WHERE u.id = support_tickets."userId"
    AND u.role = 'STUDENT'
    AND c."instructorId" = current_user_id()
  )
);

-- ============================================================================
-- TICKET RESPONSES TABLE
-- ============================================================================

ALTER TABLE ticket_responses ENABLE ROW LEVEL SECURITY;

-- Users can view responses to their tickets
CREATE POLICY "ticket_responses_select_own_ticket"
ON ticket_responses FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM support_tickets st
    WHERE st.id = ticket_responses."ticketId"
    AND st."userId" = current_user_id()
  )
);

-- Users can create responses to their own tickets
CREATE POLICY "ticket_responses_insert_own_ticket"
ON ticket_responses FOR INSERT
WITH CHECK (
  "userId" = current_user_id() AND
  EXISTS (
    SELECT 1 FROM support_tickets st
    WHERE st.id = ticket_responses."ticketId"
    AND st."userId" = current_user_id()
  )
);

-- Admins can manage all responses
CREATE POLICY "ticket_responses_all_admin"
ON ticket_responses FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- ============================================================================
-- LEARNING PROFILES TABLE
-- ============================================================================

ALTER TABLE learning_profiles ENABLE ROW LEVEL SECURITY;

-- Users can manage their own learning profile
CREATE POLICY "learning_profiles_all_own"
ON learning_profiles FOR ALL
USING ("userId" = current_user_id())
WITH CHECK ("userId" = current_user_id());

-- Admins can view all learning profiles
CREATE POLICY "learning_profiles_select_admin"
ON learning_profiles FOR SELECT
USING (is_admin());

-- ============================================================================
-- ACHIEVEMENTS TABLE
-- ============================================================================

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- All users can view active achievements
CREATE POLICY "achievements_select_active"
ON achievements FOR SELECT
USING ("isActive" = true);

-- Admins can manage all achievements
CREATE POLICY "achievements_all_admin"
ON achievements FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- ============================================================================
-- USER ACHIEVEMENTS TABLE
-- ============================================================================

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Users can view their own achievements
CREATE POLICY "user_achievements_select_own"
ON user_achievements FOR SELECT
USING ("userId" = current_user_id());

-- Admins can manage all user achievements
CREATE POLICY "user_achievements_all_admin"
ON user_achievements FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- System can insert achievements (handled via service role)

-- ============================================================================
-- LEARNING STREAKS TABLE
-- ============================================================================

ALTER TABLE learning_streaks ENABLE ROW LEVEL SECURITY;

-- Users can manage their own learning streak
CREATE POLICY "learning_streaks_all_own"
ON learning_streaks FOR ALL
USING ("userId" = current_user_id())
WITH CHECK ("userId" = current_user_id());

-- Admins can view all streaks
CREATE POLICY "learning_streaks_select_admin"
ON learning_streaks FOR SELECT
USING (is_admin());

-- ============================================================================
-- BOOKMARKS TABLE
-- ============================================================================

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Users can manage their own bookmarks
CREATE POLICY "bookmarks_all_own"
ON bookmarks FOR ALL
USING ("userId" = current_user_id())
WITH CHECK ("userId" = current_user_id());

-- ============================================================================
-- DASHBOARD ACTIVITIES TABLE
-- ============================================================================

ALTER TABLE dashboard_activities ENABLE ROW LEVEL SECURITY;

-- Users can view their own activities
CREATE POLICY "dashboard_activities_select_own"
ON dashboard_activities FOR SELECT
USING ("userId" = current_user_id());

-- Users can create their own activities
CREATE POLICY "dashboard_activities_insert_own"
ON dashboard_activities FOR INSERT
WITH CHECK ("userId" = current_user_id());

-- Admins can view all activities
CREATE POLICY "dashboard_activities_select_admin"
ON dashboard_activities FOR SELECT
USING (is_admin());

-- ============================================================================
-- COURSE RECOMMENDATIONS TABLE
-- ============================================================================

ALTER TABLE course_recommendations ENABLE ROW LEVEL SECURITY;

-- Users can manage their own recommendations
CREATE POLICY "course_recommendations_all_own"
ON course_recommendations FOR ALL
USING ("userId" = current_user_id())
WITH CHECK ("userId" = current_user_id());

-- Admins can view all recommendations
CREATE POLICY "course_recommendations_select_admin"
ON course_recommendations FOR SELECT
USING (is_admin());

-- ============================================================================
-- DASHBOARD PREFERENCES TABLE
-- ============================================================================

ALTER TABLE dashboard_preferences ENABLE ROW LEVEL SECURITY;

-- Users can manage their own preferences
CREATE POLICY "dashboard_preferences_all_own"
ON dashboard_preferences FOR ALL
USING ("userId" = current_user_id())
WITH CHECK ("userId" = current_user_id());

-- ============================================================================
-- LIVE SESSIONS TABLE
-- ============================================================================

ALTER TABLE live_sessions ENABLE ROW LEVEL SECURITY;

-- Students can view sessions for enrolled courses
CREATE POLICY "live_sessions_select_enrolled"
ON live_sessions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM enrollments e
    WHERE e."courseId" = live_sessions."courseId"
    AND e."userId" = current_user_id()
    AND e.status = 'ACTIVE'
  )
);

-- Instructors can manage their own sessions
CREATE POLICY "live_sessions_all_instructor"
ON live_sessions FOR ALL
USING ("instructorId" = current_user_id())
WITH CHECK ("instructorId" = current_user_id());

-- Admins can manage all sessions
CREATE POLICY "live_sessions_all_admin"
ON live_sessions FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- ============================================================================
-- ATTENDANCE TABLE
-- ============================================================================

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Students can view their own attendance
CREATE POLICY "attendance_select_own"
ON attendance FOR SELECT
USING ("userId" = current_user_id());

-- Instructors can manage attendance for their courses
CREATE POLICY "attendance_all_instructor"
ON attendance FOR ALL
USING (
  is_instructor() AND
  EXISTS (
    SELECT 1 FROM courses c
    WHERE c.id = attendance."courseId"
    AND c."instructorId" = current_user_id()
  )
)
WITH CHECK (
  is_instructor() AND
  EXISTS (
    SELECT 1 FROM courses c
    WHERE c.id = attendance."courseId"
    AND c."instructorId" = current_user_id()
  )
);

-- Admins can manage all attendance
CREATE POLICY "attendance_all_admin"
ON attendance FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- ============================================================================
-- ACTIVITY LOGS TABLE
-- ============================================================================

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own activity logs
CREATE POLICY "activity_logs_select_own"
ON activity_logs FOR SELECT
USING ("userId" = current_user_id());

-- Admins can view all activity logs
CREATE POLICY "activity_logs_select_admin"
ON activity_logs FOR SELECT
USING (is_admin());

-- System can insert activity logs (handled via service role)
CREATE POLICY "activity_logs_insert_system"
ON activity_logs FOR INSERT
WITH CHECK (true);

-- ============================================================================
-- AUDIT LOGS TABLE
-- ============================================================================

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own audit logs
CREATE POLICY "audit_logs_select_own"
ON audit_logs FOR SELECT
USING ("userId" = current_user_id());

-- Admins can view all audit logs
CREATE POLICY "audit_logs_select_admin"
ON audit_logs FOR SELECT
USING (is_admin());

-- System can insert audit logs (append-only, no updates/deletes)
CREATE POLICY "audit_logs_insert_system"
ON audit_logs FOR INSERT
WITH CHECK (true);

-- ============================================================================
-- NEXTAUTH TABLES (Accounts, Sessions, Verification Tokens)
-- ============================================================================

-- Accounts table
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "accounts_all_own"
ON accounts FOR ALL
USING ("userId" = current_user_id())
WITH CHECK ("userId" = current_user_id());

CREATE POLICY "accounts_all_admin"
ON accounts FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Sessions table
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sessions_all_own"
ON sessions FOR ALL
USING ("userId" = current_user_id())
WITH CHECK ("userId" = current_user_id());

CREATE POLICY "sessions_all_admin"
ON sessions FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Verification tokens (no RLS needed - handled by NextAuth)
-- ALTER TABLE verification_tokens ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SYSTEM CONFIG TABLE
-- ============================================================================

ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- All users can view system config
CREATE POLICY "system_config_select_all"
ON system_config FOR SELECT
USING (true);

-- Only admins can modify system config
CREATE POLICY "system_config_modify_admin"
ON system_config FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- ============================================================================
-- END OF RLS MIGRATION
-- ============================================================================
