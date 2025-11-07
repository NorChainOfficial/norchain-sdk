# Supabase Self-Hosting on AWS
## Complete Deployment Guide

**Date**: November 2024  
**Status**: Deployment Guide

---

## Overview

This guide covers deploying Supabase self-hosted on AWS infrastructure.

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  AWS VPC                         │
│                                                 │
│  ┌──────────────┐      ┌──────────────┐       │
│  │   Internet   │      │   Application│       │
│  │   Gateway    │◄────►│   Load       │       │
│  │              │      │   Balancer   │       │
│  └──────────────┘      └──────┬───────┘       │
│                               │                │
│  ┌───────────────────────────┼─────────────┐ │
│  │      ECS Cluster           │             │ │
│  │  ┌──────────┐  ┌──────────┐│             │ │
│  │  │PostgREST │  │ Realtime ││             │ │
│  │  │          │  │          ││             │ │
│  │  └────┬─────┘  └────┬─────┘│             │ │
│  │       │             │       │             │
│  │  ┌────┴─────────────┴─────┐│             │ │
│  │  │   GoTrue (Auth)         ││             │ │
│  │  └────────────────────────┘│             │ │
│  │  ┌────────────────────────┐│             │ │
│  │  │   Storage API          ││             │ │
│  │  └────────────────────────┘│             │ │
│  └────────────────────────────┼─────────────┘ │
│                                │                │
│  ┌─────────────────────────────┼─────────────┐ │
│  │      RDS PostgreSQL         │             │ │
│  │  ┌─────────────────────────┐│             │ │
│  │  │  Database (Primary)     ││             │ │
│  │  └─────────────────────────┘│             │ │
│  │  ┌─────────────────────────┐│             │ │
│  │  │  Database (Replica)     ││             │ │
│  │  └─────────────────────────┘│             │ │
│  └─────────────────────────────┘             │
│                                                 │
│  ┌──────────────────────────────────────────┐ │
│  │         S3 (Storage Backend)               │ │
│  └──────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

---

## Prerequisites

### AWS Resources Needed
- AWS Account with appropriate permissions
- VPC with public/private subnets
- Security Groups configured
- IAM roles for ECS tasks
- RDS PostgreSQL instance (or EC2)

### Tools Required
- AWS CLI configured
- Docker installed locally (for testing)
- Terraform (optional, for IaC)
- kubectl (if using EKS)

---

## Deployment Options

### Option 1: AWS ECS (Recommended)

**Best for**: Managed containers, auto-scaling

#### Step 1: Create RDS PostgreSQL

```bash
aws rds create-db-instance \
  --db-instance-identifier supabase-db \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 15.4 \
  --master-username postgres \
  --master-user-password <secure-password> \
  --allocated-storage 100 \
  --vpc-security-group-ids sg-xxxxx \
  --db-subnet-group-name supabase-subnet-group \
  --backup-retention-period 7 \
  --multi-az
```

#### Step 2: Create ECS Cluster

```bash
aws ecs create-cluster --cluster-name supabase-cluster
```

#### Step 3: Create Task Definition

```json
{
  "family": "supabase-postgrest",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "postgrest",
      "image": "postgrest/postgrest:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "PGRST_DB_URI",
          "value": "postgresql://postgres:password@supabase-db.xxxxx.rds.amazonaws.com:5432/postgres"
        },
        {
          "name": "PGRST_DB_SCHEMAS",
          "value": "public"
        },
        {
          "name": "PGRST_DB_ANON_ROLE",
          "value": "anon"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/supabase",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "postgrest"
        }
      }
    }
  ]
}
```

#### Step 4: Create Service

```bash
aws ecs create-service \
  --cluster supabase-cluster \
  --service-name supabase-postgrest \
  --task-definition supabase-postgrest \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxx],securityGroups=[sg-xxxxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:...:targetgroup/...,containerName=postgrest,containerPort=3000"
```

---

### Option 2: AWS EKS (Kubernetes)

**Best for**: Large scale, Kubernetes expertise

#### Step 1: Create EKS Cluster

```bash
eksctl create cluster \
  --name supabase-cluster \
  --region us-east-1 \
  --nodegroup-name workers \
  --node-type t3.medium \
  --nodes 3 \
  --nodes-min 2 \
  --nodes-max 5
```

