---
created: 2026-03-19T15:34:02.961Z
title: Keep rich metadata from defuddle.md and extend with CSV metadata
area: api
files:
  - cli.js:406-424
  - src/metadata.js
---

## Problem

The current implementation discards valuable metadata that defuddle.md provides in YAML frontmatter and replaces it with basic metadata from the Pocket CSV. Testing shows defuddle.md returns rich frontmatter including:

- `title`: Actual title extracted from webpage (vs Pocket export title)
- `source`: Original URL (potentially different after redirects)
- `language`: Detected language ("en", etc.)
- `word_count`: Article word count
- Other metadata defuddle.md provides

The `processApiResponse` function in cli.js:406-424 strips out this frontmatter, and `src/metadata.js` recreates basic metadata from CSV data only (title from Pocket, original URL, time_added). This loses valuable extracted metadata and duplicates work.

## Solution

Modify the metadata pipeline to:

1. **Parse and preserve** defuddle.md YAML frontmatter instead of discarding it
2. **Extend the metadata** with Pocket CSV fields (time_added, tags, status) not available from defuddle.md
3. **Merge intelligently** - prefer defuddle.md extracted data (title, language, word_count) while adding Pocket context (tags, reading status, archive date)
4. **Handle content type detection** - only attempt frontmatter parsing for markdown responses, not HTML

This provides richer metadata in the final markdown files while preserving the user's Pocket organization context.