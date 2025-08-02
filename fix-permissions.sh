#!/bin/bash

# Fix permissions for Khabeer Backend uploads directory
# This script should be run on the Ubuntu VPS

set -e

echo "🔧 Fixing uploads directory permissions..."

# Create uploads directory if it doesn't exist
mkdir -p uploads/documents uploads/images

# Set permissions to allow Docker container to write
chmod -R 755 uploads/

# Try to change ownership to the container user (UID 1001)
if [ "$(id -u)" = "0" ]; then
    echo "Running as root, changing ownership to UID 1001..."
    chown -R 1001:1001 uploads/ 2>/dev/null || {
        echo "⚠️  Could not change ownership to UID 1001. Making world-writable..."
        chmod -R 777 uploads/
    }
else
    echo "⚠️  Not running as root. Making uploads directory world-writable..."
    chmod -R 777 uploads/
    echo "💡 For better security, run this script as root: sudo ./fix-permissions.sh"
fi

echo "✅ Permissions fixed successfully!"
echo "📁 Uploads directory: $(pwd)/uploads"
echo "🔍 Current permissions:"
ls -la uploads/ 