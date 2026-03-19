# Pocket2md

**Convert Pocket exports to clean markdown files**

[![Validation Status](https://img.shields.io/badge/v1.0-VALIDATED-green)](./tests/manual-validation/validation-report.md)
[![Requirements](https://img.shields.io/badge/requirements-17%2F17%20PASSED-brightgreen)](./.planning/REQUIREMENTS.md)
[![Tests](https://img.shields.io/badge/tests-20%2F20%20PASSED-brightgreen)](./tests/integration-validation.test.js)

Pocket2md processes your Pocket export CSV file and converts saved articles into clean, readable markdown files. It fetches each article, cleans the HTML using the defuddle.md API, and saves the result as properly formatted markdown with metadata.

## Features

✅ **Simple CLI Interface** - Easy to use command-line tool  
✅ **Batch Processing** - Handles entire Pocket exports automatically  
✅ **Clean Output** - Converts HTML to readable markdown  
✅ **Error Resilient** - Continues processing even when some articles fail  
✅ **Rate Limited** - Respects API limits with intelligent delays  
✅ **Smart Naming** - Sanitizes filenames and handles duplicates  

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

### Basic Usage

**Convert your Pocket export:**
```bash
node cli.js --input your-pocket-export.csv --output markdown-files
```

**Use default output directory:**
```bash
node cli.js --input your-pocket-export.csv
```
*Creates files in `./output/` directory*

### Getting Your Pocket Export

1. Go to [Pocket Export](https://getpocket.com/export)
2. Download your data as CSV
3. Use the downloaded file with pocket2md

## Usage Examples

### Standard Processing
```bash
# Process export with custom output directory
node cli.js --input data/pocket-export.csv --output my-articles

# Use default output location
node cli.js --input data/pocket-export.csv
```

### What Happens During Processing
```
Processing article 1/150: "How to Learn Programming"
✓ Fetched: https://example.com/learn-programming
✓ Cleaned: API processing successful
✓ Saved: How-to-Learn-Programming.md

Processing article 2/150: "Best Coding Practices"
✗ Failed: Network timeout - skipping
```

## Requirements Compliance

Pocket2md v1.0 has been validated against 17 specific requirements:

### CLI Interface ✅
- **CLI-01** ✅ Accepts `--input` parameter for CSV file
- **CLI-02** ✅ Accepts `--output` parameter for output directory
- **CLI-03** ✅ Shows progress messages during processing

### CSV Processing ✅
- **CSV-01** ✅ Reads standard Pocket CSV export format
- **CSV-02** ✅ Extracts URLs from CSV columns
- **CSV-03** ✅ Handles CSV parsing errors gracefully

### URL Fetching ✅
- **FETCH-01** ✅ Processes articles sequentially (not parallel)
- **FETCH-02** ✅ Handles HTTP errors without crashing
- **FETCH-03** ✅ Validates URLs before attempting to fetch

### API Integration ✅
- **API-01** ✅ Sends HTML content to defuddle.md API
- **API-02** ✅ Handles API errors gracefully
- **API-03** ✅ Implements rate limiting with 5-second delays
- **API-04** ✅ Processes API responses into markdown

### Markdown Output ✅
- **MD-01** ✅ Creates output directory automatically
- **MD-02** ✅ Sanitizes filenames for file system compatibility
- **MD-03** ✅ Handles duplicate filenames with numbering
- **MD-04** ✅ Includes metadata (title, URL, date) in files

**Status: 17/17 Requirements VALIDATED ✅**

## Performance & Limitations

### Expected Performance
- **Processing Speed:** ~1 article per 5-7 seconds
- **Memory Usage:** < 50MB for typical exports (< 1000 articles)
- **Success Rate:** High (network-dependent)

### Known Limitations
- **Internet Required:** Needs connection for article fetching
- **API Dependency:** Requires defuddle.md service availability
- **Rate Limited:** 5-second delays between articles (by design)
- **Sequential Processing:** Not parallel (respects API limits)

### Typical Processing Times
- **Small export (< 50 articles):** 5-10 minutes
- **Medium export (100-500 articles):** 15-45 minutes  
- **Large export (1000+ articles):** 1-2 hours

## Error Handling

Pocket2md is designed to handle errors gracefully:

✅ **Network Issues** - Skips failed articles, continues processing  
✅ **Invalid URLs** - Shows warning, continues with next article  
✅ **API Errors** - Handles service failures without crashing  
✅ **File System** - Creates directories, sanitizes names automatically  
✅ **CSV Problems** - Clear error messages for malformed data  

## Testing & Validation

### Automated Testing
```bash
# Run full test suite
npm test

# Run integration tests only
npm test -- --testPathPatterns=integration-validation
```

**Test Status:** 20/20 tests passing ✅

### Manual Testing
For comprehensive manual validation, see:
- **[Manual Test Plan](./MANUAL_TEST_PLAN.md)** - Complete testing procedures
- **[Validation Report](./tests/manual-validation/validation-report.md)** - Detailed compliance report
- **[Test Fixtures](./tests/fixtures/)** - Edge case test data

## Troubleshooting

### Common Issues

**"CSV file not found"**
```bash
# Check file path is correct
ls -la your-pocket-export.csv
node cli.js --input ./path/to/your-pocket-export.csv
```

**"Network errors during processing"**
- Check internet connection
- Some articles may be unavailable (404 errors)
- Processing will continue with remaining articles

**"API rate limiting"**
- This is expected behavior (5-second delays)
- Required to respect defuddle.md API limits
- Processing time depends on number of articles

**"Permission denied creating output directory"**
```bash
# Ensure write permissions
chmod 755 ./
mkdir output
```

### Getting Help

1. **Check the logs** - Console output shows detailed progress
2. **Review test fixtures** - `tests/fixtures/` shows example data formats
3. **Run validation tests** - `npm test` verifies system health
4. **Check manual test plan** - `MANUAL_TEST_PLAN.md` has comprehensive testing procedures

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

### Contributing

1. Fork the repository
2. Create a feature branch
3. Run the test suite: `npm test`
4. Follow the manual test plan in `MANUAL_TEST_PLAN.md`
5. Ensure all 17 requirements remain satisfied
6. Submit a pull request

## System Requirements

- **Node.js** 14+ (tested with current LTS)
- **Internet connection** for article fetching
- **Disk space** for markdown output files
- **Memory** 100MB+ recommended for large exports

## License

[Add your license here]

## Version History

### v1.0.0 (Current)
- ✅ Complete implementation of all 17 v1 requirements
- ✅ Comprehensive test suite with 20 automated tests
- ✅ Manual validation framework
- ✅ Full CSV processing pipeline
- ✅ API integration with rate limiting
- ✅ Error handling and recovery
- ✅ Clean markdown output with metadata

---

**Ready for Production Use** - All requirements validated and tested ✅

For detailed validation documentation, see [Validation Report](./tests/manual-validation/validation-report.md)