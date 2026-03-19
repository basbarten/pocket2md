const fs = require('fs');
const path = require('path');

describe('Package Dependencies', () => {
  test('sanitize-filename should be in dependencies', () => {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    expect(packageJson.dependencies).toHaveProperty('sanitize-filename');
    expect(packageJson.dependencies['sanitize-filename']).toMatch(/^\^?\d+\.\d+\.\d+$/);
  });

  test('sanitize-filename should be installable', () => {
    // Test that the module can be required (only works after npm install)
    expect(() => {
      require('sanitize-filename');
    }).not.toThrow();
  });
});