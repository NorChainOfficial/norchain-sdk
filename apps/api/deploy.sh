#!/bin/bash

# NorChain API Deployment Script
# Target: api.norchain.org (44.200.71.179)

set -e

# Configuration
SERVER_IP="44.200.71.179"
SERVER_USER="ec2-user"
DOMAIN="api.norchain.org"
APP_NAME="norchain-api"
LOCAL_BUILD_PATH="./dist"
REMOTE_PATH="/var/www/api.norchain.org"
PM2_APP_NAME="norchain-api"
EMAIL="admin@norchain.org"  # For Let's Encrypt

echo "🚀 Starting API deployment to ${DOMAIN}..."

# Step 1: Build application
echo "📦 Building API application..."
npm run build

# Verify build
if [ ! -d "$LOCAL_BUILD_PATH" ] || [ ! -f "$LOCAL_BUILD_PATH/main.js" ]; then
    echo "❌ Build failed - dist/main.js not found"
    exit 1
fi

echo "✅ Build successful"

# Step 2: Create deployment package
echo "📦 Creating deployment package..."
DEPLOY_PACKAGE="${APP_NAME}-deploy.tar.gz"
tar -czf ${DEPLOY_PACKAGE} \
    -C . \
    dist/ \
    package.json \
    package-lock.json \
    .env.production \
    ecosystem.config.js 2>/dev/null || \
tar -czf ${DEPLOY_PACKAGE} \
    -C . \
    dist/ \
    package.json \
    package-lock.json

# Step 3: Upload to server
echo "🚀 Uploading to server..."
KEY_PATH="/Volumes/Development/sahalat/blockchain-v2/bsc-validator-key.pem"

scp -i "${KEY_PATH}" ${DEPLOY_PACKAGE} ${SERVER_USER}@${SERVER_IP}:/tmp/
scp -i "${KEY_PATH}" nginx.conf ${SERVER_USER}@${SERVER_IP}:/tmp/ 2>/dev/null || echo "⚠️  nginx.conf not found, will create default"

# Step 4: Deploy on server
echo "🔧 Deploying on server..."
ssh -i "${KEY_PATH}" ${SERVER_USER}@${SERVER_IP} << EOF
  set -e
  
  echo "📦 Extracting deployment package..."
  
  # Create backup of current deployment
  sudo mkdir -p /var/backups/api.norchain.org
  if [ -d "${REMOTE_PATH}" ]; then
    sudo cp -r ${REMOTE_PATH} /var/backups/api.norchain.org/backup-\$(date +%Y%m%d_%H%M%S)
  fi
  
  # Create application directory
  sudo mkdir -p ${REMOTE_PATH}
  sudo chown -R \$USER:\$USER ${REMOTE_PATH}
  
  # Extract new files
  cd ${REMOTE_PATH}
  rm -rf dist package.json package-lock.json 2>/dev/null || true
  tar -xzf /tmp/${DEPLOY_PACKAGE}
  
  # Install Node.js if not installed
  if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
    sudo yum install -y nodejs
  fi
  
  # Install PM2 if not installed
  if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    sudo npm install -g pm2
  fi
  
  # Install production dependencies
  echo "📦 Installing production dependencies..."
  npm install --production || npm ci --omit=dev
  
  # Stop existing PM2 process if running
  pm2 stop ${PM2_APP_NAME} 2>/dev/null || true
  pm2 delete ${PM2_APP_NAME} 2>/dev/null || true
  
  # Start application with PM2
  echo "🚀 Starting API with PM2..."
  pm2 start dist/main.js \
    --name ${PM2_APP_NAME} \
    -i 2 \
    --env production \
    --log /var/log/pm2/${PM2_APP_NAME}.log \
    --error /var/log/pm2/${PM2_APP_NAME}-error.log \
    --merge-logs
  
  # Save PM2 configuration
  pm2 save
  sudo pm2 startup systemd -u \$USER --hp /home/\$USER
  
  # Set proper permissions
  sudo chown -R \$USER:\$USER ${REMOTE_PATH}
  sudo chmod -R 755 ${REMOTE_PATH}
  
  # Configure nginx
  echo "🔧 Configuring nginx..."
  sudo yum update -y
  sudo amazon-linux-extras install nginx1 -y || sudo yum install nginx -y
  
  # Install Certbot for SSL
  echo "🔒 Installing Certbot for SSL..."
  sudo yum install -y certbot python3-certbot-nginx || {
    # Alternative installation method
    sudo yum install -y epel-release
    sudo yum install -y certbot python3-certbot-nginx
  }
  
  # Create nginx config (HTTP first for Let's Encrypt validation)
  if [ -f /tmp/nginx.conf ]; then
    sudo cp /tmp/nginx.conf /etc/nginx/conf.d/api.norchain.org.conf
  else
    # Create HTTP config for Let's Encrypt
    sudo tee /etc/nginx/conf.d/api.norchain.org.conf > /dev/null << 'NGINX_CONFIG'
  # HTTP server - redirects to HTTPS and allows Let's Encrypt validation
  server {
      listen 80;
      server_name api.norchain.org;
      
      # Let's Encrypt validation
      location /.well-known/acme-challenge/ {
          root /var/www/certbot;
      }
      
      # Redirect all other traffic to HTTPS
      location / {
          return 301 https://\$server_name\$request_uri;
      }
  }
  
  # HTTPS server
  server {
      listen 443 ssl http2;
      server_name api.norchain.org;
      
      # SSL certificates (will be set by Certbot)
      ssl_certificate /etc/letsencrypt/live/api.norchain.org/fullchain.pem;
      ssl_certificate_key /etc/letsencrypt/live/api.norchain.org/privkey.pem;
      
      # SSL configuration
      ssl_protocols TLSv1.2 TLSv1.3;
      ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
      ssl_prefer_server_ciphers on;
      ssl_session_cache shared:SSL:10m;
      ssl_session_timeout 10m;
      ssl_stapling on;
      ssl_stapling_verify on;
      
      # Security headers
      add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
      add_header X-Frame-Options "SAMEORIGIN" always;
      add_header X-Content-Type-Options "nosniff" always;
      add_header X-XSS-Protection "1; mode=block" always;
      add_header Referrer-Policy "no-referrer-when-downgrade" always;
      
      # API proxy
      location / {
          proxy_pass http://localhost:3000;
          proxy_http_version 1.1;
          proxy_set_header Upgrade \$http_upgrade;
          proxy_set_header Connection 'upgrade';
          proxy_set_header Host \$host;
          proxy_set_header X-Real-IP \$remote_addr;
          proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto \$scheme;
          proxy_cache_bypass \$http_upgrade;
          proxy_read_timeout 300s;
          proxy_connect_timeout 75s;
          proxy_send_timeout 300s;
      }
      
      # Health check endpoint
      location /api/v1/health {
          proxy_pass http://localhost:3000/api/v1/health;
          access_log off;
      }
      
      # API documentation
      location /api-docs {
          proxy_pass http://localhost:3000/api-docs;
          proxy_set_header Host \$host;
          proxy_set_header X-Real-IP \$remote_addr;
          proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
      }
      
      # Logging
      access_log /var/log/nginx/api.norchain.org.access.log;
      error_log /var/log/nginx/api.norchain.org.error.log;
  }
