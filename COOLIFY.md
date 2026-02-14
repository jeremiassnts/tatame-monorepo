# Coolify Deployment Configuration

This file contains Coolify-specific configuration for deploying the Tatame monorepo.

## Service Architecture

```
┌─────────────────────────────────────────────────┐
│                   COOLIFY                       │
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │ Database │  │  Server  │  │     Web      │ │
│  │ postgres │  │   API    │  │   Next.js    │ │
│  │  :5432   │  │  :3000   │  │    :3000     │ │
│  └────┬─────┘  └────┬─────┘  └──────┬───────┘ │
│       │             │                │         │
│       └─────────────┴────────────────┘         │
│              Internal Network                  │
└─────────────────────────────────────────────────┘
         │              │               │
         │              │               │
    (internal)    api.domain.com   domain.com
```

## Deployment Steps

### 1. Database Service

**Create PostgreSQL Database in Coolify:**

1. Go to **Resources** → **Add Resource** → **Database**
2. Select **PostgreSQL**
3. Configure:
   - **Name**: `tatame-postgres`
   - **Version**: `16` (or latest)
   - **Database**: `tatame`
   - **Username**: `postgres`
   - **Password**: Generate strong password
4. Deploy and wait for health check
5. **Copy connection string** (internal): `postgresql://postgres:PASSWORD@tatame-postgres:5432/tatame`

### 2. Server Service (API)

**Create Server Application:**

1. Go to **Resources** → **Add Resource** → **Git Repository** or **GitHub App**
2. Configure:
   - **Repository**: Your monorepo URL
   - **Branch**: `main` (or your deployment branch)
   - **Build Pack**: `Dockerfile`
   - **Dockerfile Location**: `apps/server/Dockerfile`
   - **Build Context**: `.` (root of repository)
3. **Port Configuration**:
   - **Port**: `3000`
4. **Environment Variables**:
   ```env
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=postgresql://postgres:PASSWORD@tatame-postgres:5432/tatame
   CORS_ORIGIN=https://yourdomain.com
   CLERK_SECRET_KEY=sk_live_...
   CLERK_PUBLISHABLE_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   RESEND_API_KEY=re_...
   SUPABASE_URL=https://...supabase.co
   SUPABASE_ANON_KEY=eyJ...
   ```
