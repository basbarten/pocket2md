# Detailed Test Scenarios for Manual Validation

This document provides comprehensive test scenarios for manual validation, organized by requirement category and complexity level.

## Happy Path Scenarios

### Scenario 1: Typical Pocket Export Processing
**Objective:** Validate the complete workflow with real Pocket data
**Requirements Tested:** CLI-01, CLI-02, CSV-01, CSV-02, FETCH-01, API-01, API-04, MD-01, MD-02, MD-04

**Setup:**
```bash
# Use actual Pocket export data (first 5 articles for speed)
head -n 6 data/part_000000.csv > test-5-articles.csv
mkdir happy-path-output
```

**Execution:**
```bash
time node cli.js --input test-5-articles.csv --output happy-path-output/
```

**Expected Behavior:**
1. CLI starts with clear startup messages
2. CSV parsing shows "Found 5 rows in CSV"
3. Each article shows "Processing article N/5..."
4. Network requests show "Fetching: http://..."
5. Successful articles show "✅ Wrote article: filename.md"
6. Final summary shows counts (e.g., "3 successful, 2 failed")
7. Output directory contains markdown files with proper metadata

**Verification Steps:**
1. Check output directory exists and contains .md files
2. Open sample markdown file and verify:
   - Contains "Original URL: http://..."
   - Contains "Fetched on: [timestamp]"
   - Has clean markdown content (not raw HTML)
   - Title matches CSV title
3. Verify file count matches successful count in summary

### Scenario 2: Custom Output Directory
**Objective:** Test CLI-02 output directory specification
**Requirements Tested:** CLI-02, MD-01

**Setup:**
```bash
# Test both custom and default output paths
```

**Execution:**
```bash
# Test custom output
node cli.js --input test-5-articles.csv --output ./custom-location/articles/

# Test default output (should create ./output/)
node cli.js --input test-5-articles.csv
```

**Expected Behavior:**
1. Custom directory `./custom-location/articles/` is created
2. Default directory `./output/` is created when no --output specified
3. Files are written to the correct location in both cases

**Verification Steps:**
1. Verify both directories exist
2. Confirm files are in the correct locations
3. Check that directory creation works even with nested paths

## Error Scenarios

### Scenario 3: Network Error Handling
**Objective:** Test FETCH-02, API-02 error handling
**Requirements Tested:** FETCH-02, API-02, CLI-03

**Setup:**
```bash
# Use fixture with intentionally broken URLs
cp tests/fixtures/network-errors.csv .
```

**Execution:**
```bash
node cli.js --input network-errors.csv --output error-test-output/
```

**Expected Behavior:**
1. Processing continues despite network failures
2. Each failed URL shows warning message (not crash)
3. Final summary accurately counts failed articles
4. No uncaught exceptions or crashes
5. Some articles may succeed if their URLs work

**Verification Steps:**
1. Check that CLI exits with status 0 (graceful handling)
2. Verify warning messages for each failed URL
3. Confirm final count includes failed articles
4. Check that processing doesn't stop at first error

### Scenario 4: Malformed CSV Handling
**Objective:** Test CSV-03 error resilience
**Requirements Tested:** CSV-03

**Setup:**
```bash
# Use CSV with various parsing challenges
cp tests/fixtures/malformed.csv .
```

**Execution:**
```bash
node cli.js --input malformed.csv --output malformed-output/
```

**Expected Behavior:**
1. CSV parsing handles malformed rows gracefully
2. Valid rows are still processed
3. Invalid rows are skipped with warnings
4. No crashes due to CSV parsing errors

**Verification Steps:**
1. Check for CSV parsing warning messages
2. Verify that some valid rows are still processed
3. Confirm CLI doesn't crash on malformed data

### Scenario 5: Invalid URL Handling
**Objective:** Test FETCH-03 URL validation
**Requirements Tested:** FETCH-03

