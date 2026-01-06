# Niwas Nest - Project Submission Technical Questionnaire

## 1. Application Architecture & Technology Stack

### 1. Is the application built using any CMS (Content Management System)?
**Answer:** No, the application is not built using a traditional CMS. It's a custom-built web application with its own admin panel for content management.

### 2. Is the application a standalone system or built on top of any existing platform?
**Answer:** The application is built on top of modern web platforms:
- **Frontend**: Next.js (React framework)
- **Backend**: Supabase (Backend-as-a-Service)
- **Authentication**: Supabase Auth with Google OAuth integration
- **Database**: PostgreSQL (managed by Supabase)

### 3. What is the frontend technology stack used?
**Answer:** 
- **Framework**: Next.js 13.5.1 (React-based)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom React components
- **State Management**: React hooks and context

### 4. What is the backend technology stack used?
**Answer:** 
- **Runtime**: Node.js (via Next.js API routes)
- **Backend Service**: Supabase (PostgreSQL + Auth + Storage)
- **API**: RESTful APIs built with Next.js API routes
- **Real-time**: Supabase real-time subscriptions

### 5. What frameworks and libraries are used on both frontend and backend?
**Answer:**
**Frontend:**
- Next.js 13.5.1 (React framework)
- React 18
- TypeScript
- Tailwind CSS
- React Icons
- React Hook Form

**Backend:**
- Next.js API Routes
- Supabase JavaScript Client
- Razorpay SDK
- Crypto (for payment verification)

### 6. Node.js Version Details:
**Answer:**
- **Current Version**: Node.js 18+ (Latest LTS)
- **Community Support**: Yes, actively supported with security updates until April 2025
- **Next.js Version**: 13.5.1 (actively maintained)

---

## 2. Versioning & End-of-Life (EOL) Management

### 7. What is the current application version and dependency versions?
**Answer:**
- **Application Version**: 1.0.0
- **Next.js**: 13.5.1
- **React**: 18.x
- **TypeScript**: 5.x
- **Supabase**: Latest stable
- **Tailwind CSS**: 3.x

### 8. What is your plan when any framework, language, or library reaches End of Life (EOL)?
**Answer:**
- **Monitoring**: Regular dependency audits using npm audit
- **Upgrade Strategy**: Incremental updates following semantic versioning
- **Testing**: Comprehensive testing before production deployment
- **Timeline**: Updates within 30 days of EOL announcements

### 9. Who is responsible for version upgrades and compatibility testing?
**Answer:**
- **Version Upgrades**: Development team (currently handled by project maintainer)
- **Compatibility Testing**: Automated testing pipeline + manual QA
- **Approval Process**: Code review and staging environment testing required

---

## 3. Database & Storage

### 10. Which database is being used?
**Answer:** PostgreSQL (managed by Supabase)

### 11. What is the database version currently in use?
**Answer:** PostgreSQL 15.x (latest stable version managed by Supabase)

### 12. What happens when the database version reaches EOL?
**Answer:** Supabase automatically handles database version upgrades and maintenance, ensuring continuous support and security updates.

### 13. Is the database self-managed or a managed service?
**Answer:** **Managed Service** - Supabase provides fully managed PostgreSQL with:
- Automatic backups
- Security patches
- Performance optimization
- Scaling capabilities

### 14. Are application and database hosted on the same server or separated?
**Answer:** **Separated** - Application hosted on Vercel, database hosted on Supabase infrastructure for better scalability and security.

### 15. What is the current database size and expected growth?
**Answer:**
- **Current Size**: ~50MB (initial data with sample properties and users)
- **Expected Growth**: 500MB-1GB in the first year
- **Scaling Plan**: Supabase provides automatic scaling based on usage

### 16. Where are hostel photos and other media files stored?
**Answer:** 
- **Current**: External URLs (property images from various sources)
- **Planned**: Supabase Storage (S3-compatible cloud storage)
- **CDN**: Automatic CDN distribution through Supabase

---

## 4. Hosting, Server & Cloud Infrastructure

### 17. Which server is being used?
**Answer:** **Serverless** - Vercel's edge network (no traditional server management required)

### 18. Where is the application hosted?
**Answer:** 
- **Platform**: Vercel
- **Region**: Global edge network with primary regions in US and Europe
- **CDN**: Automatic global distribution

### 19. Which cloud platform is used?
**Answer:** 
- **Frontend**: Vercel (built on AWS infrastructure)
- **Backend/Database**: Supabase (multi-cloud with AWS primary)

### 20. What is the platform/environment?
**Answer:**
- **OS**: Linux (containerized serverless environment)
- **Containerization**: Yes, automatically handled by Vercel
- **Runtime**: Node.js serverless functions

### 21. What is the approximate application size?
**Answer:**
- **Code Size**: ~15MB (including dependencies)
- **Build Output**: ~8MB (optimized for production)
- **Assets**: ~2MB (images, fonts, icons)

---

## 5. Code Management & Deployment

### 22. Where is the application source code stored?
**Answer:** **GitHub** - Private repository with version control

