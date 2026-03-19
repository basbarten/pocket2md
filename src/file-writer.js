const fs = require('fs');
const path = require('path');
const { sanitizeFilename, resolveConflicts } = require('./filename-utils');

/**
 * Writes an article to a markdown file with directory creation and conflict resolution
 * @param {Object} params - Parameters object
 * @param {string} params.title - Article title
 * @param {string} params.content - Article markdown content
 * @param {string} params.outputDir - Output directory path
 * @returns {Object} - Result object {success: boolean, filepath: string|null, error: string|null}
 */
function writeArticleFile({ title, content, outputDir } = {}) {
  // Validate required parameters
  if (!title && title !== '' || !content || !outputDir) {
    return {
      success: false,
      filepath: null,
      error: 'Missing required parameters: title, content, and outputDir are required'
    };
  }

  try {
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Sanitize filename and add .md extension
    const sanitizedName = sanitizeFilename(title);
    const filename = `${sanitizedName}.md`;
    
    // Resolve conflicts to get unique filename
    const uniqueFilename = resolveConflicts(outputDir, filename);
    const filepath = path.join(outputDir, uniqueFilename);

    // Write the file
    fs.writeFileSync(filepath, content, 'utf8');

    return {
      success: true,
      filepath,
      error: null
    };

  } catch (error) {
    // Handle various file system errors gracefully
    let errorMessage = 'Unknown file system error';
    
    if (error.code === 'EACCES' || error.code === 'EPERM') {
      errorMessage = `File permission denied: ${error.message}`;
    } else if (error.code === 'ENOSPC') {
      errorMessage = `Insufficient disk space: ${error.message}`;
    } else if (error.code === 'ENOENT') {
      errorMessage = `Directory path not found: ${error.message}`;
    } else if (error.code === 'EMFILE' || error.code === 'ENFILE') {
      errorMessage = `Too many open files: ${error.message}`;
    } else {
      errorMessage = `File system error: ${error.message}`;
    }

    return {
      success: false,
      filepath: null,
      error: errorMessage
    };
  }
}

module.exports = {
  writeArticleFile
};