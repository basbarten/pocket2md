#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

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
    console.warn('Warning: CSV file is empty');
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
      console.warn('CSV parsing warnings:');
      parseResult.errors.forEach(err => console.warn(`  Line ${err.row || 'unknown'}: ${err.message}`));
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
  const startTime = Date.now();
  
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    const articleNum = i + 1;
    
    console.log(`Processing article ${articleNum}/${articles.length}: ${article.url ? article.url.trim() : 'No URL'}`);
    
    // Skip articles with missing URLs
    if (!article.url || article.url.trim() === '') {
      console.warn(`Warning: Skipping article ${articleNum} - missing URL`);
      skippedCount++;
      continue;
    }
    
    // Validate URL format before processing
    if (!validateUrl(article.url)) {
      console.warn(`Warning: Skipping article ${articleNum} - invalid URL format: ${article.url.trim()}`);
      skippedCount++;
      continue;
    }
    
    // Extract article data
    const articleData = {
      title: article.title || 'Untitled',
      url: article.url.trim(),
      time_added: article.time_added || '',
      tags: article.tags || ''
    };
    
    // Fetch article content from defuddle.md API
    const apiResponse = await fetchArticleContent(articleData.url);
    
    if (apiResponse) {
      // Process API response and extract markdown content
      const extractedContent = processApiResponse(apiResponse);
      
      // Store the processed article data with content for later use
      const processedArticle = {
        ...articleData,
        content: extractedContent,
        contentLength: extractedContent.length
      };
      
      console.log(`Success: ${extractedContent.length} characters extracted`);
      successfulCount++;
    } else {
      // API call failed, count as failed (not skipped - these are network/API errors)
      failedCount++;
    }
    
    // Rate limiting: 10 second delay between API calls (but not after last article)
    if (i < articles.length - 1 && apiResponse !== null) {
      const remaining = articles.length - i - 1;
      const estimatedMinutes = Math.ceil((remaining * 10) / 60);
      console.log(`Waiting 10 seconds before next request... (${remaining} articles remaining, ~${estimatedMinutes} minutes)`);
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
  
    // Show final summary with timing information
    const endTime = Date.now();
    const totalTimeMs = endTime - startTime;
    const totalTimeMinutes = Math.round(totalTimeMs / 1000 / 60 * 10) / 10; // Round to 1 decimal
    const totalProcessed = successfulCount + skippedCount + failedCount;
    const avgTimePerArticle = totalProcessed > 0 ? Math.round((totalTimeMs / 1000) / totalProcessed) : 0;
    
    console.log('');
    console.log('=== Processing Complete ===');
    console.log(`Total time: ${totalTimeMinutes} minutes`);
    console.log(`Articles processed: ${totalProcessed}`);
    console.log(`  • ${successfulCount} successful (content extracted)`);
    console.log(`  • ${skippedCount} skipped (invalid URLs)`);
    console.log(`  • ${failedCount} failed (network/API errors)`);
    console.log(`Average time per article: ${avgTimePerArticle} seconds`);
    
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
 * @returns {Promise<string|null>} - Markdown content or null on error
 */
async function fetchArticleContent(url) {
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
      let errorMessage = `${response.status} ${response.statusText}`;
      if (response.status === 404) {
        errorMessage = 'Content not found';
      } else if (response.status === 500) {
        errorMessage = 'Server error';
      } else if (response.status === 503) {
        errorMessage = 'Service unavailable';
      } else if (response.status >= 400 && response.status < 500) {
        errorMessage = 'Client error';
      } else if (response.status >= 500) {
        errorMessage = 'Server error';
      }
      
      console.warn(`Warning: Failed to fetch ${url} - ${errorMessage}`);
      return null;
    }
    
    const content = await response.text();
    
    // Validate response content
    if (!content || content.trim() === '') {
      console.warn(`Warning: Failed to fetch ${url} - Empty response`);
      return null;
    }
    
    return content;
  } catch (error) {
    let errorMessage = 'Unknown error';
    
    if (error.name === 'AbortError') {
      errorMessage = 'Request timeout (30s)';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'DNS resolution failed';
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Connection refused';
    } else if (error.code === 'ECONNRESET') {
      errorMessage = 'Connection reset';
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'Connection timeout';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    console.warn(`Warning: Failed to fetch ${url} - ${errorMessage}`);
    return null;
  }
}

/**
 * Process API response and extract markdown content
 * @param {string} apiResponse - Raw API response content
 * @returns {string} - Extracted markdown content
 */
function processApiResponse(apiResponse) {
  if (!apiResponse || typeof apiResponse !== 'string') {
    return '';
  }
  
  // Check if response has YAML frontmatter (starts with ---)
  if (apiResponse.startsWith('---\n')) {
    // Find the end of frontmatter
    const frontmatterEnd = apiResponse.indexOf('\n---\n', 4);
    if (frontmatterEnd !== -1) {
      // Extract content after frontmatter
      const content = apiResponse.substring(frontmatterEnd + 5).trim();
      return content;
    }
  }
  
  // If no frontmatter found, return the full response
  return apiResponse.trim();
}

function showVersion() {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  console.log(`pocket2md v${packageJson.version}`);
}