# Pocket2md v1.0 - Manual Test Plan

This document provides comprehensive manual testing procedures for validating all 17 v1 requirements. Use this plan to verify the system works correctly before releasing v1.0.

## Quick Start

1. **Run full validation:**
   ```bash
   node cli.js --input data/part_000000.csv --output test-validation-output
   ```

2. **Check results:**
   - Console shows progress messages
   - Output directory contains markdown files
   - No crashes or errors

3. **Run edge cases:**
   ```bash
   node cli.js --input tests/fixtures/malformed.csv --output error-test-output
   ```

## Pre-Test Setup

### Environment Requirements
- [x] Node.js installed and working (`node --version`)
- [x] Project dependencies installed (`npm install`)
- [x] Internet connection for API testing
- [x] Sample data available (`data/part_000000.csv`)

### Test Data Files
- [x] **Normal data:** `data/part_000000.csv` (actual Pocket export)
- [x] **Edge cases:** `tests/fixtures/` directory contains:
  - `empty.csv` - empty data test
  - `malformed.csv` - CSV parsing errors
  - `network-errors.csv` - broken URLs
  - `special-chars.csv` - filename sanitization
  - `large-sample.csv` - performance testing
  - `mixed-domains.csv` - various domain types

## Test Execution Checklist

### 1. Basic CLI Functionality (CLI-01, CLI-02, CLI-03)

**Test Command:**
```bash
node cli.js --input data/part_000000.csv --output manual-test-output
```

**Verify:**
- [x] CLI accepts --input and --output arguments
- [x] Progress messages show "Processing article N/M"
- [x] Final summary displays success/error counts
- [x] Output directory is created
- [x] Custom output path works correctly

**Test Default Output:**
```bash
node cli.js --input data/part_000000.csv
```
- [x] Creates `./output/` directory by default

---

### 2. CSV Processing (CSV-01, CSV-02, CSV-03)

**Test Standard CSV:**
```bash
node cli.js --input data/part_000000.csv --output csv-test-output
```

**Verify:**
- [x] CSV file is parsed correctly
- [x] All URLs from CSV are processed in order
- [x] Column headers recognized (title, url, time_added, tags, status)

**Test Malformed CSV:**
```bash
node cli.js --input tests/fixtures/malformed.csv --output error-csv-output
```

**Verify:**
- [x] Parsing errors handled gracefully
- [x] CLI doesn't crash on malformed rows
- [x] Error messages are clear and helpful

---

### 3. URL Fetching (FETCH-01, FETCH-02, FETCH-03)

**Test Network Errors:**
```bash
node cli.js --input tests/fixtures/network-errors.csv --output network-error-output
```

**Verify:**
- [x] Articles processed sequentially (not parallel)
- [-] HTTP errors (404, 500) handled gracefully - no distinction between HTTP errors. Always "server error"
- [x] Invalid URLs skipped with warning messages
- [x] Processing continues after errors

---

### 4. API Integration (API-01, API-02, API-03, API-04)

**Test Rate Limiting:**
```bash
time node cli.js --input tests/fixtures/small-sample.csv --output rate-test-output
```
small-sample.csv does not exist

**Verify:**
- [x] URLs sent to defuddle.md API
- [x] ~5 second delay between API calls
- [ ] API errors handled without crashing - unable to test
- [x] Clean markdown content in output files (not raw HTML)

**Time Calculation:** For N articles, expect ~(N-1) × 5 seconds + processing time

---

### 5. Markdown Output (MD-01, MD-02, MD-03, MD-04)

**Test Special Characters:**
```bash
node cli.js --input tests/fixtures/special-chars.csv --output special-chars-output
```

**Verify:**
- [x] Output directory created automatically
- [ ] Filenames sanitized (no /\:?* characters) - wrong testset, unable to check
- [x] Duplicate titles get numbered suffixes
- [-] Metadata included (title, URL, date fetched) - 

**Check Output Files:**
- [ ] Files end with `.md` extension
- [ ] Content is readable markdown
- [ ] Metadata header present

---

## Performance Testing

### Large Dataset Test
```bash
node cli.js --input tests/fixtures/large-sample.csv --output performance-test-output
```

