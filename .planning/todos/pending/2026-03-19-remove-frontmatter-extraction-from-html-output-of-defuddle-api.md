---
created: 2026-03-19T07:34:09.106Z
title: Remove frontmatter extraction from HTML output of defuddle API
area: api
files:
  - cli.js:385-403
---

## Problem

The `processApiResponse` function in cli.js:385-403 currently attempts to extract YAML frontmatter from all API responses from the defuddle.md API. However, HTML responses do not have frontmatter, so this extraction logic is unnecessary and potentially problematic when the API returns HTML content instead of markdown with frontmatter.

The current logic:
1. Checks if response starts with `---\n` (YAML frontmatter delimiter)
2. If found, extracts content after the frontmatter block
3. If no frontmatter found, returns the full response

This works for markdown responses with frontmatter, but HTML responses should skip the frontmatter extraction entirely.

## Solution

Modify the `processApiResponse` function to detect the content type of the API response and only attempt frontmatter extraction for markdown content, not HTML content. This could be done by:

1. Adding content type detection (checking for HTML tags vs markdown patterns)
2. Only applying frontmatter extraction logic for non-HTML content
3. For HTML content, return the response as-is without frontmatter processing