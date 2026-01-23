# DNS Subdomain Setup - rsnewsroom.nors3ai.com

Complete guide to configure the DNS subdomain pointing to Cloudflare Workers.

---

## 📍 Subdomain Details

| Property | Value |
|---|---|
| **Full Domain** | rsnewsroom.nors3ai.com |
| **Parent Domain** | nors3ai.com |
| **Subdomain** | rsnewsroom |
| **Type** | CNAME to Cloudflare Workers |
| **Target** | Cloudflare Workers Edge Network |
| **SSL** | Automatic (Cloudflare managed) |

---

## 🔧 Setup Methods

### Method 1: Cloudflare Dashboard (Recommended)

1. **Go to Cloudflare Dashboard**
   - URL: https://dash.cloudflare.com
   - Select your account
   - Select domain: `nors3ai.com`

2. **Navigate to DNS Records**
   - Left sidebar > DNS Records
   - Or click the DNS tab

3. **Create CNAME Record**
   - Click "Add record"
   - Type: CNAME
   - Name: `rsnewsroom`
   - Content: `rsnewsroom.workers.dev` (or your custom workers domain)
   - TTL: Auto (3600 seconds)
   - Proxy: Cloudflare (orange cloud icon)
   - Click Save

4. **Verify DNS Propagation**
   ```bash
   # Check DNS record
   dig rsnewsroom.nors3ai.com CNAME

   # Should show CNAME pointing to workers.dev
   ```

### Method 2: Via Wrangler CLI

When you deploy with wrangler, it automatically creates the DNS record:

```bash
npm run wrangler:deploy:production
```

Wrangler will:
1. Read routes from `wrangler.toml`
2. Create/update DNS records
3. Setup SSL certificate
4. Activate the deployment

Check `wrangler.toml`:
```toml
routes = [
  { pattern = "rsnewsroom.nors3ai.com", zone_name = "nors3ai.com" }
]
```

### Method 3: Terraform (Infrastructure as Code)

If using Terraform:

```hcl
resource "cloudflare_record" "rsnewsroom" {
  zone_id = data.cloudflare_zone.nors3ai.id
  name    = "rsnewsroom"
  type    = "CNAME"
  value   = "rsnewsroom.workers.dev"
  ttl     = 3600
  proxied = true
}
```

---

## ✅ Verify Setup

### 1. DNS Resolution

```bash
# Test DNS record
nslookup rsnewsroom.nors3ai.com
# or
dig rsnewsroom.nors3ai.com

# Should resolve to Cloudflare nameservers
```

### 2. HTTP Connectivity

```bash
# Test HTTP access
curl -I https://rsnewsroom.nors3ai.com
# Should return 200/404 (not DNS error)

# Check health endpoint
curl https://rsnewsroom.nors3ai.com/health
# Should return JSON health status
```

### 3. SSL Certificate

```bash
# Check SSL certificate
openssl s_client -connect rsnewsroom.nors3ai.com:443 -servername rsnewsroom.nors3ai.com

# Should show:
# - Certificate: *.nors3ai.com or rsnewsroom.nors3ai.com
# - Issuer: Cloudflare
# - Validity: Valid
```

### 4. Cloudflare Dashboard

1. Go to https://dash.cloudflare.com/nors3ai.com
2. DNS Records section
3. Look for `rsnews` CNAME record
4. Status should show orange cloud (proxied)

---

## 🔄 SSL/TLS Configuration

Cloudflare automatically manages SSL for your subdomain:

### SSL Certificate Details

- **Certificate Issuer:** Cloudflare
- **Certificate Type:** Universal Wildcard (*.nors3ai.com)
- **Auto-renewal:** Yes (90 days)
- **Minimum TLS Version:** TLS 1.2
- **Certificate Pinning:** Optional

### Enable HTTPS

The subdomain uses HTTPS automatically:
- HTTP traffic redirects to HTTPS
- All traffic encrypted
- No manual certificate needed

### Verify SSL

```bash
# Check certificate validity
echo | openssl s_client -servername rsnewsroom.nors3ai.com -connect rsnewsroom.nors3ai.com:443 2>/dev/null | openssl x509 -noout -dates

# Check certificate details
echo | openssl s_client -servername rsnewsroom.nors3ai.com -connect rsnewsroom.nors3ai.com:443 2>/dev/null | openssl x509 -noout -text
```

