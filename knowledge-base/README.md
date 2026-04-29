# ux-prototype knowledge base

Repo-specific notes, patterns, and anti-patterns accumulated while working
in `ux-prototype`. Read relevant files before starting work; add to this
directory when a pattern or gotcha is worth preserving for future sessions.

For generic React/TypeScript component-design principles that apply across
Arda repos, see the `clean-components` skill at
`.claude/skills/clean-components/SKILL.md`.

## Index

| File | When to read |
|------|--------------|
| [component-abstractions.md](./component-abstractions.md) | Designing or reviewing public component APIs — callback props, controllers, Context providers |
| [typed-test-mocks.md](./typed-test-mocks.md) | Writing vitest tests that mock interfaces |
| [image-upload-architecture.md](./image-upload-architecture.md) | Touching ImageUploadDialog, ItemCardEditor, or the ImageUploader interface |

## Iteration

This KB is young — expect rules to sharpen as more patterns surface.
Contribute by adding a new `.md` file (prefix the filename with the topic,
keep content terse) and linking it from the Index above.
