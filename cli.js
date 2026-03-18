#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

// Parse command-line arguments
const args = process.argv.slice(2);
const parsedArgs = {};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  if (arg === '--help' || arg === '-h') {
    showHelp();
    process.exit(0);
  } else if (arg === '--version' || arg === '-v') {
    showVersion();
    process.exit(0);
  } else if (arg === '--input' || arg === '-i') {
    if (i + 1 >= args.length) {
      console.error('Error: --input flag requires a file path');
      process.exit(1);
    }
    parsedArgs.input = args[i + 1];
    i++; // Skip next argument as it's the value
  } else if (arg === '--output' || arg === '-o') {
    if (i + 1 >= args.length) {
      console.error('Error: --output flag requires a directory path');
      process.exit(1);
    }
    parsedArgs.output = args[i + 1];
    i++; // Skip next argument as it's the value
  } else {
    console.error(`Error: Unknown argument: ${arg}`);
    console.error('Run with --help to see usage information');
    process.exit(1);
  }
}

// Set default output directory
if (!parsedArgs.output) {
  parsedArgs.output = './output/';
}

// Show help if no arguments provided
if (args.length === 0) {
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

// Parse CSV file
try {
  console.log('Reading CSV file...');
  const csvContent = fs.readFileSync(parsedArgs.input, 'utf8');
  
  const parseResult = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true
  });
  
  if (parseResult.errors.length > 0) {
    console.error('CSV parsing errors:', parseResult.errors);
  }
  
  const articles = parseResult.data;
  console.log(`Found ${articles.length} rows in CSV`);
  
  // Validate required columns exist
  if (articles.length > 0) {
    const requiredColumns = ['title', 'url', 'time_added', 'tags'];
    const firstRow = articles[0];
    const missingColumns = requiredColumns.filter(col => !(col in firstRow));
    
    if (missingColumns.length > 0) {
      console.error(`Error: CSV missing required columns: ${missingColumns.join(', ')}`);
      process.exit(1);
    }
  }
  
  // Process each article with progress reporting
  let successfulCount = 0;
  let skippedCount = 0;
  
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    const articleNum = i + 1;
    
    console.log(`Processing article ${articleNum}/${articles.length}...`);
    
    // Skip articles with missing URLs
    if (!article.url || article.url.trim() === '') {
      console.warn(`Warning: Skipping article ${articleNum} - missing URL`);
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
    
    // For now, just count as successful (content extraction comes in later phases)
    successfulCount++;
  }
  
  // Show final summary
  const totalProcessed = successfulCount + skippedCount;
  console.log(`Processed ${totalProcessed} articles: ${successfulCount} successful, ${skippedCount} failed`);
  
} catch (error) {
  console.error('Error processing CSV file:', error.message);
  process.exit(1);
}

function showHelp() {
  console.log(`
pocket2md - Convert Pocket export to Markdown files

USAGE:
  pocket2md --input <csv-file> [--output <directory>]

OPTIONS:
  -i, --input <file>      Path to Pocket CSV export file (required)
  -o, --output <dir>      Output directory for markdown files (default: ./output/)
  -h, --help             Show this help message
  -v, --version          Show version number

EXAMPLES:
  pocket2md --input data/pocket_export.csv
  pocket2md --input data/pocket_export.csv --output ./my_articles/
  pocket2md -i data/part_000000.csv -o ./output/

For more information, visit: https://github.com/pocket-to-markdown
`);
}

function showVersion() {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  console.log(`pocket2md v${packageJson.version}`);
}