# Cloudflare Workers Setup Guide for RS News

This guide explains how to deploy RS News on Cloudflare Workers with D1 Database and Analytics Engine integration.

---

## 📋 Prerequisites

- Cloudflare account with Workers enabled
- Wrangler CLI v3+ installed (`npm install -g wrangler`)
- GitHub repository access
- Domain configured on Cloudflare (nors3ai.com)

---

## 🔐 Step 1: Authenticate with Cloudflare

Authenticate your Cloudflare account with wrangler:

```bash
npx wrangler login
```

This will:
1. Open a browser window to Cloudflare dashboard
2. Ask for permission to use wrangler
3. Generate an API token
4. Save credentials locally

**Your Cloudflare Account ID:** `8c338f96fc4756f94cea4c367a604b34`

---

## 🗄️ Step 2: Setup D1 Database

### Create D1 Database (if not exists)

```bash
npx wrangler d1 create rsnews-db1
```

This creates a SQLite database that will be replicated globally on Cloudflare's edge network.

### Bind Database to Worker

The `wrangler.toml` already includes the D1 binding:

```toml
[[d1_databases]]
binding = "DB"
database_name = "rsnews-db1"
database_id = "rsnews-db1"
```

### Initialize Database Schema

Create initial schema:

```bash
npx wrangler d1 execute rsnews-db1 --file schema.sql
```

Or run migrations:

```bash
npx wrangler d1 migrations create rsnews-db1 initial_schema
npx wrangler d1 migrations apply rsnews-db1 --remote
```

### Access Database

Connect to D1 from your Worker code:

```javascript
const db = env.DB;
const articles = await db.prepare('SELECT * FROM articles').all();
```

---

## 📊 Step 3: Setup Analytics Engine

Analytics Engine is automatically configured in `wrangler.toml`:

```toml
[[analytics_engine_datasets]]
binding = "ANALYTICS"
```

### Write Analytics Data

In your Worker code:

```javascript
export default {
  async fetch(request, env, ctx) {
    // Write event
    await env.ANALYTICS.writeDataPoint({
      indexes: ['article_view', articleId],
      blobs: [userAgent],
      doubles: [Date.now()]
    });
  }
};
```

### Query Analytics

View analytics in Cloudflare dashboard:
- Workers > Analytics
- Filter by dataset
- View trends and metrics

---

## 🌐 Step 4: Setup DNS Subdomain

Create subdomain `rsnews.nors3ai.com` pointing to Cloudflare Workers:

### Option A: Via Cloudflare Dashboard

1. Go to Cloudflare Dashboard > nors3ai.com
2. Go to DNS Records
3. Create CNAME record:
   - Type: CNAME
   - Name: rsnews
   - Content: [your-workers-subdomain].workers.dev
   - Proxy: Cloudflare (orange cloud)
4. Save

### Option B: Via wrangler.toml

Already configured in routes:

```toml
routes = [
  { pattern = "rsnews.nors3ai.com", zone_name = "nors3ai.com" }
]
```

When you deploy with wrangler, it will automatically:
1. Create the route
2. Setup SSL certificate
3. Enable caching

---

## 🚀 Step 5: Deploy to Cloudflare

### Local Testing

Test locally before deploying:

```bash
npx wrangler dev
```

This starts a local development server with:
- Hot reloading
- Database access (to development D1)
- Analytics simulation

Visit `http://localhost:8787` to test.

### Deploy to Production

Deploy to Cloudflare Workers:

```bash
npx wrangler deploy
```

This will:
1. Build your worker
2. Upload to Cloudflare
3. Deploy to all edge locations
4. Make live at `rsnews.nors3ai.com`

### Deploy to Staging

Deploy to staging environment:

```bash
npx wrangler deploy --env staging
```

This deploys to `staging-rsnews.nors3ai.com`.

---

## 🔄 Step 6: Setup GitHub Actions Deployment

Create `.github/workflows/deploy-cloudflare.yml`:

```yaml
name: Deploy to Cloudflare Workers

on:
  push:
    branches:
      - main
      - develop
  pull_request:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Deploy to Cloudflare
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        run: npx wrangler deploy

      - name: Post deployment
        run: |
          echo "✅ Deployed to https://rsnews.nors3ai.com"
```

### GitHub Secrets Setup

Add these secrets to your GitHub repository:

1. **CLOUDFLARE_API_TOKEN**
   - Go to Cloudflare Dashboard > User Profile > API Tokens
   - Create token with "Workers" permissions
   - Copy token
   - Add to GitHub Secrets

2. **CLOUDFLARE_ACCOUNT_ID**
   - Account ID: `8c338f96fc4756f94cea4c367a604b34`
   - Add to GitHub Secrets

### Command to Setup Secrets via CLI

