# Feature Specification: Pocket Archive to Markdown Converter

**Feature Branch**: `001-pocket-to-markdown`
**Created**: 2026-03-05
**Status**: Draft
**Input**: User description: "Build a command line tool that converts a Pocket archive (a now closed down read-it-later service) to markdown articles with YAML frontmatter. Read the Pocket archive (a csv file with on each line metadata about an article). For each article: parse the URL using the node package Defuddle, convert the HTML to Markdown using the node package Turndown, store the metadata in the YAML frontmatter of the markdown file and save the markdown file."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Parse Archive and Create Markdown Files (Priority: P1)

A user has a downloaded Pocket export CSV file containing saved article metadata. They want to convert these articles into readable markdown files with their metadata preserved in YAML frontmatter for use in Obsidian or similar note-taking applications.

**Why this priority**: This is the core functionality that delivers immediate value - converting existing Pocket saved articles into a usable format for knowledge management.

**Independent Test**: Can be fully tested by providing a sample CSV file containing known article metadata and URLs, running the CLI tool, and verifying that markdown files are created with correct content and YAML frontmatter containing the original metadata fields.

**Acceptance Scenarios**:

1. **Given** a Pocket CSV export file with article metadata including URL, title, time added, tags and status, **when** the user runs the CLI tool specifying the CSV file and output directory, **then** a markdown file is created for each article with the HTML content converted to markdown.

2. **Given** a Pocket CSV export file, **when** the user runs the CLI tool, **then** each article's metadata including URL, title, time added, tags and status, is stored in YAML frontmatter at the top of its corresponding markdown file.

3. **Given** successfully converted articles, **when** the user opens the markdown files in an editor, **then** the frontmatter contains all original metadata fields (URL, title, author, timestamp, etc.) and the body text contains properly formatted content.

---

### User Story 2 - Handle Conversion Errors Gracefully (Priority: P2)

When the conversion process encounters issues such as inaccessible URLs, network errors, or invalid HTML content, the user should receive clear feedback about which articles failed and why, without losing progress on successfully converted articles.

**Why this priority**: Error handling is essential for a reliable tool that processes multiple articles, as users may have various network conditions and may not have connectivity to all archived URLs.

**Independent Test**: Can be tested by simulating network failures, using invalid URLs, or providing URLs that return non-HTML content, then verifying that the tool produces an error report and successfully converts all articles that can be accessed.

**Acceptance Scenarios**:

1. **Given** a URL that is invalid or returns a network error, **when** the tool attempts to fetch and convert that article, **then** the article is marked as failed in the output log and the tool continues processing remaining articles.

2. **Given** non-HTML content, **when** the tool attempts conversion, **then** the article is marked as failed in the output log and the tool continues processing remaining articles.

3. **Given** a partially successful conversion process, **when** the tool reports results, **then** the user sees a summary showing number of total articles, number of successfully converted articles, and number of failed articles.

---

### Edge Cases

- What happens when the CSV file is malformed or missing required fields?
- How does the system handle articles with missing or empty HTML content?
- What occurs when multiple articles have the same title or filename?
- How are special characters in filenames handled?
- What happens when the user specifies an output directory that cannot be written to?
- How does the tool behave when the network is temporarily unavailable during batch processing?
- What happens if two articles reference the same URL but have different metadata?

## Clarifications

### Session 2026-03-05

- Q: What approach should the CLI tool use for batch processing? → A: Process articles sequentially with progress logging and interruption support

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST accept a CSV file containing Pocket article metadata as input
- **FR-002**: The system MUST extract article metadata including title, URL, time_added, tags, and status from the CSV
- **FR-003**: The system MUST fetch the HTML content referenced by each article's URL
- **FR-004**: The system MUST parse the URL to extract article information using Defuddle library
- **FR-005**: The system MUST convert HTML content to markdown using Turndown library
- **FR-006**: The system MUST store the original metadata in YAML frontmatter in each markdown file
- **FR-007**: The system MUST create a markdown file for each successfully converted article
- **FR-008**: The system MUST save the markdown files in the specified output directory
- **FR-009**: The system MUST handle malformed CSV files with clear error messages
- **FR-010**: The system MUST log success and failure status for each article during conversion
- **FR-011**: The system MUST provide a summary report of conversion results including counts and errors
- **FR-012**: The system MUST support command-line interface with arguments for input file and output directory
- **FR-013**: The system MUST process articles one at a time with visual progress indicator showing current article number and total count

### Key Entities

- **Pocket Article**: Represents a saved article from the Pocket archive containing metadata fields (URL, title, time_added, tags, status)
- **Converted Article**: Represents the final output containing markdown body with YAML frontmatter at the top

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can convert a Pocket CSV export containing 50+ articles to markdown in under 15 minutes on a standard internet connection
- **SC-002**: The system successfully converts at least 95% of articles when processing a real Pocket export with normal network conditions
- **SC-003**: The YAML frontmatter in converted files contains all metadata fields present in the original CSV for 100% of successfully processed articles
- **SC-004**: Users can open and read markdown files in any standard markdown editor without formatting errors
- **SC-005**: Error messages clearly indicate which articles failed and why, allowing users to troubleshoot network or URL issues
- **SC-006**: The CLI provides clear help output describing all available arguments and options

### Assumptions

- The input CSV file uses standard Pocket export format with columns for URL, title, and other metadata
- The URL values in the CSV are accessible via standard HTTP requests
- The tool has network access to fetch HTML content from the URLs
- Article titles can be reasonably used as filenames (with sanitization for special characters)