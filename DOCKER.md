# Docker & Coolify Deployment Guide

This monorepo is containerized and ready for deployment with Coolify or any Docker-based hosting solution.

## Architecture

The project consists of 3 separate services that run in individual containers:

1. **Database** (`postgres`) - PostgreSQL 16
2. **Server** (`apps/server`) - Express API (Node.js)
3. **Web** (`apps/web`) - Next.js frontend

## Docker Files

### Service Dockerfiles

- `apps/server/Dockerfile` - API server container
- `apps/web/Dockerfile` - Next.js frontend container
- `packages/db/docker-compose.yml` - Local development database
- `docker-compose.prod.yml` - Production reference (all services)

### Build Strategy

Both Dockerfiles use **multi-stage builds** for optimal image size:

1. **Builder stage**: Installs dependencies and builds the app
2. **Runner stage**: Minimal production image with only runtime files

## Coolify Deployment

Coolify will manage each service separately. Here's how to set them up:

### 1. Database Service

**Option A: Coolify Managed Database** (Recommended)
- Use Coolify's built-in PostgreSQL service
- Coolify will handle backups, scaling, and management
- Get the connection string from Coolify

**Option B: Custom Docker Container**
- Use `packages/db/docker-compose.yml` as reference
- Or deploy PostgreSQL image directly in Coolify

### 2. Server Service (API)

**In Coolify:**

1. **Create New Resource** → Docker Image or Git Repository
2. **Build Configuration:**
   - Dockerfile path: `apps/server/Dockerfile`
   - Build context: `.` (root of monorepo)
3. **Port:** 3000
4. **Environment Variables:**
   ```bash
   NODE_ENV=production
   DATABASE_URL=postgresql://user:password@host:5432/tatame
   CLERK_SECRET_KEY=your_key
   CLERK_PUBLISHABLE_KEY=your_key
   STRIPE_SECRET_KEY=your_key
   STRIPE_WEBHOOK_SECRET=your_key
   RESEND_API_KEY=your_key
   # Add other vars from your .env
   ```
5. **Health Check:** `/health` (if you have a health endpoint)
6. **Deploy**

### 3. Web Service (Next.js)

**In Coolify:**

1. **Create New Resource** → Docker Image or Git Repository
2. **Build Configuration:**
   - Dockerfile path: `apps/web/Dockerfile`
   - Build context: `.` (root of monorepo)
3. **Port:** 3000 (Next.js internal)
4. **Environment Variables:**
   ```bash
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://your-api-domain.com
   # Add other public Next.js vars
   ```
5. **Deploy**

### Service Communication

In Coolify:
- Each service gets its own domain/subdomain
- Server API: `api.yourdomain.com`
- Web frontend: `yourdomain.com` or `app.yourdomain.com`
- Database: Internal connection (not publicly exposed)

Set `NEXT_PUBLIC_API_URL` to point to your server domain.

## Local Testing with Docker

### Option 1: Full Stack (Recommended for testing)

```bash
# Build and run all services
docker-compose -f docker-compose.prod.yml up --build
```

Access:
- Web: http://localhost:3001
- Server: http://localhost:3000
- Database: postgresql://postgres:password@localhost:5432/tatame

### Option 2: Individual Services

```bash
# Database only (for local development)
pnpm db:start

# Server
cd apps/server
docker build -t tatame-server .
docker run -p 3000:3000 --env-file .env tatame-server

# Web
cd apps/web
docker build -t tatame-web .
docker run -p 3001:3000 tatame-web
```

## Environment Variables

### Required Environment Variables

Create a `.env` file in Coolify for each service:

**Server (`apps/server`):**
```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/tatame

# Clerk Authentication
CLERK_SECRET_KEY=
CLERK_PUBLISHABLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Resend (Email)
RESEND_API_KEY=

# Add others as needed
```

**Web (`apps/web`):**
```bash
# API endpoint
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## Database Migrations

After deploying the database and server:

```bash
# Run migrations in the server container
docker exec -it tatame-server pnpm db:migrate

# Or use Coolify's terminal to run:
cd /app && pnpm db:migrate
```

## Build Optimizations

### Server
- Uses `tsdown` for fast TypeScript compilation
- Multi-stage build reduces image size
- Only production dependencies included

### Web (Next.js)
- Standalone output mode enabled for Docker
- Static assets optimized
- Multi-stage build with minimal runtime

## Troubleshooting

### Container won't start
```bash
# Check logs in Coolify or locally:
docker logs tatame-server
docker logs tatame-web
```

### Database connection issues
- Ensure `DATABASE_URL` is correct
- Check database service is healthy
- Verify network connectivity between containers

### Build failures
- Check that all workspace dependencies are copied
- Verify pnpm lockfile is up to date
- Ensure Node.js version matches (22-alpine)

### Next.js standalone issues
- Confirm `output: "standalone"` in `next.config.ts`
- Check that static assets are copied correctly

## Monitoring

In Coolify, you can monitor:
- CPU/Memory usage per container
- Logs (real-time)
- Health checks
- Automatic restarts

## Scaling

With Coolify:
- **Web**: Can scale horizontally (multiple instances)
- **Server**: Can scale horizontally with load balancer
- **Database**: Use managed PostgreSQL for better scaling options

## CI/CD

Coolify can auto-deploy on git push:

1. Connect your Git repository
2. Set branch to track (e.g., `main`)
3. Coolify will rebuild and deploy on every push

## Security Checklist

- [ ] Use secrets management for sensitive environment variables
- [ ] Enable HTTPS/SSL certificates (Coolify auto-generates Let's Encrypt)
- [ ] Set proper CORS origins in server
- [ ] Use strong database passwords
- [ ] Keep Docker images updated
- [ ] Enable database backups in Coolify

## Cost Optimization

- Use Coolify's resource limits to prevent overuse
- Monitor container resource usage
- Consider scaling down non-critical services
- Use PostgreSQL connection pooling

## Support

For issues:
1. Check Coolify logs first
2. Verify environment variables
3. Test locally with `docker-compose.prod.yml`
4. Check network connectivity between services
