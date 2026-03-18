# Phase 1: CLI and CSV Foundation - Context

**Gathered:** Wed Mar 18 2026
**Status:** Ready for planning

<domain>
## Phase Boundary

User can run the CLI to process a Pocket export CSV file and extract article URLs. This phase establishes command-line interface foundation and CSV parsing capability. Users should be able to run the tool, specify input/output paths, see progress, and have the tool successfully parse Pocket CSV exports to extract article data.

</domain>

<decisions>
## Implementation Decisions

### CLI Invocation Style
- Global install approach via package.json `"bin": { "pocket2md": "./cli.js" }`
- Command name: `pocket2md`
- Short + long flags: `-i`/`--input`, `-o`/`--output` with full flag aliases
- Standard `--help`/`--version` support following Unix conventions
- Show help and exit when run without arguments
- Direct `node cli.js` documented as development fallback

### Progress Reporting Format
- Minimal progress by default: "Processing article 5/47..."
- Errors only approach: only show output when something goes wrong
- Full summary at end: "Processed 47 articles: 43 successful, 4 failed. Output saved to ./articles/"
- Brief inline errors + full error details at end: "Processing article 5/47... ERROR (details at end)"

### CSV Parsing Approach
- Extract all relevant fields: URL, title, tags, time_added for richer markdown output
- Skip malformed rows and log which line number had issues
- Count missing URLs as errors in final summary
- UTF-8 strict encoding requirement
- Header check only: verify expected columns exist, then process row by row
- Flexible by header: use header row to find columns by name regardless of order
- Empty CSV handling: show warning but continue processing (create empty output)

### Error Handling Strategy
- Simple exit codes: 0 for success, 1 for any failure
- Early validation: check file access upfront, fail fast with clear messages
- Graceful degradation: log errors, skip current items, continue processing to maximize completion
- User-friendly error messages: clear, non-technical language accessible to all users

### OpenCode's Discretion
- Exact CSV parsing library choice (PapaParse suggested in requirements)
- Specific error message wording and formatting
- Progress update timing and refresh rate
- Log file format and location for detailed error tracking

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- package.json: Already configured as CLI tool with main: cli.js
- data/part_000000.csv: Sample Pocket export file showing expected CSV format

### Established Patterns
- Fresh Node.js project with standard CLI structure expected
- No existing patterns to maintain - clean slate implementation

### Integration Points
- CLI will be main entry point (cli.js)
- Phase 2 will consume the extracted article data from Phase 1's CSV parsing
- Output will feed into defuddle.md API integration in subsequent phases

</code_context>

<specifics>
## Specific Ideas

- Command resembles standard Unix tools with simple flags and clear output
- CSV parsing should handle real Pocket export format (title,url,time_added,tags,status)
- Progress reporting should be clean and not overwhelming during processing
- Tool should feel reliable and predictable for users processing their personal archives

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope

</deferred>

---

*Phase: 01-cli-and-csv-foundation*
*Context gathered: Wed Mar 18 2026*