```bash
# If using GitHub CLI
gh secret set CLOUDFLARE_API_TOKEN -b "your-token-here"
gh secret set CLOUDFLARE_ACCOUNT_ID -b "8c338f96fc4756f94cea4c367a604b34"
```

---

## 🔑 Environment Variables

### Local Development

Create `.env.local`:

```env
ENVIRONMENT=development
MONGODB_URI=mongodb://localhost:27017/rsnews
CF_ACCOUNT_ID=8c338f96fc4756f94cea4c367a604b34
```

### Production Secrets

Add to Cloudflare Workers environment:

```bash
npx wrangler secret put MONGODB_PASSWORD --env production
npx wrangler secret put MONGODB_USER --env production
```

Access in Worker code:

```javascript
const password = env.MONGODB_PASSWORD;
```

---

## 📈 Monitoring & Analytics

### View Worker Metrics

1. Cloudflare Dashboard > Workers
2. Select `rsnews` worker
3. View:
   - Requests per second
   - Error rate
   - CPU time
   - Wall clock time

### View Analytics Engine Data

1. Cloudflare Dashboard > Analytics
2. Select date range
3. View custom analytics data

### View Real-time Logs

```bash
npx wrangler tail --env production
```

This streams real-time logs from your production worker.

---

## 🛠️ Database Management

### Run Migrations

```bash
# Create migration
npx wrangler d1 migrations create rsnews-db1 add_new_table

# Apply to development
npx wrangler d1 migrations apply rsnews-db1 --local

# Apply to production
npx wrangler d1 migrations apply rsnews-db1 --remote
```

### Backup Database

```bash
# Export data
npx wrangler d1 export rsnews-db1 > backup.sql

# Import data
npx wrangler d1 execute rsnews-db1 --file backup.sql
```

### Query Database Directly

```bash
# Open interactive shell
npx wrangler d1 execute rsnews-db1 --interactive

# Or run query directly
npx wrangler d1 execute rsnews-db1 --command "SELECT * FROM articles LIMIT 10"
```

---

## 🔗 Subdomain Details

### Domain: rsnews.nors3ai.com

- **Type:** CNAME to Cloudflare Workers
- **SSL:** Automatic (Cloudflare managed)
- **Caching:** Enabled (configurable per route)
- **Performance:** Global edge deployment

### Access Points

- Production: https://rsnews.nors3ai.com
- Staging: https://staging-rsnews.nors3ai.com
- Development: http://localhost:8787

---

## 🚨 Common Issues & Troubleshooting

### Issue: "Account ID not found"

**Solution:** Ensure correct Account ID in `wrangler.toml`:
```toml
account_id = "8c338f96fc4756f94cea4c367a604b34"
```

### Issue: "D1 database not found"

**Solution:** Create database first:
```bash
npx wrangler d1 create rsnews-db1
```

### Issue: "CORS errors"

**Solution:** Add CORS headers in Worker:
```javascript
const response = new Response(body);
response.headers.set('Access-Control-Allow-Origin', '*');
response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
return response;
```

### Issue: "Timeout on D1 queries"

**Solution:** Use indexes for large tables:
```sql
CREATE INDEX idx_articles_created ON articles(createdAt DESC);
```

### Issue: "Analytics not showing"

**Solution:** Verify Analytics Engine binding in `wrangler.toml` and ensure data is being written:
```javascript
env.ANALYTICS.writeDataPoint({
  indexes: ['test'],
  blobs: ['data'],
  doubles: [1]
});
```

---

## 📚 Useful Resources

- **Wrangler Docs:** https://developers.cloudflare.com/workers/wrangler/
- **D1 Documentation:** https://developers.cloudflare.com/workers/platforms/databases/
- **Analytics Engine:** https://developers.cloudflare.com/analytics/analytics-engine/
- **Workers Runtime APIs:** https://developers.cloudflare.com/workers/runtime-apis/

---

## 🎯 Next Steps

1. ✅ Install wrangler: `npm install -g wrangler`
2. ✅ Authenticate: `npx wrangler login`
3. ✅ Create D1 database: `npx wrangler d1 create rsnews-db1`
4. ✅ Test locally: `npx wrangler dev`
5. ✅ Deploy: `npx wrangler deploy`
6. ✅ Setup GitHub Actions
7. ✅ Monitor at https://rsnews.nors3ai.com

---

## 📞 Account Information

```
Account ID: 8c338f96fc4756f94cea4c367a604b34
D1 Database: rsnews-db1
Domain: nors3ai.com
Subdomain: rsnews.nors3ai.com
Workers Environment: production, staging, development
Analytics Dataset: ANALYTICS
```

---

**Version:** 1.0.0
**Updated:** 2024
**Status:** Ready for Setup

---
