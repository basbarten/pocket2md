# Phase 2: Content Extraction - Context

**Gathered:** Wed Mar 18 2026
**Status:** Ready for planning

<domain>
## Phase Boundary

Each article URL is sent to defuddle.md API service for content extraction and markdown conversion. This phase adds web content fetching capability to the existing CLI foundation. Users should see progress as articles are fetched, with clear error reporting and rate limiting, resulting in extracted content ready for Phase 3 markdown processing.

</domain>

<decisions>
## Implementation Decisions

### API Response Handling
- **Response Format**: HTML that needs conversion (defuddle.md returns HTML content)
- **HTML Conversion**: Store as HTML for now, defer markdown conversion to Phase 3
- **Response Validation**: Any non-empty response considered valid - simple and permissive
- **Malformed Response Handling**: Skip and log error - treat as failed article, continue processing

### URL Processing Flow
- **Integration Point**: New function after the CSV processing loop - cleaner separation of concerns
- **Data Passing**: Array of article objects passed to fetchContent(articles) function
- **Function Return**: Enhanced article objects with fetchStatus, content, error fields added
- **Progress Reporting**: Replace CSV progress with fetching progress - only show "Fetching article X/Y..."

### Connection and Retry Logic
- **API Timeout**: 30 seconds - conservative timeout for complex page content extraction
- **HTTP Error Handling**: Categorize common errors (404: not found, 429: rate limit, 500: server error, timeout)
- **Service Unavailability**: Fail fast and exit - detect after first few failures, don't waste user time
- **Rate Limit Feedback**: Single delay message - "Rate limiting delay..." at start of each 5-second delay

### Content Storage Strategy
- **Temporary Storage**: Mixed approach - keep in memory during processing, write cache file at end
- **Cache File Format**: Array of enhanced articles - [{title, url, content, fetchStatus, ...}]
- **Cache File Location**: Output directory as `articles-cache.json` - visible and accessible to user
- **Cache Write Failure**: Exit with error - ensures data integrity, prevents silent data loss

### Previously Decided (from prior discussion)
- **Rate Limiting**: Fixed 5-second delay between API calls
- **Error Handling**: Detailed error messages with specific error types
- **Progress Reporting**: Progress counter format ("Processing article 5/50: [URL]")
- **Processing Strategy**: One-at-a-time for memory efficiency  
- **HTTP Client**: Built-in fetch() API
- **URL Validation**: Basic format checking (http/https, domain format)
- **Final Summary**: Detailed breakdown by error type

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- cli.js lines 171-194: Existing article processing loop with progress reporting
- articleData object structure: {title, url, time_added, tags} ready for enhancement
- Progress reporting pattern: console.log(`Processing article ${articleNum}/${articles.length}...`)
- Error handling pattern: graceful error handling with summary counting established

### Established Patterns
- Early validation and fail-fast approach (lines 71-89)
- UTF-8 file handling with clear error messages (lines 99-110)
- Structured error counting: successfulCount, skippedCount pattern
- Clean separation of concerns: argument parsing, validation, processing phases

### Integration Points
- **Insertion Point**: After line 165, before the processing loop
- **Data Flow**: Extract articles array → validate URLs → fetchContent(articles) → write cache
- **Progress Integration**: Replace existing progress with API fetch progress
- **Error Summary**: Extend existing summary pattern to include API errors

</code_context>

<specifics>
## Specific Ideas

- fetchContent() function takes articles array, returns enhanced articles with content and status
- API calls use built-in fetch() with 30s timeout and 5s delays between calls  
- Error categories: "404 Not Found", "Timeout", "Rate Limited", "Server Error", "Network Error"
- Cache file written as articles-cache.json in output directory for Phase 3 consumption
- Service availability detection: fail after 3 consecutive network errors to save time

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope. All suggestions were implementation details within the established Phase 2 boundary of content extraction via defuddle.md API service.

</deferred>

---

*Phase: 02-content-extraction*
*Context gathered: Wed Mar 18 2026*