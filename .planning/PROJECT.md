# Pocket to Markdown CLI

## What This Is

A command-line tool that reads a Pocket export file (CSV format) containing article URLs, sends each URL to the defuddle.md API service for content extraction and markdown conversion. The output is stored as flat markdown files in a directory, creating a portable archive that persists even when source articles are removed from the web.

## Core Value

Convert Pocket read-later lists to persistent, portable markdown archives for long-term reading in Markdown tools.

## Requirements

### Validated

None yet — ship to validate

### Active

See detailed v1 requirements in `REQUIREMENTS.md`:
- **CLI Interface**: CLI-01, CLI-02, CLI-03 (command-line processing)
- **CSV Processing**: CSV-01, CSV-02, CSV-03 (Pocket export parsing)
- **Content Extraction**: FETCH-01, FETCH-02, FETCH-03, API-01, API-02, API-03, API-04 (URL validation and API processing)
- **Markdown Output**: MD-01, MD-02, MD-03, MD-04 (file creation and metadata)

**Total**: 17 v1 requirements → See `REQUIREMENTS.md` for full details

### Out of Scope

- Multiple input files or directories — Single file support only
- Configuration files (no custom options, default behavior)
- Batch processing — Sequential processing only
- Folder organization by date or categories — Flat output only
- OAuth/Pocket API integration — CSV export processing only
- Mobile apps or web interface — CLI only

## Context

- Project directory structure: `.planning/` for documentation, `data/` for input files
- Package.json indicates this is a CLI tool with Node.js as the runtime
- Pocket service closed, but CSV exports remain valid

## Constraints

- **Tech stack**: Node.js CLI, CommonJS/ES Modules (package.json specifies `"main": "cli.js"`)
- **API service**: defuddle.md for content extraction (requires internet connection)
- **File handling**: Single Pocket CSV input, flat markdown output directory
- **Processing**: Sequential article processing with 10-second rate limiting

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Sequential processing (one at a time) | Simpler code, lower memory risk, good for typical Pocket exports (<1000 articles) | Implementation straightforward, but slower for large exports |
| Flat structure, filename = sanitized title only | Minimal complexity, easy file discovery, no navigation needed | Simple CLI, but files can have overlapping names after sanitization |
| defuddle.md API service | Eliminates local HTML processing complexity, proven content extraction | Requires internet connection, introduces rate limiting (10s delays) |

---

*Last updated: Mon Mar 16 2026 by Bas Barten*