# Pocket2md

**Convert Pocket exports to clean markdown files**

[![Validation Status](https://img.shields.io/badge/v1.0-VALIDATED-green)](./tests/manual-validation/validation-report.md)
[![Requirements](https://img.shields.io/badge/requirements-17%2F17%20PASSED-brightgreen)](./.planning/REQUIREMENTS.md)
[![Tests](https://img.shields.io/badge/tests-20%2F20%20PASSED-brightgreen)](./tests/integration-validation.test.js)

Pocket2md processes your Pocket export CSV file and converts saved articles into clean, readable markdown files. It fetches each article, cleans the HTML using the defuddle.md API, and saves the result as properly formatted markdown with metadata.

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
- **Internet Required:** Needs connection for article fetching
- **API Dependency:** Requires defuddle.md service availability
- **Rate Limited:** 5-second delays between articles (by design)
- **Sequential Processing:** Not parallel (respects API limits)

## Error Handling

Pocket2md is designed to handle errors gracefully:
- Invalid URL - Skips article, shows warning, continues with next
- Network Issues - Skips article, shows warning, continues with next
- API Errors - Handles service failures without crashing  
- CSV Problems - Clear error messages for malformed data  

## Development

### Project Structure
```
pocket2md/
├── cli.js                 # Main CLI interface
├── src/                   # Core application code
├── tests/                 # Automated and manual tests
│   ├── integration-validation.test.js
│   ├── fixtures/          # Test data files
│   └── manual-validation/ # Manual testing documentation
├── data/                  # Sample Pocket export data
└── MANUAL_TEST_PLAN.md   # Comprehensive testing guide
```

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

## System Requirements

- **Node.js** 14+ (tested with current LTS)
- **Internet connection** for article fetching
- **Disk space** for markdown output files
- **Memory** 100MB+ recommended for large exports

## License

[Add your license here]
s