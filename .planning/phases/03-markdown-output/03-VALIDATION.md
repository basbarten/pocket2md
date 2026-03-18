---
phase: 3
slug: markdown-output
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-18
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest (Node.js testing) |
| **Config file** | package.json scripts or Wave 0 installs |
| **Quick run command** | `npm test -- --testPathPattern=file-writer` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testPathPattern=file-writer`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-task Verification Map

| task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 3-01-01 | 01 | 1 | MD-01 | unit | `npm test -- --testPathPattern=directory` | ❌ W0 | ⬜ pending |
| 3-01-02 | 01 | 1 | MD-02 | unit | `npm test -- --testPathPattern=filename` | ❌ W0 | ⬜ pending |
| 3-01-03 | 01 | 1 | MD-03 | unit | `npm test -- --testPathPattern=conflict` | ❌ W0 | ⬜ pending |
| 3-02-01 | 02 | 2 | MD-04 | integration | `npm test -- --testPathPattern=metadata` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/file-writer.test.js` — unit tests for file operations, filename sanitization, conflict resolution
- [ ] `tests/metadata.test.js` — tests for YAML frontmatter formatting
- [ ] `jest` framework install — if no testing framework detected
- [ ] `sanitize-filename` dependency test stubs

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Cross-platform filename compatibility | MD-02 | Different OS filename rules | Run tests on Windows/Mac/Linux, verify no invalid chars |
| Generated markdown readability | MD-04 | Human judgment needed | Open sample generated files, verify metadata format is clean |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references  
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending