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
 * @param {Array<string>} [params.tags] - Optional array of tags
 * @returns {Object} - Metadata object with title, url, date, timestamp, and tags
 */
function createMetadata({ title, url, timestamp, tags = [] } = {}) {
  let date = timestamp;
  
  // Convert numeric timestamp to ISO string
  if (typeof timestamp === 'number') {
    date = new Date(timestamp).toISOString();
  }
  
  return {
    title,
    url,
    date,
    timestamp,
    tags
  };
}

/**
 * Formats metadata and content into complete markdown with YAML frontmatter
 * @param {Object} metadata - Metadata object with title, url, date, timestamp, tags, etc.
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
    const needsQuoting = /[":{}[\],&*#?|\-<>=!%@` ]/.test(value);
    
    if (needsQuoting) {
      // Escape existing quotes and wrap in quotes
      return `"${value.replace(/"/g, '\\"')}"`;
    }
    
    return value;
  }
  
  // Format tags array for YAML
  function formatTags(tags) {
    if (!tags || tags.length === 0) {
      return '[]';
    }
    const quotedTags = tags.map(tag => quoteIfNeeded(tag));
    return `[${quotedTags.join(', ')}]`;
  }
  
  const yamlLines = [
    '---',
    `title: ${quoteIfNeeded(metadata.title)}`,
    `url: ${quoteIfNeeded(metadata.url)}`,
    `date: ${quoteIfNeeded(metadata.date)}`
  ];
  
  // Add timestamp if present
  if (metadata.timestamp !== undefined) {
    yamlLines.push(`timestamp: ${metadata.timestamp}`);
  }
  
  // Add tags if present
  if (metadata.tags !== undefined) {
    yamlLines.push(`tags: ${formatTags(metadata.tags)}`);
  }
  
  // Add any defuddle-specific fields
  if (metadata.author) {
    yamlLines.push(`author: ${quoteIfNeeded(metadata.author)}`);
  }
  if (metadata.published_date) {
    yamlLines.push(`published_date: ${quoteIfNeeded(metadata.published_date)}`);
  }
  if (metadata.site_name) {
    yamlLines.push(`site_name: ${quoteIfNeeded(metadata.site_name)}`);
  }
  
  yamlLines.push('---');
  
  return yamlLines.join('\n') + '\n' + content;
}

/**
 * Merges defuddle frontmatter with Pocket metadata
 * @param {Object|null} defuddleFrontmatter - Parsed defuddle frontmatter
 * @param {Object} pocketMetadata - Pocket metadata object
 * @returns {Object} - Merged metadata object
 */
function mergeDefuddleMetadata(defuddleFrontmatter, pocketMetadata) {
  // If no defuddle frontmatter, return pocket metadata as-is
  if (!defuddleFrontmatter) {
    return pocketMetadata;
  }
  
  // Merge: defuddle fields take precedence for title, add author/published_date/site_name
  return {
    ...pocketMetadata,
    ...defuddleFrontmatter
  };
}

module.exports = {
  createMetadata,
  formatFrontmatter,
  parseDefuddleFrontmatter,
  mergeDefuddleMetadata
};