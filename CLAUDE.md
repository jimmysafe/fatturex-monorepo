# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `pnpm dev` - Run all apps in development mode
- `pnpm --filter web-client dev` - Run only web-client (main app) in development mode
- `pnpm --filter web-admin dev` - Run only web-admin app in development mode
- `pnpm --filter web-site dev` - Run only web-site app in development mode

### Build & Test
- `pnpm build` - Build all apps and packages
- `pnpm lint` - Run linting across all packages
- `pnpm check-types` - Run TypeScript type checking
- `pnpm format` - Format code with Prettier
- `pnpm test:e2e` - Run end-to-end tests for web-client

### Database
- `pnpm db:studio` - Open Drizzle Studio for database management
- `pnpm db:generate` - Generate database migrations
- `pnpm db:migrate` - Run database migrations
- `pnpm db:seed` - Seed database with test data

### UI Components
- `pnpm ui` - Access UI package utilities

## Architecture

### Project Structure
This is a Turborepo monorepo with three Next.js applications and shared packages:

#### Applications
- **web-client** - Main client application for invoice management (Italian: "fatture")
- **web-admin** - Admin dashboard
- **web-site** - Marketing website

#### Packages
- **@repo/auth** - Authentication using Better Auth with email OTP and Google OAuth
- **@repo/database** - Database layer with Drizzle ORM and SQLite/Turso
- **@repo/shared** - Shared utilities, constants, and validation schemas
- **@repo/ui** - Shared UI components built with Shadcn/UI and Tailwind
- **@repo/eslint-config** - ESLint configuration
- **@repo/typescript-config** - TypeScript configurations

### Key Technologies
- **Framework**: Next.js 15 with App Router
- **Database**: SQLite (dev) / Turso (prod) with Drizzle ORM
- **Authentication**: Better Auth with OTP email and Google OAuth
- **UI**: Shadcn/UI components with Tailwind CSS
- **State Management**: React Query (TanStack Query) with Server Actions
- **Payments**: Stripe integration
- **Testing**: Playwright for E2E tests
- **Package Manager**: pnpm with workspace support

### Authentication Flow
- Users authenticate via email OTP or Google OAuth
- Session management handled by Better Auth
- Middleware enforces authentication and onboarding flow
- Custom session data includes user profile and subscription info

### Database Schema
Key entities include:
- Users (auth, profiles, subscriptions)
- Clients (customers/clienti)
- Invoices (fatture) with electronic invoicing support
- Credit notes (note di credito)
- Addresses (indirizzi)
- Accounting records (contabilita)
- Templates for documents

### Business Logic
- Italian invoice management system ("fatture")
- Electronic invoicing compliance (FatturaPA)
- Professional pension funds integration ("casse")
- STS (Sistema Tessera Sanitaria) integration
- Multi-year accounting support

### Development Patterns
- Server Actions for data mutations
- React Query for client state and caching
- Zod for runtime validation
- Form handling with React Hook Form
- PDF generation with jsPDF
- File uploads with Vercel Blob

### Environment Variables
Key environment variables are defined in turbo.json's globalPassThroughEnv. Required for development:
- `DATABASE_URL` - Database connection string
- `BETTER_AUTH_SECRET` - Authentication secret
- `RESEND_API_KEY` - Email service
- `STRIPE_SECRET_KEY` - Payment processing
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - OAuth

### Localization
- Italian-focused application
- Uses i18next for internationalization
- Zod error messages in Italian via zod-i18n-map