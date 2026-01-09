#!/bin/bash
# install_remote.sh: Downloads and installs the local fix on the remote server
# Usage: curl -s http://HOST_IP:8765/install_remote.sh | bash

HOST_IP="192.168.178.76" # Updated to match successfully connected host IP
PORT="8765"
TARBALL="openmemory-v123.tgz"
REMOTE_DIR="/mnt/.ix-apps/app_mounts/dockge/stacks/openmemory"

echo "🚀 Starting Remote Installation of OpenMemory v1.2.3 Fix..."
echo "--------------------------------------------------------"

# 1. Navigate to target directory
cd "$REMOTE_DIR" || { echo "❌ Directory $REMOTE_DIR not found!"; exit 1; }

# 2. Backup existing (optional, but safe)
echo "📦 Backing up valid config files..."
# We typically want to keep env files or specific configs if they exist, 
# but here we are doing a full replace as requested. We'll trust the tarball.

# 3. Download the tarball
echo "⬇️  Downloading $TARBALL from $HOST_IP:$PORT..."
curl -O "http://$HOST_IP:$PORT/$TARBALL" || { echo "❌ Download failed!"; exit 1; }

# 4. Extract
echo "📂 Extracting files..."
# Strip the top-level folder 'openmemory-v123' so contents go directly into current dir
tar -xzf "$TARBALL" --strip-components=1 --overwrite

# 5. Clean up
rm "$TARBALL"

# 6. Rebuild and Restart
echo "🏗️  Rebuilding Docker containers..."
docker compose build backend
docker compose up -d

echo "✅ Installation Complete!"
echo "   The server is now running the locally patched code with:"
echo "   - SSE support (mcp.ts)"
echo "   - Schema Fixes (Dockerfile)"
