---
phase: 1
slug: cli-and-csv-foundation
status: complete
nyquist_compliant: true
wave_0_complete: true
created: Wed Mar 18 2026
updated: Wed Mar 18 2026
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x |
| **Config file** | none — Wave 0 installs |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-task Verification Map

| task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | CLI-01 | unit | `npm test -- --testNamePattern="CLI argument parsing"` | ✅ | ✅ green |
| 1-01-02 | 01 | 1 | CLI-02 | unit | `npm test -- --testNamePattern="output directory"` | ✅ | ✅ green |
| 1-01-03 | 01 | 1 | CLI-03 | unit | `npm test -- --testNamePattern="progress display"` | ✅ | ✅ green |
| 1-02-01 | 02 | 2 | CSV-01 | unit | `npm test -- --testNamePattern="CSV reading"` | ✅ | ✅ green |
| 1-02-02 | 02 | 2 | CSV-02 | unit | `npm test -- --testNamePattern="URL extraction"` | ✅ | ✅ green |
| 1-02-03 | 02 | 2 | CSV-03 | unit | `npm test -- --testNamePattern="CSV error handling"` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `tests/cli-args.test.js` — comprehensive tests for CLI-01, CLI-02, CLI-03
- [x] `tests/csv-processor.test.js` — comprehensive tests for CSV-01, CSV-02, CSV-03
- [x] `package.json` — jest dependency and test script configured
- [x] `jest.config.js` — basic configuration created

*Wave 0 complete: testing infrastructure installed and comprehensive test suites created.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| End-to-end CLI workflow | All Phase 1 | Integration testing | 1. Create sample CSV file 2. Run `node cli.js --input sample.csv` 3. Verify progress output 4. Check URL extraction results |

*Most behaviors have automated verification; manual testing covers full integration.*

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 5s (average ~1.2s)
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** ✅ COMPLETE