NGINX_CONFIG
  fi
  
  # Create certbot directory
  sudo mkdir -p /var/www/certbot
  
  # Test nginx config
  sudo nginx -t
  
  # Start nginx (needed for Let's Encrypt validation)
  sudo systemctl enable nginx
  sudo systemctl restart nginx
  
  # Obtain SSL certificate
  echo "🔒 Obtaining SSL certificate from Let's Encrypt..."
  sudo certbot --nginx -d ${DOMAIN} --non-interactive --agree-tos --email ${EMAIL} --redirect || {
    echo "⚠️  SSL certificate setup failed. You may need to:"
    echo "   1. Ensure DNS A record points ${DOMAIN} to ${SERVER_IP}"
    echo "   2. Run manually: sudo certbot --nginx -d ${DOMAIN}"
  }
  
  # Restart nginx after SSL setup
  sudo systemctl restart nginx
  
  # Clean up
  rm -f /tmp/${DEPLOY_PACKAGE} /tmp/nginx.conf 2>/dev/null || true
  
  echo "✅ Deployment completed successfully!"
  echo "📊 PM2 Status:"
  pm2 status
EOF

# Step 5: Test deployment
echo "🧪 Testing deployment..."
sleep 10  # Wait for services to start

# Test HTTPS endpoint
HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://${DOMAIN}/api/v1/health -k 2>/dev/null || echo "000")
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://${DOMAIN}/api/v1/health 2>/dev/null || echo "000")

if [ "$HTTPS_STATUS" -eq 200 ]; then
    echo "✅ API is accessible at https://${DOMAIN}/api/v1/health"
    echo "✅ HTTPS health check passed!"
elif [ "$HTTP_STATUS" -eq 200 ]; then
    echo "⚠️  API accessible via HTTP but HTTPS not configured yet"
    echo "💡 Run: ssh ${SERVER_USER}@${SERVER_IP} 'sudo certbot --nginx -d ${DOMAIN}'"
else
    echo "⚠️  API returned HTTP status: HTTPS=$HTTPS_STATUS, HTTP=$HTTP_STATUS"
    echo "💡 Check PM2 logs: ssh ${SERVER_USER}@${SERVER_IP} 'pm2 logs ${PM2_APP_NAME}'"
fi

# Cleanup local files
rm -f ${DEPLOY_PACKAGE}

echo ""
echo "🎉 Deployment complete!"
echo "🌐 API URL: https://${DOMAIN}"
echo "📚 API Docs: https://${DOMAIN}/api-docs"
echo "❤️  Health Check: https://${DOMAIN}/api/v1/health"
echo ""
echo "📊 PM2 Dashboard: ssh ${SERVER_USER}@${SERVER_IP} 'pm2 monit'"
echo "📝 View Logs: ssh ${SERVER_USER}@${SERVER_IP} 'pm2 logs ${PM2_APP_NAME}'"
echo "🔄 Restart: ssh ${SERVER_USER}@${SERVER_IP} 'pm2 restart ${PM2_APP_NAME}'"
echo ""
echo "🔒 SSL Certificate:"
echo "   - Auto-renewal: sudo certbot renew --dry-run"
echo "   - Check expiry: sudo certbot certificates"

