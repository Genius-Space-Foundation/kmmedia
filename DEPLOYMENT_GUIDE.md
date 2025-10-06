# 🚀 KM Media Training Institute - Deployment Guide

## 📋 Prerequisites

### Required Services

- **PostgreSQL Database** (v13+)
- **Node.js** (v18+)
- **Paystack Account** (Payment gateway)
- **Cloudinary Account** (File storage)
- **SMTP Email Service** (Gmail/SendGrid)
- **Twilio Account** (Optional - SMS notifications)

### Environment Variables

Create a `.env` file in the root directory with the following variables:

> **⚠️ CRITICAL**: Use the production environment template (`env.production.example`) for production deployment. Generate strong, unique secrets for JWT tokens.

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/kmmedia_db"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"

# Paystack Configuration
PAYSTACK_PUBLIC_KEY="pk_live_your_paystack_public_key"
PAYSTACK_SECRET_KEY="sk_live_your_paystack_secret_key"

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"

# Email Configuration
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your_email@gmail.com"
EMAIL_PASSWORD="your_app_specific_password"
EMAIL_FROM="KM Media Training Institute <noreply@kmmediatraining.com>"

# SMS Configuration (Optional)
TWILIO_ACCOUNT_SID="your_twilio_account_sid"
TWILIO_AUTH_TOKEN="your_twilio_auth_token"
TWILIO_PHONE_NUMBER="+1234567890"

# Application Configuration
NEXT_PUBLIC_APP_URL="https://your-domain.com"
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="pk_live_your_paystack_public_key"
```

## 🗄️ Database Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Seed initial data (optional)
npx prisma db seed
```

### 3. Create Initial Admin User

```bash
# Run the admin creation script
npm run create-admin
```

## 🔧 Service Configuration

### 1. Paystack Setup

1. Create a Paystack account at https://paystack.com
2. Get your API keys from the dashboard
3. Set up webhook URL: `https://your-domain.com/api/webhooks/paystack`
4. Configure webhook events: `charge.success`, `charge.failed`

### 2. Cloudinary Setup

1. Create account at https://cloudinary.com
2. Get your cloud name, API key, and secret
3. Configure upload presets for different file types

### 3. Email Configuration

1. Set up SMTP credentials (Gmail App Password recommended)
2. Configure email templates in the notification system
3. Test email delivery

### 4. SMS Configuration (Optional)

1. Create Twilio account for SMS notifications
2. Get account SID, auth token, and phone number
3. Configure SMS templates

## 🚀 Deployment Steps

### 1. Production Build

```bash
# Use the deployment script (recommended)
npm run deploy

# Or manual build
npm run build
npm start
```

### 1.1 Automated Deployment

```bash
# Production deployment
./scripts/deploy.sh production

# Staging deployment
./scripts/deploy.sh staging
```

### 2. Database Deployment

```bash
# For production database
npx prisma migrate deploy

# Generate optimized Prisma client
npx prisma generate --no-engine
```

### 3. Environment Setup

- Set all environment variables in your hosting platform
- Use strong, unique secrets for JWT keys
- Configure proper database connection strings
- Set up SSL certificates

### 4. Security Configuration

- Enable HTTPS
- Configure CORS policies
- Set up rate limiting
- Enable database connection pooling
- Configure backup schedules

## 📊 Monitoring & Analytics

### Health Checks

- Database connectivity: `/api/health/db`
- Payment gateway: `/api/health/paystack`
- File storage: `/api/health/cloudinary`
- Email service: `/api/health/email`

### Performance Monitoring

- API response times
- Database query performance
- File upload speeds
- Payment processing times

## 🔐 Security Checklist

### Authentication & Authorization

- ✅ JWT-based authentication implemented
- ✅ Role-based access control (RBAC)
- ✅ Secure password hashing (bcrypt)
- ✅ Token refresh mechanism
- ✅ Session management

### Data Protection

- ✅ Input validation (Zod schemas)
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS protection
- ✅ CSRF protection
- ✅ Secure file uploads

### Payment Security

- ✅ Paystack PCI compliance
- ✅ Webhook signature verification
- ✅ Transaction logging
- ✅ Refund management
- ✅ Fraud detection

## 📱 Mobile & PWA Setup

### Progressive Web App

1. Configure service worker
2. Set up app manifest
3. Enable offline functionality
4. Configure push notifications

### Mobile Responsiveness

- ✅ Mobile-first design implemented
- ✅ Touch-friendly interfaces
- ✅ Responsive layouts
- ✅ Fast loading times

## 🎯 Post-Deployment Tasks

### 1. System Configuration

- Set default application fees
- Configure payment plans
- Set up certificate templates
- Configure notification templates

### 2. Content Management

- Upload course categories
- Set up instructor onboarding
- Create help documentation
- Configure support workflows

### 3. User Management

- Create admin accounts
- Set up instructor profiles
- Configure user roles
- Set up bulk import tools

### 4. Testing & Validation

- Test all payment flows
- Verify email/SMS delivery
- Test file upload/download
- Validate user workflows

## 🔄 Maintenance & Updates

### Regular Tasks

- Database backups
- Security updates
- Performance monitoring
- User activity analysis
- Payment reconciliation

### Scaling Considerations

- Database optimization
- CDN configuration
- Load balancing
- Caching strategies
- API rate limiting

## 📞 Support & Documentation

### Admin Resources

- User management guide
- Course approval workflows
- Payment management procedures
- System configuration manual

### Instructor Resources

- Course creation guide
- Content upload procedures
- Student management tools
- Assessment creation guide

### Student Resources

- Application process guide
- Payment instructions
- Learning platform tutorial
- Support contact information

## 🎉 Success Metrics

### Key Performance Indicators

- User registration rates
- Course completion rates
- Payment success rates
- Student satisfaction scores
- Instructor engagement levels

### Business Metrics

- Revenue growth
- Course enrollment numbers
- Application approval rates
- Support ticket resolution times
- Platform uptime

---

## 🏆 Congratulations!

You now have a **world-class educational platform** with:

- ✅ **3 Comprehensive Dashboards** (Admin, Instructor, Student)
- ✅ **Complete Payment System** (Paystack integration)
- ✅ **Advanced User Management** (RBAC, bulk operations)
- ✅ **Rich Course Management** (Creation, approval, delivery)
- ✅ **Robust Assessment System** (Quizzes, assignments, grading)
- ✅ **Communication Tools** (Announcements, messaging, support)
- ✅ **File Management** (Cloudinary integration)
- ✅ **Notification System** (Email, SMS, in-app)
- ✅ **Security Features** (JWT, encryption, validation)
- ✅ **Mobile Responsiveness** (PWA-ready)

Your platform is now ready to compete with the best educational platforms in the industry! 🚀
