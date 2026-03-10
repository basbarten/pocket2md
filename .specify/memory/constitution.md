<!--
Sync Impact Report:
Version change: 1.0.0 → 1.1.0
Modified principles: None renamed or removed
Added sections: Additional Constraints (technology stack)
Removed sections: None
Templates requiring updates:
  ✅ .specify/templates/plan-template.md (already generic)
  ✅ .specify/templates/spec-template.md (no constitution references)
  ✅ .specify/templates/tasks-template.md (no constitution references)
Follow-up TODOs: None
-->

# Pocket to Obsidian Constitution

## Core Principles

### I. CLI-First
Every feature MUST be accessible via command-line interface. Text in/out protocol: stdin/args → stdout, errors → stderr. Support human-readable output formats for interoperability.

### II. Test-First (NON-NEGOTIABLE)
TDD mandatory: Tests written → Implementation → Tests pass → Refactor. Red-Green-Refactor cycle strictly enforced for all features. Unit tests REQUIRED before any implementation.

### III. Integration Testing
Use few integration tests and test the happy path user stories. Make sure they don't fail! Create test-dataset snapshots and make sure tests are repeatable.

## Additional Constraints

- **File Format**: Store articles as Markdown with YAML frontmatter for Obsidian compatibility
- **Core Technologies**: Node.js (latest) and vanilla JavaScript as primary runtime and language

## Development Workflow

- Use `main` as primary branch; feature branches from `main`

## Governance

This constitution supersedes all other practices. Amendments require:
1. Draft proposal in `.specify/memory/constitution.md`
2. Version bump following semantic versioning (MAJOR for breaking changes, MINOR for additions, PATCH for clarifications)
3. Documentation of migration plan if required
4. All team members notified of changes

**Version**: 1.1.0 | **Ratified**: 2026-03-05 | **Last Amended**: 2026-03-05