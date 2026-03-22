const { createMetadata, formatFrontmatter, parseDefuddleFrontmatter } = require('../src/metadata');

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

  describe('parseDefuddleFrontmatter', () => {
    it('should extract YAML frontmatter and content from defuddle response', () => {
      const apiResponse = `---
title: "Test Article"
author: "John Doe"
published_date: "2024-03-15"
site_name: "Example Site"
---
# Article Content

This is the article body.`;

      const result = parseDefuddleFrontmatter(apiResponse);

      expect(result.frontmatter).toEqual({
        title: 'Test Article',
        author: 'John Doe',
        published_date: '2024-03-15',
        site_name: 'Example Site'
      });
      expect(result.content).toBe('# Article Content\n\nThis is the article body.');
    });

    it('should handle malformed YAML gracefully without throwing', () => {
      const apiResponse = `---
title: "Test Article
author: [unclosed array
invalid: yaml: structure
---
# Article Content`;

      const result = parseDefuddleFrontmatter(apiResponse);

      expect(result.frontmatter).toBeNull();
      expect(result.content).toBe(apiResponse);
    });

    it('should handle missing frontmatter', () => {
      const apiResponse = `# Article Content

This article has no frontmatter.`;

      const result = parseDefuddleFrontmatter(apiResponse);

      expect(result.frontmatter).toBeNull();
      expect(result.content).toBe(apiResponse);
    });

    it('should handle empty response', () => {
      const apiResponse = '';

      const result = parseDefuddleFrontmatter(apiResponse);

      expect(result.frontmatter).toBeNull();
      expect(result.content).toBe('');
    });

    it('should handle response with only opening frontmatter delimiter', () => {
      const apiResponse = `---
title: "Test Article"
author: "John Doe"`;

      const result = parseDefuddleFrontmatter(apiResponse);

      expect(result.frontmatter).toBeNull();
      expect(result.content).toBe(apiResponse);
    });

    it('should handle response with frontmatter containing triple dashes in content', () => {
      const apiResponse = `---
title: "Test Article"
---
# Content

Some text with --- in it.`;

      const result = parseDefuddleFrontmatter(apiResponse);

      expect(result.frontmatter).toEqual({
        title: 'Test Article'
      });
      expect(result.content).toBe('# Content\n\nSome text with --- in it.');
    });

    it('should trim content after extracting frontmatter', () => {
      const apiResponse = `---
title: "Test Article"
---

  
# Content with leading whitespace`;

      const result = parseDefuddleFrontmatter(apiResponse);

      expect(result.frontmatter).toEqual({
        title: 'Test Article'
      });
      expect(result.content).toBe('# Content with leading whitespace');
    });
  });
});