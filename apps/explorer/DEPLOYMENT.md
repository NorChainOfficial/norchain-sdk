# Xaheen Chain Explorer - Deployment Guide

## Production Infrastructure

### DNS Configuration
The following DNS A records are configured for production:

```
explorer.xaheen.org → 3.91.50.187  (HTTPS)
rpc.xaheen.org      → 3.91.50.187  (HTTPS)
ws.xaheen.org       → 3.91.50.187  (WSS - WebSocket Secure)
```

**Note:** All production endpoints must use HTTPS/WSS (TLS encrypted connections)

## Environment Configuration

### Local Development

1. Copy the example environment file:
```bash
cp .env.example .env.local
```

2. Configure local environment variables:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_RPC_URL=http://localhost:8545
NEXT_PUBLIC_NETWORK_NAME=Xaheen Chain (Local)
```

3. Start the development server:
```bash
npm run dev
```

### Production Deployment

1. Ensure `.env.production` is configured with production values:
```env
NEXT_PUBLIC_API_URL=https://explorer.xaheen.org/api/v1
NEXT_PUBLIC_RPC_URL=https://rpc.xaheen.org
NEXT_PUBLIC_NETWORK_NAME=Xaheen Chain
```

2. Build the production application:
```bash
npm run build
```

3. Start the production server:
```bash
npm run start
```

## Server Requirements

### Minimum Requirements
- **Node.js**: 18.x or higher
- **RAM**: 2GB minimum (4GB recommended)
- **Storage**: 10GB minimum
- **CPU**: 2 cores minimum

### Recommended Production Setup
- **Node.js**: 20.x LTS
- **RAM**: 8GB
- **Storage**: 50GB SSD
- **CPU**: 4 cores
- **Load Balancer**: Nginx or AWS ALB

## Deployment Options

### Option 1: Docker Deployment (Recommended)

1. Build the Docker image:
```bash
docker build -t xaheen-explorer:latest .
```

2. Run the container:
```bash
docker run -d \
  --name xaheen-explorer \
  -p 3000:3000 \
  --env-file .env.production \
  xaheen-explorer:latest
```

3. Or use Docker Compose:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Option 2: PM2 Deployment

1. Install PM2 globally:
```bash
npm install -g pm2
```

2. Build the application:
```bash
npm run build
```

3. Start with PM2:
```bash
pm2 start npm --name "xaheen-explorer" -- start
pm2 save
pm2 startup
```

4. Monitor the application:
```bash
pm2 logs xaheen-explorer
pm2 status
```

### Option 3: Vercel Deployment

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy to Vercel:
```bash
vercel --prod
```

3. Configure environment variables in Vercel dashboard

### Option 4: AWS EC2 Deployment

1. Launch EC2 instance (Ubuntu 22.04 LTS recommended)

2. Install Node.js and dependencies:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install -y git nginx
```

3. Clone and setup the project:
```bash
git clone <repository-url>
cd xaheen-sdk/apps/web
npm install
npm run build
```

4. Configure Nginx as reverse proxy:
```nginx
server {
    listen 80;
    server_name explorer.xaheen.org;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

5. Setup SSL with Let's Encrypt:
```bash
sudo apt-get install certbot python3-certbot-nginx

# Get certificates for all domains
sudo certbot --nginx -d explorer.xaheen.org -d rpc.xaheen.org -d ws.xaheen.org

# Or get them separately
sudo certbot --nginx -d explorer.xaheen.org
sudo certbot --nginx -d rpc.xaheen.org
sudo certbot --nginx -d ws.xaheen.org
```

## Nginx Configuration

### Complete Nginx Configuration with WebSocket Support

```nginx
# Frontend upstream
upstream xaheen_explorer {
    server localhost:3000;
    keepalive 64;
}

# WebSocket upstream
upstream xaheen_websocket {
    server localhost:4001;
    keepalive 64;
}

# Redirect HTTP to HTTPS for explorer
server {
    listen 80;
    server_name explorer.xaheen.org;
    return 301 https://$server_name$request_uri;
}

# Redirect HTTP to HTTPS for WebSocket
server {
    listen 80;
    server_name ws.xaheen.org;
    return 301 https://$server_name$request_uri;
}

# Explorer frontend
server {
    listen 443 ssl http2;
    server_name explorer.xaheen.org;

    ssl_certificate /etc/letsencrypt/live/explorer.xaheen.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/explorer.xaheen.org/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    location / {
        proxy_pass http://xaheen_explorer;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files caching
    location /_next/static/ {
        alias /var/www/xaheen-explorer/.next/static/;
        expires 1y;
        access_log off;
        add_header Cache-Control "public, immutable";
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
    }
}

# WebSocket server
server {
    listen 443 ssl http2;
    server_name ws.xaheen.org;

    ssl_certificate /etc/letsencrypt/live/ws.xaheen.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ws.xaheen.org/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://xaheen_websocket;
        proxy_http_version 1.1;

        # WebSocket specific headers
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket timeout settings
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;

        # Disable buffering for WebSocket
        proxy_buffering off;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "websocket healthy\n";
    }
}
```

## Backend API Setup

The explorer requires the Xaheen SDK backend API to be running. Ensure the backend is:

1. Running on the same server or accessible network
2. Properly configured with database connection
3. Accessible at the URL specified in `NEXT_PUBLIC_API_URL`

### Backend Health Checks
```bash
# API Health Check
curl https://explorer.xaheen.org/api/v1/stats