5. **Domain Configuration**:
   - Add domain: `api.yourdomain.com`
   - Enable SSL (Let's Encrypt)
6. Deploy

### 3. Web Service (Next.js)

**Create Web Application:**

1. Go to **Resources** → **Add Resource** → **Git Repository**
2. Configure:
   - **Repository**: Same monorepo URL
   - **Branch**: `main`
   - **Build Pack**: `Dockerfile`
   - **Dockerfile Location**: `apps/web/Dockerfile`
   - **Build Context**: `.` (root of repository)
3. **Port Configuration**:
   - **Port**: `3000`
4. **Environment Variables**:
   ```env
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   ```
5. **Domain Configuration**:
   - Add domain: `yourdomain.com` or `app.yourdomain.com`
   - Enable SSL (Let's Encrypt)
6. Deploy

## Environment Variables Reference

### Server (Required)

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | PostgreSQL connection | `postgresql://user:pass@host:5432/db` |
| `CORS_ORIGIN` | Allowed CORS origin | `https://yourdomain.com` |
| `CLERK_SECRET_KEY` | Clerk auth secret | `sk_live_...` |
| `CLERK_PUBLISHABLE_KEY` | Clerk public key | `pk_live_...` |
| `STRIPE_SECRET_KEY` | Stripe API key | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | `whsec_...` |
| `RESEND_API_KEY` | Resend email API | `re_...` |
| `SUPABASE_URL` | Supabase URL (temporary) | `https://...supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase key (temporary) | `eyJ...` |

### Web (Required)

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `NEXT_PUBLIC_API_URL` | API endpoint | `https://api.yourdomain.com` |

## Post-Deployment Tasks

### 1. Run Database Migrations

After server is deployed:

```bash
# In Coolify's server container terminal:
cd /app
pnpm db:migrate
```

Or use Coolify's **Execute Command** feature:
- Command: `cd /app && pnpm db:migrate`

### 2. Verify Services

**Database:**
```bash
# Test connection
psql $DATABASE_URL -c "SELECT version();"
```

**Server:**
```bash
# Check health
curl https://api.yourdomain.com/api/health
```

**Web:**
```bash
# Check if web is loading
curl https://yourdomain.com
```

### 3. Configure Webhooks

**Stripe Webhooks:**
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://api.yourdomain.com/api/webhooks/stripe`
3. Copy signing secret to `STRIPE_WEBHOOK_SECRET`

**Clerk Webhooks (if needed):**
1. Go to Clerk Dashboard → Webhooks
2. Add endpoint for user events

## Coolify Features to Enable

### Auto-Deploy
- Enable **Auto Deploy** on git push
- Branch: `main` (or your production branch)
- Deploy on push: ✅

### Health Checks
Configure health checks in Coolify:

**Server:**
- Path: `/api/health` (if you have a health endpoint)
- Interval: `30s`
- Timeout: `5s`
- Retries: `3`

**Web:**
- Path: `/`
- Interval: `30s`

### Resource Limits

**Server:**
- CPU: `0.5-1 core` (adjust based on load)
- Memory: `512MB-1GB`

**Web:**
- CPU: `0.5-1 core`
- Memory: `512MB-1GB`

**Database:**
- CPU: `0.5 core`
- Memory: `1GB`
- Storage: `10GB` (adjust based on needs)

### Backups

**Database Backups:**
- Enable **Automatic Backups** in Coolify
- Frequency: Daily
- Retention: 7 days (or more)

## Networking

### Internal Communication

Services communicate internally using Coolify's internal network:

```
Server → Database: tatame-postgres:5432
Web → Server: Internal (not needed if using public domain)
```

### External Access

Only Web and Server should be publicly accessible:

```
User → Web (yourdomain.com) → Server (api.yourdomain.com) → Database (internal)
```

## Monitoring

### Logs

Access logs in Coolify:
1. Select service
2. Go to **Logs** tab
3. View real-time logs

### Metrics

Monitor in Coolify dashboard:
- CPU usage
- Memory usage
- Network I/O
- Response time

### Alerts

Set up alerts in Coolify:
- Service down
- High CPU/Memory
- Failed health checks

## Scaling

### Horizontal Scaling

**Web (Next.js):**
- Can scale to multiple instances
- Coolify handles load balancing

**Server:**
- Can scale to multiple instances
- Ensure stateless design

**Database:**
- Consider managed PostgreSQL for better scaling
- Or use Coolify's PostgreSQL replica

### Vertical Scaling

Adjust resource limits in Coolify:
1. Select service
2. Go to **Resources**
3. Increase CPU/Memory

## Troubleshooting

### Common Issues

**1. Build fails:**
```bash
# Check build logs in Coolify
# Common issues:
- Incorrect Dockerfile path
- Missing dependencies in pnpm-lock.yaml
- Wrong build context
```

**2. Container won't start:**
```bash
# Check logs:
- Environment variable missing
- Port conflict
- Database connection failure
```

**3. Database connection error:**
```bash
# Verify DATABASE_URL format:
postgresql://user:password@host:5432/database

# Check database is running:
# Go to database service in Coolify, check health
```

**4. CORS errors:**
```bash
# Update CORS_ORIGIN in server env vars
# Ensure it matches your web domain
CORS_ORIGIN=https://yourdomain.com
```

### Debug Commands

**Check server logs:**
```bash
# In Coolify container terminal
tail -f /app/logs/error.log
```

**Test database connection:**
```bash
# In server container
node -e "console.log(process.env.DATABASE_URL)"
```

**Check Next.js build:**
```bash
# In web container
ls -la /app/apps/web/.next/
```

## Security Checklist

- [ ] SSL/HTTPS enabled for all public services
- [ ] Strong database password
- [ ] Environment variables stored in Coolify secrets
- [ ] Database not publicly accessible
- [ ] CORS restricted to your domain
- [ ] Stripe webhook signature verification enabled
- [ ] Regular security updates (enable auto-update in Coolify)
- [ ] Firewall rules configured
- [ ] Database backups enabled
- [ ] Monitor logs for suspicious activity

## Cost Optimization

1. **Right-size resources**: Start small, scale as needed
2. **Use resource limits**: Prevent overuse
3. **Enable caching**: Use Coolify's caching features
4. **Optimize images**: Multi-stage builds already implemented
5. **Monitor usage**: Check Coolify metrics regularly

## Rollback Strategy

If deployment fails:

1. **Rollback in Coolify**:
   - Go to service
   - Select **Deployments** tab
   - Click **Rollback** on previous working deployment

2. **Manual rollback**:
   ```bash
   # Revert git commit
   git revert HEAD
   git push
   
   # Or deploy specific commit
   # In Coolify: specify commit SHA
   ```

## Support Resources

- **Coolify Docs**: https://coolify.io/docs
- **Coolify Discord**: https://discord.gg/coolify
- **GitHub Issues**: Your repository issues

## Next Steps After Deployment

1. ✅ Verify all services are running
2. ✅ Run database migrations
3. ✅ Test API endpoints
4. ✅ Test web application
5. ✅ Configure webhooks
6. ✅ Set up monitoring
7. ✅ Enable backups
8. ✅ Configure domain DNS
9. ✅ Test production flow end-to-end
10. ✅ Monitor for 24-48 hours
