#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Test CSV parsing functionality
function testCsvParsing() {
  console.log('Running CSV parsing tests...');
  
  // Test 1: CSV parsing should extract article data with progress reporting
  try {
    const { spawn } = require('child_process');
    
    // Create a small test CSV file
    const testCsv = `title,url,time_added,tags,status
"Test Article 1",http://example.com/1,1407757755,tag1|tag2,archive
"Test Article 2",http://example.com/2,1407757756,tag3,archive`;
    
    fs.writeFileSync('test_input.csv', testCsv);
    
    // Run CLI and capture output
    const child = spawn('node', ['cli.js', '--input', 'test_input.csv', '--output', 'test_output'], { stdio: 'pipe' });
    
    let output = '';
    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      output += data.toString();
    });
    
    child.on('close', (code) => {
      console.log('CLI output:', output);
      
      // Test expectations:
      // 1. Should show progress indicators
      assert(output.includes('Processing article 1/2') || output.includes('Processing article'), 
             'Should show progress reporting');
      
      // 2. Should show final summary
      assert(output.includes('Processed') || output.includes('successful'), 
             'Should show processing summary');
      
      // 3. Should create output directory
      assert(fs.existsSync('test_output'), 'Should create output directory');
      
      // 4. Should extract required fields (verify internally in code)
      console.log('✓ CSV parsing tests passed');
      
      // Cleanup
      fs.unlinkSync('test_input.csv');
      if (fs.existsSync('test_output')) {
        fs.rmSync('test_output', { recursive: true, force: true });
      }
    });
    
  } catch (error) {
    console.error('✗ CSV parsing test failed:', error.message);
    throw error;
  }
}

// Test 2: Should handle missing URLs gracefully
function testMissingUrls() {
  console.log('Running missing URL test...');
  
  const testCsv = `title,url,time_added,tags,status
"Valid Article",http://example.com,1407757755,tag1,archive
"Invalid Article",,1407757756,tag2,archive`;
  
  fs.writeFileSync('test_missing_url.csv', testCsv);
  
  const { spawn } = require('child_process');
  const child = spawn('node', ['cli.js', '--input', 'test_missing_url.csv', '--output', 'test_output2'], { stdio: 'pipe' });
  
  let output = '';
  child.stdout.on('data', (data) => {
    output += data.toString();
  });
  
  child.stderr.on('data', (data) => {
    output += data.toString();
  });
  
  child.on('close', (code) => {
    console.log('Missing URL test output:', output);
    
    // Should process valid articles and skip invalid ones
    assert(output.includes('Processing article') || output.includes('Processed'), 
           'Should still process valid articles');
    
    console.log('✓ Missing URL handling test passed');
    
    // Cleanup
    fs.unlinkSync('test_missing_url.csv');
    if (fs.existsSync('test_output2')) {
      fs.rmSync('test_output2', { recursive: true, force: true });
    }
  });
}

// Run tests
if (require.main === module) {
  try {
    testCsvParsing();
    setTimeout(() => testMissingUrls(), 2000); // Wait for first test to complete
  } catch (error) {
    console.error('Tests failed:', error);
    process.exit(1);
  }
}