# Khabeer Backend Deployment Guide

This guide will help you deploy the Khabeer backend application to your VPS using Docker and the provided deployment script.

## Prerequisites

Before deploying, ensure your VPS has the following installed:

1. **Docker** (version 20.10 or higher)
2. **Docker Compose** (version 2.0 or higher)
3. **Git** (for cloning the repository)

### Installing Docker on Ubuntu/Debian

```bash
# Update package index
sudo apt update

# Install required packages
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker
```

## Deployment Steps

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd khabeer-backend
```

### 2. Configure Environment Variables

The deployment script will create a default `.env` file if it doesn't exist. You **MUST** update it with your actual values:

```bash
# Edit the environment file
nano .env
```

**Important variables to update:**

```env
# Database Configuration
POSTGRES_DB=khabeer
POSTGRES_USER=khabeer_user
POSTGRES_PASSWORD=your_secure_database_password

# Redis Configuration
REDIS_PASSWORD=your_secure_redis_password

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key

# SMS Configuration
SMS_API_KEY=your_sms_api_key
SMS_API_SECRET=your_sms_api_secret
SMS_SENDER_ID=your_sender_id

# CORS Configuration (update with your frontend domain)
CORS_ORIGIN=https://your-frontend-domain.com
```

### 3. Make the Deployment Script Executable

```bash
chmod +x deploy.sh
```

### 4. Run the Deployment

```bash
./deploy.sh
```

The script will:
- Check prerequisites
- Create environment file if needed
- Backup existing data
- Build and start Docker containers
- Wait for services to be healthy
- Run database migrations
- Show deployment status

## Deployment Options

### Basic Deployment (Development/Testing)

```bash
# Use the default docker-compose.yml
./deploy.sh
```

### Production Deployment

```bash
# Use production configuration
docker-compose -f docker-compose.prod.yml up -d
```

### Deployment with Monitoring

```bash
# Deploy with Prometheus and Grafana
docker-compose -f docker-compose.prod.yml --profile monitoring up -d
```

## SSL Certificate Setup

For production, you'll need SSL certificates. Place them in the `ssl/` directory:

```bash
mkdir ssl
# Copy your SSL certificates
cp your-cert.pem ssl/cert.pem
cp your-key.pem ssl/key.pem
```

### Using Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt install certbot

# Get SSL certificate
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates to the ssl directory
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/key.pem

# Set proper permissions
sudo chown $USER:$USER ssl/cert.pem ssl/key.pem
chmod 600 ssl/cert.pem ssl/key.pem
```

## Useful Commands

### View Logs

```bash
# All services
./deploy.sh logs

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres
docker-compose logs -f nginx
```

### Check Status

```bash
./deploy.sh status
```

### Stop Services

```bash
./deploy.sh stop
```

### Restart Services

```bash
./deploy.sh restart
```

### Update Application

```bash
# Pull latest changes
git pull

# Redeploy
./deploy.sh
```

## Monitoring

### Access Monitoring Tools

- **Prometheus**: http://your-server:9090 (if monitoring profile is enabled)
- **Grafana**: http://your-server:3001 (if monitoring profile is enabled)

### Health Checks

- **Application Health**: http://your-domain.com/health
- **API Documentation**: http://your-domain.com/docs

## Backup and Recovery

### Database Backup

```bash
# Create backup
docker-compose exec postgres pg_dump -U khabeer_user khabeer > backup-$(date +%Y%m%d-%H%M%S).sql

# Restore backup
docker-compose exec -T postgres psql -U khabeer_user khabeer < backup-file.sql
```

### Uploads Backup

```bash
# The deployment script automatically creates backups of the uploads directory
# Manual backup
tar -czf uploads-backup-$(date +%Y%m%d-%H%M%S).tar.gz uploads/
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   sudo netstat -tulpn | grep :3000
   
   # Kill the process or change the port in .env
   ```

2. **Database Connection Issues**
   ```bash
   # Check database logs
   docker-compose logs postgres
   
   # Check database connectivity
   docker-compose exec postgres pg_isready -U khabeer_user
   ```

3. **Permission Issues**
   ```bash
   # Fix uploads directory permissions
   sudo chown -R $USER:$USER uploads/
   chmod -R 755 uploads/
   ```

4. **Memory Issues**
   ```bash
   # Check system resources
   docker stats
   
   # Increase swap if needed
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

### Log Analysis

```bash
# View real-time logs
docker-compose logs -f --tail=100

# Search for errors
docker-compose logs | grep -i error

# Check specific service logs
docker-compose logs app | grep -i error
```

## Security Considerations

1. **Change Default Passwords**: Always change default passwords in the `.env` file
2. **Firewall Configuration**: Configure your VPS firewall to only allow necessary ports
3. **Regular Updates**: Keep Docker images and system packages updated
4. **SSL Certificates**: Use valid SSL certificates for production
5. **Backup Strategy**: Implement regular backup procedures

## Performance Optimization

1. **Resource Limits**: Adjust memory and CPU limits in `docker-compose.prod.yml`
2. **Database Optimization**: Configure PostgreSQL for your workload
3. **Caching**: Utilize Redis for session storage and caching
4. **CDN**: Use a CDN for static assets in production

## Support

If you encounter issues:

1. Check the logs: `./deploy.sh logs`
2. Verify environment variables are set correctly
3. Ensure all prerequisites are installed
4. Check system resources and disk space

For additional help, refer to the application logs and Docker documentation. 