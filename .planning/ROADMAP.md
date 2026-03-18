# ROADMAP: Pocket to Obsidian CLI

**Created:** Wed Mar 11 2026
**Core Value:** Convert Pocket read-later lists to persistent, portable markdown archives for long-term reading in Markdown tools
**Granularity:** Standard (5-8 phases typical)
**Coverage:** 17/17 v1 requirements mapped ✓

---

## Phases

- [x] **Phase 1: CLI and CSV Foundation** - Setup CLI for Pocket export processing
- [ ] **Phase 2: Content Extraction** - Fetch and clean articles from web
- [ ] **Phase 3: Markdown Output** - Save cleaned HTML as markdown files
- [ ] **Phase 4: Testing and Validation** - Verify all requirements work end-to-end

---

## Phase Details

### Phase 1: CLI and CSV Foundation
**Goal:** User can run the CLI to process a Pocket export CSV file and extract article URLs

**Depends on:** Nothing (first phase)

**Requirements:** CLI-01, CLI-02, CLI-03, CSV-01, CSV-02, CSV-03

**Success Criteria:**
1. User runs `node cli.js --input data/part_000000.csv` and CLI starts processing
2. User can specify output directory with `--output ./output/` or use default
3. User sees console output showing "Processing article 1/50..." progression
4. CLI handles malformed CSV files with clear error message

**Plans:** 2 plans

Plans:
- [x] 01-01-PLAN.md — CLI Foundation and Argument Parsing (completed 2026-03-18)
- [x] 01-02-PLAN.md — CSV Processing and Integration (completed 2026-03-18)

---

### Phase 2: Content Extraction
**Goal:** Each article URL is sent to defuddle.md API service for content extraction and markdown conversion

**Depends on:** Phase 1

**Requirements:** FETCH-01, FETCH-02, FETCH-03, API-01, API-02, API-03, API-04

**Success Criteria:**
1. User sees status updates for each article: "Processing [URL]", "Skipped (error)"
2. CLI validates URLs before sending to API service
3. CLI gracefully skips articles with network/API errors without crashing
4. CLI sends article URLs to defuddle.md API service (`curl defuddle.md/<<url>>`)
5. CLI implements 10-second rate limiting between API calls
6. CLI processes API responses to extract cleaned markdown content

**Plans:** TBD

---

### Phase 3: Markdown Output
**Goal:** Cleaned markdown content is saved to files with proper metadata

**Depends on:** Phase 2

**Requirements:** MD-01, MD-02, MD-03, MD-04

**Success Criteria:**
1. CLI creates output directory (`./output/`) if it doesn't exist
2. Markdown files are saved with sanitized article titles as filenames (e.g., "Compose-to-a-vertical-rhythm.md")
3. Filename conflicts are resolved by appending numbers (e.g., "title-1.md", "title-2.md")
4. Each markdown file contains: article title, original URL, and date fetched at the top

**Plans:** TBD

---

### Phase 4: Testing and Validation
**Goal:** The complete workflow validates all requirements work correctly

**Depends on:** Phases 1, 2, 3

**Requirements:** All 17 v1 requirements validated together

**Success Criteria:**
1. Complete end-to-end workflow works on sample Pocket export
2. All CSV requirements met: proper parsing, URL extraction, error handling
3. All fetch requirements met: URL validation, API error handling, rate limiting
4. All API requirements met: defuddle.md service integration, error handling, response processing
5. All output requirements met: directory creation, sanitized filenames, conflict resolution, metadata
6. Articles that fail to fetch are logged but don't halt processing
7. Sequential processing completes without memory errors for typical exports (<1000 articles)

**Plans:** TBD

---

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1 - CLI and CSV Foundation | 0/4 | Not started | - |
| 2 - Content Extraction | 0/6 | Not started | - |
| 3 - Markdown Output | 0/4 | Not started | - |
| 4 - Testing and Validation | 0/7 | Not started | - |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CLI-01 | Phase 1 | Pending |
| CLI-02 | Phase 1 | Pending |
| CLI-03 | Phase 1 | Pending |
| CSV-01 | Phase 1 | Pending |
| CSV-02 | Phase 1 | Pending |
| CSV-03 | Phase 1 | Pending |
| FETCH-01 | Phase 2 | Pending |
| FETCH-02 | Phase 2 | Pending |
| FETCH-03 | Phase 2 | Pending |
| API-01 | Phase 2 | Pending |
| API-02 | Phase 2 | Pending |
| API-03 | Phase 2 | Pending |
| API-04 | Phase 2 | Pending |
| MD-01 | Phase 3 | Pending |
| MD-02 | Phase 3 | Pending |
| MD-03 | Phase 3 | Pending |
| MD-04 | Phase 3 | Pending |

---

## Requirement Coverage

✓ **All 17 v1 requirements mapped** to exactly one phase
✓ **No orphaned requirements**
✓ **No duplicate mappings**
✓ **Clear phase dependencies** established (1 → 2 → 3 → 4)

---

## Next Steps

1. **Review this roadmap** — Ensure phase structure and success criteria align with your expectations
2. **Approve** with `/gsd-plan-phase 1` to create detailed plans for the first phase
3. **Execute** as implementation progresses through each phase
4. **Validate** completion with `/gsd-complete-phase N` to mark phases done

---

*Last updated: Wed Mar 11 2026*