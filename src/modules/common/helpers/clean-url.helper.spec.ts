import { cleanUrlHelper } from './clean-url.helper';

describe('cleanUrlHelper', () => {
  describe('Valid URLs with origins', () => {
    it('should return origin for simple HTTP URLs', () => {
      expect(cleanUrlHelper('http://example.com')).toBe('http://example.com');
      expect(cleanUrlHelper('https://example.com')).toBe('https://example.com');
    });

    it('should remove path from URLs', () => {
      expect(cleanUrlHelper('https://example.com/path/to/page')).toBe('https://example.com');
      expect(cleanUrlHelper('http://example.com/api/v1/users')).toBe('http://example.com');
    });

    it('should remove query parameters from URLs', () => {
      expect(cleanUrlHelper('https://example.com?param=value')).toBe('https://example.com');
      expect(cleanUrlHelper('http://example.com/page?id=1&sort=asc')).toBe('http://example.com');
    });

    it('should remove fragments from URLs', () => {
      expect(cleanUrlHelper('https://example.com#section')).toBe('https://example.com');
      expect(cleanUrlHelper('http://example.com/page#top')).toBe('http://example.com');
    });

    it('should preserve port numbers in origin', () => {
      expect(cleanUrlHelper('http://example.com:8080')).toBe('http://example.com:8080');
      // Default HTTPS port (443) is omitted by URL.origin
      expect(cleanUrlHelper('https://example.com:443')).toBe('https://example.com');
      expect(cleanUrlHelper('http://localhost:3000/app')).toBe('http://localhost:3000');
    });

    it('should handle subdomains correctly', () => {
      expect(cleanUrlHelper('https://api.example.com')).toBe('https://api.example.com');
      expect(cleanUrlHelper('http://www.example.com/page')).toBe('http://www.example.com');
      expect(cleanUrlHelper('https://sub1.sub2.example.com')).toBe('https://sub1.sub2.example.com');
    });

    it('should handle IP addresses', () => {
      expect(cleanUrlHelper('http://192.168.1.1')).toBe('http://192.168.1.1');
      expect(cleanUrlHelper('https://127.0.0.1:8080/api')).toBe('https://127.0.0.1:8080');
    });

    it('should handle IPv6 addresses', () => {
      expect(cleanUrlHelper('http://[2001:db8::1]')).toBe('http://[2001:db8::1]');
      expect(cleanUrlHelper('https://[::1]:8080')).toBe('https://[::1]:8080');
    });

    it('should clean complex URLs', () => {
      const complexUrl = 'https://api.example.com:8443/v1/users?id=123&active=true#section';
      expect(cleanUrlHelper(complexUrl)).toBe('https://api.example.com:8443');
    });

    it('should handle URLs with authentication (origin includes protocol and domain only)', () => {
      // Note: URL.origin does NOT include authentication credentials
      expect(cleanUrlHelper('http://user:pass@example.com')).toBe('http://example.com');
      expect(cleanUrlHelper('https://admin@example.com/path')).toBe('https://example.com');
    });

    it('should handle localhost URLs', () => {
      expect(cleanUrlHelper('http://localhost')).toBe('http://localhost');
      expect(cleanUrlHelper('http://localhost:3000/app')).toBe('http://localhost:3000');
    });

    it('should handle FTP URLs', () => {
      expect(cleanUrlHelper('ftp://ftp.example.com/files')).toBe('ftp://ftp.example.com');
    });

    it('should handle file protocol URLs', () => {
      expect(cleanUrlHelper('file:///C:/Users/user/file.txt')).toBe('file://');
    });

    it('should handle WebSocket URLs', () => {
      expect(cleanUrlHelper('ws://example.com:8080')).toBe('ws://example.com:8080');
      expect(cleanUrlHelper('wss://secure.example.com')).toBe('wss://secure.example.com');
    });
  });

  describe('Opaque origins (returns original value)', () => {
    it('should return original value for about: URLs', () => {
      expect(cleanUrlHelper('about:blank')).toBe('about:blank');
      expect(cleanUrlHelper('about:config')).toBe('about:config');
    });

    it('should return original value for data: URLs', () => {
      expect(cleanUrlHelper('data:text/html,<html></html>')).toBe('data:text/html,<html></html>');
      expect(cleanUrlHelper('data:image/png;base64,iVBORw0KG')).toBe(
        'data:image/png;base64,iVBORw0KG'
      );
    });

    it('should return original value for blob: URLs', () => {
      // blob: URLs are parsed, and the origin becomes the nested URL's origin
      expect(cleanUrlHelper('blob:https://example.com/123-456')).toBe('https://example.com');
    });

    it('should return original value for chrome: URLs', () => {
      expect(cleanUrlHelper('chrome://extensions')).toBe('chrome://extensions');
      expect(cleanUrlHelper('chrome-extension://abcdef123456')).toBe(
        'chrome-extension://abcdef123456'
      );
    });
  });

  describe('Invalid URLs (returns original value)', () => {
    it('should return original value for malformed URLs', () => {
      expect(cleanUrlHelper('not a url')).toBe('not a url');
      expect(cleanUrlHelper('htp://invalid')).toBe('htp://invalid');
      expect(cleanUrlHelper('://missing-protocol')).toBe('://missing-protocol');
    });

    it('should return original value for relative paths', () => {
      expect(cleanUrlHelper('/path/to/page')).toBe('/path/to/page');
      expect(cleanUrlHelper('../parent/page')).toBe('../parent/page');
      expect(cleanUrlHelper('./current/page')).toBe('./current/page');
    });

    it('should return original value for URLs without protocol', () => {
      expect(cleanUrlHelper('example.com')).toBe('example.com');
      expect(cleanUrlHelper('www.example.com')).toBe('www.example.com');
    });

    it('should return original value for protocol-relative URLs', () => {
      expect(cleanUrlHelper('//example.com')).toBe('//example.com');
      expect(cleanUrlHelper('//cdn.example.com/script.js')).toBe('//cdn.example.com/script.js');
    });
  });

  describe('Null, undefined, and empty values', () => {
    it('should return empty string for null', () => {
      expect(cleanUrlHelper(null)).toBe('');
    });

    it('should return empty string for undefined', () => {
      expect(cleanUrlHelper(undefined)).toBe('');
    });

    it('should return empty string for empty string', () => {
      expect(cleanUrlHelper('')).toBe('');
    });

    it('should handle whitespace strings', () => {
      // Whitespace is truthy but not a valid URL
      expect(cleanUrlHelper('   ')).toBe('   ');
      expect(cleanUrlHelper('\t')).toBe('\t');
      expect(cleanUrlHelper('\n')).toBe('\n');
    });
  });

  describe('Edge cases', () => {
    it('should handle URLs with trailing slashes', () => {
      expect(cleanUrlHelper('http://example.com/')).toBe('http://example.com');
      expect(cleanUrlHelper('https://example.com/path/')).toBe('https://example.com');
    });

    it('should handle URLs with multiple slashes in path', () => {
      expect(cleanUrlHelper('http://example.com//path//to//page')).toBe('http://example.com');
    });

    it('should handle very long URLs', () => {
      const longPath = 'a'.repeat(1000);
      expect(cleanUrlHelper(`http://example.com/${longPath}`)).toBe('http://example.com');
    });

    it('should handle URLs with special characters in path', () => {
      expect(cleanUrlHelper('http://example.com/~user')).toBe('http://example.com');
      expect(cleanUrlHelper('https://example.com/path%20with%20spaces')).toBe(
        'https://example.com'
      );
    });

    it('should handle international domain names', () => {
      // URL API converts IDN to punycode in origin
      expect(cleanUrlHelper('http://例え.jp/path')).toBe('http://xn--r8jz45g.jp');
      expect(cleanUrlHelper('https://münchen.de/page')).toBe('https://xn--mnchen-3ya.de');
    });

    it('should handle URLs with encoded characters', () => {
      expect(cleanUrlHelper('http://example.com/%E2%9C%93')).toBe('http://example.com');
    });

    it('should handle URLs with hash fragments in complex positions', () => {
      expect(cleanUrlHelper('https://example.com/path?query=1#hash')).toBe('https://example.com');
    });

    it('should handle mailto URLs', () => {
      expect(cleanUrlHelper('mailto:user@example.com')).toBe('mailto:user@example.com');
    });

    it('should handle tel URLs', () => {
      expect(cleanUrlHelper('tel:+1234567890')).toBe('tel:+1234567890');
    });

    it('should handle javascript URLs (opaque origin)', () => {
      expect(cleanUrlHelper('javascript:void(0)')).toBe('javascript:void(0)');
    });
  });

  describe('Performance and consistency', () => {
    it('should return consistent results for the same input', () => {
      const url = 'https://example.com/page?id=1';
      const result1 = cleanUrlHelper(url);
      const result2 = cleanUrlHelper(url);
      expect(result1).toBe(result2);
      expect(result1).toBe('https://example.com');
    });

    it('should handle rapid successive calls', () => {
      const urls = [
        'https://example1.com/path',
        'https://example2.com?query=1',
        'about:blank',
        'https://example3.com#hash',
      ];

      const results = urls.map(url => cleanUrlHelper(url));
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

      const results = urls.map(url => cleanUrlHelper(url));
      expect(results).toEqual([
        'http://test.com',
        '',
        '',
        '',
        'about:blank',
        'data:text/html,test',
        'https://secure.com', // Default HTTPS port omitted
      ]);
    });
  });

  describe('Error handling', () => {
    it('should not throw errors for any input', () => {
      expect(() => cleanUrlHelper(null)).not.toThrow();
      expect(() => cleanUrlHelper(undefined)).not.toThrow();
      expect(() => cleanUrlHelper('')).not.toThrow();
      expect(() => cleanUrlHelper('invalid')).not.toThrow();
      expect(() => cleanUrlHelper('https://valid.com')).not.toThrow();
    });

    it('should gracefully handle URL constructor errors', () => {
      // These would throw in URL constructor but are caught
      expect(cleanUrlHelper('ht!tp://bad')).toBe('ht!tp://bad');
      expect(cleanUrlHelper('http://')).toBe('http://');
      expect(cleanUrlHelper('http:/')).toBe('http:/');
    });
  });

  describe('Boundary conditions', () => {
    it('should handle minimum valid URL', () => {
      expect(cleanUrlHelper('http://a')).toBe('http://a');
    });

    it('should handle URL with only protocol and slashes', () => {
      expect(cleanUrlHelper('http://')).toBe('http://');
    });

    it('should handle URL with numeric domains', () => {
      // Invalid IP addresses are not parsed as valid URLs
      expect(cleanUrlHelper('http://123.456.789.012/path')).toBe('http://123.456.789.012/path');
    });

    it('should handle URL with hyphens in domain', () => {
      expect(cleanUrlHelper('http://my-example-site.com/page')).toBe('http://my-example-site.com');
    });

    it('should handle URL with underscores in path', () => {
      expect(cleanUrlHelper('https://example.com/path_with_underscores')).toBe(
        'https://example.com'
      );
    });
  });
});
