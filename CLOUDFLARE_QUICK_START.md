# Cloudflare Quick Start - RS News

Fast setup guide to deploy RS News on Cloudflare Workers with D1 and Analytics Engine.

---

## ⚡ Quick Setup (5-10 minutes)

### 1. Install Wrangler

```bash
npm install -g wrangler
# or use npm script
npm run wrangler -- --version
```

### 2. Authenticate with Cloudflare

```bash
npm run wrangler:login
```

**Account ID:** `8c338f96fc4756f94cea4c367a604b34`

This opens a browser and creates an API token. Keep it safe!

### 3. Create D1 Database

```bash
npm run db:create
```

Or manually:
```bash
npx wrangler d1 create rsnews-db1
```

### 4. Initialize Database Schema

```bash
npm run db:schema
```

This creates all necessary tables from `schema.sql`.

### 5. Test Locally

```bash
npm run wrangler:dev
```

Opens local worker at `http://localhost:8787/health`

### 6. Deploy to Production

```bash
npm run wrangler:deploy:production
```

Or to staging:
```bash
npm run wrangler:deploy:staging
```

---

## 🔑 GitHub Setup for Auto-Deployment

### 1. Get Cloudflare API Token

Go to: https://dash.cloudflare.com/profile/api-tokens

- Create token with "Workers" scope
- Copy token

### 2. Add GitHub Secrets

In your GitHub repo settings > Secrets and variables > Actions:

```
CLOUDFLARE_API_TOKEN = [your-api-token]
CLOUDFLARE_ACCOUNT_ID = 8c338f96fc4756f94cea4c367a604b34
```

Or via CLI:
```bash
gh secret set CLOUDFLARE_API_TOKEN -b "your-token"
gh secret set CLOUDFLARE_ACCOUNT_ID -b "8c338f96fc4756f94cea4c367a604b34"
```

### 3. Push Code to GitHub

Workflow automatically deploys when you push:
- Push to `main` → Deploy to production
- Push to `develop` → Deploy to staging

---

## 📊 Access Your Deployment

| Environment | URL |
|---|---|
| Production | https://rsnewsroom.nors3ai.com |
| Staging | https://staging-rsnewsroom.nors3ai.com |
| Development | http://localhost:8787 |

Check health: `https://rsnewsroom.nors3ai.com/health`

---

## 🗄️ Database Commands

```bash
# Execute SQL directly
npm run db:execute -- --command "SELECT COUNT(*) FROM users"

# List all databases
npm run db:list

# Backup database
npm run db:backup

# Connect to database shell
npx wrangler d1 execute rsnews-db1 --interactive
```

---

## 📈 Monitor Your Deployment

### View Logs

```bash
npm run wrangler:tail
```

### Check Metrics

1. Cloudflare Dashboard > Workers > rsnews
2. View requests, errors, CPU time
3. See real-time logs

### View Analytics Engine Data

1. Cloudflare Dashboard > Analytics
2. View custom analytics
3. Query your data points

---

## 🆘 Troubleshooting

### Can't login?

```bash
# Clear wrangler credentials
rm ~/.wrangler/config.toml

# Login again
npm run wrangler:login
```

### Database not working?

```bash
# Check database exists
npm run db:list

# View database schema
npm run db:execute -- --command ".schema"

# Check database ID matches wrangler.toml
cat wrangler.toml | grep rsnews-db1
```

### Deployment failed?

1. Check GitHub Actions logs
2. Ensure `CLOUDFLARE_API_TOKEN` is set
3. Verify account ID: `8c338f96fc4756f94cea4c367a604b34`
4. Run locally first: `npm run wrangler:dev`

### SSL Certificate Issues?

Cloudflare automatically generates SSL for:
- `rsnewsroom.nors3ai.com` (production)
- `staging-rsnewsroom.nors3ai.com` (staging)

Wait ~5 minutes after first deployment.

---

## 📋 Configuration Files

All files are already created:

```
/wrangler.toml          # Main configuration
/schema.sql             # Database schema
/src/workers/index.js   # Worker code
/.github/workflows/     # Auto-deploy workflows
/CLOUDFLARE_SETUP.md    # Detailed guide
```

---

## 🚀 Next Steps

1. ✅ Run local dev server: `npm run wrangler:dev`
2. ✅ Deploy: `npm run wrangler:deploy:production`
3. ✅ Monitor: View dashboard
4. ✅ Setup GitHub: Add secrets and push code

---

## 📞 Support

- **Wrangler Docs:** https://developers.cloudflare.com/workers/wrangler/
- **D1 Docs:** https://developers.cloudflare.com/workers/platforms/databases/
- **Cloudflare Dashboard:** https://dash.cloudflare.com/

---

**Account ID:** `8c338f96fc4756f94cea4c367a604b34`
**Domain:** `nors3ai.com`
**Subdomain:** `rsnewsroom.nors3ai.com`
**Database:** `rsnews-db1`

---
