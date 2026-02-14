# tatame-monorepo

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines Next.js, Express, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **Next.js** - Full-stack React framework
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **shadcn/ui** - Reusable UI components
- **Express** - Fast, unopinionated web framework
- **Node.js** - Runtime environment
- **Stripe** - Payment processing and subscription management
- **Clerk** - Authentication and user management
- **Drizzle** - TypeScript-first ORM
- **PostgreSQL** - Database engine
- **Turborepo** - Optimized monorepo build system

## Getting Started

First, install the dependencies:

```bash
pnpm install
```

## Environment Setup

1. Copy the example environment file:

```bash
cp apps/server/.env.example apps/server/.env
```

2. Update `apps/server/.env` with your credentials:
   - **Stripe:** Get your test keys from [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
   - **Clerk:** Get your keys from [Clerk Dashboard](https://dashboard.clerk.com)
   - **CORS:** Update the origin to match your frontend URL

## Backend Setup (Phase 1 - Stripe Integration)

The backend is currently configured to work with Stripe for product and pricing management. Database setup with PostgreSQL is optional for now as the backend uses Supabase for data storage.

Then, run the development server:

```bash
pnpm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to see the web application.
The API is running at [http://localhost:3000](http://localhost:3000).

## API Endpoints

All endpoints require Clerk JWT authentication via `Authorization: Bearer <token>` header.

### Stripe Products

- `GET /stripe/products` - List all active products
  - Query params: `active` (boolean), `limit` (number, max 100)
- `GET /stripe/products/:id` - Get a specific product

### Stripe Prices

- `GET /stripe/prices` - List all active prices
  - Query params: `product` (string), `active` (boolean), `limit` (number, max 100)
- `GET /stripe/prices/:id` - Get a specific price

## Database Setup (Optional - Phase 5)

PostgreSQL with Drizzle ORM is available but not used in Phase 1. To set up the database for future phases:

1. Start the database:

```bash
pnpm run db:start
```

2. Apply the schema:

```bash
pnpm run db:push
```

## Project Structure

```
tatame-monorepo/
├── apps/
│   ├── web/                    # Frontend application (Next.js)
│   └── server/                 # Backend API (Express)
│       ├── src/
│       │   ├── middleware/     # Auth and error handling
│       │   ├── routes/         # API route handlers
│       │   ├── services/       # Business logic (Stripe, etc.)
│       │   └── types/          # TypeScript type definitions
│       └── .env.example        # Environment variables template
├── packages/
│   ├── db/                     # Database schema & queries
│   └── env/                    # Environment validation
└── docs/
    └── backend/                # Backend architecture documentation
```

## Available Scripts

### Development

- `pnpm run dev` - Start all applications in development mode
- `pnpm run dev:web` - Start only the web application
- `pnpm run dev:server` - Start only the server
- `pnpm run build` - Build all applications
- `pnpm run check-types` - Check TypeScript types across all apps

### Database (Optional - Phase 5)

- `pnpm run db:start` - Start PostgreSQL with Docker
- `pnpm run db:stop` - Stop PostgreSQL container
- `pnpm run db:push` - Push schema changes to database
- `pnpm run db:generate` - Generate database client/types
- `pnpm run db:migrate` - Run database migrations
- `pnpm run db:studio` - Open database studio UI

## Documentation

For detailed documentation, see:

### Backend
- [Backend Development Roadmap](./docs/backend/00-backend-development-roadmap.md)
- [Architecture Overview](./docs/backend/01-architecture-overview-and-findings.md)
- [API Design](./docs/backend/03-api-design.md)
- [Security Best Practices](./docs/backend/05-security-and-best-practices.md)

### Database Migration
- [Supabase to PostgreSQL Migration Plan](./docs/postgres-migration/00-migration-overview.md)
- [Phase 0: Foundation Setup](./docs/postgres-migration/01-phase-0-foundation.md)

### Deployment
- **[Docker Deployment Guide](./DOCKER.md)** - Container setup and local testing
- **[Coolify Deployment Guide](./COOLIFY.md)** - Production deployment with Coolify

## Deployment

This project is containerized and ready for production deployment. Each service runs in its own Docker container:

- **Database**: PostgreSQL 16
- **Server**: Express API (Node.js)
- **Web**: Next.js frontend

### Quick Deploy with Coolify

1. Create PostgreSQL database in Coolify
2. Deploy server from `apps/server/Dockerfile`
3. Deploy web from `apps/web/Dockerfile`
4. Configure environment variables
5. Run database migrations

See [COOLIFY.md](./COOLIFY.md) for detailed deployment instructions.

### Local Docker Testing

```bash
# Run all services with Docker Compose
docker-compose -f docker-compose.prod.yml up --build
```

See [DOCKER.md](./DOCKER.md) for complete Docker documentation.
