#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const { writeArticleFile } = require('./src/file-writer');
const { parseDefuddleFrontmatter } = require('./src/metadata');

// Parse command-line arguments using Node.js built-in parseArgs
const { parseArgs } = require('node:util');

let parsedArgs;
try {
  const { values } = parseArgs({
    options: {
      help: {
        type: 'boolean',
        short: 'h'
      },
      version: {
        type: 'boolean', 
        short: 'v'
      },
      input: {
        type: 'string',
        short: 'i'
      },
      output: {
        type: 'string',
        short: 'o'
      }
    },
    allowPositionals: false
  });
  
  // Handle help and version flags
  if (values.help) {
    showHelp();
    process.exit(0);
  }
  
  if (values.version) {
    showVersion();
    process.exit(0);
  }
  
  parsedArgs = values;
} catch (err) {
  console.error(`Error: ${err.message}`);
  console.error('Run with --help to see usage information');
  process.exit(1);
}

// Set default output directory
if (!parsedArgs.output) {
  parsedArgs.output = './output/';
}

// Show help if no arguments provided
if (process.argv.slice(2).length === 0) {
  showHelp();
  process.exit(0);
}

// Validate required input flag
if (!parsedArgs.input) {
  console.error('Error: --input flag is required');
  console.error('Run with --help to see usage information');
  process.exit(1);
}

// Validate input file exists and is readable
if (!fs.existsSync(parsedArgs.input)) {
  console.error(`Error: Input file not found: ${parsedArgs.input}`);
  process.exit(1);
}

try {
  fs.accessSync(parsedArgs.input, fs.constants.R_OK);
} catch (err) {
  console.error(`Error: Cannot read input file: ${parsedArgs.input}`);
  process.exit(1);
}

// Create output directory if it doesn't exist
try {
  fs.mkdirSync(parsedArgs.output, { recursive: true });
} catch (err) {
  console.error(`Error: Cannot create output directory: ${parsedArgs.output}`);
  process.exit(1);
}

// Print startup messages
console.log(`Processing Pocket export: ${parsedArgs.input}`);
console.log(`Output directory: ${parsedArgs.output}`);

