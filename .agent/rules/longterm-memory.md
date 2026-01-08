---
trigger: always_on
---

# Long-Term Memory Rules

**Last Updated**: [date]  
**Status**: [status]

## Project ID Convention

**CRITICAL RULE**: Always use the SINGULAR project ID for this project:

```
"projectId": "[projectname]"  // ✅ Use package.json name
```

### ❌ Do NOT use:
- `project-[projectname]`
- `project-[projectname]-migration.md`
- Any other variations  

### ✅ Always use:
- "projectId": "[projectname]"  // ✅ Use package.json name

## Memory Storage Guidelines

### When to Store Memories
- **Architectural Decisions**: Core patterns, routing, state management
- **Production Constraints**: Critical requirements (HashRouter, relative paths, etc.)
- **Bug Fixes**: "Traps" (why hard to find) and "Constraints" (why alternatives won't work)
- **Feature Implementations**: Key logic, integration points, gotchas
- **Refactoring Patterns**: Modularization strategies, circular dependency solutions

### What NOT to Store
- Temporary implementation details
- Code that's already well-documented in architecture files
- Routine CRUD operations without special constraints
- UI styling choices (unless they have technical constraints)

## Search Query Best Practices

**CRITICAL**: The MCP search uses fuzzy/semantic matching. **Short queries work better than long ones.**

### ✅ Good Queries (Single words or short phrases)
```javascript
// Find routing-related memories
{ query: "router" }
{ query: "HashRouter" }

// Find backend architecture
{ query: "backend" }
{ query: "services" }

// Find licensing info
{ query: "licensing" }
{ query: "feature gating" }

// Find production issues
{ query: "production" }
{ query: "minification" }
```

### ❌ Bad Queries (Too specific, too long)
```javascript
// Too many words - may return nothing
{ query: "[projectname] architecture licensing production backend frontend" }

// Too specific - may miss related memories
{ query: "how to implement HashRouter in Electron with file protocol" }
```

### Strategy
1. Start with **1-2 word queries** for broad results
2. Scan summaries to find relevant memory
3. Use `get_details` with specific ID to see full content
4. If too many results, add one more specific word

## Progressive Disclosure Workflow

1. **Step 1**: Use `recall` with **short queries** (1-2 words) to find technical summaries
2. **Step 2**: If summary contains critical code/steps, call `get_details` with ID
3. **Never guess** implementation if detailed memory exists

## Memory-First Conflict Resolution

If suggested code contradicts a "Golden Rule" in memory:
- Memory rule takes precedence
- Flag contradiction to user before proceeding

## Project Isolation

- Always use correct `projectId` for current workspace
- Cross-reference other projects only for:
  - Solved bugs with similar patterns
  - Common infrastructure (e.g., "How did we handle X in other app?")

## Intent Over Implementation

- Focus on storing **reasoning** behind choices
- Code changes are in git
- The **argument for that code** belongs in memory

---

