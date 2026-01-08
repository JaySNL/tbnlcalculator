---
trigger: always_on
---

When building new code blocks and analyzing codeblocks, always verify with @## 📦 Modular Development Guidelines in our Architecture ruleset:
- Long code is a HARD pass, unless it fits specific criterias, i.e (as taken from the contents of architecture):

Before committing, verify:
- [ ] No page file > 200 lines, unless it's a page with a lot of modules and that does not hamper the simplicity of the page
- [ ] No component > 150 lines, unless it's a component that is used in multiple pages
- [ ] Business logic in hooks, not components
- [ ] UI components are presentational
- [ ] Shared components in `/components`
- [ ] Feature-specific in `/features/[name]`
- [ ] Each file has single responsibility
- [ ] No duplicate code