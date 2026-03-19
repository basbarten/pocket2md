---
created: 2026-03-19T14:07:45.168Z
title: Add a way of logging the error scenario's from defuddle to the stdwarn/stdout of our cli tool
area: api
files:
  - cli.js:358-377
  - cli.js:331-347
---

## Problem

The current CLI tool handles various error scenarios when fetching content from the defuddle.md API, but the error logging could be enhanced to provide better visibility into different failure modes. Currently, errors are logged with `console.warn()` but there's no systematic way to:

1. Categorize different types of defuddle API errors
2. Log detailed error information to stderr vs stdout appropriately
3. Provide structured error reporting for debugging and monitoring
4. Track error patterns across multiple article processing runs

The current error handling in `fetchArticleContent()` (cli.js:358-377) catches various error types (timeout, DNS, connection issues) and HTTP status codes (404, 500, 503) but uses generic warning messages. This makes it difficult to diagnose systematic issues with the defuddle service or specific URL patterns that consistently fail.

## Solution

Implement a structured error logging system that:

1. **Categorizes error types**: Network errors, HTTP errors, timeout errors, content errors
2. **Uses appropriate output streams**: stderr for genuine errors, stdout for informational messages
3. **Provides detailed context**: Include URL, error type, timestamp, retry attempts
4. **Supports different verbosity levels**: Basic vs detailed error reporting
5. **Tracks error patterns**: Count error types for final summary reporting

This could involve:
- Creating an error classification function
- Adding a structured logger with different levels
- Enhancing the final processing summary with error breakdowns
- Adding optional verbose mode for detailed error diagnostics