#### Step 2: Deploy Supabase Stack

```yaml
# supabase-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgrest
spec:
  replicas: 2
  selector:
    matchLabels:
      app: postgrest
  template:
    metadata:
      labels:
        app: postgrest
    spec:
      containers:
      - name: postgrest
        image: postgrest/postgrest:latest
        ports:
        - containerPort: 3000
        env:
        - name: PGRST_DB_URI
          valueFrom:
            secretKeyRef:
              name: supabase-secrets
              key: db-uri
---
apiVersion: v1
kind: Service
metadata:
  name: postgrest-service
spec:
  selector:
    app: postgrest
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

---

### Option 3: EC2 Instances (Simple)

**Best for**: Small scale, full control

#### Step 1: Launch EC2 Instance

```bash
aws ec2 run-instances \
  --image-id ami-xxxxx \
  --instance-type t3.medium \
  --key-name your-key \
  --security-group-ids sg-xxxxx \
  --subnet-id subnet-xxxxx \
  --user-data file://supabase-setup.sh
```

#### Step 2: Install Docker

```bash
# supabase-setup.sh
#!/bin/bash
yum update -y
yum install -y docker
systemctl start docker
systemctl enable docker
usermod -a -G docker ec2-user
```

#### Step 3: Run Supabase Stack

```bash
git clone https://github.com/supabase/supabase.git
cd supabase/docker
cp .env.example .env
# Edit .env with your configuration
docker-compose up -d
```

---

## Configuration

### Environment Variables

```bash
# Database
POSTGRES_HOST=supabase-db.xxxxx.rds.amazonaws.com
POSTGRES_PORT=5432
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<secure-password>

# API Keys
SUPABASE_ANON_KEY=<generate-secure-key>
SUPABASE_SERVICE_KEY=<generate-secure-key>
JWT_SECRET=<generate-secure-key>

# Storage
STORAGE_BACKEND=s3
S3_BUCKET=supabase-storage
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<access-key>
AWS_SECRET_ACCESS_KEY=<secret-key>

# URLs
SUPABASE_URL=https://api.yourdomain.com
API_URL=https://api.yourdomain.com
```

### Security Groups

**PostgREST/API:**
- Inbound: 443 (HTTPS) from 0.0.0.0/0
- Inbound: 80 (HTTP) from Load Balancer
- Outbound: All

**RDS PostgreSQL:**
- Inbound: 5432 from ECS Security Group only
- Outbound: None

**Realtime:**
- Inbound: 4000 (WebSocket) from Load Balancer
- Outbound: All

---

## Networking Setup

### VPC Configuration

```bash
# Create VPC
aws ec2 create-vpc --cidr-block 10.0.0.0/16

# Create Public Subnet
aws ec2 create-subnet \
  --vpc-id vpc-xxxxx \
  --cidr-block 10.0.1.0/24 \
  --availability-zone us-east-1a

# Create Private Subnet
aws ec2 create-subnet \
  --vpc-id vpc-xxxxx \
  --cidr-block 10.0.2.0/24 \
  --availability-zone us-east-1b

# Create Internet Gateway
aws ec2 create-internet-gateway
aws ec2 attach-internet-gateway \
  --vpc-id vpc-xxxxx \
  --internet-gateway-id igw-xxxxx

# Create NAT Gateway (for private subnet)
aws ec2 create-nat-gateway \
  --subnet-id subnet-public \
  --allocation-id eipalloc-xxxxx
```

---

## Load Balancer Setup

### Application Load Balancer

```bash
aws elbv2 create-load-balancer \
  --name supabase-alb \
  --subnets subnet-xxxxx subnet-yyyyy \
  --security-groups sg-xxxxx \
  --scheme internet-facing \
  --type application

# Create Target Group
aws elbv2 create-target-group \
  --name supabase-targets \
  --protocol HTTP \
  --port 3000 \
  --vpc-id vpc-xxxxx \
  --health-check-path /health

# Create Listener
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:... \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=arn:aws:acm:... \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:...
```

---

## Storage Configuration (S3)

### Create S3 Bucket

```bash
aws s3 mb s3://supabase-storage --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket supabase-storage \
  --versioning-configuration Status=Enabled

