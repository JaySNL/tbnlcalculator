# Long-Term Memory Rules

## Project ID Convention

**CRITICAL RULE**: Always use the project's `package.json` name as the `projectId`: - if there is no `package.json`, use the folder name
or MCP rules for `projectId`.

```json
{
  "projectId": "[projectname]"
}
```

**Never use**:
- ❌ `"projectId": "project-[projectname]"` (will be normalized but confusing)
- ❌ `"projectId": "antigravity"` (MCP server's own project)

## Cross-Project Memories
For memories that apply across all projects (e.g., general coding patterns):
```json
{
  "projectId": "global"
}
```

## Why This Matters

The `antigravity-mem` MCP server:
1. Runs as a separate process
2. Cannot detect which workspace the AI is in
3. Relies on the AI passing the correct `projectId`
4. Normalizes the ID by stripping `"project-"` prefix
5. Creates a folder named exactly as the normalized ID

**Result**: If you pass `"[projectname]"`, you get folder `[projectname]/`. If you pass `"project-[projectname]"`, it normalizes to `[projectname]/` but is confusing.

## Memory Workflow

### Step 1: Recall (Search)
```json
{
  "query": "authentication error handling",
  "projectId": "[projectname]",
  "limit": 10
}
```

### Step 2: Get Details (Expand)
If the summary contains critical information, get the full content:
```json
{
  "id": "abc-123-def",
  "projectId": "[projectname]"
}
```

### Step 3: Remember (Store)
```json
{
  "content": "Full technical details of the bugfix...",
  "projectId": "[projectname]",
  "files": [
    "/absolute/path/to/file1.js",
    "/absolute/path/to/file2.js"
  ]
}
```

## Memory Types

The system auto-detects these types:
- **bugfix**: Bug resolution with root cause
- **architecture**: Design decisions and constraints
- **golden-rule**: Hard constraints that must never be violated
- **trap**: Common pitfalls and why alternatives don't work

## Best Practices

1. **Store the WHY, not just the WHAT**: Code is in git, but reasoning belongs in memory
2. **Document constraints**: Why we can't use the "obvious" solution
3. **Progressive disclosure**: Use `recall` first, then `get_details` only if needed
4. **Update, don't duplicate**: Use `update_memory` to refine existing memories
5. **Clean up**: Use `delete_memory` to remove outdated information

## Folder Structure

Your memories are stored in:
```
C:\Users\Jooshua\.gemini\antigravity\memory\
├── global\          ← Cross-project memories
└── [projectname]\   ← This project's memories
    └── memory.db
```