# WebSocket Health Check (HTTP)
curl https://ws.xaheen.org/health

# WebSocket Connection Test
wscat -c wss://ws.xaheen.org

# Or using JavaScript
node -e "const ws = new (require('ws'))('wss://ws.xaheen.org'); ws.on('open', () => console.log('Connected!'));"
```

## Monitoring and Maintenance

### Health Checks

Monitor the following endpoints:
- Frontend: `https://explorer.xaheen.org/`
- API: `https://explorer.xaheen.org/api/v1/stats`
- RPC: `https://rpc.xaheen.org/`
- WebSocket: `wss://ws.xaheen.org/` (WebSocket connection)
- WebSocket Health: `https://ws.xaheen.org/health` (HTTP check)

### Log Management

**With PM2:**
```bash
pm2 logs xaheen-explorer
pm2 logs xaheen-explorer --lines 100
pm2 flush xaheen-explorer
```

**With Docker:**
```bash
docker logs xaheen-explorer
docker logs -f xaheen-explorer --tail 100
```

### Performance Monitoring

**Enable Next.js Analytics:**
```env
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

**Monitor Key Metrics:**
- Response time
- Error rate
- Memory usage
- CPU usage
- API latency

### Backup Strategy

1. **Application Files:**
```bash
tar -czf xaheen-explorer-backup-$(date +%Y%m%d).tar.gz /path/to/app
```

2. **Environment Configuration:**
```bash
cp .env.production .env.production.backup
```

## Troubleshooting

### Common Issues

**1. Port 3000 already in use:**
```bash
# Find process
lsof -i :3000
# Kill process
kill -9 <PID>
```

**2. API connection errors:**
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check backend API is running
- Verify firewall rules allow connections

**3. Build errors:**
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

**4. Memory issues:**
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

## Security Best Practices

1. **Keep Dependencies Updated:**
```bash
npm audit
npm update
```

2. **Use Environment Variables:** Never commit sensitive data to git

3. **Enable HTTPS:** Always use SSL certificates in production

4. **Set Security Headers:** Configure CSP, HSTS, X-Frame-Options

5. **Rate Limiting:** Implement rate limiting at Nginx level

6. **Regular Updates:** Keep Node.js, npm, and system packages updated

## Scaling

### Horizontal Scaling

Deploy multiple instances behind a load balancer:

```nginx
upstream xaheen_explorer {
    least_conn;
    server 10.0.1.10:3000 max_fails=3 fail_timeout=30s;
    server 10.0.1.11:3000 max_fails=3 fail_timeout=30s;
    server 10.0.1.12:3000 max_fails=3 fail_timeout=30s;
}
```

### Caching Strategy

1. **CDN:** Use CloudFlare or AWS CloudFront for static assets
2. **Redis:** Cache API responses (configure in backend)
3. **Next.js ISR:** Already configured with 3-second revalidation

## Support

For deployment support, contact:
- Technical Support: support@xaheen.org
- Documentation: https://docs.xaheen.org
- GitHub Issues: https://github.com/xaheenchain/explorer

## Production Checklist

Before deploying to production:

- [ ] Environment variables configured (.env.production)
- [ ] Backend API accessible (https://explorer.xaheen.org/api/v1)
- [ ] RPC endpoint responsive (https://rpc.xaheen.org)
- [ ] WebSocket server running (wss://ws.xaheen.org)
- [ ] SSL certificates installed for all 3 domains
  - [ ] explorer.xaheen.org
  - [ ] rpc.xaheen.org
  - [ ] ws.xaheen.org
- [ ] Nginx configured and tested
- [ ] WebSocket proxying working correctly
- [ ] Monitoring setup (PM2/Docker logs)
- [ ] Firewall rules configured
  - [ ] Port 443 (HTTPS/WSS)
  - [ ] Port 80 (HTTP redirect)
- [ ] Backup strategy in place
- [ ] Health checks passing
  - [ ] Frontend: https://explorer.xaheen.org/
  - [ ] API: https://explorer.xaheen.org/api/v1/stats
  - [ ] RPC: https://rpc.xaheen.org/
  - [ ] WebSocket: wss://ws.xaheen.org/
- [ ] Performance testing completed
- [ ] Security headers configured
- [ ] DNS records verified (3 A records)
- [ ] Error tracking setup
- [ ] Documentation updated
- [ ] WebSocket reconnection tested
- [ ] Real-time updates working
