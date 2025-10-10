-- Add performance indexes for better query performance

-- User table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Course table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_courses_instructor_id ON courses(instructor_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_courses_approved_at ON courses(approved_at);

-- Application table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_applications_user_course ON applications(user_id, course_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_applications_submitted_at ON applications(submitted_at);

-- Enrollment table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_enrollments_user_course ON enrollments(user_id, course_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_enrollments_status ON enrollments(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_enrollments_enrolled_at ON enrollments(enrolled_at);

-- Payment table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_user_status ON payments(user_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_type ON payments(type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_reference ON payments(reference);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- Lesson table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_lessons_order ON lessons(course_id, "order");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_lessons_published ON lessons(is_published);

-- Assessment table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assessments_course_id ON assessments(course_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assessments_instructor_id ON assessments(instructor_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assessments_published ON assessments(is_published);

-- Assessment submission indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assessment_submissions_student_assessment ON assessment_submissions(student_id, assessment_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assessment_submissions_status ON assessment_submissions(status);

-- Notification indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Activity log indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity, entity_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

-- Support ticket indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at);

-- Payment plan indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_plans_user_id ON payment_plans(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_plans_status ON payment_plans(status);

-- Payment installment indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_installments_payment_plan_id ON payment_installments(payment_plan_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_installments_status ON payment_installments(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_installments_due_date ON payment_installments(due_date);

