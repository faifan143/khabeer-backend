@echo off
REM Khabeer Backend Deployment Script for Windows
REM This is for local testing only. Use deploy.sh on the VPS.

echo [INFO] Starting Khabeer Backend deployment...

REM Check if Docker is running
docker version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running or not installed.
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

REM Check if docker-compose is available
docker-compose version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Compose is not available.
    echo Please install Docker Compose and try again.
    pause
    exit /b 1
)

echo [SUCCESS] Prerequisites check passed.

REM Create .env file if it doesn't exist
if not exist .env (
    echo [WARNING] Environment file not found. Creating default .env file...
    
    (
        echo # Application Configuration
        echo NODE_ENV=production
        echo PORT=3000
        echo APP_VERSION=1.0.0
        echo.
        echo # Database Configuration
        echo POSTGRES_DB=khabeer
        echo POSTGRES_USER=khabeer_user
        echo POSTGRES_PASSWORD=khabeer_password
        echo.
        echo # Redis Configuration
        echo REDIS_PASSWORD=redis_password
        echo.
        echo # JWT Configuration
        echo JWT_SECRET=your-super-secret-jwt-key-change-in-production
        echo JWT_EXPIRES_IN=7d
        echo.
        echo # CORS Configuration
        echo CORS_ORIGIN=*
        echo.
        echo # Rate Limiting
        echo RATE_LIMIT_WINDOW_MS=900000
        echo RATE_LIMIT_MAX_REQUESTS=100
        echo.
        echo # Security
        echo HELMET_CONTENT_SECURITY_POLICY_ENABLED=true
        echo.
        echo # SMS Configuration (Update with your actual values)
        echo SMS_API_KEY=your_sms_api_key
        echo SMS_API_SECRET=your_sms_api_secret
        echo SMS_SENDER_ID=your_sender_id
    ) > .env
    
    echo [WARNING] Please update the .env file with your actual configuration values.
    echo [WARNING] Especially update the JWT_SECRET, database passwords, and SMS configuration.
    pause
)

REM Stop existing containers
echo [INFO] Stopping existing containers...
docker-compose down --remove-orphans

REM Build and start containers
echo [INFO] Building and starting application...
docker-compose up -d --build

echo [SUCCESS] Application deployment started.
echo.
echo [INFO] Deployment Status:
echo ==================
docker-compose ps

echo.
echo [INFO] Application URLs:
echo ==================
echo Health Check: http://localhost:3000/health
echo API Documentation: http://localhost:3000/docs
echo API Base URL: http://localhost:3000/api

echo.
echo [INFO] Useful Commands:
echo ==================
echo View logs: docker-compose logs -f
echo Stop services: docker-compose down
echo Restart services: docker-compose restart

echo.
echo [SUCCESS] Deployment completed successfully!
pause 