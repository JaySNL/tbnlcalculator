# [projectname] Architecture

**Last Updated**: [date]

This document is a living document, it should be updated as the architecture evolves.

> **📋 Task Tracking**: All outstanding tasks are tracked in [`workflow-items/todo.md`](./todo.md).

---

## Documentation Index

### Core Architecture
- **[Project Structure](./architecture/01-project-structure.md)** - Directory layout and file organization
- **[System Overview](./architecture/02-system-overview.md)** - High-level architecture and data flows
- **[Frontend](./architecture/03-frontend.md)** - Client-side application and UI patterns
- **[Backend](./architecture/04-backend.md)** - Server-side application and API patterns

Add any additional sections as needed.

---

## Quick Reference

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS + ShadCN UI
- **Backend**: Node.js + Express + Better-SQLite3
- **Desktop**: Electron 28
- **Routing**: HashRouter (for Electron `file://` protocol)
- **State**: React Context API + License Context
- **i18n**: react-i18next (Dutch + English)

### Key Features
[if applicable list features]

### Current Routes

[if applicable list routes]

### Directory Structure Example

```
[project-root]/
├── client/              # Frontend application
│   ├── src/
│   │   ├── pages/       # Route-level components
│   │   ├── features/    # Modular domain logic (features/modules)
│   │   ├── components/  # Shared reusable UI components
│   │   ├── contexts/    # Global state management
│   │   └── services/    # API client
│   └── dist/            # Production build
│
├── server/              # Backend application
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   ├── services/    # Business logic
│   │   └── data/        # Database
│   └── dist/            # Production build
│
├── electron/            # Electron wrapper + launcher
│   └── src/
│       └── services/    # Backend manager, window manager, license
│
└── scripts/             # Build and automation scripts
```

If the project is not modular, the directory structure will be different. If the project is not a desktop application, the `electron` directory will be missing. If the project is not a backend application, the `server` directory will be missing. Update/choose accordingly.

---

## Critical Production Requirements

[list critical production requirements]

---

## Development Workflow

[list development workflow]

### Adding Dependencies

[list dependency management if any] 

---

## License System

[list license system if any]

### Dev Mode
[list dev mode if any]

### Production
[list production if any]

### Feature Gating
[list feature gating if any]

---

## Recent Critical Fixes

[list recent critical fixes if any]

---

## Contributing

[list contributing if any]

---
