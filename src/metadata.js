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
  formatFrontmatter
};