# Configure CORS
aws s3api put-bucket-cors \
  --bucket supabase-storage \
  --cors-configuration file://cors.json
```

### CORS Configuration

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["https://yourdomain.com"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

---

## Monitoring & Logging

### CloudWatch Logs

```bash
# Create Log Group
aws logs create-log-group --log-group-name /ecs/supabase

# Configure Log Retention
aws logs put-retention-policy \
  --log-group-name /ecs/supabase \
  --retention-in-days 30
```

### CloudWatch Alarms

```bash
# CPU Utilization Alarm
aws cloudwatch put-metric-alarm \
  --alarm-name supabase-high-cpu \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2
```

---

## Cost Estimation

### Small Scale (Development)
- RDS db.t3.small: ~$15/month
- ECS Fargate (2 tasks): ~$30/month
- ALB: ~$20/month
- S3 Storage (10GB): ~$0.25/month
- **Total: ~$65/month**

### Medium Scale (Production)
- RDS db.t3.medium (Multi-AZ): ~$150/month
- ECS Fargate (4 tasks): ~$60/month
- ALB: ~$20/month
- S3 Storage (100GB): ~$2.50/month
- Data Transfer: ~$50/month
- **Total: ~$280/month**

### Large Scale (Enterprise)
- RDS db.r5.xlarge (Multi-AZ): ~$600/month
- ECS Fargate (10 tasks): ~$150/month
- ALB: ~$20/month
- S3 Storage (1TB): ~$25/month
- Data Transfer: ~$200/month
- **Total: ~$995/month**

---

## Migration from Supabase Cloud

### Step 1: Export Data

```bash
# Export from Supabase Cloud
pg_dump -h db.xxxxx.supabase.co \
  -U postgres \
  -d postgres \
  -F c \
  -f supabase-backup.dump
```

### Step 2: Import to AWS RDS

```bash
# Import to AWS RDS
pg_restore -h supabase-db.xxxxx.rds.amazonaws.com \
  -U postgres \
  -d postgres \
  -F c \
  supabase-backup.dump
```

### Step 3: Update Application Config

```bash
# Update environment variables
export SUPABASE_URL=https://api.yourdomain.com
export SUPABASE_ANON_KEY=<new-key>
export SUPABASE_DB_URL=postgresql://...
```

---

## Security Best Practices

1. **Use Secrets Manager**
   ```bash
   aws secretsmanager create-secret \
     --name supabase/db-password \
     --secret-string <password>
   ```

2. **Enable Encryption**
   - RDS encryption at rest
   - S3 encryption
   - TLS for all connections

3. **Network Security**
   - Private subnets for RDS
   - Security groups with least privilege
   - WAF for API protection

4. **Access Control**
   - IAM roles for ECS tasks
   - No hardcoded credentials
   - Rotate keys regularly

---

## Troubleshooting

### Common Issues

1. **Connection Timeout**
   - Check security groups
   - Verify VPC routing
   - Check RDS endpoint

2. **High Latency**
   - Use same region for all services
   - Enable RDS read replicas
   - Use CloudFront for static assets

3. **Scaling Issues**
   - Configure auto-scaling policies
   - Monitor CloudWatch metrics
   - Adjust task definitions

---

## Maintenance

### Regular Tasks

1. **Database Backups**
   - Automated RDS snapshots
   - Test restore procedures

2. **Updates**
   - Update Docker images
   - Patch RDS instances
   - Update ECS task definitions

3. **Monitoring**
   - Review CloudWatch metrics
   - Check logs for errors
   - Monitor costs

---

## ✅ Checklist

### Pre-Deployment
- [ ] AWS account configured
- [ ] VPC and subnets created
- [ ] Security groups configured
- [ ] RDS instance created
- [ ] S3 bucket created

### Deployment
- [ ] ECS cluster created
- [ ] Task definitions created
- [ ] Services deployed
- [ ] Load balancer configured
- [ ] DNS configured

### Post-Deployment
- [ ] Health checks passing
- [ ] Monitoring configured
- [ ] Backups configured
- [ ] Documentation updated
- [ ] Team trained

---

**Last Updated**: November 2024

