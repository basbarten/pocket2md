# Requirements: Pocket to Markdown CLI

**Defined:** Wed Mar 11 2026
**Core Value:** Convert Pocket read-later lists to persistent, portable markdown archives for long-term reading in markdown tools

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### CLI Interface

- [x] **CLI-01**: User can run `cli.js --input <file.csv>` to process Pocket export
- [x] **CLI-02**: User provides output directory path (default: `output/`)
- [x] **CLI-03**: CLI prints progress: Processing article N/M, success/error for each

### CSV Processing

- [x] **CSV-01**: CLI reads Pocket export CSV format
- [x] **CSV-02**: CLI extracts article URLs from CSV rows
- [x] **CSV-03**: CLI handles CSV parsing errors gracefully

### HTML Fetching and Cleaning

- [ ] **FETCH-01**: CLI fetches HTML from each article URL sequentially
- [ ] **FETCH-02**: CLI handles HTTP errors (404, 500, timeouts) and skips Article
- [ ] **FETCH-03**: Cli validates URLs before fetching (basic URL format check)
- [ ] **API-01**: CLI sends article URLs to defuddle.md API service (`curl defuddle.md/<<url>>`)
- [ ] **API-02**: CLI handles API errors (network failures, service unavailable) and skips article
- [ ] **API-03**: CLI implements rate limiting (10 second delay between API calls)
- [ ] **API-04**: CLI processes API response to extract cleaned markdown content

### Markdown Output

- [ ] **MD-01**: CLI creates output directory (default: `./output/`)
- [ ] **MD-02**: CLI saves markdown files with sanitized article title as filename
- [ ] **MD-03**: CLI handles filename conflicts (append number if title exists)
- [ ] **MD-04**: CLI includes basic metadata in markdown file (title, URL, date fetched)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### CLI Enhancements

- **CLI-04**: Support for multiple input files (CLI flag or glob patterns)
- **CLI-05**: Progress bar showing completion percentage
- **CLI-06**: Config file options for custom output directory, timeout settings
- **CLI-07**: Resume functionality (skip already processed articles)

### Processing Enhancements

- **PARS-01**: Batch processing mode using concurrency control
- **PARS-02**: Support for different HTML cleaning strategies/configurable
- **PARS-03**: Pre-flight validation of all URLs before fetching
- **PARS-04**: Caching of fetched articles to avoid redundant requests

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Multiple input files or glob patterns | Simpler implementation, v1 scope |
| Configuration file support | CLI default behavior sufficient, v1 complexity cost high |
| Batch processing/concurrency | Sequential simpler, v2 for performance needs |
| Advanced HTML cleaning options | Fixed API approach (defuddle.md service) works well, configurable too complex for v1 |
| Mobile app or web interface | CLI tool, v2 platform expansion |
| OAuth/Pocket API integration | CSV export processing only, more complex to implement |
| Resume functionality | Article IDs or timestamps needed, v2 for large archives |
| Advanced error reporting (JSON, detailed logs) | Console output adequate, v2 for automation |
| Support for other "read it later" services | Pocket-specific, v2 for extensibility |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| CLI-01 | Phase 1 | Complete |
| CLI-02 | Phase 1 | Complete |
| CLI-03 | Phase 1 | Complete |
| CSV-01 | Phase 1 | Complete |
| CSV-02 | Phase 1 | Complete |
| CSV-03 | Phase 1 | Complete |
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

**Coverage:**
- v1 requirements: 17 total
- Mapped to phases: 4
- Unmapped: 0 ✓

**Note:** Phase 4 (Testing and Validation) validates all requirements work correctly together, not implementing new features.

---

*Requirements defined: Wed Mar 11 2026*
*Last updated: Wed Mar 11 2026 after initial setup*