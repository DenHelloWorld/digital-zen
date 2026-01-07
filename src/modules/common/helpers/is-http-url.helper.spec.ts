import { isHttpUrl } from './is-http-url.helper';

describe('isHttpUrl', () => {
  describe('Valid HTTP/HTTPS URLs', () => {
    it('should return true for http:// URLs', () => {
      expect(isHttpUrl('http://example.com')).toBe(true);
    });

    it('should return true for https:// URLs', () => {
      expect(isHttpUrl('https://example.com')).toBe(true);
    });

    it('should return true for HTTP URLs with paths', () => {
      expect(isHttpUrl('http://example.com/path/to/page')).toBe(true);
      expect(isHttpUrl('https://example.com/api/v1/users')).toBe(true);
    });

    it('should return true for HTTP URLs with query parameters', () => {
      expect(isHttpUrl('http://example.com?param=value')).toBe(true);
      expect(isHttpUrl('https://example.com?q=search&page=1')).toBe(true);
    });

    it('should return true for HTTP URLs with fragments', () => {
      expect(isHttpUrl('http://example.com#section')).toBe(true);
      expect(isHttpUrl('https://example.com/page#top')).toBe(true);
    });

    it('should return true for HTTP URLs with ports', () => {
      expect(isHttpUrl('http://example.com:8080')).toBe(true);
      expect(isHttpUrl('https://example.com:443')).toBe(true);
      expect(isHttpUrl('http://localhost:3000')).toBe(true);
    });

    it('should return true for HTTP URLs with authentication', () => {
      expect(isHttpUrl('http://user:pass@example.com')).toBe(true);
      expect(isHttpUrl('https://admin@example.com')).toBe(true);
    });

    it('should return true for HTTP URLs with subdomains', () => {
      expect(isHttpUrl('http://api.example.com')).toBe(true);
      expect(isHttpUrl('https://www.example.com')).toBe(true);
      expect(isHttpUrl('https://sub1.sub2.example.com')).toBe(true);
    });

    it('should return true for HTTP URLs with IP addresses', () => {
      expect(isHttpUrl('http://192.168.1.1')).toBe(true);
      expect(isHttpUrl('https://127.0.0.1')).toBe(true);
      expect(isHttpUrl('http://10.0.0.1:8080')).toBe(true);
    });

    it('should return true for HTTP URLs with IPv6 addresses', () => {
      expect(isHttpUrl('http://[2001:db8::1]')).toBe(true);
      expect(isHttpUrl('https://[::1]')).toBe(true);
    });

    it('should return true for complex HTTP URLs', () => {
      expect(
        isHttpUrl('https://user:pass@api.example.com:8443/v1/users?id=123&active=true#section')
      ).toBe(true);
    });

    it('should return true for localhost HTTP URLs', () => {
      expect(isHttpUrl('http://localhost')).toBe(true);
      expect(isHttpUrl('http://localhost:3000/app')).toBe(true);
    });

    it('should return true for HTTP URLs with special characters in path', () => {
      expect(isHttpUrl('http://example.com/path%20with%20spaces')).toBe(true);
      expect(isHttpUrl('https://example.com/файл')).toBe(true);
    });
  });

  describe('Invalid URLs', () => {
    it('should return false for non-HTTP protocols', () => {
      expect(isHttpUrl('ftp://example.com')).toBe(false);
      expect(isHttpUrl('file:///path/to/file')).toBe(false);
      expect(isHttpUrl('mailto:user@example.com')).toBe(false);
      expect(isHttpUrl('tel:+1234567890')).toBe(false);
      expect(isHttpUrl('ssh://user@example.com')).toBe(false);
      expect(isHttpUrl('ws://example.com')).toBe(false);
      expect(isHttpUrl('wss://example.com')).toBe(false);
    });

    it('should return false for browser-specific protocols', () => {
      expect(isHttpUrl('about:blank')).toBe(false);
      expect(isHttpUrl('about:config')).toBe(false);
      expect(isHttpUrl('chrome://extensions')).toBe(false);
      expect(isHttpUrl('chrome-extension://abcdef123456')).toBe(false);
      expect(isHttpUrl('data:text/html,<html></html>')).toBe(false);
      expect(isHttpUrl('blob:https://example.com/123-456')).toBe(false);
    });

    it('should return false for relative URLs', () => {
      expect(isHttpUrl('/path/to/page')).toBe(false);
      expect(isHttpUrl('../parent/page')).toBe(false);
      expect(isHttpUrl('./current/page')).toBe(false);
    });

    it('should return false for URLs without protocol', () => {
      expect(isHttpUrl('example.com')).toBe(false);
      expect(isHttpUrl('www.example.com')).toBe(false);
      expect(isHttpUrl('//example.com')).toBe(false);
    });

    it('should return false for empty strings', () => {
      expect(isHttpUrl('')).toBe(false);
    });

    it('should return false for whitespace strings', () => {
      expect(isHttpUrl('   ')).toBe(false);
      expect(isHttpUrl('\t')).toBe(false);
      expect(isHttpUrl('\n')).toBe(false);
    });

    it('should return false for null', () => {
      expect(isHttpUrl(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isHttpUrl(undefined)).toBe(false);
    });

    it('should return false for strings that contain http but do not start with it', () => {
      expect(isHttpUrl('not http://example.com')).toBe(false);
      expect(isHttpUrl('prefix_https://example.com')).toBe(false);
      expect(isHttpUrl('   http://example.com')).toBe(false); // starts with whitespace
    });

    it('should return false for malformed HTTP URLs', () => {
      expect(isHttpUrl('http:/')).toBe(false);
      expect(isHttpUrl('http:/example.com')).toBe(false);
      expect(isHttpUrl('htp://example.com')).toBe(false);
      expect(isHttpUrl('htttp://example.com')).toBe(false);
    });

    it('should return false for case variations that do not match exactly', () => {
      expect(isHttpUrl('HTTP://example.com')).toBe(false);
      expect(isHttpUrl('HTTPS://example.com')).toBe(false);
      expect(isHttpUrl('Http://example.com')).toBe(false);
      expect(isHttpUrl('Https://example.com')).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle URLs with trailing slashes', () => {
      expect(isHttpUrl('http://example.com/')).toBe(true);
      expect(isHttpUrl('https://example.com/path/')).toBe(true);
    });

    it('should handle URLs with multiple slashes in path', () => {
      expect(isHttpUrl('http://example.com//path//to//page')).toBe(true);
    });

    it('should handle very long URLs', () => {
      const longPath = 'a'.repeat(1000);
      expect(isHttpUrl(`http://example.com/${longPath}`)).toBe(true);
      expect(isHttpUrl(`https://example.com/${longPath}`)).toBe(true);
    });

    it('should handle URLs with unusual but valid characters', () => {
      expect(isHttpUrl('http://example.com/~user')).toBe(true);
      expect(isHttpUrl('https://example.com/path$special')).toBe(true);
    });

    it('should handle URLs with international domain names', () => {
      expect(isHttpUrl('http://例え.jp')).toBe(true);
      expect(isHttpUrl('https://münchen.de')).toBe(true);
    });

    it('should handle URLs with empty path after protocol', () => {
      expect(isHttpUrl('http://')).toBe(true);
      expect(isHttpUrl('https://')).toBe(true);
    });

    it('should distinguish http from https correctly', () => {
      expect(isHttpUrl('http://secure.example.com')).toBe(true);
      expect(isHttpUrl('https://not-secure.example.com')).toBe(true);
    });

    it('should handle URLs with multiple @ symbols', () => {
      expect(isHttpUrl('http://user@host@example.com')).toBe(true);
    });

    it('should handle URLs with multiple : symbols in path', () => {
      expect(isHttpUrl('http://example.com/path:with:colons')).toBe(true);
    });

    it('should handle URLs with encoded characters', () => {
      expect(isHttpUrl('http://example.com/%E2%9C%93')).toBe(true);
      expect(isHttpUrl('https://example.com/%20space')).toBe(true);
    });
  });

  describe('Performance and consistency', () => {
    it('should return consistent results for the same input', () => {
      const url = 'https://example.com';
      const result1 = isHttpUrl(url);
      const result2 = isHttpUrl(url);
      expect(result1).toBe(result2);
    });

    it('should handle rapid successive calls', () => {
      const urls = [
        'http://example1.com',
        'https://example2.com',
        'ftp://example3.com',
        'http://example4.com',
      ];

      const results = urls.map(url => isHttpUrl(url));
      expect(results).toEqual([true, true, false, true]);
    });

    it('should handle array of mixed URLs efficiently', () => {
      const urls = [
        'http://test.com',
        'https://test.com',
        null,
        undefined,
        '',
        '/relative',
        'about:blank',
      ];

      const results = urls.map(url => isHttpUrl(url));
      expect(results).toEqual([true, true, false, false, false, false, false]);
    });
  });

  describe('Boundary conditions', () => {
    it('should handle minimum valid HTTP URL', () => {
      expect(isHttpUrl('http://a')).toBe(true);
      expect(isHttpUrl('https://a')).toBe(true);
    });

    it('should handle just the protocol prefix', () => {
      expect(isHttpUrl('http://')).toBe(true);
      expect(isHttpUrl('https://')).toBe(true);
    });

    it('should not match similar but different protocols', () => {
      expect(isHttpUrl('httpx://example.com')).toBe(false);
      expect(isHttpUrl('http2://example.com')).toBe(false);
      expect(isHttpUrl('httpss://example.com')).toBe(false);
    });

    it('should handle URLs with numeric domains', () => {
      expect(isHttpUrl('http://123.456.789.012')).toBe(true);
    });

    it('should handle URLs with hyphens in domain', () => {
      expect(isHttpUrl('http://my-example-site.com')).toBe(true);
      expect(isHttpUrl('https://test-api-v2.example.com')).toBe(true);
    });
  });
});
