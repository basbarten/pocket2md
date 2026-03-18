#!/usr/bin/env node

const fs = require('fs');
const { spawn } = require('child_process');

function runCliTest(inputFile, expectedOutput, testName) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', ['cli.js', '--input', inputFile, '--output', 'test_error_output'], { stdio: 'pipe' });
    
    let output = '';
    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      output += data.toString();
    });
    
    child.on('close', (code) => {
      console.log(`${testName}:`);
      console.log(`Exit code: ${code}`);
      console.log(`Output: ${output.trim()}`);
      
      if (expectedOutput.every(expected => output.includes(expected))) {
        console.log(`✓ ${testName} passed\n`);
        resolve();
      } else {
        console.log(`✗ ${testName} failed - missing expected output\n`);
        reject(new Error(`${testName} failed`));
      }
    });
  });
}

async function testErrorHandling() {
  console.log('Testing CSV error handling...\n');
  
  // Test 1: Empty CSV file
  fs.writeFileSync('/tmp/empty.csv', '');
  await runCliTest('/tmp/empty.csv', ['Warning: CSV file is empty'], 'Empty CSV handling');
  
  // Test 2: Invalid CSV structure  
  fs.writeFileSync('/tmp/bad.csv', 'invalid,csv\n"unclosed quote,data');
  await runCliTest('/tmp/bad.csv', ['Error:', 'CSV'], 'Invalid CSV structure');
  
  // Test 3: Missing required columns
  fs.writeFileSync('/tmp/wrong_columns.csv', 'wrong,columns\ndata1,data2');
  await runCliTest('/tmp/wrong_columns.csv', ['Error: CSV missing required columns'], 'Missing columns');
  
  // Test 4: Valid CSV with some malformed rows (should continue processing)
  const validCsvWithErrors = `title,url,time_added,tags,status
"Valid Article",http://example.com,1407757755,tag1,archive
"Another Valid",,1407757756,tag2,archive
"Third Valid",http://example3.com,1407757757,tag3,archive`;
  
  fs.writeFileSync('/tmp/mixed_validity.csv', validCsvWithErrors);
  await runCliTest('/tmp/mixed_validity.csv', ['Processing article', 'Warning: Skipping', 'successful'], 'Mixed validity handling');
  
  console.log('All error handling tests completed!');
  
  // Cleanup
  ['/tmp/empty.csv', '/tmp/bad.csv', '/tmp/wrong_columns.csv', '/tmp/mixed_validity.csv'].forEach(file => {
    if (fs.existsSync(file)) fs.unlinkSync(file);
  });
  
  if (fs.existsSync('test_error_output')) {
    fs.rmSync('test_error_output', { recursive: true, force: true });
  }
}

if (require.main === module) {
  testErrorHandling().catch(error => {
    console.error('Error handling tests failed:', error);
    process.exit(1);
  });
}