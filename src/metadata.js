const yaml = require('js-yaml');

/**
 * Parses YAML frontmatter from defuddle API response
 * @param {string} apiResponse - Raw API response content
 * @returns {Object} - {frontmatter: Object|null, content: string}
 */
function parseDefuddleFrontmatter(apiResponse) {
  if (!apiResponse || typeof apiResponse !== 'string') {
    return {
      frontmatter: null,
      content: apiResponse || ''
    };
  }

  // Check if response starts with YAML frontmatter delimiter
  if (!apiResponse.startsWith('---\n')) {
    return {
      frontmatter: null,
      content: apiResponse
    };
  }

  // Find the closing delimiter (skip first 4 chars to avoid matching opening delimiter)
  const frontmatterEnd = apiResponse.indexOf('\n---\n', 4);
  
  if (frontmatterEnd === -1) {
    // No closing delimiter found
    return {
      frontmatter: null,
      content: apiResponse
    };
  }

  // Extract frontmatter block (between delimiters, excluding the --- lines)
  const frontmatterBlock = apiResponse.substring(4, frontmatterEnd);
  
  // Parse YAML with error handling for malformed YAML
  let frontmatter;
  try {
    frontmatter = yaml.load(frontmatterBlock);
  } catch (error) {
    // Malformed YAML - return null frontmatter and full response as content
    return {
      frontmatter: null,
      content: apiResponse
    };
  }

  // Extract content after frontmatter and trim
  const content = apiResponse.substring(frontmatterEnd + 5).trim();

  return {
    frontmatter,
    content
  };
}

/**
 * Creates metadata object from article data
 * @param {Object} params - Parameters object
 * @param {string} params.title - Article title
 * @param {string} params.url - Article URL
 * @param {string|number} params.timestamp - Article timestamp (ISO string or epoch ms)
 * @returns {Object} - Metadata object with title, url, and date
 */
function createMetadata({ title, url, timestamp } = {}) {
  let date = timestamp;
  
  // Convert numeric timestamp to ISO string
  if (typeof timestamp === 'number') {
    date = new Date(timestamp).toISOString();
  }
  
  return {
    title,
    url,
    date
  };
}

/**
 * Formats metadata and content into complete markdown with YAML frontmatter
 * @param {Object} metadata - Metadata object with title, url, date
 * @param {string} content - Article content
 * @returns {string} - Complete markdown with YAML frontmatter
 */
function formatFrontmatter(metadata, content) {
  // Helper function to safely quote YAML values if they contain special characters
  function quoteIfNeeded(value) {
    if (typeof value !== 'string') {
      return value;
    }
    
    // Don't quote ISO 8601 date strings (they're valid YAML as-is)
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/.test(value)) {
      return value;
    }
    
    // Check for YAML special characters that require quoting
    const needsQuoting = /[":{}[\],&*#?|\-<>=!%@`]/.test(value);
    
    if (needsQuoting) {
      // Escape existing quotes and wrap in quotes
      return `"${value.replace(/"/g, '\\"')}"`;
    }
    
    return value;
  }
  
  const yamlLines = [
    '---',
    `title: ${quoteIfNeeded(metadata.title)}`,
    `url: ${quoteIfNeeded(metadata.url)}`,
    `date: ${quoteIfNeeded(metadata.date)}`,
    '---'
  ];
  
  return yamlLines.join('\n') + '\n' + content;
}

module.exports = {
  createMetadata,
  formatFrontmatter,
  parseDefuddleFrontmatter
};