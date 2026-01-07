import { CleanUrlPipe } from './clear-url.pipe';
import { cleanUrlHelper } from '../helpers';

describe('CleanUrlPipe', () => {
  let pipe: CleanUrlPipe;

  beforeEach(() => {
    pipe = new CleanUrlPipe();
  });

  describe('Pipe instantiation', () => {
    it('should create an instance', () => {
      expect(pipe).toBeTruthy();
    });
  });

  describe('Valid URLs with origins', () => {
    it('should transform simple HTTP URLs to origin', () => {
      expect(pipe.transform('http://example.com')).toBe('http://example.com');
      expect(pipe.transform('https://example.com')).toBe('https://example.com');
    });

    it('should remove path from URLs', () => {
      expect(pipe.transform('https://example.com/path/to/page')).toBe('https://example.com');
      expect(pipe.transform('http://example.com/api/v1/users')).toBe('http://example.com');
    });

    it('should remove query parameters from URLs', () => {
      expect(pipe.transform('https://example.com?param=value')).toBe('https://example.com');
      expect(pipe.transform('http://example.com/page?id=1&sort=asc')).toBe('http://example.com');
    });

    it('should remove fragments from URLs', () => {
      expect(pipe.transform('https://example.com#section')).toBe('https://example.com');
      expect(pipe.transform('http://example.com/page#top')).toBe('http://example.com');
    });

    it('should preserve port numbers in origin', () => {
      expect(pipe.transform('http://example.com:8080')).toBe('http://example.com:8080');
      expect(pipe.transform('https://example.com:443')).toBe('https://example.com');
      expect(pipe.transform('http://localhost:3000/app')).toBe('http://localhost:3000');
    });

    it('should handle subdomains correctly', () => {
      expect(pipe.transform('https://api.example.com')).toBe('https://api.example.com');
      expect(pipe.transform('http://www.example.com/page')).toBe('http://www.example.com');
      expect(pipe.transform('https://sub1.sub2.example.com')).toBe('https://sub1.sub2.example.com');
    });

    it('should handle IP addresses', () => {
      expect(pipe.transform('http://192.168.1.1')).toBe('http://192.168.1.1');
      expect(pipe.transform('https://127.0.0.1:8080/api')).toBe('https://127.0.0.1:8080');
    });

    it('should handle IPv6 addresses', () => {
      expect(pipe.transform('http://[2001:db8::1]')).toBe('http://[2001:db8::1]');
      expect(pipe.transform('https://[::1]:8080')).toBe('https://[::1]:8080');
    });

    it('should clean complex URLs', () => {
      const complexUrl = 'https://api.example.com:8443/v1/users?id=123&active=true#section';
      expect(pipe.transform(complexUrl)).toBe('https://api.example.com:8443');
    });

    it('should handle localhost URLs', () => {
      expect(pipe.transform('http://localhost')).toBe('http://localhost');
      expect(pipe.transform('http://localhost:3000/app')).toBe('http://localhost:3000');
    });

    it('should handle FTP URLs', () => {
      expect(pipe.transform('ftp://ftp.example.com/files')).toBe('ftp://ftp.example.com');
    });

    it('should handle file protocol URLs', () => {
      expect(pipe.transform('file:///C:/Users/user/file.txt')).toBe('file://');
    });

    it('should handle WebSocket URLs', () => {
      expect(pipe.transform('ws://example.com:8080')).toBe('ws://example.com:8080');
      expect(pipe.transform('wss://secure.example.com')).toBe('wss://secure.example.com');
    });
  });

  describe('Opaque origins', () => {
    it('should return original value for about: URLs', () => {
      expect(pipe.transform('about:blank')).toBe('about:blank');
      expect(pipe.transform('about:config')).toBe('about:config');
    });

    it('should return original value for data: URLs', () => {
      expect(pipe.transform('data:text/html,<html></html>')).toBe('data:text/html,<html></html>');
      expect(pipe.transform('data:image/png;base64,iVBORw0KG')).toBe(
        'data:image/png;base64,iVBORw0KG'
      );
    });

    it('should handle blob: URLs', () => {
      expect(pipe.transform('blob:https://example.com/123-456')).toBe('https://example.com');
    });

    it('should return original value for chrome: URLs', () => {
      expect(pipe.transform('chrome://extensions')).toBe('chrome://extensions');
      expect(pipe.transform('chrome-extension://abcdef123456')).toBe(
        'chrome-extension://abcdef123456'
      );
    });
  });

  describe('Invalid URLs', () => {
    it('should return original value for malformed URLs', () => {
      expect(pipe.transform('not a url')).toBe('not a url');
      expect(pipe.transform('htp://invalid')).toBe('htp://invalid');
      expect(pipe.transform('://missing-protocol')).toBe('://missing-protocol');
    });

    it('should return original value for relative paths', () => {
      expect(pipe.transform('/path/to/page')).toBe('/path/to/page');
      expect(pipe.transform('../parent/page')).toBe('../parent/page');
      expect(pipe.transform('./current/page')).toBe('./current/page');
    });

    it('should return original value for URLs without protocol', () => {
      expect(pipe.transform('example.com')).toBe('example.com');
      expect(pipe.transform('www.example.com')).toBe('www.example.com');
    });

    it('should return original value for protocol-relative URLs', () => {
      expect(pipe.transform('//example.com')).toBe('//example.com');
      expect(pipe.transform('//cdn.example.com/script.js')).toBe('//cdn.example.com/script.js');
    });
  });

  describe('Null, undefined, and empty values', () => {
    it('should return empty string for null', () => {
      expect(pipe.transform(null)).toBe('');
    });

    it('should return empty string for undefined', () => {
      expect(pipe.transform(undefined)).toBe('');
    });

    it('should return empty string for empty string', () => {
      expect(pipe.transform('')).toBe('');
    });

    it('should handle whitespace strings', () => {
      expect(pipe.transform('   ')).toBe('   ');
      expect(pipe.transform('\t')).toBe('\t');
      expect(pipe.transform('\n')).toBe('\n');
    });
  });

  describe('Edge cases', () => {
    it('should handle URLs with trailing slashes', () => {
      expect(pipe.transform('http://example.com/')).toBe('http://example.com');
      expect(pipe.transform('https://example.com/path/')).toBe('https://example.com');
    });

    it('should handle URLs with multiple slashes in path', () => {
      expect(pipe.transform('http://example.com//path//to//page')).toBe('http://example.com');
    });

    it('should handle very long URLs', () => {
      const longPath = 'a'.repeat(1000);
      expect(pipe.transform(`http://example.com/${longPath}`)).toBe('http://example.com');
    });

    it('should handle URLs with special characters in path', () => {
      expect(pipe.transform('http://example.com/~user')).toBe('http://example.com');
      expect(pipe.transform('https://example.com/path%20with%20spaces')).toBe(
        'https://example.com'
      );
    });

    it('should handle international domain names', () => {
      expect(pipe.transform('http://例え.jp/path')).toBe('http://xn--r8jz45g.jp');
      expect(pipe.transform('https://münchen.de/page')).toBe('https://xn--mnchen-3ya.de');
    });

    it('should handle URLs with encoded characters', () => {
      expect(pipe.transform('http://example.com/%E2%9C%93')).toBe('http://example.com');
    });

    it('should handle mailto URLs', () => {
      expect(pipe.transform('mailto:user@example.com')).toBe('mailto:user@example.com');
    });

    it('should handle tel URLs', () => {
      expect(pipe.transform('tel:+1234567890')).toBe('tel:+1234567890');
    });

    it('should handle javascript URLs', () => {
      expect(pipe.transform('javascript:void(0)')).toBe('javascript:void(0)');
    });
  });

  describe('Performance and consistency', () => {
    it('should return consistent results for the same input', () => {
      const url = 'https://example.com/page?id=1';
      const result1 = pipe.transform(url);
      const result2 = pipe.transform(url);
      expect(result1).toBe(result2);
      expect(result1).toBe('https://example.com');
    });

    it('should handle rapid successive transformations', () => {
      const urls = [
        'https://example1.com/path',
        'https://example2.com?query=1',
        'about:blank',
        'https://example3.com#hash',
      ];

      const results = urls.map(url => pipe.transform(url));
      expect(results).toEqual([
        'https://example1.com',
        'https://example2.com',
        'about:blank',
        'https://example3.com',
      ]);
    });

    it('should handle array of mixed URLs efficiently', () => {
      const urls = [
        'http://test.com/path',
        null,
        undefined,
        '',
        'about:blank',
        'data:text/html,test',
        'https://secure.com:443',
      ];

      const results = urls.map(url => pipe.transform(url));
      expect(results).toEqual([
        'http://test.com',
        '',
        '',
        '',
        'about:blank',
        'data:text/html,test',
        'https://secure.com',
      ]);
    });
  });

  describe('Error handling', () => {
    it('should not throw errors for any input', () => {
      expect(() => pipe.transform(null)).not.toThrow();
      expect(() => pipe.transform(undefined)).not.toThrow();
      expect(() => pipe.transform('')).not.toThrow();
      expect(() => pipe.transform('invalid')).not.toThrow();
      expect(() => pipe.transform('https://valid.com')).not.toThrow();
    });

    it('should gracefully handle URL constructor errors', () => {
      expect(pipe.transform('ht!tp://bad')).toBe('ht!tp://bad');
      expect(pipe.transform('http://')).toBe('http://');
      expect(pipe.transform('http:/')).toBe('http:/');
    });
  });

  describe('Boundary conditions', () => {
    it('should handle minimum valid URL', () => {
      expect(pipe.transform('http://a')).toBe('http://a');
    });

    it('should handle URL with only protocol and slashes', () => {
      expect(pipe.transform('http://')).toBe('http://');
    });

    it('should handle URL with numeric domains', () => {
      expect(pipe.transform('http://123.456.789.012/path')).toBe('http://123.456.789.012/path');
    });

    it('should handle URL with hyphens in domain', () => {
      expect(pipe.transform('http://my-example-site.com/page')).toBe('http://my-example-site.com');
    });

    it('should handle URL with underscores in path', () => {
      expect(pipe.transform('https://example.com/path_with_underscores')).toBe(
        'https://example.com'
      );
    });
  });

  describe('Integration with cleanUrlHelper', () => {
    it('should delegate to cleanUrlHelper', () => {
      const testUrl = 'https://example.com/path?query=1#hash';
      const pipeResult = pipe.transform(testUrl);
      const helperResult = cleanUrlHelper(testUrl);
      expect(pipeResult).toBe(helperResult);
    });

    it('should produce same results as cleanUrlHelper for various inputs', () => {
      const testCases = [
        'https://example.com',
        'http://localhost:3000',
        null,
        undefined,
        '',
        'about:blank',
        'invalid url',
        'https://example.com/path/to/page?id=1&active=true#section',
      ];

      testCases.forEach(testCase => {
        expect(pipe.transform(testCase)).toBe(cleanUrlHelper(testCase));
      });
    });
  });

  describe('Template usage simulation', () => {
    it('should work in template-like scenario with valid URL', () => {
      const url = 'https://example.com/page';
      const result = pipe.transform(url);
      expect(result).toBe('https://example.com');
    });

    it('should work in template-like scenario with null', () => {
      const url = null;
      const result = pipe.transform(url);
      expect(result).toBe('');
    });

    it('should work in template-like scenario with dynamic values', () => {
      const dynamicUrl = 'https://dynamic.com/path';
      const result1 = pipe.transform(dynamicUrl);
      expect(result1).toBe('https://dynamic.com');

      const newUrl = 'https://changed.com/other';
      const result2 = pipe.transform(newUrl);
      expect(result2).toBe('https://changed.com');
    });
  });

  describe('Pure pipe behavior', () => {
    it('should return same reference for same primitive input', () => {
      const url = 'https://example.com';
      const result1 = pipe.transform(url);
      const result2 = pipe.transform(url);
      // For pure pipes with same input, result should be identical
      expect(result1).toBe(result2);
    });
  });

  describe('Multiple pipe instances', () => {
    it('should work independently across instances', () => {
      const pipe1 = new CleanUrlPipe();
      const pipe2 = new CleanUrlPipe();

      const url1 = 'https://example1.com/path';
      const url2 = 'https://example2.com/path';

      expect(pipe1.transform(url1)).toBe('https://example1.com');
      expect(pipe2.transform(url2)).toBe('https://example2.com');
    });

    it('should maintain independent state (if any)', () => {
      const pipe1 = new CleanUrlPipe();
      const pipe2 = new CleanUrlPipe();

      pipe1.transform('https://test1.com');
      pipe2.transform('https://test2.com');

      expect(pipe1.transform('https://test1.com')).toBe('https://test1.com');
      expect(pipe2.transform('https://test2.com')).toBe('https://test2.com');
    });
  });
});
