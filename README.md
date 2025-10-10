# KM Media Training Institute

A comprehensive learning management system built with Next.js, featuring advanced dashboards for administrators, instructors, and students.

## 🚀 Features

### Core Functionality

- **User Management**: Role-based access control (Admin, Instructor, Student)
- **Course Management**: Complete course lifecycle management
- **Payment Processing**: Integrated Paystack payment gateway
- **Assessment System**: Quizzes, assignments, and grading
- **File Management**: Secure file uploads with Cloudinary
- **Notification System**: Email and SMS notifications
- **Analytics Dashboard**: Comprehensive reporting and analytics

### Advanced Features

- **Progressive Web App (PWA)**: Offline capabilities and mobile optimization
- **Real-time Notifications**: Instant updates and alerts
- **AI-Powered Insights**: Predictive analytics and recommendations
- **Collaboration Tools**: Instructor collaboration and peer reviews
- **Export Capabilities**: Data export in multiple formats
- **Security**: JWT authentication, rate limiting, and security headers

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: JWT with refresh tokens
- **Payments**: Paystack integration
- **File Storage**: Cloudinary
- **Styling**: Tailwind CSS, Radix UI
- **Testing**: Jest, Testing Library
- **Deployment**: Production-ready with automated scripts

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 13+
- npm or yarn
- Paystack account
- Cloudinary account
- SMTP email service

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd kmmedia
npm install
```

### 2. Environment Setup

```bash
cp env.production.example .env
# Edit .env with your production values
```

### 3. Database Setup

```bash
npx prisma migrate deploy
npx prisma generate
npm run db:seed
```

### 4. Build and Start

```bash
npm run build
npm start
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks
- `npm test` - Run tests
- `npm run deploy` - Deploy to production

### Database Commands

- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma client
- `npm run db:seed` - Seed database with initial data
- `npm run db:studio` - Open Prisma Studio

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Granular permissions system
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Zod schema validation
- **SQL Injection Prevention**: Prisma ORM protection
- **XSS Protection**: Built-in Next.js security
- **CSRF Protection**: Cross-site request forgery prevention
- **Secure File Uploads**: Type and size validation

## 📊 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token

### Health Checks

- `GET /api/health` - Application health status
- `GET /api/health/db` - Database connectivity

### Course Management

- `GET /api/courses` - List courses
- `POST /api/courses` - Create course
- `PUT /api/courses/[id]` - Update course
- `DELETE /api/courses/[id]` - Delete course

### Payment Processing

- `POST /api/payments/initialize` - Initialize payment
- `POST /api/payments/verify` - Verify payment
- `POST /api/webhooks/paystack` - Paystack webhook

## 🌐 Deployment

### Production Deployment

1. **Prepare Environment**:

   ```bash
   cp env.production.example .env
   # Configure all environment variables
   ```

2. **Deploy with Script**:

   ```bash
   npm run deploy
   ```

3. **Manual Deployment**:
   ```bash
   npm ci --only=production
   npx prisma migrate deploy
   npm run build
   npm start
   ```

### Environment Variables

Required environment variables for production:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Strong JWT secret (32+ characters)
- `JWT_REFRESH_SECRET` - Strong refresh token secret
- `PAYSTACK_SECRET_KEY` - Paystack live secret key
- `PAYSTACK_PUBLIC_KEY` - Paystack live public key
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `SMTP_HOST` - SMTP server host
- `SMTP_PORT` - SMTP server port
- `SMTP_USER` - SMTP username
- `SMTP_PASS` - SMTP password

## 📱 Mobile & PWA

The application is fully responsive and includes PWA features:

- **Offline Support**: Service worker for offline functionality
- **Mobile-First Design**: Optimized for mobile devices
- **Touch Interactions**: Touch-friendly interface
- **App Manifest**: Installable as a web app
- **Push Notifications**: Real-time notifications

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run CI tests (type-check + lint + test)
npm run test:ci
```

## 📈 Performance

- **Code Splitting**: Automatic code splitting with Next.js
- **Image Optimization**: Next.js Image component
- **Caching**: Strategic caching for better performance
- **Bundle Analysis**: Optimized bundle sizes
- **Database Indexing**: Performance indexes for queries

## 🔍 Monitoring

- **Health Checks**: Built-in health monitoring
- **Error Tracking**: Comprehensive error logging
- **Performance Metrics**: API response time monitoring
- **User Analytics**: User behavior tracking
- **Database Monitoring**: Query performance tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is proprietary software developed for KM Media Training Institute.

## 🆘 Support

For technical support or questions:

- **Documentation**: Check the `/docs` folder
- **Issues**: Create an issue in the repository
- **Email**: Contact the development team

## 🎯 Roadmap

- [ ] Advanced analytics dashboard
- [ ] Mobile app development
- [ ] Integration with external LMS
- [ ] Advanced assessment types
- [ ] Video streaming capabilities
- [ ] Multi-language support
- [ ] Advanced reporting features

---

**Built with ❤️ for KM Media Training Institute**
