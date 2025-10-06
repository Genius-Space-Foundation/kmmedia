# KM Media Training Institute LMS

A comprehensive Learning Management System (LMS) built with Next.js, designed for hybrid training programs combining online and offline learning experiences.

## Features

- **Role-Based Access Control**: Admin, Instructor, and Student roles with different permissions
- **JWT Authentication**: Secure authentication with access and refresh tokens
- **Course Management**: Instructors can create courses that require admin approval
- **Application Workflow**: Students must pay application fees before submitting applications
- **Payment Integration**: Paystack integration for application fees and tuition payments
- **Installment Payments**: Support for flexible payment plans
- **Hybrid Learning**: Support for online, offline, and hybrid course modes
- **Admin Dashboard**: Complete management interface for admins
- **Responsive Design**: Mobile-first design with modern UI components

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt
- **Payments**: Paystack
- **UI**: Tailwind CSS, Radix UI components
- **Forms**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Paystack account (for payments)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd kmmedia
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp env.example .env.local
   ```

   Update the `.env.local` file with your actual values:

   - Database connection string
   - JWT secrets
   - Paystack API keys
   - Other service credentials

4. **Set up the database**

   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run database migrations
   npx prisma db push

   # (Optional) Seed the database
   npx prisma db seed
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── courses/       # Course management
│   │   ├── applications/  # Application handling
│   │   └── payments/      # Payment processing
│   ├── auth/              # Authentication pages
│   ├── dashboards/        # Role-specific dashboards
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── forms/            # Form components
│   ├── layouts/          # Layout components
│   └── ui/               # UI components
└── lib/                  # Utility libraries
    ├── auth.ts           # Authentication logic
    ├── db.ts             # Database connection
    ├── middleware.ts     # Auth middleware
    └── payments/         # Payment integration
```

## User Roles & Workflows

### Admin

- Approve/reject instructor courses
- Review and approve student applications
- Manage users and payments
- Generate reports and analytics

### Instructor

- Create and edit courses (draft mode)
- Submit courses for admin approval
- Manage course content and lessons
- Track student engagement

### Student

- Browse available courses
- Pay application fees
- Submit application forms
- Pay tuition (full or installments)
- Access enrolled courses

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token

### Courses

- `GET /api/courses` - List courses (with filtering)
- `POST /api/courses` - Create course (instructor only)
- `GET /api/courses/[id]` - Get single course
- `PUT /api/courses/[id]` - Update course
- `DELETE /api/courses/[id]` - Delete course
- `POST /api/courses/[id]/approve` - Approve/reject course (admin only)

### Applications

- `GET /api/applications` - List applications (admin only)
- `POST /api/applications` - Create application (student only)
- `GET /api/applications/[id]` - Get single application
- `PUT /api/applications/[id]` - Update application (admin only)

### Payments

- `POST /api/payments/initialize` - Initialize payment
- `POST /api/payments/verify` - Verify payment

## Database Schema

The system uses PostgreSQL with the following main entities:

- **Users**: Admin, Instructor, Student roles
- **Courses**: Course information and approval status
- **Applications**: Student course applications
- **Enrollments**: Student course enrollments
- **Payments**: Payment tracking and history
- **Lessons**: Course content and materials

## Payment Flow

1. Student selects a course and pays application fee
2. After successful payment, student can submit application form
3. Admin reviews and approves/rejects application
4. If approved, student pays tuition (full or installments)
5. Student gains access to course content

## Development

### Running Tests

```bash
npm run test
```

### Building for Production

```bash
npm run build
npm start
```

### Database Management

```bash
# View database in Prisma Studio
npx prisma studio

# Reset database
npx prisma db push --force-reset
```

## Deployment

The application can be deployed to various platforms:

1. **Vercel** (Recommended for Next.js)
2. **Railway** (Good for full-stack apps)
3. **DigitalOcean App Platform**
4. **AWS/GCP/Azure**

Make sure to:

- Set up production environment variables
- Configure production database
- Set up Paystack production keys
- Configure domain and SSL certificates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.