**Setup:**
```bash
# Create CSV with mix of valid and invalid URLs
cat > mixed-urls.csv << 'EOF'
title,url,time_added,tags,status
"Valid Article","http://httpbin.org/html",1407757755,test,archive
"Invalid URL 1","not-a-url-at-all",1407757756,test,archive
"Invalid URL 2","ftp://example.com/file",1407757757,test,archive
"Another Valid","https://httpbin.org/html",1407757758,test,archive
"Missing Protocol","example.com/page",1407757759,test,archive
EOF
```

**Execution:**
```bash
node cli.js --input mixed-urls.csv --output url-validation-output/
```

**Expected Behavior:**
1. Valid URLs are processed normally
2. Invalid URLs are skipped with warning messages
3. Final summary shows correct counts for skipped vs. failed articles
4. Processing continues through invalid URLs

**Verification Steps:**
1. Check that valid URLs were processed
2. Verify warning messages for invalid URLs
3. Confirm skipped count in summary is accurate

## Edge Cases

### Scenario 6: Empty and Special Character Handling
**Objective:** Test edge cases in data handling
**Requirements Tested:** CSV-02, MD-02, MD-03

**Setup:**
```bash
# Use fixture with special characters and edge cases
cp tests/fixtures/special-chars.csv .
```

**Execution:**
```bash
node cli.js --input special-chars.csv --output special-chars-output/
```

**Expected Behavior:**
1. Unicode characters in titles are preserved
2. Special characters in filenames are sanitized
3. HTML entities in content are handled properly
4. No encoding issues with output files

**Verification Steps:**
1. Check output filenames are safe for filesystem
2. Open files and verify Unicode content is readable
3. Confirm special characters didn't break processing

### Scenario 7: Filename Conflicts
**Objective:** Test MD-03 duplicate filename handling
**Requirements Tested:** MD-03

**Setup:**
```bash
# Create CSV with duplicate titles
cat > duplicate-titles.csv << 'EOF'
title,url,time_added,tags,status
"Same Title","http://httpbin.org/html",1407757755,test,archive
"Same Title","https://httpbin.org/json",1407757756,test,archive
"Same Title","http://httpbin.org/xml",1407757757,test,archive
EOF
```

**Execution:**
```bash
node cli.js --input duplicate-titles.csv --output duplicate-test-output/
```

**Expected Behavior:**
1. First file: `Same Title.md`
2. Second file: `Same Title (2).md` or similar numbering
3. Third file: `Same Title (3).md`
4. All files are created successfully

**Verification Steps:**
1. Check that 3 different files exist in output
2. Verify numbering or suffix system works
3. Confirm all files have different filenames

### Scenario 8: Empty Input Handling
**Objective:** Test handling of empty or minimal data
**Requirements Tested:** CSV-01, CSV-02

**Setup:**
```bash
# Test with empty CSV
cp tests/fixtures/empty.csv .

# Create CSV with only headers
echo "title,url,time_added,tags,status" > headers-only.csv
```

**Execution:**
```bash
# Test empty file
node cli.js --input empty.csv --output empty-test-output/

# Test headers-only file  
node cli.js --input headers-only.csv --output headers-only-output/
```

**Expected Behavior:**
1. Empty CSV processed without crashing
2. Clear message about no articles to process
3. Output directory created but empty
4. Graceful handling with appropriate messages

**Verification Steps:**
1. Verify CLI doesn't crash on empty input
2. Check appropriate "no articles" messages
3. Confirm output directories are created

## Performance Scenarios

### Scenario 9: Rate Limiting Validation
**Objective:** Test API-03 rate limiting implementation
**Requirements Tested:** API-03

**Setup:**
```bash
# Create CSV with 4 articles to test 3 delays
cat > rate-limit-test.csv << 'EOF'
title,url,time_added,tags,status
"Article 1","http://httpbin.org/delay/1",1407757755,test,archive
"Article 2","http://httpbin.org/delay/1",1407757756,test,archive
"Article 3","http://httpbin.org/delay/1",1407757757,test,archive
"Article 4","http://httpbin.org/delay/1",1407757758,test,archive
EOF
```

