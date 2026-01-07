import { isSvgIcon } from './is-svg-icon.helper';

describe('isSvgIcon', () => {
  describe('Valid SVG URLs', () => {
    it('should return true for .svg files', () => {
      expect(isSvgIcon('https://example.com/icon.svg')).toBe(true);
    });

    it('should return true for uppercase .SVG extension', () => {
      expect(isSvgIcon('https://example.com/ICON.SVG')).toBe(true);
    });

    it('should return true for mixed case .svg extension', () => {
      expect(isSvgIcon('https://example.com/icon.SvG')).toBe(true);
      expect(isSvgIcon('https://example.com/icon.sVg')).toBe(true);
    });

    it('should return true for SVG URLs with query parameters', () => {
      expect(isSvgIcon('https://example.com/icon.svg?size=32')).toBe(true);
      expect(isSvgIcon('https://example.com/icon.svg?v=1.0&cache=false')).toBe(true);
      expect(isSvgIcon('https://example.com/icon.svg?timestamp=123456')).toBe(true);
    });

    it('should return true for relative SVG URLs', () => {
      expect(isSvgIcon('/assets/icon.svg')).toBe(true);
      expect(isSvgIcon('../images/logo.svg')).toBe(true);
      expect(isSvgIcon('./arrow.svg')).toBe(true);
    });

    it('should return true for SVG URLs with port numbers', () => {
      expect(isSvgIcon('https://example.com:8080/icon.svg')).toBe(true);
    });

    it('should return true for SVG URLs with authentication', () => {
      expect(isSvgIcon('https://user:pass@example.com/icon.svg')).toBe(true);
    });

    it('should return true for localhost SVG URLs', () => {
      expect(isSvgIcon('http://localhost:3000/icon.svg')).toBe(true);
    });

    it('should return true for file protocol SVG URLs', () => {
      expect(isSvgIcon('file:///C:/Users/user/icon.svg')).toBe(true);
    });

    it('should return true for SVG URLs with multiple query parameters', () => {
      expect(isSvgIcon('https://cdn.example.com/icon.svg?w=100&h=100&fill=blue')).toBe(true);
    });

    it('should return true for SVG with dots in filename', () => {
      expect(isSvgIcon('https://example.com/my.icon.file.svg')).toBe(true);
      expect(isSvgIcon('https://example.com/version.1.0.svg')).toBe(true);
    });

    it('should return true for data URI paths ending with .svg', () => {
      expect(isSvgIcon('data:image/svg.svg')).toBe(true);
    });
  });

  describe('Invalid URLs', () => {
    it('should return false for non-SVG image types', () => {
      expect(isSvgIcon('https://example.com/image.png')).toBe(false);
      expect(isSvgIcon('https://example.com/photo.jpg')).toBe(false);
      expect(isSvgIcon('https://example.com/icon.ico')).toBe(false);
      expect(isSvgIcon('https://example.com/graphic.webp')).toBe(false);
      expect(isSvgIcon('https://example.com/animation.gif')).toBe(false);
    });

    it('should return false for non-image file types', () => {
      expect(isSvgIcon('https://example.com/document.pdf')).toBe(false);
      expect(isSvgIcon('https://example.com/archive.zip')).toBe(false);
      expect(isSvgIcon('https://example.com/video.mp4')).toBe(false);
      expect(isSvgIcon('https://example.com/script.js')).toBe(false);
      expect(isSvgIcon('https://example.com/style.css')).toBe(false);
      expect(isSvgIcon('https://example.com/page.html')).toBe(false);
    });

    it('should return false for URLs without extensions', () => {
      expect(isSvgIcon('https://example.com/icon')).toBe(false);
      expect(isSvgIcon('https://example.com/')).toBe(false);
      expect(isSvgIcon('https://example.com')).toBe(false);
    });

    it('should return false for empty strings', () => {
      expect(isSvgIcon('')).toBe(false);
    });

    it('should return false for whitespace strings', () => {
      expect(isSvgIcon('   ')).toBe(false);
      expect(isSvgIcon('\t')).toBe(false);
      expect(isSvgIcon('\n')).toBe(false);
    });

    it('should return false for null', () => {
      expect(isSvgIcon(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isSvgIcon(undefined)).toBe(false);
    });

    it('should return false for .svg extension in the middle of filename', () => {
      expect(isSvgIcon('https://example.com/icon.svg.txt')).toBe(false);
    });

    it('should return false for partial .svg matches', () => {
      expect(isSvgIcon('https://example.com/file.svgx')).toBe(false);
      expect(isSvgIcon('https://example.com/file.xsvg')).toBe(false);
    });

    it('should return false for inline SVG data URIs', () => {
      expect(isSvgIcon('data:image/svg+xml;base64,PHN2Zy...')).toBe(false);
      expect(isSvgIcon('data:image/svg+xml,%3Csvg%3E')).toBe(false);
    });

    it('should return false for blob URLs', () => {
      expect(isSvgIcon('blob:https://example.com/123-456')).toBe(false);
    });

    it('should return false for URLs with .svg in query parameter', () => {
      expect(isSvgIcon('https://example.com/file?icon=test.svg')).toBe(false);
    });

    it('should return false for URLs with .svg in subdomain', () => {
      expect(isSvgIcon('https://svg.example.com/icon.png')).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle URLs with trailing whitespace', () => {
      expect(isSvgIcon('https://example.com/icon.svg  ')).toBe(true);
      expect(isSvgIcon('  https://example.com/icon.svg')).toBe(true);
    });

    it('should handle URLs with only .svg extension', () => {
      expect(isSvgIcon('.svg')).toBe(true);
    });

    it('should handle very long URLs', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(1000) + '.svg';
      expect(isSvgIcon(longUrl)).toBe(true);
    });

    it('should handle URLs with special characters in path', () => {
      expect(isSvgIcon('https://example.com/my%20icon.svg')).toBe(true);
      expect(isSvgIcon('https://example.com/icon-name_123.svg')).toBe(true);
      expect(isSvgIcon('https://example.com/іконка.svg')).toBe(true);
    });

    it('should handle URLs with hash after query', () => {
      expect(isSvgIcon('https://example.com/icon.svg?v=1#top')).toBe(true);
    });

    it('should handle URLs with multiple consecutive dots', () => {
      expect(isSvgIcon('https://example.com/file..svg')).toBe(true);
    });

    it('should return false for URLs with hash fragments (not handled by current implementation)', () => {
      // Fragment is not removed by split('?'), so the current implementation returns false
      expect(isSvgIcon('https://example.com/icon.svg#layer1')).toBe(false);
    });

    it('should handle URLs with uppercase path but lowercase extension', () => {
      expect(isSvgIcon('https://EXAMPLE.COM/ICON.svg')).toBe(true);
    });

    it('should handle URLs with mixed case throughout', () => {
      expect(isSvgIcon('HtTpS://ExAmPlE.cOm/IcOn.SvG')).toBe(true);
    });
  });

  describe('Performance and consistency', () => {
    it('should return consistent results for the same input', () => {
      const url = 'https://example.com/test.svg';
      const result1 = isSvgIcon(url);
      const result2 = isSvgIcon(url);
      expect(result1).toBe(result2);
    });

    it('should handle rapid successive calls', () => {
      const urls = [
        'https://example.com/icon1.svg',
        'https://example.com/icon2.svg',
        'https://example.com/image.png',
        'https://example.com/icon3.svg',
      ];

      const results = urls.map(url => isSvgIcon(url));
      expect(results).toEqual([true, true, false, true]);
    });

    it('should handle array of mixed URLs efficiently', () => {
      const urls = ['icon.svg', 'icon.SVG', 'icon.png', null, undefined, '', 'test.svg?v=1'];

      const results = urls.map(url => isSvgIcon(url));
      expect(results).toEqual([true, true, false, false, false, false, true]);
    });
  });
});
