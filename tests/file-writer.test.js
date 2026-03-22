const { writeArticleFile } = require('../src/file-writer');
const fs = require('fs');
const path = require('path');
const os = require('os');

describe('writeArticleFile', () => {
  let tempDir;
  
  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'file-writer-test-'));
  });
  
  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test('creates output directory if missing', () => {
    const outputDir = path.join(tempDir, 'new-directory');
    const result = writeArticleFile({
      title: 'Test Article',
      content: '# Test Content',
      outputDir
    });
    
    expect(fs.existsSync(outputDir)).toBe(true);
    expect(result.success).toBe(true);
  });

  test('writes article file with sanitized filename', () => {
    const result = writeArticleFile({
      title: 'Article with/Special<Characters>',
      content: '# Article Content',
      outputDir: tempDir
    });
    
    expect(result.success).toBe(true);
    expect(result.filepath).toBe(path.join(tempDir, 'Article-with-Special-Characters.md'));
    expect(fs.existsSync(result.filepath)).toBe(true);
    
    const content = fs.readFileSync(result.filepath, 'utf8');
    expect(content).toBe('# Article Content');
  });

  test('writes complete markdown with YAML frontmatter when metadata provided', () => {
    const result = writeArticleFile({
      title: 'Test Article',
      content: '# Article Content\n\nThis is the body.',
      url: 'https://example.com/article',
      timestamp: '2026-03-19T14:19:00Z',
      outputDir: tempDir
    });
    
    expect(result.success).toBe(true);
    expect(result.filepath).toBe(path.join(tempDir, 'Test-Article.md'));
    
    const writtenContent = fs.readFileSync(result.filepath, 'utf8');
    expect(writtenContent).toContain('---\n');
    expect(writtenContent).toContain('title: "Test Article"\n');
    expect(writtenContent).toContain('url: "https://example.com/article"\n');
    expect(writtenContent).toContain('date: 2026-03-19T14:19:00Z\n');
    expect(writtenContent).toContain('timestamp: 2026-03-19T14:19:00Z\n');
    expect(writtenContent).toContain('tags: []\n');
    expect(writtenContent).toContain('---\n');
    expect(writtenContent).toContain('# Article Content\n\nThis is the body.');
  });

  test('maintains backward compatibility without metadata', () => {
    const result = writeArticleFile({
      title: 'Legacy Article',
      content: '# Legacy Content',
      outputDir: tempDir
    });
    
    expect(result.success).toBe(true);
    const content = fs.readFileSync(result.filepath, 'utf8');
    expect(content).toBe('# Legacy Content');
    expect(content).not.toContain('---');
  });

  test('handles metadata with special characters', () => {
    const result = writeArticleFile({
      title: 'Article with "quotes" and: special chars',
      content: '# Content here',
      url: 'https://example.com/test?param=value&other=true',
      timestamp: '2026-03-19T14:19:00Z',
      outputDir: tempDir
    });
    
    expect(result.success).toBe(true);
    
    const writtenContent = fs.readFileSync(result.filepath, 'utf8');
    expect(writtenContent).toContain('title: "Article with \\"quotes\\" and: special chars"');
    expect(writtenContent).toContain('url: "https://example.com/test?param=value&other=true"');
  });

  test('handles duplicate titles with conflict resolution', () => {
    // First article
    const result1 = writeArticleFile({
      title: 'Duplicate Title',
      content: '# First Article',
      outputDir: tempDir
    });
    
    // Second article with same title
    const result2 = writeArticleFile({
      title: 'Duplicate Title',
      content: '# Second Article',
      outputDir: tempDir
    });
    
    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true);
    expect(result1.filepath).toBe(path.join(tempDir, 'Duplicate-Title.md'));
    expect(result2.filepath).toBe(path.join(tempDir, 'Duplicate-Title-1.md'));
    
    // Verify both files exist with correct content
    expect(fs.readFileSync(result1.filepath, 'utf8')).toBe('# First Article');
    expect(fs.readFileSync(result2.filepath, 'utf8')).toBe('# Second Article');
  });

  test('returns structured result object on success', () => {
    const result = writeArticleFile({
      title: 'Success Test',
      content: '# Success',
      outputDir: tempDir
    });
    
    expect(result).toEqual({
      success: true,
      filepath: path.join(tempDir, 'Success-Test.md'),
      error: null
    });
  });

  test('handles file system errors gracefully', () => {
    // Try to write to a read-only directory (simulate permission error)
    const readOnlyDir = path.join(tempDir, 'readonly');
    fs.mkdirSync(readOnlyDir);
    fs.chmodSync(readOnlyDir, 0o444); // Read-only
    
    const result = writeArticleFile({
      title: 'Permission Test',
      content: '# Content',
      outputDir: readOnlyDir
    });
    
    expect(result.success).toBe(false);
    expect(result.filepath).toBeNull();
    expect(result.error).toContain('permission');
    
    // Restore permissions for cleanup
    fs.chmodSync(readOnlyDir, 0o755);
  });

  test('handles missing parameters gracefully', () => {
    const result = writeArticleFile({});
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('Missing required parameters');
  });

  test('handles empty title with fallback', () => {
    const result = writeArticleFile({
      title: '',
      content: '# Content',
      outputDir: tempDir
    });
    
    expect(result.success).toBe(true);
    expect(result.filepath).toBe(path.join(tempDir, 'untitled-article.md'));
  });

  test('integrates with filename-utils for sanitization', () => {
    const result = writeArticleFile({
      title: 'Title<>:"/\\|?*with-all-problems',
      content: '# Clean content',
      outputDir: tempDir
    });
    
    expect(result.success).toBe(true);
    expect(result.filepath).toBe(path.join(tempDir, 'Title-with-all-problems.md'));
    expect(fs.existsSync(result.filepath)).toBe(true);
  });

  test('handles very long content without issues', () => {
    const longContent = 'Very long content '.repeat(1000);
    const result = writeArticleFile({
      title: 'Long Content Test',
      content: longContent,
      outputDir: tempDir
    });
    
    expect(result.success).toBe(true);
    const writtenContent = fs.readFileSync(result.filepath, 'utf8');
    expect(writtenContent).toBe(longContent);
  });
});