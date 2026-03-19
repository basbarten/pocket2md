# Manual Validation Checklist - v1 Requirements

Complete this checklist to validate all 17 v1 requirements systematically. Each requirement should be tested with real data and realistic scenarios.

## CLI Interface Requirements

### CLI-01: User can run `cli.js --input <file.csv>` to process Pocket export
- [ ] **Test Action:** Run `node cli.js --input data/part_000000.csv --output test-output/`
- [ ] **Expected Result:** CLI starts processing, shows startup messages, processes articles sequentially
- [ ] **Pass/Fail:** ___________
- [ ] **Notes:** ________________________________________________

### CLI-02: User provides output directory path (default: `output/`)
- [ ] **Test Action:** 
  - Run with custom output: `node cli.js --input data/part_000000.csv --output custom-dir/`
  - Run with default: `node cli.js --input data/part_000000.csv` (should create `./output/`)
- [ ] **Expected Result:** Files created in specified directory or default `output/` directory
- [ ] **Pass/Fail:** ___________
- [ ] **Notes:** ________________________________________________

### CLI-03: CLI prints progress (Processing article N/M, success/error for each)
- [ ] **Test Action:** Run with multiple articles and observe console output
- [ ] **Expected Result:** Shows "Processing article X/Y", final summary with counts, success/error messages
- [ ] **Pass/Fail:** ___________
- [ ] **Notes:** ________________________________________________

## CSV Processing Requirements

### CSV-01: CLI reads Pocket export CSV format
- [ ] **Test Action:** Use actual Pocket export CSV with columns: title, url, time_added, tags, status
- [ ] **Expected Result:** CSV parsed correctly, all columns recognized
- [ ] **Pass/Fail:** ___________
- [ ] **Notes:** ________________________________________________

### CSV-02: CLI extracts article URLs from CSV rows
- [ ] **Test Action:** Verify URLs from CSV are being fetched (check console output for "Fetching: http://...")
- [ ] **Expected Result:** Each URL from CSV is processed in order
- [ ] **Pass/Fail:** ___________
- [ ] **Notes:** ________________________________________________

### CSV-03: CLI handles CSV parsing errors gracefully
- [ ] **Test Action:** Use `tests/fixtures/malformed.csv` with intentional formatting errors
- [ ] **Expected Result:** CLI continues processing, skips invalid rows, doesn't crash
- [ ] **Pass/Fail:** ___________
- [ ] **Notes:** ________________________________________________

## HTML Fetching and API Requirements

### FETCH-01: CLI fetches HTML from each article URL sequentially
- [ ] **Test Action:** Monitor network activity or console logs to verify sequential processing
- [ ] **Expected Result:** Articles processed one at a time, not in parallel
- [ ] **Pass/Fail:** ___________
- [ ] **Notes:** ________________________________________________

### FETCH-02: CLI handles HTTP errors (404, 500, timeouts) and skips Article
- [ ] **Test Action:** Use `tests/fixtures/network-errors.csv` with broken URLs
- [ ] **Expected Result:** Error messages logged, processing continues with next article
- [ ] **Pass/Fail:** ___________
- [ ] **Notes:** ________________________________________________

### FETCH-03: CLI validates URLs before fetching (basic URL format check)
- [ ] **Test Action:** Use CSV with invalid URLs (missing protocol, malformed domains)
- [ ] **Expected Result:** Invalid URLs skipped with warning messages
- [ ] **Pass/Fail:** ___________
- [ ] **Notes:** ________________________________________________

### API-01: CLI sends article URLs to defuddle.md API service
- [ ] **Test Action:** Monitor network requests or check code for `defuddle.md` API calls
- [ ] **Expected Result:** URLs sent to `https://defuddle.md/{encoded-url}` format
- [ ] **Pass/Fail:** ___________
- [ ] **Notes:** ________________________________________________

### API-02: CLI handles API errors (network failures, service unavailable) and skips article
- [ ] **Test Action:** Test when defuddle.md is unavailable or returns errors
- [ ] **Expected Result:** Graceful error handling, processing continues
- [ ] **Pass/Fail:** ___________
- [ ] **Notes:** ________________________________________________

### API-03: CLI implements rate limiting (5 second delay between API calls)
- [ ] **Test Action:** Process 3+ articles and time the execution
- [ ] **Expected Result:** ~5 second delay between each API call, total time = (N-1) * 5 seconds + processing time
- [ ] **Pass/Fail:** ___________
- [ ] **Notes:** ________________________________________________

### API-04: CLI processes API response to extract cleaned markdown content
- [ ] **Test Action:** Verify that output files contain cleaned markdown content from API
- [ ] **Expected Result:** Markdown files have clean content, not raw HTML
- [ ] **Pass/Fail:** ___________
- [ ] **Notes:** ________________________________________________

## Markdown Output Requirements

### MD-01: CLI creates output directory (default: `./output/`)
- [ ] **Test Action:** Run CLI and verify directory creation
- [ ] **Expected Result:** Output directory created if it doesn't exist
- [ ] **Pass/Fail:** ___________
- [ ] **Notes:** ________________________________________________

### MD-02: CLI saves markdown files with sanitized article title as filename
- [ ] **Test Action:** Use articles with special characters, spaces, symbols in titles
- [ ] **Expected Result:** Filenames sanitized (no /, \, :, ?, etc.), end with `.md`
- [ ] **Pass/Fail:** ___________
- [ ] **Notes:** ________________________________________________

### MD-03: CLI handles filename conflicts (append number if title exists)
- [ ] **Test Action:** Process articles with identical titles
- [ ] **Expected Result:** Second file gets numbered suffix (e.g., `title (2).md`)
- [ ] **Pass/Fail:** ___________
- [ ] **Notes:** ________________________________________________

### MD-04: CLI includes basic metadata in markdown file (title, URL, date fetched)
- [ ] **Test Action:** Check generated markdown files for metadata
- [ ] **Expected Result:** Files contain original URL, fetch timestamp, and title information
- [ ] **Pass/Fail:** ___________
- [ ] **Notes:** ________________________________________________

## Summary

**Total Requirements:** 17
**Passed:** _____ / 17
**Failed:** _____ / 17

**Overall Status:** [ ] PASS [ ] FAIL

**Critical Issues Found:**
_____________________________________________________________________________
_____________________________________________________________________________
_____________________________________________________________________________

**Validation Date:** _______________
**Validator:** _______________
**Environment:** _______________