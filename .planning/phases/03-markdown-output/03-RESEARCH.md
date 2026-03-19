# Phase 3 Research: Markdown Output

**Research for:** Phase 3: Markdown Output  
**Date:** Wed Mar 18 2026  
**Status:** Complete  

## Research Question

"What do I need to know to PLAN Phase 3: Markdown Output well?"

## Context Analysis

**Phase Goal:** Cleaned markdown content is saved to files with proper metadata

**Dependencies:** Phase 2 (Content Extraction) - receives cleaned markdown content from defuddle.md API

**Requirements to Address:** MD-01, MD-02, MD-03, MD-04

## Key Research Areas

### 1. File System Operations (MD-01)

**Directory Creation:**
- Use Node.js `fs.mkdirSync()` with `recursive: true` option
- Handle permissions errors gracefully
- Default output directory: `./output/`
- User-specified directory via `--output` flag (already established in Phase 1)

**Best Practice:** Check if directory exists before creation to avoid unnecessary operations.

### 2. Filename Sanitization (MD-02)

**Critical Requirements:**
- Convert article titles to valid filenames
- Handle special characters, spaces, Unicode
- Ensure cross-platform compatibility (Windows/Mac/Linux)

**Sanitization Strategy:**
- Remove/replace invalid filename characters: `<>:"/\|?*`
- Replace spaces with hyphens or underscores
- Limit filename length (typically 255 chars max)
- Handle empty titles with fallback naming

**Implementation Options:**
1. **Built-in approach:** Manual regex replacement
2. **Library approach:** `sanitize-filename` npm package (lightweight, battle-tested)

**Recommendation:** Use `sanitize-filename` library for robust cross-platform handling.

### 3. Filename Conflict Resolution (MD-03)

**Conflict Detection:**
- Check if file exists before writing
- Use `fs.existsSync()` for synchronous check

**Resolution Strategy:**
- Append incremental numbers: `title.md`, `title-1.md`, `title-2.md`
- Continue until unique filename found
- Preserve original extension (`.md`)

**Edge Cases:**
- Very long titles + conflict numbers
- Unicode normalization consistency
- Case-sensitive vs case-insensitive filesystems

### 4. Metadata Format (MD-04)

**Required Metadata:**
- Article title
- Original URL  
- Date fetched

**Format Options:**
1. **YAML frontmatter** (standard in static site generators)
2. **Simple header comments**
3. **Structured markdown headers**

**Recommended Format (YAML frontmatter):**
```markdown
---
title: "Article Title Here"
url: "https://example.com/article"
fetched: "2026-03-18T14:30:00.000Z"
---

# Article Title Here

[Article content here...]
```

**Benefits:** Machine-readable, widely supported, clean separation of metadata and content.

### 5. Integration with Phase 2

**Input from Phase 2:**
- Cleaned markdown content from defuddle.md API
- Article title (extracted from content or API response)
- Original URL
- Processing timestamp

**Data Flow:**
```
Phase 2 API Response → Extract title/content → Sanitize filename → Check conflicts → Write file with metadata
```

### 6. Error Handling

**File System Errors:**
- Disk full
- Permission denied
- Invalid paths
- Network drives/mounted filesystems

**Recovery Strategies:**
- Log error and continue with next article
- Provide meaningful error messages
- Don't halt entire process for single file failure

## Technical Implementation

### Dependencies Needed

**New Dependencies:**
- `sanitize-filename`: Robust filename sanitization
- No additional dependencies needed (fs operations are Node.js built-in)

**Existing Dependencies (from Phases 1-2):**
- Node.js built-in `fs` module
- Process arguments handling established

### Code Organization

**Suggested Module Structure:**
```
src/
├── file-writer.js     # Main file writing logic
├── filename-utils.js  # Sanitization and conflict resolution
└── metadata.js        # Metadata formatting
```

**Integration Point:**
- Called from Phase 2's API processing loop
- Receives: {title, content, url, timestamp}
- Returns: {success, filepath, error}

## Testing Considerations

**Critical Test Cases:**
1. **Basic functionality:** Simple title → clean filename
2. **Special characters:** Unicode, symbols, spaces
3. **Conflict resolution:** Multiple articles with same title
4. **Long filenames:** Title truncation behavior
5. **File system errors:** Permission denied, disk full
6. **Empty/missing titles:** Fallback naming
7. **Metadata format:** YAML frontmatter parsing

## Validation Architecture

**Automated Verification:**
1. **Unit tests:** Filename sanitization functions
2. **Integration tests:** End-to-end file writing with metadata
3. **File system tests:** Directory creation, conflict resolution
4. **Cross-platform tests:** Windows/Mac/Linux filename compatibility

**Manual Verification:**
1. **Visual inspection:** Generated markdown files are well-formed
2. **Metadata extraction:** YAML frontmatter parses correctly
3. **Filename readability:** Sanitized names are human-readable

## Risk Assessment

**Low Risk:**
- Directory creation (established pattern)
- Basic file writing operations

**Medium Risk:**
- Filename sanitization edge cases
- Conflict resolution performance with many duplicates
- Cross-platform filename compatibility

**High Risk:**
- Unicode handling in filenames
- File system permission issues
- Memory usage with large content files

## Dependencies on Prior Phases

**Phase 1 (Complete):**
- CLI argument parsing (`--output` directory)
- Error handling patterns established

**Phase 2 (Planned):**
- API response format and content structure
- Error handling for failed articles
- Processing flow and timing

**Assumption:** Phase 2 provides structured data: `{title, content, url, timestamp}`

## Implementation Approach

**Sequential Processing:**
- Process one article at a time (maintains Phase 1-2 pattern)
- Write file immediately after receiving content
- Continue processing on file write errors

**Error Isolation:**
- File write failures don't stop processing
- Clear logging for troubleshooting
- Maintain processing statistics

## Success Metrics

**Functional:**
- All MD-01 through MD-04 requirements met
- Robust filename sanitization across platforms
- Proper conflict resolution
- Well-formed metadata in all files

**Quality:**
- Zero crashes on file system errors
- Predictable filename generation
- Human-readable output structure

---

## RESEARCH COMPLETE

Phase 3 research covers all aspects needed for effective planning:

1. **File operations:** Directory creation and management
2. **Filename handling:** Sanitization and conflict resolution  
3. **Metadata format:** YAML frontmatter structure
4. **Error handling:** Graceful failure and continuation
5. **Integration:** Clean handoff from Phase 2 processing
6. **Testing strategy:** Comprehensive verification approach

**Key Decision:** Use `sanitize-filename` library for robust cross-platform filename handling.

**Planning-ready:** All requirements (MD-01 through MD-04) have clear technical approaches.