**Execution:**
```bash
# Time the execution
time node cli.js --input rate-limit-test.csv --output rate-limit-output/
```

**Expected Behavior:**
1. Total execution time ≥ 15 seconds (3 delays × 5 seconds)
2. Console shows "Waiting 5 seconds before next request..."
3. Delays occur between articles, not before first or after last
4. Actual API processing time is additional to delay time

**Verification Steps:**
1. Measure total execution time
2. Check for delay messages in console output
3. Verify delays don't occur before first article
4. Confirm no delay after final article

### Scenario 10: Large Dataset Handling
**Objective:** Test system behavior with larger datasets
**Requirements Tested:** All requirements under load

**Setup:**
```bash
# Create larger test dataset (first 20 lines of real data)
head -n 21 data/part_000000.csv > large-test.csv
```

**Execution:**
```bash
# Monitor system resources during execution
time node cli.js --input large-test.csv --output large-dataset-output/
```

**Expected Behavior:**
1. Processing completes successfully
2. Memory usage remains stable
3. Progress reporting is accurate throughout
4. No performance degradation over time
5. Rate limiting still functions correctly

**Verification Steps:**
1. Monitor memory usage during execution
2. Verify all articles are processed in order
3. Check final counts match expected numbers
4. Confirm rate limiting maintained throughout

## Regression Test Scenarios

### Scenario 11: Integration with Existing Test Suite
**Objective:** Ensure manual validation aligns with automated tests
**Requirements Tested:** All requirements

**Execution:**
```bash
# First run automated tests
npm test

# Then run specific integration validation
npm test -- --testPathPatterns=integration-validation
```

**Expected Behavior:**
1. All automated tests pass
2. Integration tests validate same requirements as manual tests
3. No conflicts between automated and manual validation results

**Verification Steps:**
1. Compare automated test results with manual findings
2. Investigate any discrepancies
3. Confirm both validation methods agree on requirement status

### Scenario 12: End-to-End Workflow Validation
**Objective:** Test complete user workflow from export to markdown
**Requirements Tested:** All 17 requirements in sequence

**Setup:**
```bash
# Simulate complete user workflow
mkdir end-to-end-test
cd end-to-end-test
```

**Execution:**
```bash
# Complete workflow simulation
echo "1. User exports data from Pocket (simulated with sample data)"
cp ../data/part_000000.csv pocket-export.csv

echo "2. User runs pocket2md on their export"
node ../cli.js --input pocket-export.csv --output my-articles/

echo "3. User checks their article collection"
ls -la my-articles/
head my-articles/*.md
```

**Expected Behavior:**
1. Smooth workflow from start to finish
2. Clear user feedback at each step
3. Usable output files for reading
4. No technical errors or confusing messages

**Verification Steps:**
1. Walk through workflow as an end user would
2. Check that output files are readable and useful
3. Verify the process feels intuitive and robust
4. Confirm error messages (if any) are user-friendly

## Test Data Requirements

### Required Test Files
- `data/part_000000.csv` - Real Pocket export data
- `tests/fixtures/empty.csv` - Empty CSV for edge case testing
- `tests/fixtures/malformed.csv` - Malformed CSV data
- `tests/fixtures/network-errors.csv` - URLs that cause network errors
- `tests/fixtures/special-chars.csv` - Special character and Unicode test data

### Generated Test Files (created during testing)
- `test-5-articles.csv` - Subset of real data for quick testing
- `mixed-urls.csv` - Mix of valid and invalid URLs
- `duplicate-titles.csv` - Duplicate titles for conflict testing
- `headers-only.csv` - CSV with headers but no data
- `rate-limit-test.csv` - Small dataset for rate limiting verification
- `large-test.csv` - Larger dataset for performance testing

### Environment Requirements
- **Node.js version:** Latest LTS recommended
- **Network access:** Required for API testing
- **Disk space:** At least 100MB free for test outputs
- **Time:** Allow 30-60 minutes for complete validation suite