# Pocket2md

**Convert Pocket exports to clean markdown files**

Pocket2md processes your Pocket export CSV file and converts saved articles into clean, readable markdown files. It fetches each article, cleans the HTML using the defuddle.md API, and saves the result as properly formatted markdown with metadata.

> [!IMPORTANT]
> This codebase was generated using AI assistance (spec-driven development using GSD with OpenCode). While the code has been tested and validated by humans, please review it carefully before use.

## Quick Start

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/pocket2md.git
   cd pocket2md
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

### Usage

**Convert your Pocket export:**
```bash
node cli.js --input your-pocket-export.csv --output markdown-files
```

**Use default output directory:**
```bash
node cli.js --input your-pocket-export.csv
```
*Creates files in `./output/` directory*

## Known Limitations
- Internet Required: Needs connection for article fetching
- API Dependency: Requires defuddle.md service availability
- Rate Limited: 5-second delays between articles (by design)
- Sequential Processing: Not parallel (respects API limits)

> [!NOTE]
> Please note that Defuddle has a [limit of 1.000 free requests per month](https://defuddle.md/pricing).

## System Requirements

- Node.js 14+ (tested with current LTS)

## Development

### Project Structure
```
pocket2md/
├── cli.js                 # Main CLI interface
├── src/                   # Core application code
│   ├── file-writer.js     # Markdown file writing
│   ├── filename-utils.js  # Filename sanitization
│   └── metadata.js        # Article metadata handling
├── tests/                 # Automated tests
│   ├── *.test.js          # Unit and integration tests
│   └── fixtures/          # Test data files
├── LICENSE                # MIT license
└── README.md              # This file
```

**Note:** The `data/` directory is excluded from git (add your Pocket export CSV files there).

### Running Tests
```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run specific test patterns
npm test -- --testPathPatterns=integration

# Run with verbose output
npm test -- --verbose
```

## License

MIT
