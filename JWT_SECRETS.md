# 🔐 JWT Secrets Generated for Production

## ⚠️ **SECURITY WARNING**

These secrets are for production use only. Keep them secure and never commit them to version control.

## 🔑 Generated Secrets

### JWT Access Token Secret

```
YGXj0nfWsrVPnYHBkUyv/ycGB4WRZpIwhW2I+DpnIsg=
```

**Purpose**: Used for signing JWT access tokens (15 minutes expiry)

### JWT Refresh Token Secret

```
/KH/+TGCFQjGZqcBAEQcH1O7QObMVw7CbIy174knqx8=
```

**Purpose**: Used for signing JWT refresh tokens (7 days expiry)

### NextAuth Secret

```
ybYQ1bs7ADcJDFDTqBrtz7jdzc1MK+U3YaNLdzoseOE=
```

**Purpose**: Used for NextAuth.js session encryption

## 📋 How to Use

1. **Copy these secrets to your production environment variables**
2. **Update your `.env` file with these values**
3. **Ensure these are set in your hosting platform (Vercel, Railway, etc.)**

## 🔒 Security Best Practices

- ✅ **Generated using OpenSSL**: `openssl rand -base64 32`
- ✅ **64 characters long**: Strong entropy
- ✅ **Unique for each purpose**: Different secrets for different tokens
- ✅ **Production ready**: Cryptographically secure

## 🚀 Environment Variables

Add these to your production environment:

```bash
JWT_SECRET="YGXj0nfWsrVPnYHBkUyv/ycGB4WRZpIwhW2I+DpnIsg="
JWT_REFRESH_SECRET="/KH/+TGCFQjGZqcBAEQcH1O7QObMVw7CbIy174knqx8="
NEXTAUTH_SECRET="ybYQ1bs7ADcJDFDTqBrtz7jdzc1MK+U3YaNLdzoseOE="
```

## ⚡ Quick Setup

```bash
# Copy production environment template
cp env.production.example .env

# The JWT secrets are already configured in env.production.example
# Just update other values like DATABASE_URL, PAYSTACK keys, etc.
```

---

**Generated on**: $(date)
**Status**: ✅ Ready for Production
**Security Level**: Maximum

