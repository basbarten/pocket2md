const { createMetadata, formatFrontmatter } = require('../src/metadata');

describe('metadata module', () => {
  describe('createMetadata', () => {
    it('should create metadata object from article data', () => {
      const input = {
        title: 'Test Article Title',
        url: 'https://example.com/test-article',
        timestamp: '2026-03-19T14:19:00Z'
      };

      const result = createMetadata(input);

      expect(result).toEqual({
        title: 'Test Article Title',
        url: 'https://example.com/test-article',
        date: '2026-03-19T14:19:00Z'
      });
    });

    it('should handle special characters in titles', () => {
      const input = {
        title: 'Article with "quotes" and: special chars',
        url: 'https://example.com/test',
        timestamp: '2026-03-19T14:19:00Z'
      };

      const result = createMetadata(input);

      expect(result.title).toBe('Article with "quotes" and: special chars');
    });

    it('should format timestamps as ISO 8601 strings', () => {
      const input = {
        title: 'Test Article',
        url: 'https://example.com/test',
        timestamp: 1773929978000 // timestamp as number
      };

      const result = createMetadata(input);

      expect(result.date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
    });
  });

  describe('formatFrontmatter', () => {
    it('should generate valid YAML frontmatter block', () => {
      const metadata = {
        title: 'Test Article',
        url: 'https://example.com/test',
        date: '2026-03-19T14:19:00Z'
      };
      const content = 'This is the article content.';

      const result = formatFrontmatter(metadata, content);

      expect(result).toContain('---\n');
      expect(result).toContain('title: Test Article\n');
      expect(result).toContain('url: "https://example.com/test"\n');
      expect(result).toContain('date: 2026-03-19T14:19:00Z\n');
      expect(result).toContain('---\n');
      expect(result).toContain('This is the article content.');
    });

    it('should handle YAML escaping for special characters', () => {
      const metadata = {
        title: 'Article with "quotes" and: special chars',
        url: 'https://example.com/test?param=value&other=true',
        date: '2026-03-19T14:19:00Z'
      };
      const content = 'Content here.';

      const result = formatFrontmatter(metadata, content);

      // Should properly quote strings with special YAML characters
      expect(result).toContain('title: "Article with \\"quotes\\" and: special chars"\n');
      expect(result).toContain('url: "https://example.com/test?param=value&other=true"\n');
    });

    it('should handle empty content', () => {
      const metadata = {
        title: 'Test Article',
        url: 'https://example.com/test',
        date: '2026-03-19T14:19:00Z'
      };
      const content = '';

      const result = formatFrontmatter(metadata, content);

      expect(result).toContain('---\n');
      expect(result).toContain('title: Test Article\n');
      expect(result).toContain('---\n');
      expect(result.endsWith('\n')).toBe(true);
    });

    it('should produce parseable YAML', () => {
      const yaml = require('js-yaml');
      const metadata = {
        title: 'Complex: Title with "quotes" and symbols!',
        url: 'https://example.com/path?query=value&more=true',
        date: '2026-03-19T14:19:00Z'
      };
      const content = 'Article content here';

      const result = formatFrontmatter(metadata, content);
      const frontmatterMatch = result.match(/^---\n([\s\S]*?)\n---\n/);
      
      expect(frontmatterMatch).toBeTruthy();
      
      const yamlContent = frontmatterMatch[1];
      const parsed = yaml.load(yamlContent);
      
      // YAML parser converts ISO dates to Date objects, so check the structure
      expect(parsed.title).toBe(metadata.title);
      expect(parsed.url).toBe(metadata.url);
      expect(parsed.date).toEqual(new Date(metadata.date));
    });
  });
});