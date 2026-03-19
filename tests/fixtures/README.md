# Test Fixtures

This directory contains comprehensive test CSV files for validating the pocket2md application against various edge cases and scenarios.

## Test Files

### empty.csv
- **Purpose**: Test handling of empty CSV files (header only, no data rows)
- **Expected Behavior**: Should process successfully but generate no output files
- **Use Case**: Validates empty input handling (CSV-02)

### malformed.csv
- **Purpose**: Test handling of malformed CSV data with various formatting issues
- **Contains**: Missing headers, unclosed quotes, extra commas, empty titles
- **Expected Behavior**: Should handle gracefully, skip invalid rows, continue processing
- **Use Case**: Validates CSV parsing resilience (CSV-01, CSV-03)

### special-chars.csv
- **Purpose**: Test handling of special characters, Unicode, and HTML entities
- **Contains**: Quotes, umlauts, emojis, Chinese/Japanese text, symbols, line breaks, HTML tags
- **Expected Behavior**: Should preserve special characters in output, handle encoding correctly
- **Use Case**: Validates Unicode support and character encoding (MD-02, MD-04)

### large-sample.csv
- **Purpose**: Test performance and memory usage with larger datasets (50+ articles)
- **Contains**: 52 sample articles with various tags
- **Expected Behavior**: Should process efficiently without memory issues
- **Use Case**: Validates performance requirements and scalability

### mixed-domains.csv
- **Purpose**: Test handling of various URL patterns and domain types
- **Contains**: Different platforms (GitHub, Medium, Dev.to), localhost, IP addresses, subdomains
- **Expected Behavior**: Should handle all URL types correctly
- **Use Case**: Validates URL processing flexibility (FETCH-01)

### network-errors.csv
- **Purpose**: Test network error handling scenarios
- **Contains**: Non-existent domains, invalid URLs, timeout scenarios, HTTP errors
- **Expected Behavior**: Should gracefully handle failures, continue with other URLs, log errors appropriately
- **Use Case**: Validates error handling and network resilience (FETCH-02, FETCH-03, API-02, API-03)

## Usage in Tests

These fixtures are designed to be used with the integration test suite to validate all 17 v1 requirements systematically. Each file tests specific aspects of the application's robustness and error handling capabilities.