### 23. Who has access control to the code repository?
**Answer:** 
- **Owner**: Project maintainer (full access)
- **Collaborators**: Development team members (as needed)
- **Access Control**: GitHub's built-in permission system

### 24. Is the code hosted on GoDaddy/Hostinger, or only deployment?
**Answer:** **Neither** - Code is hosted on GitHub, deployed to Vercel. No dependency on traditional hosting providers.

### 25. What is the deployment process?
**Answer:** **Automated CI/CD Pipeline**:
- Git push to main branch
- Automatic build on Vercel
- Automated testing and deployment
- Zero-downtime deployment with rollback capability

---

## 6. Testing & Environments

### 26. Do you have separate environments?
**Answer:**
- **Development**: Local development environment
- **Preview**: Vercel preview deployments for each PR
- **Production**: Live production environment (www.niwasnest.com)

### 27. Testing environment details:
**Answer:** **Dedicated Testing** - Vercel preview URLs for each deployment, separate from live production.

### 28. Who is responsible for testing?
**Answer:** **Internal Team** - Development team handles testing with automated and manual processes.

### 29. What types of tests are performed?
**Answer:**
- **Unit Testing**: Component and function testing
- **Integration Testing**: API endpoint testing
- **User Acceptance Testing**: Manual testing of user flows
- **Payment Testing**: Razorpay test mode integration

---

## 7. Security & Best Practices

### 30. Who is responsible for security patches and updates?
**Answer:** **Development Team** with automatic security updates from:
- Vercel (platform security)
- Supabase (database and auth security)
- npm audit for dependency vulnerabilities

### 31. Are industry best practices followed?
**Answer:** **Yes**:
- **Code Structure**: Modular, TypeScript-based architecture
- **Authentication**: OAuth 2.0 with Supabase Auth
- **Authorization**: Row Level Security (RLS) policies
- **API Security**: Input validation, rate limiting, HTTPS only

### 32. What security testing has been performed?
**Answer:**
- **Dependency Scanning**: Regular npm audit checks
- **Authentication Testing**: OAuth flow validation
- **API Security**: Input validation and sanitization
- **HTTPS**: SSL/TLS encryption for all communications

### 33. React and library security concerns:
**Answer:**
- **Regular Updates**: Dependencies updated regularly
- **Vulnerability Scanning**: Automated security alerts from GitHub
- **Security Patches**: Applied within 48 hours of critical updates

### 34. Long-term security support:
**Answer:** **Yes** - All chosen technologies (Next.js, React, Supabase) provide long-term security support and regular updates.

---

## 8. Payments & Financial Security

### 35. Is Razorpay used as the payment gateway?
**Answer:** **Yes** - Razorpay is properly configured with:
- Live API keys
- Webhook integration
- Payment verification
- Comprehensive testing completed

### 36. Does the payment amount directly credit into the company's account?
**Answer:** **Yes** - Payments are directly credited to the registered business account through Razorpay.

### 37. Payment gateway plugins or SDKs:
**Answer:**
- **Razorpay JavaScript SDK**: Latest version
- **Custom Integration**: Built with Razorpay's official APIs
- **Webhook Handling**: Secure payment verification

### 38. Are credit card or debit card details stored?
**Answer:** **No** - Card details are never stored in our system:
- **PCI Compliance**: Razorpay handles all card data
- **Tokenization**: Only payment tokens stored
- **Security**: Full PCI-DSS compliance through Razorpay

---

## 9. Support & Ownership

### 39. Who will provide technical support after deployment?
**Answer:** **Development Team** - Ongoing technical support and maintenance.

### 40. What is the support model?
**Answer:**
- **SLA**: 24-hour response for critical issues
- **Resolution Time**: 48-72 hours for non-critical issues
- **Monitoring**: 24/7 uptime monitoring
- **Communication**: Email and WhatsApp support channels

### 41. Who owns the application components?
**Answer:**
- **Application Code**: Client/Business owner
- **Database**: Client (hosted on Supabase)
- **Hosting Accounts**: Client-owned Vercel and Supabase accounts

---

## 10. Additional Clarifications

### 42. Are backups taken?
**Answer:** **Yes**:
- **Application Code**: Git version control with GitHub
- **Database**: Automatic daily backups by Supabase
- **Media Files**: Redundant storage with Supabase Storage

### 43. What is the disaster recovery plan?
**Answer:**
- **Code Recovery**: Git repository with full history
- **Database Recovery**: Point-in-time recovery up to 7 days
- **Application Recovery**: Instant redeployment from Git
- **RTO**: 15 minutes for application, 1 hour for full data recovery
- **RPO**: Maximum 24 hours of data loss (daily backups)

---

## Summary

**Niwas Nest** is built using modern, scalable technologies with enterprise-grade security and reliability. The platform leverages industry-standard tools and follows best practices for web application development, ensuring long-term maintainability and security.

**Key Strengths:**
- Modern tech stack with long-term support
- Serverless architecture for scalability
- Comprehensive security measures
- Automated deployment and monitoring
- Professional payment integration
- Robust backup and recovery systems