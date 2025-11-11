#!/bin/bash

# NorChain Documentation Deployment Script
# Target: docs.norchain.org (44.200.71.179)

set -e

# Configuration
SERVER_IP="44.200.71.179"
SERVER_USER="ec2-user"
DOMAIN="docs.norchain.org"
APP_NAME="norchain-docs"
LOCAL_BUILD_PATH="./out"
REMOTE_PATH="/var/www/docs.norchain.org"

echo "🚀 Starting deployment to docs.norchain.org..."

# Step 1: Build for static export
echo "📦 Building application for static export..."
npm run build

# Step 2: Create deployment package
echo "📦 Creating deployment package..."
tar -czf ${APP_NAME}.tar.gz -C ./out .

# Step 3: Upload to server
echo "🚀 Uploading to server..."
scp -i "/Volumes/Development/sahalat/blockchain-v2/bsc-validator-key.pem" ${APP_NAME}.tar.gz ${SERVER_USER}@${SERVER_IP}:/tmp/
scp -i "/Volumes/Development/sahalat/blockchain-v2/bsc-validator-key.pem" nginx.conf ${SERVER_USER}@${SERVER_IP}:/tmp/docs-nginx.conf

# Step 4: Deploy on server
echo "🔧 Deploying on server..."
ssh -i "/Volumes/Development/sahalat/blockchain-v2/bsc-validator-key.pem" ${SERVER_USER}@${SERVER_IP} << 'EOF'
  # Create backup of current deployment
  sudo mkdir -p /var/backups/docs.norchain.org
  if [ -d "/var/www/docs.norchain.org" ]; then
    sudo cp -r /var/www/docs.norchain.org /var/backups/docs.norchain.org/backup-$(date +%Y%m%d_%H%M%S)
  fi

  # Create web directory
  sudo mkdir -p /var/www/docs.norchain.org
  sudo chown -R $USER:$USER /var/www/docs.norchain.org

  # Extract new files
  cd /var/www/docs.norchain.org
  rm -rf *
  tar -xzf /tmp/norchain-docs.tar.gz

  # Set proper permissions
  sudo chown -R nginx:nginx /var/www/docs.norchain.org 2>/dev/null || sudo chown -R www-data:www-data /var/www/docs.norchain.org 2>/dev/null || sudo chown -R ec2-user:ec2-user /var/www/docs.norchain.org
  sudo chmod -R 755 /var/www/docs.norchain.org

  # Install nginx if not present
  sudo yum update -y
  sudo amazon-linux-extras install nginx1 -y 2>/dev/null || sudo yum install nginx -y

  # Configure nginx
  sudo cp /tmp/docs-nginx.conf /etc/nginx/sites-available/docs.norchain.org 2>/dev/null || sudo cp /tmp/docs-nginx.conf /etc/nginx/conf.d/docs.norchain.org.conf

  # Create sites directories if they don't exist
  sudo mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled

  # Enable site (for Ubuntu/Debian style)
  if [ -f /etc/nginx/sites-available/docs.norchain.org ]; then
    sudo ln -sf /etc/nginx/sites-available/docs.norchain.org /etc/nginx/sites-enabled/
  fi

  # Test and restart nginx
  sudo nginx -t
  sudo systemctl enable nginx
  sudo systemctl restart nginx

  # Clean up
  rm /tmp/norchain-docs.tar.gz /tmp/docs-nginx.conf

  echo "✅ Deployment completed successfully!"
EOF

# Step 5: Test deployment
echo "🧪 Testing deployment..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://${DOMAIN})
if [ "$HTTP_STATUS" -eq 200 ] || [ "$HTTP_STATUS" -eq 301 ]; then
    echo "✅ Website is accessible at http://${DOMAIN}"
else
    echo "❌ Website returned HTTP status: $HTTP_STATUS"
fi

# Cleanup local files
rm -f ${APP_NAME}.tar.gz

echo "🎉 Deployment complete!"
echo "🌐 Visit: http://${DOMAIN}"
echo "🌐 Visit: https://${DOMAIN}"
