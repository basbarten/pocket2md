const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

describe('CLI argument parsing', () => {
  const testCsvContent = `title,url,time_added,tags,status
Test Article,https://example.com,1407757755,tag1|tag2,archive`;
  
  let testCsvFile;
  let testOutputDir;
  
  beforeEach(() => {
    // Create temporary test files
    testCsvFile = path.join(__dirname, 'test.csv');
    testOutputDir = path.join(__dirname, 'test-output');
    
    fs.writeFileSync(testCsvFile, testCsvContent);
    
    // Clean up output directory if it exists
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true, force: true });
    }
  });
  
  afterEach(() => {
    // Clean up test files
    if (fs.existsSync(testCsvFile)) {
      fs.unlinkSync(testCsvFile);
    }
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true, force: true });
    }
    
    // Clean up any additional test files created in tests
    const additionalFiles = [
      path.join(__dirname, 'multi-test.csv'),
      path.join(__dirname, 'invalid-test.csv')
    ];
    
    additionalFiles.forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
  });
  
  describe('CLI argument parsing', () => {
    test('should show help when run without arguments', () => {
      const result = execSync('node cli.js', { encoding: 'utf8' });
      
      expect(result).toContain('pocket2md - Convert Pocket export to Markdown files');
      expect(result).toContain('USAGE:');
      expect(result).toContain('--input');
      expect(result).toContain('--output');
    });
    
    test('should show help when --help flag is provided', () => {
      const result = execSync('node cli.js --help', { encoding: 'utf8' });
      
      expect(result).toContain('pocket2md - Convert Pocket export to Markdown files');
      expect(result).toContain('OPTIONS:');
      expect(result).toContain('-i, --input');
      expect(result).toContain('-o, --output');
    });
    
    test('should show version when --version flag is provided', () => {
      const result = execSync('node cli.js --version', { encoding: 'utf8' });
      
      expect(result).toContain('pocket2md v');
      expect(result).toMatch(/v\d+\.\d+\.\d+/);
    });
    
    test('should accept input flag and process CSV file', () => {
      const result = execSync(`node cli.js --input "${testCsvFile}"`, { encoding: 'utf8' });
      
      expect(result).toContain(`Processing Pocket export: ${testCsvFile}`);
      expect(result).toContain('Reading CSV file...');
      expect(result).toContain('Processing article 1/1...');
    });
    
    test('should require input flag and show error when missing', () => {
      try {
        execSync('node cli.js --output /tmp/test', { encoding: 'utf8', stdio: 'pipe' });
        fail('Should have thrown an error');
      } catch (error) {
        const output = error.stdout + error.stderr;
        expect(output).toContain('Error: --input flag is required');
      }
    });
    
    test('should handle unknown arguments with clear error', () => {
      try {
        execSync(`node cli.js --unknown-flag --input "${testCsvFile}"`, { encoding: 'utf8', stdio: 'pipe' });
        fail('Should have thrown an error');
      } catch (error) {
        const output = error.stdout + error.stderr;
        expect(output).toContain('Error: Unknown option \'--unknown-flag\'');
        expect(output).toContain('Run with --help to see usage information');
      }
    });
  });
  
  describe('output directory', () => {
    test('should use default output directory when not specified', () => {
      const result = execSync(`node cli.js --input "${testCsvFile}"`, { encoding: 'utf8' });
      
      expect(result).toContain('Output directory: ./output/');
    });
    
    test('should use custom output directory when specified', () => {
      const result = execSync(`node cli.js --input "${testCsvFile}" --output "${testOutputDir}"`, { encoding: 'utf8' });
      
      expect(result).toContain(`Output directory: ${testOutputDir}`);
    });
    
    test('should create output directory if it does not exist', () => {
      execSync(`node cli.js --input "${testCsvFile}" --output "${testOutputDir}"`, { encoding: 'utf8' });
      
      expect(fs.existsSync(testOutputDir)).toBe(true);
      expect(fs.statSync(testOutputDir).isDirectory()).toBe(true);
    });
    
    test('should handle output directory creation with nested paths', () => {
      const nestedDir = path.join(testOutputDir, 'nested', 'deep');
      
      try {
        execSync(`node cli.js --input "${testCsvFile}" --output "${nestedDir}"`, { encoding: 'utf8', stdio: 'pipe' });
      } catch (error) {
        // CLI might exit early due to processing completion, that's okay
      }
      
      expect(fs.existsSync(nestedDir)).toBe(true);
      expect(fs.statSync(nestedDir).isDirectory()).toBe(true);
    });
  });
  
  describe('progress display', () => {
    test('should show processing progress for each article', () => {
      const multiArticleCsv = `title,url,time_added,tags,status
Article 1,https://example.com/1,1407757755,tag1,archive
Article 2,https://example.com/2,1407757756,tag2,archive
Article 3,https://example.com/3,1407757757,tag3,archive`;
      
      const multiTestFile = path.join(__dirname, 'multi-test.csv');
      fs.writeFileSync(multiTestFile, multiArticleCsv);
      
      try {
        const result = execSync(`node cli.js --input "${multiTestFile}"`, { encoding: 'utf8' });
        
        expect(result).toContain('Processing article 1/3...');
        expect(result).toContain('Processing article 2/3...');
        expect(result).toContain('Processing article 3/3...');
        expect(result).toContain('Processed 3 articles: 3 successful, 0 failed');
      } finally {
        if (fs.existsSync(multiTestFile)) {
          fs.unlinkSync(multiTestFile);
        }
      }
    });
    
    test('should show final summary with success and failure counts', () => {
      const result = execSync(`node cli.js --input "${testCsvFile}"`, { encoding: 'utf8' });
      
      expect(result).toContain('Processed 1 articles: 1 successful, 0 failed');
    });
    
    test('should count skipped articles in failure count', () => {
      const csvWithMissingUrl = `title,url,time_added,tags,status
Valid Article,https://example.com,1407757755,tag1,archive
Invalid Article,,1407757756,tag2,archive`;
      
      const testFileWithInvalid = path.join(__dirname, 'invalid-test.csv');
      fs.writeFileSync(testFileWithInvalid, csvWithMissingUrl);
      
      try {
        const result = execSync(`node cli.js --input "${testFileWithInvalid}"`, { encoding: 'utf8', stdio: 'pipe' });
        
        expect(result).toContain('Processed 2 articles: 1 successful, 1 failed');
      } finally {
        if (fs.existsSync(testFileWithInvalid)) {
          fs.unlinkSync(testFileWithInvalid);
        }
      }
    });
  });
});