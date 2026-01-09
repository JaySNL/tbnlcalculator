#!/usr/bin/env python3
"""
HTTP Server to serve OpenMemory fix files
Serves the fixed files so they can be pulled into Docker container via curl
"""

import http.server
import socketserver
import os
from pathlib import Path

# Port to serve on
PORT = 8765

# Directory containing the fixed files (Root for serving tarball)
FIX_DIR = Path(__file__).parent

class FixFileHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(FIX_DIR), **kwargs)
    
    def end_headers(self):
        # Add CORS headers to allow cross-origin requests
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

if __name__ == "__main__":
    print(f"🚀 Starting HTTP server on port {PORT}")
    print(f"📁 Serving files from: {FIX_DIR}")
    print(f"\n📥 Available files:")
    print(f"   - http://localhost:{PORT}/mcp-claude-fix.ts")
    print(f"   - http://localhost:{PORT}/mcp.ts")
    print(f"\n💡 Use these URLs to curl files into your Docker container")
    print(f"   Example: curl -o /app/backend/src/ai/mcp-claude-fix.ts http://host.docker.internal:{PORT}/mcp-claude-fix.ts")
    print(f"\n⏹️  Press Ctrl+C to stop the server\n")
    
    with socketserver.TCPServer(("", PORT), FixFileHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n✅ Server stopped")
