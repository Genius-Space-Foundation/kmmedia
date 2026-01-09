# Row Level Security (RLS) - Deployment Guide

## Overview

This guide explains how to deploy and verify the Row Level Security policies for the KM Media Training Institute database.

## Prerequisites

- PostgreSQL database (Supabase)
- Database backup created
- Staging environment for testing
- Admin access to the database

## Migration File

The RLS policies are defined in:
```
prisma/migrations/20260109185425_enable_row_level_security/migration.sql
```

## Deployment Steps

### 1. Create Database Backup

**CRITICAL**: Always create a backup before applying RLS policies.

```bash
# If using Supabase, use the dashboard to create a backup
# Or use pg_dump if you have direct access
pg_dump -h your-db-host -U your-user -d your-database > backup_before_rls.sql
```

### 2. Deploy to Staging Environment

```bash
# Apply the migration to staging
npx prisma migrate deploy
```

### 3. Verify RLS Policies

Run the verification tests (see Testing section below).

### 4. Deploy to Production

Only after successful staging verification:

```bash
# Set production database URL
export DATABASE_URL="your-production-database-url"

# Apply migration
npx prisma migrate deploy
```

## Authentication Setup

The RLS policies assume you're using **Supabase** with the `auth.uid()` function. The helper functions are:

- `current_user_id()`: Returns the authenticated user's ID
- `is_admin()`: Checks if user is an admin
- `is_instructor()`: Checks if user is an instructor
- `is_student()`: Checks if user is a student

### If NOT using Supabase

If you're using a different authentication system, you'll need to modify the helper functions in the migration file to match your auth setup.

## What RLS Protects

### Students Can:
- ✅ View their own profile, applications, enrollments, payments
- ✅ View courses they're enrolled in (lessons, resources, assignments)
- ✅ Submit assignments and assessments
- ✅ View their own progress, achievements, bookmarks
- ✅ Send/receive messages
- ❌ Cannot view other students' data
- ❌ Cannot modify course content
- ❌ Cannot change their role or status

### Instructors Can:
- ✅ View and manage their own courses
- ✅ View students enrolled in their courses
- ✅ Create and grade assignments/assessments
- ✅ View course-related payments (read-only)
- ✅ Manage attendance for their courses
- ❌ Cannot access other instructors' courses
- ❌ Cannot modify student payments
- ❌ Cannot change user roles

### Admins Can:
- ✅ Full access to all tables
- ✅ Manage users, roles, and permissions
- ✅ View all payments and financial data
- ✅ Approve/reject applications
- ✅ Manage system configuration

## Testing RLS Policies

### Manual Testing

1. **Test as Student**:
```sql
-- Set session to student user
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claim.sub TO 'student-user-id';

-- Try to view all users (should only see own profile)
SELECT * FROM users;

-- Try to view all applications (should only see own)
SELECT * FROM applications;
```

2. **Test as Instructor**:
```sql
-- Set session to instructor user
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claim.sub TO 'instructor-user-id';

-- Try to view courses (should see own courses + published)
SELECT * FROM courses;

-- Try to view students (should only see enrolled students)
SELECT * FROM users WHERE role = 'STUDENT';
```

3. **Test as Admin**:
```sql
-- Set session to admin user
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claim.sub TO 'admin-user-id';

-- Should see all data
SELECT * FROM users;
SELECT * FROM applications;
SELECT * FROM payments;
```

### Application-Level Testing

Test your API endpoints with different user roles:

```bash
# Test student endpoints
curl -H "Authorization: Bearer STUDENT_TOKEN" \
  http://localhost:3000/api/applications

# Test instructor endpoints
curl -H "Authorization: Bearer INSTRUCTOR_TOKEN" \
  http://localhost:3000/api/courses

# Test admin endpoints
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:3000/api/users
```

## Common Issues & Solutions

### Issue: "permission denied for table X"

**Cause**: RLS is enabled but no policies match the user's context.

**Solution**: 
1. Check if user is authenticated
2. Verify the helper functions are working
3. Check if policies exist for the operation

### Issue: "function auth.uid() does not exist"

**Cause**: Not using Supabase or auth schema not set up.

**Solution**: Modify `current_user_id()` function to match your auth system.

### Issue: Queries are very slow after enabling RLS

**Cause**: Missing indexes on foreign keys used in policies.

**Solution**: Add indexes:
```sql
CREATE INDEX idx_enrollments_userId ON enrollments("userId");
CREATE INDEX idx_enrollments_courseId ON enrollments("courseId");
CREATE INDEX idx_courses_instructorId ON courses("instructorId");
-- Add more as needed
```

### Issue: Service/background jobs failing

**Cause**: Background jobs don't have user context.

**Solution**: Use a service role that bypasses RLS:
```sql
-- Create service role
CREATE ROLE service_role BYPASSRLS;

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
```

Then use this role for background jobs.

## Rollback Procedure

If you need to rollback RLS:

```sql
-- Disable RLS on all tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE applications DISABLE ROW LEVEL SECURITY;
-- ... repeat for all tables

-- Drop helper functions
DROP FUNCTION IF EXISTS current_user_id();
DROP FUNCTION IF EXISTS get_user_role(TEXT);
DROP FUNCTION IF EXISTS is_admin();
DROP FUNCTION IF EXISTS is_instructor();
DROP FUNCTION IF EXISTS is_student();
```

## Performance Monitoring

Monitor query performance after enabling RLS:

```sql
-- Check slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC
LIMIT 20;
```

## Security Best Practices

1. **Never bypass RLS in application code** - Let the database enforce security
2. **Test with real user tokens** - Don't rely on admin access for testing
3. **Monitor audit logs** - Track who accesses what data
4. **Regular security audits** - Review policies quarterly
5. **Principle of least privilege** - Only grant necessary permissions

## Next Steps

After successful deployment:

1. ✅ Monitor application logs for access denied errors
2. ✅ Review slow query logs
3. ✅ Update API documentation with RLS behavior
4. ✅ Train team on RLS implications
5. ✅ Set up automated RLS policy tests in CI/CD

## Support

If you encounter issues:
1. Check the Supabase documentation: https://supabase.com/docs/guides/auth/row-level-security
2. Review PostgreSQL RLS docs: https://www.postgresql.org/docs/current/ddl-rowsecurity.html
3. Check application logs for specific error messages