**Monitor:**
- [ ] Memory usage stays reasonable (< 100MB)
- [ ] Processing doesn't slow down over time
- [ ] No memory leaks with large datasets

### Rate Limiting Verification
Create a small test file with 3 articles and time execution:
- Expected time: ~10 seconds (2 delays × 5s + processing)
- Verify timing matches expectation

---

## Error Scenario Testing

### 1. File System Issues
```bash
# Test missing input file
node cli.js --input nonexistent.csv

# Test read-only output (if supported by OS)
mkdir readonly-output
chmod 444 readonly-output
node cli.js --input data/part_000000.csv --output readonly-output
```

### 2. Network Issues
- Disconnect network during processing
- Test with slow/timeout endpoints
- Verify graceful degradation

### 3. API Service Issues
- Test when defuddle.md is unavailable
- Verify error handling and continuation

---

## Validation Results

### Requirement Checklist

| ID | Requirement | Status | Notes |
|---|---|---|---|
| CLI-01 | Run with --input parameter | ☐ Pass ☐ Fail | |
| CLI-02 | Output directory parameter | ☐ Pass ☐ Fail | |
| CLI-03 | Progress messages | ☐ Pass ☐ Fail | |
| CSV-01 | Read Pocket CSV format | ☐ Pass ☐ Fail | |
| CSV-02 | Extract URLs from CSV | ☐ Pass ☐ Fail | |
| CSV-03 | Handle CSV errors | ☐ Pass ☐ Fail | |
| FETCH-01 | Sequential HTML fetching | ☐ Pass ☐ Fail | |
| FETCH-02 | Handle HTTP errors | ☐ Pass ☐ Fail | |
| FETCH-03 | URL validation | ☐ Pass ☐ Fail | |
| API-01 | Send to defuddle.md API | ☐ Pass ☐ Fail | |
| API-02 | Handle API errors | ☐ Pass ☐ Fail | |
| API-03 | Rate limiting (5s delay) | ☐ Pass ☐ Fail | |
| API-04 | Process API response | ☐ Pass ☐ Fail | |
| MD-01 | Create output directory | ☐ Pass ☐ Fail | |
| MD-02 | Sanitized filenames | ☐ Pass ☐ Fail | |
| MD-03 | Handle name conflicts | ☐ Pass ☐ Fail | |
| MD-04 | Include metadata | ☐ Pass ☐ Fail | |

### Summary
- **Total Requirements:** 17
- **Passed:** _____ / 17
- **Failed:** _____ / 17
- **Overall Status:** ☐ PASS ☐ FAIL

### Critical Issues Found
```
Issue 1: _________________________________

Issue 2: _________________________________

Issue 3: _________________________________
```

### Performance Metrics
- **Average time per article:** _____ seconds
- **Memory usage:** _____ MB
- **Rate limiting working:** ☐ Yes ☐ No
- **Error recovery:** ☐ Yes ☐ No

---

## Sign-off

**Test Environment:**
- **OS:** ____________________
- **Node.js:** _______________
- **Date:** __________________
- **Tester:** _________________

**Certification:**
- [ ] I have completed all 17 requirement tests
- [ ] I have documented all issues found
- [ ] I have verified the system works as specified
- [ ] I recommend this version for: ☐ RELEASE ☐ FURTHER TESTING

**Signature:** _________________________ **Date:** _____________

---

## Quick Reference Commands

```bash
# Main test
node cli.js --input data/part_000000.csv --output test-output

# Error scenarios
node cli.js --input tests/fixtures/malformed.csv --output error-test
node cli.js --input tests/fixtures/network-errors.csv --output network-test
node cli.js --input tests/fixtures/special-chars.csv --output special-test

# Performance test
time node cli.js --input tests/fixtures/large-sample.csv --output perf-test

# Default output test
node cli.js --input data/part_000000.csv
```

## Additional Resources

- **Detailed test procedures:** `tests/manual-validation/validation-process.md`
- **Test scenarios:** `tests/manual-validation/test-scenarios.md`
- **Interactive checklist:** `tests/manual-validation/checklist.md`
- **Test fixtures:** `tests/fixtures/` directory

For questions or issues, refer to the detailed validation documentation in the `tests/manual-validation/` directory.