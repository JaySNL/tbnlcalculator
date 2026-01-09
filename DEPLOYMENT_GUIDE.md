# OpenMemory MCP Claude Fix - Deployment Guide

## Quick Start

Deploy the fix in 3 simple steps:

### Step 1: Start the HTTP Server

```bash
python3 serve_fix_files.py
```

Leave this running in a terminal window. You should see:
```
🚀 Starting HTTP server on port 8765
📁 Serving files from: .../openmemory-fix/backend/src/ai
📥 Available files:
   - http://localhost:8765/mcp-claude-fix.ts
   - http://localhost:8765/mcp.ts
```

### Step 2: Deploy to Docker

Open a **new terminal** and run:

```bash
./deploy_fix_to_docker.sh
```

This will:
1. ✅ Check HTTP server is running
2. ✅ Find your OpenMemory Docker container
3. 📥 Pull fixed files into container via curl
4. 🔨 Rebuild the backend
5. 🔄 Restart the container

### Step 3: Verify the Fix

Check the logs to confirm the patch is working:

```bash
docker logs openmemory-api-1 | grep "MCP-CLAUDE-FIX"
```

You should see:
```
[MCP-CLAUDE-FIX] MCP server patched for Claude compatibility
[MCP-CLAUDE-FIX] Sanitized schema for tool: openmemory_query
[MCP-CLAUDE-FIX] Sanitized schema for tool: openmemory_store
[MCP-CLAUDE-FIX] Sanitized schema for tool: openmemory_reinforce
[MCP-CLAUDE-FIX] Sanitized schema for tool: openmemory_list
[MCP-CLAUDE-FIX] Sanitized schema for tool: openmemory_get
```

---

## Testing

### Test 1: Claude Loads Without Error

1. Open Antigravity
2. Select a Claude model
3. **Expected**: No "agent terminated due to error"
4. **Expected**: Agent initializes successfully

### Test 2: Memory Operations Work

```
You: "Remember that my favorite framework is React"
Claude: [stores memory successfully]

You: "What's my favorite framework?"
Claude: "Your favorite framework is React"
```

### Test 3: Gemini Still Works

1. Switch to Gemini model
2. Test memory operations
3. **Expected**: Everything still works

---

## Troubleshooting

### Issue: "HTTP server not running"

**Solution**: Make sure `serve_fix_files.py` is running in another terminal

### Issue: "Container not found"

**Solution**: Find your container name and update the script:

```bash
# List all containers
docker ps -a

# Update deploy_fix_to_docker.sh
# Change CONTAINER_NAME="openmemory-api-1" to your actual container name
```

### Issue: "curl: (7) Failed to connect"

**Solution**: Docker can't reach `host.docker.internal`. Try:

```bash
# Get your local IP
ipconfig getifaddr en0  # or en1, depending on your network

# Update deploy_fix_to_docker.sh
# Replace host.docker.internal with your IP (e.g., 192.168.1.100)
```

### Issue: "npm run build fails"

**Solution**: Check if Node.js is installed in the container:

```bash
docker exec openmemory-api-1 node --version
docker exec openmemory-api-1 npm --version
```

If missing, you may need to rebuild the Docker image.

---

## Manual Deployment (Alternative)

If the automated script doesn't work, deploy manually:

### 1. Start HTTP Server

```bash
python3 serve_fix_files.py
```

### 2. Enter Docker Container

```bash
docker exec -it openmemory-api-1 sh
```

### 3. Download Files

```bash
cd /app/backend/src/ai

# Download the new patch file
curl -o mcp-claude-fix.ts http://host.docker.internal:8765/mcp-claude-fix.ts

# Download the modified MCP file
curl -o mcp.ts http://host.docker.internal:8765/mcp.ts

# Verify files downloaded
ls -la mcp-claude-fix.ts mcp.ts
```

### 4. Rebuild Backend

```bash
cd /app/backend
npm run build
```

### 5. Exit and Restart

```bash
exit
docker restart openmemory-api-1
```

---

## Rollback

If you need to undo the changes:

### Option 1: Restore from Backup

If you backed up the original files:

```bash
docker cp backup/mcp.ts openmemory-api-1:/app/backend/src/ai/
docker exec openmemory-api-1 rm /app/backend/src/ai/mcp-claude-fix.ts
docker exec openmemory-api-1 sh -c "cd /app/backend && npm run build"
docker restart openmemory-api-1
```

### Option 2: Rebuild Container

```bash
cd /path/to/openmemory
docker-compose down
docker-compose up -d --build
```

---

## Files Modified

- ✅ `/backend/src/ai/mcp-claude-fix.ts` (NEW)
- ✅ `/backend/src/ai/mcp.ts` (MODIFIED - added import and patch call)

---

## What the Fix Does

**Before**: MCP SDK generates JSON Schema draft-07 with `"strict": true` → Claude rejects → Agent terminates

**After**: Patch intercepts schemas, removes `"strict"`, converts to draft-2020-12 → Claude accepts → Agent works

---

## Support

If you encounter issues:

1. Check container logs: `docker logs openmemory-api-1`
2. Verify HTTP server is accessible: `curl http://localhost:8765/mcp-claude-fix.ts`
3. Check if files exist in container: `docker exec openmemory-api-1 ls -la /app/backend/src/ai/`
4. Verify build succeeded: `docker exec openmemory-api-1 ls -la /app/backend/dist/ai/`
