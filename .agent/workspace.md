# [Project Name] - Workspace Rules

## File Organization

### Directory Structure
```
src/
├── core/                                   # Core system logic and orchestration
│   ├── [name]_registry.[ext]               # Component/Service management
│   ├── [name]_engine.[ext]                 # Primary processing logic
│   ├── [name]_planner.[ext]                # Strategic/Logic planning
│   └── [name]_api_manager.[ext]            # External interface management
│
├── shared/                                 # Reusable utilities and helpers
│   ├── [name]_aggregator.[ext]             # Data processing helpers
│   ├── [name]_validator.[ext]              # Input/Schema validation
│   └── [name]_utils.[ext]                  # Common utility functions
│
└── features/                               # Domain-specific implementations
    ├── [feature_a]/                        # Feature A domain
    └── [feature_b]/                        # Feature B domain

tests/                                      # Test suites and benchmarks
├── unit/                                   # Isolated component tests
├── integration/                            # Cross-module workflows
└── benchmarks/                             # Performance profiling

docs/                                       # Technical documentation
└── architecture/                           # System design and diagrams
```

### Naming Conventions
- **Files**: `kebab-case` or `snake_case` (consistent per project)
- **Classes/Types**: `PascalCase`
- **Variables/Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`

### Code Organization Rules

1. **Module Header** - Every source file must include:
   ```text
   // ═══════════════════════════════════════════════════════════════
   // COMPONENT: [Name]
   // ═══════════════════════════════════════════════════════════════
   // Description: [Clear summary of responsibility]
   // Dependencies: [Key internal/external dependencies]
   // Side Effects: [State changes, I/O, etc.]
   ```

2. **Configuration & Constants**
   - Define all configuration objects at the top of the scope.
   - Use environment variables or external config files for environment-specific values.
   - Document the units for all numeric constants (e.g., `TIMEOUT_MS`).

3. **Logic Flow**
   - **Imports/Dependencies**: Grouped by source (Standard Lib, External, Internal).
   - **Internal Helpers**: Private functions defined before the public API.
   - **Public API/Main Export**: Clearly defined at the end of the file.

4. **Execution Safety**
   - Implement robust error boundaries at entry points.
   - Use structured logging with appropriate severity levels.
   - Ensure cleanup of resources (file handles, sockets, timers).

## Performance Guidelines

### Execution Frequency Tiers

| Tier | Latency Target | Priority | Context |
|------|----------------|----------|---------|
| **Critical** | <50ms | High | User-facing / Real-time loops |
| **Standard** | <200ms | Medium | General request/response |
| **Background** | >500ms | Low | Async processing / Batch jobs |

### Optimization Rules
- **State Awareness**: Implement change detection to avoid redundant processing.
- **Resource Caching**: Cache expensive lookups or computed values with TTLs.
- **Complexity Management**: Avoid O(n²) operations on unbounded datasets.
- **Early Exit**: Validate preconditions early to minimize deep nesting and wasted cycles.

## State & Data Management

### Persistence Strategy
- **Ephemeral**: In-memory storage for session-specific or high-frequency data.
- **Persistent**: Database or filesystem for long-term state and configuration.
- **Cache**: Distributed or local cache for performance-critical shared data.

### Access Patterns
- Use clear getters/setters or state management patterns.
- Prefix internal state variables to distinguish from local scope.
- Ensure atomic updates for shared state to prevent race conditions.

## Quality & Testing

### Standards
- ✅ **Single Responsibility**: One module, one primary purpose.
- ✅ **Readability**: Code should explain "Why" via comments and "How" via clean logic.
- ✅ **Nesting Limit**: Maximum 3 levels of indentation.
- ✅ **Error Handling**: Never swallow errors; provide context in logs.

### Validation Workflow
1. Static analysis (Linting/Typing) passes.
2. Unit tests cover success and failure paths.
3. Performance meets the defined tier for the module.
4. Documentation updated for any public API changes.

## Version Control

### Commit Standard
- `feat:` New functionality
- `fix:` Bug fixes
- `perf:` Performance tuning
- `refactor:` Code cleanup without behavior change
- `docs:` Documentation updates
- `chore:` Maintenance tasks (deps, build scripts)
