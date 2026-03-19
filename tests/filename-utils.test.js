const { sanitizeFilename, resolveConflicts } = require('../src/filename-utils');
const fs = require('fs');
const path = require('path');
const os = require('os');

describe('sanitizeFilename', () => {
  test('converts basic title to safe filename', () => {
    expect(sanitizeFilename('My Article Title')).toBe('My-Article-Title');
  });

  test('handles special characters', () => {
    expect(sanitizeFilename('Title<with>special:chars"')).toBe('Title-with-special-chars');
  });

  test('handles all problematic characters: < > : " / \\ | ? *', () => {
    const problematic = 'Title<>:"/\\|?*with-problems';
    const result = sanitizeFilename(problematic);
    expect(result).toBe('Title-with-problems');
    expect(result).not.toMatch(/[<>:"/\\|?*]/);
  });

  test('replaces spaces with hyphens', () => {
    expect(sanitizeFilename('Spaces   Between   Words')).toBe('Spaces-Between-Words');
  });

  test('limits length to 200 characters', () => {
    const longTitle = 'a'.repeat(250);
    const result = sanitizeFilename(longTitle);
    expect(result.length).toBeLessThanOrEqual(200);
  });

  test('falls back to untitled-article for empty title', () => {
    expect(sanitizeFilename('')).toBe('untitled-article');
    expect(sanitizeFilename('   ')).toBe('untitled-article');
    expect(sanitizeFilename(null)).toBe('untitled-article');
    expect(sanitizeFilename(undefined)).toBe('untitled-article');
  });

  test('handles Unicode characters safely', () => {
    expect(sanitizeFilename('Café and Naïve résumé')).toBe('Café-and-Naïve-résumé');
  });

  test('removes leading/trailing hyphens', () => {
    expect(sanitizeFilename('  -Title-  ')).toBe('Title');
  });
});

describe('resolveConflicts', () => {
  let tempDir;
  
  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'filename-utils-test-'));
  });
  
  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test('returns original filename when no conflict', () => {
    const filename = 'unique-article.md';
    expect(resolveConflicts(tempDir, filename)).toBe(filename);
  });

  test('appends -1 for first conflict', () => {
    const filename = 'duplicate-article.md';
    fs.writeFileSync(path.join(tempDir, filename), 'content');
    
    expect(resolveConflicts(tempDir, filename)).toBe('duplicate-article-1.md');
  });

  test('increments number for multiple conflicts', () => {
    const baseName = 'multi-duplicate';
    const ext = '.md';
    const filename = baseName + ext;
    
    // Create original and first duplicate
    fs.writeFileSync(path.join(tempDir, filename), 'content');
    fs.writeFileSync(path.join(tempDir, `${baseName}-1${ext}`), 'content');
    fs.writeFileSync(path.join(tempDir, `${baseName}-2${ext}`), 'content');
    
    expect(resolveConflicts(tempDir, filename)).toBe('multi-duplicate-3.md');
  });

  test('handles files without extension', () => {
    const filename = 'no-extension';
    fs.writeFileSync(path.join(tempDir, filename), 'content');
    
    expect(resolveConflicts(tempDir, filename)).toBe('no-extension-1');
  });
});