// Parse CSV file and process articles
async function processArticles() {
  try {
    console.log('Reading CSV file...');
    
    // Read file with UTF-8 encoding requirement
    let csvContent;
    try {
      csvContent = fs.readFileSync(parsedArgs.input, 'utf8');
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.error(`Error: CSV file not found: ${parsedArgs.input}`);
      } else {
        console.error(`Error: Cannot read CSV file. Ensure file is UTF-8 encoded: ${err.message}`);
      }
      process.exit(1);
    }
  
  // Check for empty CSV files
  if (csvContent.trim() === '') {
    console.error('Warning: CSV file is empty');
    console.log('Processed 0 articles: 0 successful, 0 failed');
    return;
  }
  
  // Parse CSV with error handling
  let parseResult;
  try {
    parseResult = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true
    });
  } catch (parseErr) {
    console.error(`Error: Invalid CSV format: ${parseErr.message}`);
    process.exit(1);
  }
  
  // Handle Papa Parse errors
  if (parseResult.errors.length > 0) {
    const criticalErrors = parseResult.errors.filter(err => err.type === 'Delimiter' || err.type === 'Quotes');
    if (criticalErrors.length > 0) {
      console.error('Error: CSV file has malformed structure:');
      criticalErrors.forEach(err => console.error(`  Line ${err.row || 'unknown'}: ${err.message}`));
      process.exit(1);
    } else {
      // Non-critical errors - log but continue
      console.error('CSV parsing warnings:');
      parseResult.errors.forEach(err => console.error(`  Line ${err.row || 'unknown'}: ${err.message}`));
    }
  }
  
  const articles = parseResult.data;
  console.log(`Found ${articles.length} rows in CSV`);
  
  // Validate required columns exist
  if (articles.length === 0 && csvContent.trim() !== '') {
    console.error('Error: No valid data rows found in CSV file');
    process.exit(1);
  }
  
  if (articles.length > 0) {
    const requiredColumns = ['title', 'url', 'time_added', 'tags'];
    const firstRow = articles[0];
    const availableColumns = Object.keys(firstRow);
    const missingColumns = requiredColumns.filter(col => !(col in firstRow));
    
    if (missingColumns.length > 0) {
      console.error(`Error: CSV missing required columns: ${missingColumns.join(', ')}`);
      console.error(`Available columns: ${availableColumns.join(', ')}`);
      process.exit(1);
    }
  }
  
  // Process each article with progress reporting
  let successfulCount = 0;
  let skippedCount = 0; // Invalid URLs, missing URLs
  let failedCount = 0;  // API/network errors
  const failedArticles = []; // Collect failed articles for error log
  
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    const articleNum = i + 1;
    
    console.log(`Processing article ${articleNum}/${articles.length}...`);
    
    // Skip articles with missing URLs
    if (!article.url || article.url.trim() === '') {
      console.error(`Warning: Skipping article ${articleNum} - missing URL`);
      skippedCount++;
      continue;
    }
    
    // Validate URL format before processing
    if (!validateUrl(article.url)) {
      console.error(`Warning: Skipping article ${articleNum} - invalid URL format: ${article.url.trim()}`);
      skippedCount++;
      continue;
    }
    
    // Extract article data and parse tags
    const tags = article.tags ? article.tags.split(',').map(t => t.trim()).filter(t => t) : [];
    
    // Convert timestamp from CSV string to number (seconds) and convert to milliseconds for JavaScript Date
    // Pocket CSV uses Unix timestamps in seconds, JavaScript Date expects milliseconds
    const timestamp = article.time_added ? parseInt(article.time_added, 10) * 1000 : null;
    
    const articleData = {
      title: article.title || 'Untitled',
      url: article.url.trim(),
      time_added: timestamp,
      tags: tags
    };
    
    // Fetch article content from defuddle.md API
    const apiResponse = await fetchArticleContent(articleData.url, articleData.title);
    
    if (apiResponse.content) {
      // Parse defuddle frontmatter before extracting content
      const { frontmatter, content } = parseDefuddleFrontmatter(apiResponse.content);
      
      // Log warning if YAML parsing failed
      if (frontmatter === null && content !== apiResponse.content) {
        console.error(`Warning: Malformed YAML in response from ${articleData.url}`);
      }
      
      // Write article to markdown file with enhanced metadata
      const fileResult = writeArticleFile({
        title: articleData.title,
        content: content,
        url: articleData.url,
        timestamp: articleData.time_added,
        outputDir: parsedArgs.output || './output',
        tags: articleData.tags,
        defuddleFrontmatter: frontmatter
      });
      
      if (fileResult.success) {
        console.log(`✅ Wrote article: ${path.basename(fileResult.filepath)}`);
        successfulCount++;
      } else {
        console.error(`⚠️  Failed to write article "${articleData.title}": ${fileResult.error}`);
        failedCount++;
        failedArticles.push({
          index: articleNum,
          title: articleData.title,
          url: articleData.url,
          error: `File write error: ${fileResult.error}`,
          timestamp: new Date().toISOString()
        });
      }
    } else {
      // API call failed, count as failed (not skipped - these are network/API errors)
      failedCount++;
      failedArticles.push({
        index: articleNum,
        title: articleData.title,
        url: articleData.url,
        error: apiResponse.error || 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
    
    // Rate limiting: 5 second delay between API calls (but not after last article)
    if (i < articles.length - 1 && apiResponse.content !== null) {
      console.log(`Waiting 5 seconds before next request...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
    // Show final summary
    const totalProcessed = successfulCount + skippedCount + failedCount;
    
    console.log('');
    console.log('=== Processing Complete ===');
    console.log(`Articles processed: ${totalProcessed}`);
    console.log(`  • ${successfulCount} successful (content extracted)`);
    console.log(`  • ${skippedCount} skipped (invalid URLs)`);
    console.log(`  • ${failedCount} failed (network/API errors)`);
    
    // Add expected format for backward compatibility with existing tests
    const totalFailed = skippedCount + failedCount;
    console.log(`Processed ${totalProcessed} articles: ${successfulCount} successful, ${totalFailed} failed`);
    
    // Write error log file if there were failures
    if (failedArticles.length > 0) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
      const errorLogPath = path.join(parsedArgs.output, `errors-${timestamp}.log`);
      
      const logContent = [
        `Pocket2md Error Log - ${new Date().toISOString()}`,
        `Total errors: ${failedArticles.length}`,
        '',
        ...failedArticles.map(article => 
          `[${article.index}] "${article.title}" (${article.url}) - ${article.error}`
        )
      ].join('\n');
      
      fs.writeFileSync(errorLogPath, logContent, 'utf8');
      console.error(`Error log written to: ${errorLogPath}`);
    }
    
    if (successfulCount > 0) {
      console.log(`\n✅ Successfully processed ${successfulCount} articles for Phase 3 markdown generation`);
    } else {
      console.log(`\n⚠️  No articles successfully processed`);
    }
    
  } catch (error) {
    console.error('Error processing CSV file:', error.message);
    process.exit(1);
  }
}

// Run the async processing
processArticles().catch(error => {
  console.error('Unexpected error:', error.message);
  process.exit(1);
});

function showHelp() {
  console.log(`
pocket2md - Convert Pocket export to Markdown files

USAGE:
  pocket2md --input <csv-file> [--output <directory>]

OPTIONS:
  -i, --input <file>      Path to Pocket CSV export file (required)
  -o, --output <dir>      Output directory for markdown files (default: ./output/)
  -h, --help              Show this help message
  -v, --version           Show version number

EXAMPLES:
  pocket2md --input data/pocket_export.csv
  pocket2md --input data/pocket_export.csv --output ./my_articles/
  pocket2md -i data/part_000000.csv -o ./output/

For more information, visit: https://github.com/pocket2md
`);
}

/**
 * Validates a URL format before making API requests
 * @param {string} url - The URL to validate
 * @returns {boolean} - true if URL is valid, false otherwise
 */
function validateUrl(url) {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return false;
  }
  
  const trimmedUrl = url.trim();
  
  try {
    const urlObj = new URL(trimmedUrl);
    // Only accept http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false;
    }
    // Check for valid hostname
    if (!urlObj.hostname || urlObj.hostname === '') {
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Fetches article content from defuddle.md API
 * @param {string} url - The article URL to fetch
 * @param {string} title - The article title for error messages
 * @returns {Promise<{content: string|null, error: string|null}>} - Object with content and error
 */
async function fetchArticleContent(url, title = 'Untitled') {
  try {
    const encodedUrl = encodeURIComponent(url);
    const apiUrl = `https://defuddle.md/${encodedUrl}`;
    
    console.log(`Fetching: ${url}`);
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'pocket2md/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      let errorMessage;
      if (response.status === 404) {
        errorMessage = 'Content not found (404)';
      } else if (response.status === 429) {
        errorMessage = 'Rate limited (429)';
      } else if (response.status === 500) {
        errorMessage = 'Server error (500)';
      } else if (response.status === 503) {
        errorMessage = 'Service unavailable (503)';
      } else if (response.status >= 400 && response.status < 500) {
        errorMessage = `Client error (${response.status})`;
      } else if (response.status >= 500) {
        errorMessage = `Server error (${response.status})`;
      } else {
        errorMessage = `HTTP ${response.status}`;
      }
      
      console.error(`Failed to fetch "${title}" (${url}) - ${errorMessage}`);
      return { content: null, error: errorMessage };
    }
    
    const content = await response.text();
    
    // Validate response content
    if (!content || content.trim() === '') {
      const errorMessage = 'Empty response';
      console.error(`Failed to fetch "${title}" (${url}) - ${errorMessage}`);
      return { content: null, error: errorMessage };
    }
    
    return { content: content, error: null };
  } catch (error) {
    let errorMessage;
    
    if (error.name === 'AbortError') {
      errorMessage = 'Timeout (30s)';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'DNS resolution failed';
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Connection refused';
    } else if (error.code === 'ECONNRESET') {
      errorMessage = 'Connection reset';
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'Connection timeout';
    } else if (error.message && error.message.toLowerCase().includes('certificate')) {
      errorMessage = 'SSL certificate error';
    } else if (error.message && error.message.toLowerCase().includes('redirect')) {
      errorMessage = 'Too many redirects';
    } else if (error.message) {
      errorMessage = error.message;
    } else {
      errorMessage = 'Unknown network error';
    }
    
    console.error(`Failed to fetch "${title}" (${url}) - ${errorMessage}`);
    return { content: null, error: errorMessage };
  }
}

function showVersion() {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  console.log(`pocket2md v${packageJson.version}`);
}