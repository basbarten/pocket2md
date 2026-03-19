# Manual Validation Process

This document provides step-by-step instructions for conducting comprehensive manual validation of all 17 v1 requirements.

## Pre-Validation Setup

### 1. Environment Preparation
- [ ] Ensure Node.js is installed and working
- [ ] Verify pocket2md project is cloned and dependencies installed (`npm install`)
- [ ] Confirm test fixture files exist in `tests/fixtures/`
- [ ] Create clean test workspace directory: `mkdir validation-workspace && cd validation-workspace`

### 2. Test Data Preparation
- [ ] Copy actual Pocket export CSV to workspace (e.g., `data/part_000000.csv`)
- [ ] Copy test fixture files to workspace:
  - `tests/fixtures/empty.csv`
  - `tests/fixtures/malformed.csv`
  - `tests/fixtures/network-errors.csv`
  - `tests/fixtures/special-chars.csv`
- [ ] Ensure internet connection is available for API testing

### 3. Baseline Verification
- [ ] Run `node ../cli.js --help` to verify CLI is functional
- [ ] Run `node ../cli.js --version` to verify version display
- [ ] Check that defuddle.md API is accessible: `curl -I https://defuddle.md/`

## Complete Workflow Execution

### Phase 1: Happy Path Validation (Requirements CLI-01, CSV-01, FETCH-01, API-01, MD-01)

1. **Test with sample data:**
   ```bash
   node ../cli.js --input ../data/part_000000.csv --output ./happy-path-output/
   ```

2. **Observe and verify:**
   - [ ] CLI starts up correctly with input/output messages
   - [ ] CSV parsing shows correct row count
   - [ ] Article processing shows sequential "Processing article N/M"
   - [ ] Network fetching shows "Fetching: http://..." messages  
   - [ ] Output directory is created
   - [ ] Markdown files are generated

3. **Record observations in checklist**

### Phase 2: Error Scenario Testing (Requirements FETCH-02, FETCH-03, CSV-03, API-02)

1. **Test malformed CSV:**
   ```bash
   node ../cli.js --input ../tests/fixtures/malformed.csv --output ./error-test-output/
   ```

2. **Test network errors:**
   ```bash
   node ../cli.js --input ../tests/fixtures/network-errors.csv --output ./network-error-output/
   ```

3. **Verify graceful error handling:**
   - [ ] No crashes or uncaught exceptions
   - [ ] Clear error messages in console
   - [ ] Processing continues despite errors
   - [ ] Final summary shows error counts

### Phase 3: Edge Case Validation (Requirements CLI-02, CLI-03, MD-02, MD-03, MD-04)

1. **Test custom output directory:**
   ```bash
   node ../cli.js --input ../data/part_000000.csv --output ./custom-output-dir/
   ```

2. **Test default output directory:**
   ```bash
   node ../cli.js --input ../data/part_000000.csv
   ```

3. **Test special characters:**
   ```bash
   node ../cli.js --input ../tests/fixtures/special-chars.csv --output ./special-chars-output/
   ```

4. **Verify edge case handling:**
   - [ ] Custom and default output directories work
   - [ ] Special characters in titles are sanitized
   - [ ] Progress reporting is accurate
   - [ ] Metadata is included in output files

### Phase 4: Performance and Rate Limiting (Requirements API-03)

1. **Test rate limiting with multiple articles:**
   - Create small CSV with 3 articles
   - Time the execution: `time node ../cli.js --input test-3-articles.csv --output ./rate-limit-test/`
   - Verify ~10 seconds total time (2 delays × 5 seconds + processing)

2. **Test with larger dataset:**
   - Use first 10 lines of actual Pocket export
   - Monitor memory usage and performance
   - Verify processing remains stable

## Error Scenario Testing Procedures

### Network Failure Simulation
1. **Disconnect network** during processing
2. **Use invalid domains** from network-errors.csv
3. **Test timeout scenarios** with slow endpoints
4. **Monitor error handling** and recovery

### File System Issues Testing  
1. **Test read-only output directory**:
   ```bash
   mkdir readonly-output
   chmod 444 readonly-output
   node ../cli.js --input ../data/part_000000.csv --output ./readonly-output/
   ```

2. **Test missing input file**:
   ```bash
   node ../cli.js --input nonexistent.csv
   ```

3. **Test insufficient disk space** (if possible in test environment)

### Data Integrity Testing
1. **Compare input CSV URLs** with processing logs
2. **Verify all URLs attempted** (count should match)
3. **Check output file content** against expected format
4. **Validate metadata accuracy** (URLs, timestamps)

## Performance Observation Guidelines

### Memory Usage Monitoring
- [ ] Use `top` or Activity Monitor during processing
- [ ] Monitor for memory leaks with large datasets
- [ ] Verify memory usage remains reasonable (< 100MB for typical datasets)

### Processing Time Validation
- [ ] Record start and end times
- [ ] Calculate expected time: `(article_count - 1) * 5 seconds + processing_overhead`
- [ ] Verify rate limiting is working (not too fast)
- [ ] Ensure processing isn't too slow (< 10s overhead per article)

### Network Activity Observation
- [ ] Use network monitoring tools if available
- [ ] Verify sequential API calls (no parallel requests)
- [ ] Check User-Agent headers are set correctly
- [ ] Monitor for proper HTTP error handling

## Final Report Generation

### Validation Summary Report Template

```markdown
# Pocket2md v1 Validation Report

**Date:** [Date]
**Validator:** [Name]  
**Environment:** [OS, Node.js version]
**Test Duration:** [Total time]

## Executive Summary
- **Requirements Tested:** 17/17
- **Requirements Passed:** ___/17
- **Requirements Failed:** ___/17
- **Critical Issues:** ___
- **Overall Status:** [PASS/FAIL]

## Detailed Results
[Copy results from checklist.md]

## Performance Metrics
- **Average processing time per article:** ___s
- **Memory usage:** ___MB
- **Rate limiting verification:** [PASS/FAIL]
- **Error recovery:** [PASS/FAIL]

## Recommendations
[List any suggestions for improvements or concerns]

## Test Environment
- **Node.js version:** [version]
- **Operating System:** [OS]
- **Network conditions:** [Stable/Intermittent/etc.]
- **Test data size:** [Number of articles tested]
```

### Report Deliverables
1. **Completed checklist.md** with all checkboxes filled
2. **Validation summary report** using template above
3. **Sample output files** from successful test runs
4. **Error logs** if any critical issues found
5. **Performance measurements** and timing data

## Validation Sign-off

**Validator Certification:**
- [ ] I have completed all 17 requirement tests
- [ ] I have documented all issues found
- [ ] I have verified the overall system works as specified
- [ ] I recommend this version for [RELEASE/FURTHER TESTING]

**Signature:** _________________________ **Date:** _____________