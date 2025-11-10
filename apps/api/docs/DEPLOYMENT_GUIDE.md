# API Deployment Guide

## Quick Deploy

```bash
cd apps/api
./deploy.sh
```

## Manual Deployment Steps

### 1. Build Application
```bash
npm run build
```

### 2. Verify Build
```bash
ls -la dist/main.js  # Should exist
```

### 3. Test Locally
```bash
npm run start:prod
# Test: curl http://localhost:3000/api/v1/health
```

### 4. Deploy to Server

#### Option A: Using deploy.sh (Recommended)
```bash
./deploy.sh
```

#### Option B: Manual Deployment
```bash
# 1. Create deployment package
tar -czf norchain-api-deploy.tar.gz dist/ package.json package-lock.json

# 2. Upload to server
scp -i ~/.ssh/key.pem norchain-api-deploy.tar.gz ec2-user@44.200.71.179:/tmp/

# 3. SSH and deploy
ssh -i ~/.ssh/key.pem ec2-user@44.200.71.179
cd /var/www/api.norchain.org
tar -xzf /tmp/norchain-api-deploy.tar.gz
npm ci --production
pm2 restart norchain-api
```

## Server Requirements

- **Node.js:** 18.x or higher
- **PM2:** Latest version (for process management)
- **Nginx:** For reverse proxy
- **Ports:** 3000 (API), 80/443 (Nginx)

## Environment Variables

Ensure `.env.production` is configured on the server with:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `DATABASE_URL`
- `DIRECT_URL`
- `RPC_URL`
- `REDIS_HOST`
- `REDIS_PORT`
- `JWT_SECRET`
- `NODE_ENV=production`

## Post-Deployment Verification

1. **Health Check (HTTPS):**
   ```bash
   curl https://api.norchain.org/api/v1/health
   ```

2. **API Docs (HTTPS):**
   ```bash
   curl https://api.norchain.org/api-docs
   ```

3. **SSL Certificate Check:**
   ```bash
   ssh ec2-user@44.200.71.179 'sudo certbot certificates'
   ```

3. **PM2 Status:**
   ```bash
   ssh ec2-user@44.200.71.179 'pm2 status'
   ```

4. **View Logs:**
   ```bash
   ssh ec2-user@44.200.71.179 'pm2 logs norchain-api'
   ```

## Troubleshooting

### API Not Responding
```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs norchain-api --lines 50

# Restart API
pm2 restart norchain-api
```

### Nginx Issues
```bash
# Test nginx config
sudo nginx -t

# Check nginx logs
sudo tail -f /var/log/nginx/api.norchain.org.error.log

# Restart nginx
sudo systemctl restart nginx
```

### Database Connection Issues
```bash
# Test database connection
npm run db:test

# Check environment variables
cat .env.production | grep DATABASE
```

## Rollback

```bash
# Stop current version
pm2 stop norchain-api

# Restore from backup
cd /var/www/api.norchain.org
rm -rf dist package.json
cp -r /var/backups/api.norchain.org/backup-YYYYMMDD_HHMMSS/* .

# Restart
pm2 restart norchain-api
```

## SSL/HTTPS Setup

SSL is automatically configured during deployment via Let's Encrypt. The deployment script:
1. Installs Certbot
2. Configures nginx for HTTP (for validation)
3. Obtains SSL certificate automatically
4. Configures HTTPS with security headers

**Manual SSL Setup (if needed):**
```bash
ssh ec2-user@44.200.71.179
sudo certbot --nginx -d api.norchain.org --non-interactive --agree-tos --email admin@norchain.org
```

**Auto-renewal:**
Certbot automatically sets up renewal. Test with:
```bash
sudo certbot renew --dry-run
```

## Monitoring

- **PM2 Monitoring:** `pm2 monit`
- **PM2 Web Dashboard:** `pm2 web`
- **Logs:** `/var/log/pm2/norchain-api-*.log`
- **Nginx Logs:** `/var/log/nginx/api.norchain.org.*.log`

---

**Last Updated:** $(date)  
**Version:** 2.0.0

