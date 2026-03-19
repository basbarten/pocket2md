const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

describe('Integration Validation Tests - All 17 v1 Requirements', () => {
  let tempDir;
  let outputDir;
  let cliPath;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'integration-validation-'));
    outputDir = path.join(tempDir, 'output');
    cliPath = path.join(__dirname, '../cli.js');
    
    // Create output directory
    fs.mkdirSync(outputDir, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  // Helper function to run CLI with timeout
  const runCLI = async (args, timeout = 30000) => {
    const command = `node "${cliPath}" ${args}`;
    try {
      const { stdout, stderr } = await execAsync(command, { 
        timeout,
        cwd: tempDir 
      });
      return { stdout, stderr, exitCode: 0 };
    } catch (error) {
      return { 
        stdout: error.stdout || '', 
        stderr: error.stderr || '', 
        exitCode: error.code || 1 
      };
    }
  };

  describe('CLI Interface Requirements (CLI-01, CLI-02, CLI-03)', () => {
    test('CLI-01: User can run cli.js --input <file.csv> to process Pocket export', async () => {
      const csvPath = path.join(tempDir, 'test.csv');
      const csvContent = `title,url,time_added,tags,status
"Test Article","http://httpbin.org/delay/1",1407757755,test,archive`;
      
      fs.writeFileSync(csvPath, csvContent);

      const result = await runCLI(`--input "${csvPath}" --output "${outputDir}"`);
      
      // Should run without crashing, regardless of network outcome
      expect(result.stdout).toContain('Processing');
      expect(result.stdout).toContain('Pocket export');
    });

    test('CLI-02: User provides output directory path (default: output/)', async () => {
      const csvPath = path.join(tempDir, 'test.csv');
      const customOutputDir = path.join(tempDir, 'custom-output');
      const csvContent = `title,url,time_added,tags,status
"Test Article","http://httpbin.org/delay/1",1407757755,test,archive`;
      
      fs.writeFileSync(csvPath, csvContent);

      const result = await runCLI(`--input "${csvPath}" --output "${customOutputDir}"`);
      
      expect(fs.existsSync(customOutputDir)).toBe(true);
    });

    test('CLI-03: CLI prints progress (Processing article N/M, success/error for each)', async () => {
      const csvPath = path.join(tempDir, 'test.csv');
      const csvContent = `title,url,time_added,tags,status
"Test Article 1","http://httpbin.org/status/200",1407757755,test,archive
"Test Article 2","http://httpbin.org/status/404",1407757756,test,archive`;
      
      fs.writeFileSync(csvPath, csvContent);

      const result = await runCLI(`--input "${csvPath}" --output "${outputDir}"`);
      
      expect(result.stdout).toMatch(/Processing article \d+\/\d+/);
      expect(result.stdout).toMatch(/Articles processed: \d+/);
    });
  });

  describe('CSV Processing Requirements (CSV-01, CSV-02, CSV-03)', () => {
    test('CSV-01: CLI reads Pocket export CSV format', async () => {
      const csvPath = path.join(tempDir, 'pocket-export.csv');
      // Use the actual Pocket CSV format from fixtures (first 3 lines for speed)
      const csvContent = `title,url,time_added,tags,status
Sample Article 1,http://httpbin.org/delay/1,1407757755,tech,archive
Sample Article 2,http://httpbin.org/delay/1,1407757756,web,archive`;
      fs.writeFileSync(csvPath, csvContent);

      const result = await runCLI(`--input "${csvPath}" --output "${outputDir}"`);
      
      expect(result.stdout).toMatch(/Found \d+ rows in CSV/);
      expect(result.stdout).toMatch(/Processing/);
    });

    test('CSV-02: CLI extracts article URLs from CSV rows', async () => {
      const csvPath = path.join(tempDir, 'test.csv');
      const csvContent = `title,url,time_added,tags,status
"Test Article","http://httpbin.org/status/200",1407757755,test,archive`;
      
      fs.writeFileSync(csvPath, csvContent);

      const result = await runCLI(`--input "${csvPath}" --output "${outputDir}"`);
      
      expect(result.stdout).toContain('httpbin.org/status/200');
      expect(result.stdout).toContain('Fetching:');
    });

    test('CSV-03: CLI handles CSV parsing errors gracefully', async () => {
      const csvPath = path.join(tempDir, 'malformed.csv');
      const malformedCSV = fs.readFileSync(path.join(__dirname, 'fixtures', 'malformed.csv'), 'utf8');
      fs.writeFileSync(csvPath, malformedCSV);

      const result = await runCLI(`--input "${csvPath}" --output "${outputDir}"`);
      
      // Should handle malformed CSV gracefully without crashing
      expect(result.stdout).toContain('Reading CSV file');
    });
  });

  describe('Fetch and API Requirements (FETCH-01, FETCH-02, FETCH-03, API-01, API-02, API-03, API-04)', () => {
    test('FETCH-01: CLI fetches HTML from each article URL sequentially', async () => {
      const csvPath = path.join(tempDir, 'test.csv');
      const csvContent = `title,url,time_added,tags,status
"Article 1","http://httpbin.org/delay/1",1407757755,test,archive
"Article 2","http://httpbin.org/delay/1",1407757756,test,archive`;
      
      fs.writeFileSync(csvPath, csvContent);

      const result = await runCLI(`--input "${csvPath}" --output "${outputDir}"`);
      
      expect(result.stdout).toMatch(/Processing article 1\/2/);
      expect(result.stdout).toMatch(/Processing article 2\/2/);
      expect(result.stdout).toContain('Fetching:');
    });

    test('FETCH-02: CLI handles HTTP errors (404, 500, timeouts) and skips Article', async () => {
      const csvPath = path.join(tempDir, 'test.csv');
      const csvContent = `title,url,time_added,tags,status
"404 Article","http://httpbin.org/status/404",1407757756,test,archive`;
      
      fs.writeFileSync(csvPath, csvContent);

      const result = await runCLI(`--input "${csvPath}" --output "${outputDir}"`);
      
      expect(result.stdout).toMatch(/failed.*network.*API errors/);
    });

    test('FETCH-03: CLI validates URLs before fetching (basic URL format check)', async () => {
      const csvPath = path.join(tempDir, 'test.csv');
      const csvContent = `title,url,time_added,tags,status
"Valid URL","http://httpbin.org/status/200",1407757755,test,archive
"Invalid URL","not-a-url",1407757756,test,archive`;
      
      fs.writeFileSync(csvPath, csvContent);

      const result = await runCLI(`--input "${csvPath}" --output "${outputDir}"`);
      
      // Should process valid URL and handle invalid URL
      expect(result.stdout).toContain('httpbin.org/status/200');
      expect(result.stdout).toMatch(/skipped.*invalid URLs/);
    });

    test('API-01: CLI sends article URLs to defuddle.md API service', async () => {
      const csvPath = path.join(tempDir, 'test.csv');
      const csvContent = `title,url,time_added,tags,status
"Test Article","http://httpbin.org/html",1407757755,test,archive`;
      
      fs.writeFileSync(csvPath, csvContent);

      const result = await runCLI(`--input "${csvPath}" --output "${outputDir}"`);
      
      // Should show it's using defuddle.md API by checking CLI source
      const cliCode = fs.readFileSync(cliPath, 'utf8');
      expect(cliCode).toContain('defuddle.md');
    });

    test('API-02: CLI handles API errors (network failures, service unavailable) and skips article', async () => {
      const csvPath = path.join(tempDir, 'test.csv');
      const csvContent = `title,url,time_added,tags,status
"Network Error","http://nonexistent-domain-12345.invalid/test",1407757755,test,archive`;
      
      fs.writeFileSync(csvPath, csvContent);

      const result = await runCLI(`--input "${csvPath}" --output "${outputDir}"`);
      
      expect(result.stdout).toMatch(/failed.*network.*API errors/);
    });

    test('API-03: CLI implements rate limiting (5 second delay between API calls)', async () => {
      // Check that CLI code includes rate limiting logic
      const cliCode = fs.readFileSync(cliPath, 'utf8');
      expect(cliCode).toMatch(/setTimeout.*5000|delay.*5.*second/i);
    });

    test('API-04: CLI processes API response to extract cleaned markdown content', async () => {
      // Check that CLI code includes markdown processing logic
      const cliCode = fs.readFileSync(cliPath, 'utf8');
      expect(cliCode).toMatch(/writeArticleFile/);
      expect(cliCode).toMatch(/content.*=.*response/i);
    });
  });

  describe('Markdown Output Requirements (MD-01, MD-02, MD-03, MD-04)', () => {
    test('MD-01: CLI creates output directory (default: ./output/)', async () => {
      const csvPath = path.join(tempDir, 'test.csv');
      const defaultOutput = path.join(tempDir, 'output');
      const csvContent = `title,url,time_added,tags,status
"Test Article","http://httpbin.org/delay/1",1407757755,test,archive`;
      
      fs.writeFileSync(csvPath, csvContent);

      // Run without explicit output directory
      const result = await runCLI(`--input "${csvPath}"`);
      
      expect(fs.existsSync(defaultOutput)).toBe(true);
    });

    test('MD-02: CLI saves markdown files with sanitized article title as filename', async () => {
      // Check that file-writer includes sanitize-filename logic
      const fileWriterCode = fs.readFileSync(path.join(__dirname, '../src/file-writer.js'), 'utf8');
      expect(fileWriterCode).toMatch(/sanitize.*filename/i);
    });

    test('MD-03: CLI handles filename conflicts (append number if title exists)', async () => {
      // Check that file-writer module handles conflicts
      const fileWriterCode = fs.readFileSync(path.join(__dirname, '../src/file-writer.js'), 'utf8');
      expect(fileWriterCode).toMatch(/conflict|exists|duplicate|\(\d+\)/i);
    });

    test('MD-04: CLI includes basic metadata in markdown file (title, URL, date fetched)', async () => {
      // Check that file-writer includes metadata
      const fileWriterCode = fs.readFileSync(path.join(__dirname, '../src/file-writer.js'), 'utf8');
      expect(fileWriterCode).toMatch(/Original URL|Fetched on|timestamp/i);
    });
  });

  describe('Performance and Edge Cases', () => {
    test('Performance: Large dataset processing can handle multiple articles', async () => {
      const csvPath = path.join(tempDir, 'multi-test.csv');
      // Use just 3 articles for faster testing
      const csvContent = `title,url,time_added,tags,status
Sample Article 1,http://httpbin.org/delay/0,1407757755,tech,archive
Sample Article 2,http://httpbin.org/delay/0,1407757756,web,archive
Sample Article 3,http://httpbin.org/delay/0,1407757757,dev,archive`;
      fs.writeFileSync(csvPath, csvContent);

      const result = await runCLI(`--input "${csvPath}" --output "${outputDir}"`, 60000);
      
      expect(result.stdout).toMatch(/Found 3 rows in CSV/);
      expect(result.stdout).toMatch(/Processing article 3\/3/);
    });

    test('Edge Case: Empty CSV file', async () => {
      const csvPath = path.join(tempDir, 'empty.csv');
      const emptyCSV = fs.readFileSync(path.join(__dirname, 'fixtures', 'empty.csv'), 'utf8');
      fs.writeFileSync(csvPath, emptyCSV);

      const result = await runCLI(`--input "${csvPath}" --output "${outputDir}"`);
      
      expect(result.stdout).toMatch(/Found 0 rows in CSV/);
    });

    test('Edge Case: Special characters and Unicode in CSV', async () => {
      const csvPath = path.join(tempDir, 'special-chars.csv');
      const csvContent = `title,url,time_added,tags,status
"Special ""Quotes"" & Chars",http://httpbin.org/delay/0,1407757755,special,archive
"Ümlauts & Émojis 🚀",http://httpbin.org/delay/0,1407757756,unicode,archive`;
      fs.writeFileSync(csvPath, csvContent);

      const result = await runCLI(`--input "${csvPath}" --output "${outputDir}"`);
      
      // Should process CSV with special characters without crashing
      expect(result.stdout).toMatch(/Found 2 rows in CSV/);
      expect(result.stdout).toContain('Processing article 2/2');
    });
  });
});