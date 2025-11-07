# Xaheen Chain - Quick Deployment Checklist

## Chain Configuration

### Network Details
```
Chain Name: Xaheen Chain
Chain ID: 65001 (0xFDE9 in hex)
Currency: XHN
Decimals: 18
```

### Production Endpoints
```
Explorer: https://explorer.xaheen.org
RPC: https://rpc.xaheen.org
WebSocket: wss://ws.xaheen.org
API: https://explorer.xaheen.org/api/v1
```

### DNS A Records (All point to 3.91.50.187)
```
A explorer.xaheen.org → 3.91.50.187 (HTTPS)
A rpc.xaheen.org → 3.91.50.187 (HTTPS)
A ws.xaheen.org → 3.91.50.187 (WSS)
```

## Wallet Integration

### Add Network to MetaMask/Trust Wallet
```javascript
{
  chainId: '0xFDE9', // 65001 in hex
  chainName: 'Xaheen Chain',
  rpcUrls: ['https://rpc.xaheen.org'],
  nativeCurrency: {
    name: 'XHN',
    symbol: 'XHN',
    decimals: 18,
  },
  blockExplorerUrls: ['https://explorer.xaheen.org'],
}
```

### One-Click Network Addition
Users can add the network directly from the homepage wallet connector:
1. Visit https://explorer.xaheen.org
2. Scroll to "Connect Your Wallet" section
3. Connect wallet (MetaMask/Trust Wallet/Ledger)
4. Click "Add Xaheen Network" button
5. Approve in wallet

## Environment Files Status

✅ `.env.production` - Chain ID updated to 65001
✅ `.env.local` - Chain ID updated to 65001
✅ `.env.example` - Chain ID updated to 65001
✅ `WalletConnector.tsx` - Chain ID updated to 0xFDE9

## Pre-Deployment Checklist

### Backend Requirements
- [ ] Xaheen SDK backend deployed and running
- [ ] PostgreSQL database configured
- [ ] Backend API accessible at https://explorer.xaheen.org/api/v1
- [ ] RPC endpoint responsive at https://rpc.xaheen.org
- [ ] WebSocket server running at wss://ws.xaheen.org

### SSL Certificates
- [ ] Certificate for explorer.xaheen.org
- [ ] Certificate for rpc.xaheen.org
- [ ] Certificate for ws.xaheen.org

### Nginx Configuration
- [ ] Reverse proxy configured for frontend (port 3000)
- [ ] RPC proxy configured
- [ ] WebSocket proxy configured with upgrade headers
- [ ] SSL redirects (HTTP → HTTPS)
- [ ] CORS headers configured if needed

### DNS Verification
```bash
# Verify DNS records
dig explorer.xaheen.org
dig rpc.xaheen.org
dig ws.xaheen.org

# All should return: 3.91.50.187
```

### Health Checks
```bash
# Frontend
curl https://explorer.xaheen.org

# API
curl https://explorer.xaheen.org/api/v1/stats

# RPC
curl -X POST https://rpc.xaheen.org \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# WebSocket (HTTP check)
curl https://ws.xaheen.org/health

# WebSocket (Connection test)
wscat -c wss://ws.xaheen.org
```

## Deployment Steps

### 1. Build Application
```bash
cd /path/to/xaheen-sdk/apps/web
npm install
npm run build
```

### 2. Start with PM2 (Recommended)
```bash
pm2 start npm --name "xaheen-explorer" -- start
pm2 save
pm2 startup
```

### 3. Or Start with Docker
```bash
docker build -t xaheen-explorer:latest .
docker run -d \
  --name xaheen-explorer \
  -p 3000:3000 \
  --env-file .env.production \
  xaheen-explorer:latest
```

### 4. Verify Deployment
```bash
# Check application is running
curl http://localhost:3000

# Check PM2 status
pm2 status

# Check logs
pm2 logs xaheen-explorer
```

### 5. Configure Nginx
```bash
# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 6. Setup SSL
```bash
# Install certbot if not already installed
sudo apt-get install certbot python3-certbot-nginx

# Get certificates for all domains
sudo certbot --nginx -d explorer.xaheen.org
sudo certbot --nginx -d rpc.xaheen.org
sudo certbot --nginx -d ws.xaheen.org

# Verify auto-renewal
sudo certbot renew --dry-run
```

## Post-Deployment Verification

### Functionality Tests
- [ ] Homepage loads correctly
- [ ] Latest blocks are displayed
- [ ] Latest transactions are displayed
- [ ] Stats are accurate
- [ ] Block detail pages work
- [ ] Transaction detail pages work
- [ ] Account/address pages work
- [ ] Validators page works
- [ ] Search functionality works
- [ ] Wallet connector appears on homepage
- [ ] Can connect MetaMask
- [ ] Can add Xaheen Network to wallet (shows as "Xaheen Chain" not "BitcoinBR")
- [ ] Can add XHN token to wallet
- [ ] WebSocket real-time updates working
- [ ] Theme switcher works
- [ ] Mobile responsive design works
- [ ] Footer links work
- [ ] Navigation works

### Performance Tests
- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms
- [ ] WebSocket connection stable
- [ ] No console errors
- [ ] No memory leaks

### Security Tests
- [ ] All endpoints use HTTPS/WSS
- [ ] SSL certificates valid
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] No sensitive data in frontend

## Monitoring Setup

### Application Monitoring
```bash
# With PM2
pm2 monit

# Check logs in real-time
pm2 logs xaheen-explorer --lines 100

# Check memory/CPU usage
pm2 show xaheen-explorer
```

### Server Monitoring
```bash
# Check disk space
df -h

# Check memory
free -h

# Check CPU
top

# Check Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## Troubleshooting

### Issue: Network shows as "BitcoinBR" instead of "Xaheen Chain"
**Solution:** Users need to remove the old BitcoinBR network from their wallet first, then add Xaheen Chain. The chain ID has been changed from 885824 to 65001.

### Issue: Can't connect wallet
**Solution:**
- Ensure wallet extension is installed
- Check browser console for errors
- Verify RPC endpoint is accessible
- Try refreshing the page

### Issue: Real-time updates not working
**Solution:**
- Check WebSocket server is running
- Verify wss://ws.xaheen.org is accessible
- Check browser console for WebSocket errors
- Ensure Nginx WebSocket proxy is configured correctly

### Issue: API errors
**Solution:**
- Verify backend is running
- Check API endpoint accessibility
- Review backend logs
- Verify database connection

## Support

For deployment issues:
- Technical Support: support@xaheen.org
- Documentation: https://docs.xaheen.org
- Full Deployment Guide: See DEPLOYMENT.md

---

**Last Updated:** 2024
**Chain ID:** 65001 (0xFDE9)
**Status:** Ready for production deployment
