#!/bin/bash

# Khabeer Backend Deployment Script
# This script deploys the Khabeer backend application to a VPS

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="khabeer-backend"
DOCKER_COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "All prerequisites are met"
}

# Function to create environment file if it doesn't exist
create_env_file() {
    if [ ! -f "$ENV_FILE" ]; then
        print_warning "Environment file not found. Creating default .env file..."
        
        cat > "$ENV_FILE" << EOF
# Application Configuration
NODE_ENV=production
PORT=3000
APP_VERSION=1.0.0

# Database Configuration
POSTGRES_DB=khabeer
POSTGRES_USER=khabeer_user
POSTGRES_PASSWORD=khabeer_password
DATABASE_URL=postgresql://khabeer_user:khabeer_password@localhost:5432/khabeer

# Redis Configuration
REDIS_PASSWORD=redis_password
REDIS_URL=redis://:redis_password@localhost:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=*

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
HELMET_CONTENT_SECURITY_POLICY_ENABLED=true

# SMS Configuration (Tamimah SMS)
TAMIMAH_SMS_API_URL=https://api.tamimah.com/sms
TAMIMAH_SMS_USERNAME=your_sms_username
TAMIMAH_SMS_PASSWORD=your_sms_password
SMS_API_KEY=your_sms_api_key
SMS_API_SECRET=your_sms_api_secret
SMS_SENDER_ID=Khabeer

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
EOF
        
        print_warning "Please update the .env file with your actual configuration values before proceeding."
        print_warning "Especially update the JWT_SECRET, database passwords, and SMS configuration."
        read -p "Press Enter to continue after updating the .env file..."
    fi
}

# Function to backup existing data
backup_data() {
    if [ -d "uploads" ]; then
        print_status "Creating backup of uploads directory..."
        tar -czf "backup-uploads-$(date +%Y%m%d-%H%M%S).tar.gz" uploads/
        print_success "Backup created successfully"
    fi
}

# Function to setup uploads directory with correct permissions
setup_uploads_directory() {
    print_status "Setting up uploads directory with correct permissions..."
    
    # Create uploads directory if it doesn't exist
    mkdir -p uploads/documents uploads/images
    
    # Set permissions to allow Docker container to write
    # The container runs as user 1001 (nestjs), so we need to ensure the directory is writable
    chmod -R 755 uploads/
    
    # If running as root, change ownership to allow container access
    if [ "$(id -u)" = "0" ]; then
        # Find the UID that the container will use (usually 1001)
        CONTAINER_UID=1001
        chown -R $CONTAINER_UID:$CONTAINER_UID uploads/ 2>/dev/null || {
            print_warning "Could not change ownership to UID $CONTAINER_UID. This might cause permission issues."
            # Make it world-writable as fallback (less secure but functional)
            chmod -R 777 uploads/
        }
    else
        # If not running as root, make it world-writable
        chmod -R 777 uploads/
        print_warning "Made uploads directory world-writable. Consider running as root for better security."
    fi
    
    print_success "Uploads directory setup completed"
}

# Function to stop existing containers
stop_containers() {
    print_status "Stopping existing containers..."
    docker-compose down --remove-orphans || true
    print_success "Containers stopped"
}

# Function to remove old images
cleanup_images() {
    print_status "Cleaning up old Docker images..."
    docker image prune -f || true
    print_success "Cleanup completed"
}

# Function to build and start containers
deploy_application() {
    print_status "Building and starting application..."
    
    # Pull latest images
    docker-compose pull || true
    
    # Build and start services
    docker-compose up -d --build
    
    print_success "Application deployment started"
}

