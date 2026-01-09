#!/bin/bash
# Deploy OpenMemory MCP Claude Fix to Docker Container
# This script pulls the fixed files from the local HTTP server into the Docker container

set -e  # Exit on error

echo "🔧 OpenMemory MCP Claude Fix Deployment"
echo "========================================"
echo ""

# Configuration
HTTP_PORT=8765
CONTAINER_NAME="openmemory-api-1"  # Adjust if your container has a different name

# Check if HTTP server is running
if ! curl -s "http://localhost:$HTTP_PORT/mcp-claude-fix.ts" > /dev/null 2>&1; then
    echo "❌ Error: HTTP server not running on port $HTTP_PORT"
    echo "   Please run: python3 serve_fix_files.py"
    exit 1
fi

echo "✅ HTTP server is running"
echo ""

# Check if Docker container exists
if ! docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "❌ Error: Container '$CONTAINER_NAME' not found"
    echo "   Available containers:"
    docker ps -a --format '{{.Names}}'
    echo ""
    echo "   Please update CONTAINER_NAME in this script"
    exit 1
fi

echo "✅ Found container: $CONTAINER_NAME"
echo ""

# Pull files into container
echo "📥 Pulling fixed files into container..."
echo ""

echo "  → Downloading mcp-claude-fix.ts..."
docker exec "$CONTAINER_NAME" sh -c "curl -f -o /app/backend/src/ai/mcp-claude-fix.ts http://host.docker.internal:$HTTP_PORT/mcp-claude-fix.ts"

echo "  → Downloading mcp.ts..."
docker exec "$CONTAINER_NAME" sh -c "curl -f -o /app/backend/src/ai/mcp.ts http://host.docker.internal:$HTTP_PORT/mcp.ts"

echo ""
echo "✅ Files downloaded successfully"
echo ""

# Rebuild the backend
echo "🔨 Rebuilding backend..."
docker exec "$CONTAINER_NAME" sh -c "cd /app/backend && npm run build"

echo ""
echo "✅ Backend rebuilt"
echo ""

# Restart the container
echo "🔄 Restarting container..."
docker restart "$CONTAINER_NAME"

echo ""
echo "⏳ Waiting for container to restart..."
sleep 5

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Check logs: docker logs $CONTAINER_NAME | grep 'MCP-CLAUDE-FIX'"
echo "   2. Test with Claude in Antigravity"
echo "   3. Verify no 'agent terminated' error"
echo ""
