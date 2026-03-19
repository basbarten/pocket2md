const sanitizeFilename = require('sanitize-filename');
const fs = require('fs');
const path = require('path');

/**
 * Converts article titles to safe, cross-platform filenames
 * @param {string} title - The article title to sanitize
 * @returns {string} - Safe filename (without extension)
 */
function sanitizeTitle(title) {
  // Handle null, undefined, empty, or whitespace-only titles
  if (!title || typeof title !== 'string' || !title.trim()) {
    return 'untitled-article';
  }

  // First pass: use sanitize-filename for cross-platform safety
  let filename = sanitizeFilename(title, {
    replacement: '-'  // Replace invalid chars with hyphens
  });

  // Replace multiple spaces/hyphens with single hyphens
  filename = filename.replace(/[\s\-]+/g, '-');

  // Remove leading/trailing hyphens
  filename = filename.replace(/^-+|-+$/g, '');

  // Ensure we still have content after sanitization
  if (!filename) {
    return 'untitled-article';
  }

  // Limit length to 200 characters for cross-platform compatibility
  if (filename.length > 200) {
    filename = filename.substring(0, 200);
    // Remove trailing hyphen if we cut in the middle
    filename = filename.replace(/-+$/, '');
  }

  return filename;
}

/**
 * Resolves filename conflicts by appending incremental numbers
 * @param {string} outputDir - Directory to check for conflicts
 * @param {string} filename - Desired filename (with extension)
 * @returns {string} - Unique filename in the directory
 */
function resolveConflicts(outputDir, filename) {
  const fullPath = path.join(outputDir, filename);
  
  // No conflict if file doesn't exist
  if (!fs.existsSync(fullPath)) {
    return filename;
  }

  // Parse filename and extension
  const ext = path.extname(filename);
  const name = path.basename(filename, ext);
  
  let counter = 1;
  let newFilename;
  
  do {
    newFilename = `${name}-${counter}${ext}`;
    counter++;
  } while (fs.existsSync(path.join(outputDir, newFilename)));
  
  return newFilename;
}

module.exports = {
  sanitizeFilename: sanitizeTitle,
  resolveConflicts
};