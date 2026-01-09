#!/bin/bash
# Deploy the locally fixed OpenMemory v1.2.3 to the remote server

LOCAL_DIR="openmemory-v123"
REMOTE_HOST="root@192.168.178.76"
REMOTE_STACK_DIR="/mnt/.ix-apps/app_mounts/dockge/stacks/openmemory"

echo "🚀 Deploying Fixed OpenMemory v1.2.3..."
echo "---------------------------------------"

if [ ! -d "$LOCAL_DIR" ]; then
    echo "❌ Local directory '$LOCAL_DIR' not found!"
    exit 1
fi

echo "📦 Syncing files to $REMOTE_HOST:$REMOTE_STACK_DIR..."
# Exclude dist and node_modules to speed up transfer (let Docker build handle it)
rsync -avz --exclude 'node_modules' --exclude 'dist' --exclude '.git' "$LOCAL_DIR/" "$REMOTE_HOST:$REMOTE_STACK_DIR/"

echo "🏗️  Rebuilding and Starting on Remote..."
ssh "$REMOTE_HOST" "cd $REMOTE_STACK_DIR && docker compose build backend && docker compose up -d"

echo "✅ Deployment Complete! The new backend has:"
echo "   - SSE support (mcp.ts patch)"
echo "   - Draft 2020-12 schema (Dockerfile patch)"
echo "   - Strictness Fix (Dockerfile patch)"
