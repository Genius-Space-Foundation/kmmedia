# 🔐 KM Media Training Institute - Login Credentials

## 🎯 **Admin Access**

### **Administrator Account:**

- **Email**: `admin@kmmedia.com`
- **Password**: `admin123`
- **Role**: Admin
- **Access**: Full administrative dashboard with all management features

---

## 👨‍🏫 **Instructor Access**

### **Instructor Account 1:**

- **Email**: `john.film@kmmedia.com`
- **Password**: `instructor123`
- **Role**: Instructor
- **Name**: John Film Director

### **Instructor Account 2:**

- **Email**: `sarah.video@kmmedia.com`
- **Password**: `instructor123`
- **Role**: Instructor
- **Name**: Sarah Video Editor

---

## 👨‍🎓 **Student Access**

### **Student Test Account:**

- **Email**: `student@test.com`
- **Password**: `student123`
- **Role**: Student
- **Access**: Student dashboard with course enrollment and learning features

---

## 🚀 **How to Login**

1. **Navigate to Login Page**:
   - Go to `http://localhost:3000/auth/login`
2. **Enter Credentials**:
   - Use one of the email/password combinations above
3. **Dashboard Redirect**:
   - **Admin** → `/dashboards/admin`
   - **Instructor** → `/dashboards/instructor`
   - **Student** → `/dashboards/student`

---

## 🔧 **Admin Dashboard Features**

Once logged in as admin, you'll have access to:

✅ **Application Management**

- View, approve, and reject course applications
- Bulk actions for multiple applications
- Detailed applicant information

✅ **User Management**

- Manage all users (students, instructors, admins)
- Activate, suspend, or delete users
- Bulk user operations
- User statistics and analytics

✅ **Course Management**

- Approve or reject course submissions
- Publish and unpublish courses
- View course statistics and revenue
- Bulk course operations

✅ **Analytics Dashboard**

- Real-time statistics
- Revenue tracking (GH₵)
- User and course analytics
- Performance metrics

✅ **Notifications Center**

- System notifications
- Email notifications
- Real-time updates

✅ **Profile Management**

- Edit admin profile
- Update personal information
- Logout functionality

---

## 🔑 **Password Reset**

If you need to reset any password:

1. **Via Database Seed**:

   ```bash
   npm run db:seed
   ```

   This will reset all test accounts to their default passwords.

2. **Via Prisma Studio**:
   ```bash
   npx prisma studio
   ```
   Access the database GUI to manually update user passwords.

---

## 🛡️ **Security Notes**

- ⚠️ **Development Only**: These are test credentials for development
- 🔒 **Production**: Change all default passwords in production
- 🔐 **JWT Tokens**: Authentication uses JWT tokens stored in localStorage
- 🚫 **Never Commit**: Never commit production credentials to version control

---

## 📝 **Database Seeding**

To reset the database with test data:

```bash
# Reset database
npx prisma migrate reset

# Run migrations
npx prisma migrate dev

# Seed database
npm run db:seed
```

This will create:

- 1 Admin account
- 2 Instructor accounts
- 1 Student account
- Sample courses
- Sample applications
- Sample enrollments

---

## 🎉 **Test the System**

### **Admin Workflow:**

1. Login as admin (`admin@kmmedia.com`)
2. Navigate to Applications tab
3. Approve/reject pending applications
4. Navigate to Courses tab
5. Approve/publish courses
6. Navigate to Users tab
7. Manage user accounts

### **Instructor Workflow:**

1. Login as instructor (`john.film@kmmedia.com`)
2. View your courses
3. Manage course content
4. View student enrollments

### **Student Workflow:**

1. Login as student (`student@test.com`)
2. Browse available courses
3. Apply for courses
4. View enrollment status

---

## 🌐 **Access URLs**

- **Homepage**: `http://localhost:3000`
- **Login**: `http://localhost:3000/auth/login`
- **Register**: `http://localhost:3000/auth/register`
- **Admin Dashboard**: `http://localhost:3000/dashboards/admin`
- **Instructor Dashboard**: `http://localhost:3000/dashboards/instructor`
- **Student Dashboard**: `http://localhost:3000/dashboards/student`

---

## 💡 **Quick Start**

1. **Start Development Server**:

   ```bash
   npm run dev
   ```

2. **Access Application**:

   - Open browser to `http://localhost:3000`

3. **Login as Admin**:

   - Email: `admin@kmmedia.com`
   - Password: `admin123`

4. **Explore Features**:
   - Application Management
   - User Management
   - Course Management
   - Analytics Dashboard

---

**All systems are ready! Start by logging in as admin to explore the full functionality.** 🚀🇬🇭
