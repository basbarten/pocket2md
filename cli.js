#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

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