---

## 🔒 Security Settings

### DNSSEC

Cloudflare provides DNSSEC for domain protection:

1. Cloudflare Dashboard > nors3ai.com
2. DNS > DNSSEC
3. Status: Enabled (by default)

### DDoS Protection

Cloudflare automatically protects your subdomain:
- DDoS attacks blocked at edge
- Firewall rules available
- Advanced DDoS protection for business plans

### Access Control

Control who can access your subdomain:

```toml
# In wrangler.toml - can add in future
[routes]
pattern = "rsnewsroom.nors3ai.com"
zone_name = "nors3ai.com"
# IP allowlist would go here
```

---

## 📊 Monitoring DNS

### Cloudflare Dashboard

1. Go to https://dash.cloudflare.com
2. Domain: nors3ai.com
3. Analytics & Logs section
4. View DNS query statistics

### Monitor Queries

```bash
# Real-time query monitoring
watch -n 1 'dig rsnewsroom.nors3ai.com short'
```

---

## 🆘 Troubleshooting

### Issue: DNS not resolving

**Solution:**
1. Wait 24-48 hours for DNS propagation
2. Clear DNS cache:
   ```bash
   # macOS
   sudo dscacheutil -flushcache

   # Linux
   sudo systemctl restart systemd-resolved

   # Windows
   ipconfig /flushdns
   ```
3. Verify record in Cloudflare dashboard

### Issue: SSL Certificate not working

**Solution:**
1. Wait 5-10 minutes after DNS creation
2. Use curl to verify:
   ```bash
   curl -v https://rsnewsroom.nors3ai.com
   ```
3. Check Cloudflare SSL/TLS settings

### Issue: Workers not responding

**Solution:**
1. Verify worker is deployed:
   ```bash
   npm run wrangler:deploy:production
   ```
2. Check logs:
   ```bash
   npm run wrangler:tail
   ```
3. Test locally first:
   ```bash
   npm run wrangler:dev
   ```

### Issue: CNAME conflicts

**Solution:**
Ensure no conflicting records:
- Delete old A records for `rsnewsroom`
- Only one CNAME per subdomain allowed
- Check Cloudflare DNS Records page

---

## 📋 DNS Record Details

### Current Configuration

```
Name:    rsnewsroom
Type:    CNAME
Content: rsnewsroom.workers.dev
TTL:     Auto (3600)
Proxy:   Cloudflare (orange)
```

### DNS Propagation Status

Check at: https://whatsmydns.net/

1. Enter: `rsnewsroom.nors3ai.com`
2. Check propagation globally
3. All should show Cloudflare nameservers

---

## 🚀 After DNS Setup

Once DNS is configured:

1. **Deploy Worker:**
   ```bash
   npm run wrangler:deploy:production
   ```

2. **Test Access:**
   ```bash
   curl https://rsnewsroom.nors3ai.com/health
   ```

3. **Monitor Logs:**
   ```bash
   npm run wrangler:tail
   ```

4. **View Metrics:**
   - Cloudflare Dashboard > Workers > rsnews
   - Check Requests, Errors, CPU Time

---

## 📞 Subdomain Summary

```
Production URL:  https://rsnewsroom.nors3ai.com
Staging URL:     https://staging-rsnewsroom.nors3ai.com
Development:     http://localhost:8787

Account ID:      8c338f96fc4756f94cea4c367a604b34
Domain:          nors3ai.com
Database:        rsnews-db1
Workers Name:    rsnews
Environment:     production, staging, development
```

---

## ✨ Next Steps

1. ✅ Create DNS record (CNAME)
2. ✅ Wait for propagation
3. ✅ Deploy worker: `npm run wrangler:deploy:production`
4. ✅ Test: `curl https://rsnewsroom.nors3ai.com/health`
5. ✅ Monitor: Check Cloudflare dashboard

---

**Setup Date:** January 2024
**Status:** Ready for Deployment
**Maintenance:** Automatic (Cloudflare managed)

---