# Function to wait for services to be healthy
wait_for_services() {
    print_status "Waiting for services to be healthy..."
    
    # Wait for PostgreSQL
    print_status "Waiting for PostgreSQL..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if docker-compose exec -T postgres pg_isready -U ${POSTGRES_USER:-khabeer_user} -d ${POSTGRES_DB:-khabeer} >/dev/null 2>&1; then
            print_success "PostgreSQL is ready"
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -le 0 ]; then
        print_error "PostgreSQL failed to start within timeout"
        exit 1
    fi
    
    # Wait for Redis
    print_status "Waiting for Redis..."
    timeout=30
    while [ $timeout -gt 0 ]; do
        if docker-compose exec -T redis redis-cli ping >/dev/null 2>&1; then
            print_success "Redis is ready"
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -le 0 ]; then
        print_error "Redis failed to start within timeout"
        exit 1
    fi
    
    # Wait for application
    print_status "Waiting for application to be ready..."
    timeout=120
    while [ $timeout -gt 0 ]; do
        if curl -f http://localhost:${PORT:-3000}/health >/dev/null 2>&1; then
            print_success "Application is ready"
            break
        fi
        sleep 5
        timeout=$((timeout - 5))
    done
    
    if [ $timeout -le 0 ]; then
        print_error "Application failed to start within timeout"
        docker-compose logs app
        exit 1
    fi
}

# Function to run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Wait a bit more for the database to be fully ready
    sleep 10
    
    # Run Prisma migrations
    docker-compose exec -T app npx prisma migrate deploy || {
        print_error "Database migration failed"
        docker-compose logs app
        exit 1
    }
    
    print_success "Database migrations completed"
}

# Function to seed initial data (optional)
seed_data() {
    if [ -f "src/seed.ts" ]; then
        read -p "Do you want to seed initial data? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_status "Seeding initial data..."
            docker-compose exec -T app npm run seed:test || {
                print_warning "Data seeding failed, but continuing..."
            }
            print_success "Data seeding completed"
        fi
    fi
}

# Function to show deployment status
show_status() {
    print_status "Deployment Status:"
    echo "=================="
    
    # Show container status
    docker-compose ps
    
    echo ""
    print_status "Application URLs:"
    echo "=================="
    echo "Health Check: http://localhost:${PORT:-3000}/health"
    echo "API Documentation: http://localhost:${PORT:-3000}/docs"
    echo "API Base URL: http://localhost:${PORT:-3000}/api"
    
    echo ""
    print_status "Useful Commands:"
    echo "=================="
    echo "View logs: docker-compose logs -f"
    echo "Stop services: docker-compose down"
    echo "Restart services: docker-compose restart"
    echo "Update application: ./deploy.sh"
}

# Function to show logs
show_logs() {
    print_status "Showing recent logs..."
    docker-compose logs --tail=50
}

# Function to handle cleanup on script exit
cleanup() {
    if [ $? -ne 0 ]; then
        print_error "Deployment failed. Showing logs..."
        docker-compose logs
    fi
}

# Main deployment function
main() {
    print_status "Starting Khabeer Backend deployment..."
    
    # Set up cleanup trap
    trap cleanup EXIT
    
    # Check prerequisites
    check_prerequisites
    
    # Create environment file if needed
    create_env_file
    
    # Backup existing data
    backup_data
    
    # Setup uploads directory with correct permissions
    setup_uploads_directory
    
    # Stop existing containers
    stop_containers
    
    # Cleanup old images
    cleanup_images
    
    # Deploy application
    deploy_application
    
    # Wait for services
    wait_for_services
    
    # Run migrations
    run_migrations
    
    # Seed data (optional)
    seed_data
    
    # Show status
    show_status
    
    print_success "Deployment completed successfully!"
}

# Function to show help
show_help() {
    echo "Khabeer Backend Deployment Script"
    echo "================================="
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  deploy    Deploy the application (default)"
    echo "  logs      Show application logs"
    echo "  status    Show deployment status"
    echo "  stop      Stop all services"
    echo "  restart   Restart all services"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0          # Deploy the application"
    echo "  $0 logs     # Show logs"
    echo "  $0 status   # Show status"
}

# Parse command line arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "logs")
        show_logs
        ;;
    "status")
        show_status
        ;;
    "stop")
        print_status "Stopping all services..."
        docker-compose down
        print_success "All services stopped"
        ;;
    "restart")
        print_status "Restarting all services..."
        docker-compose restart
        print_success "All services restarted"
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        print_error "Unknown option: $1"
        show_help
        exit 1
        ;;
esac 