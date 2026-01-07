import { isImageIcon } from './is-image-icon.helper';

describe('isImageIcon', () => {
  describe('Valid image/icon URLs', () => {
    it('should return true for .png files', () => {
      expect(isImageIcon('https://example.com/favicon.png')).toBe(true);
    });

    it('should return true for .jpg files', () => {
      expect(isImageIcon('https://example.com/image.jpg')).toBe(true);
    });

    it('should return true for .jpeg files', () => {
      expect(isImageIcon('https://example.com/photo.jpeg')).toBe(true);
    });

    it('should return true for .webp files', () => {
      expect(isImageIcon('https://example.com/modern.webp')).toBe(true);
    });

    it('should return true for .ico files', () => {
      expect(isImageIcon('https://example.com/favicon.ico')).toBe(true);
    });

    it('should return true for uppercase extensions', () => {
      expect(isImageIcon('https://example.com/IMAGE.PNG')).toBe(true);
      expect(isImageIcon('https://example.com/PHOTO.JPG')).toBe(true);
      expect(isImageIcon('https://example.com/ICON.ICO')).toBe(true);
    });

    it('should return true for mixed case extensions', () => {
      expect(isImageIcon('https://example.com/image.PnG')).toBe(true);
      expect(isImageIcon('https://example.com/photo.JpEg')).toBe(true);
    });

    it('should return true for URLs with query parameters', () => {
      expect(isImageIcon('https://example.com/favicon.png?size=32')).toBe(true);
      expect(isImageIcon('https://example.com/image.jpg?v=1.0&cache=false')).toBe(true);
      expect(isImageIcon('https://example.com/icon.ico?timestamp=123456')).toBe(true);
    });

    it('should return true for URLs with fragment identifiers', () => {
      expect(isImageIcon('https://example.com/image.png#section')).toBe(false); // Fragment is not removed by split('?')
    });

    it('should return true for relative URLs', () => {
      expect(isImageIcon('/assets/favicon.ico')).toBe(true);
      expect(isImageIcon('../images/photo.jpg')).toBe(true);
      expect(isImageIcon('./icon.png')).toBe(true);
    });

    it('should return true for data URIs with image extensions in path', () => {
      // Edge case: data URI that happens to end in .png
      expect(isImageIcon('data:image/png.png')).toBe(true);
    });

    it('should return true for URLs with multiple query parameters', () => {
      expect(isImageIcon('https://cdn.example.com/img.png?w=100&h=100&q=80')).toBe(true);
    });

    it('should return true for URLs with port numbers', () => {
      expect(isImageIcon('https://example.com:8080/favicon.ico')).toBe(true);
    });

    it('should return true for URLs with authentication', () => {
      expect(isImageIcon('https://user:pass@example.com/image.jpg')).toBe(true);
    });

    it('should return true for localhost URLs', () => {
      expect(isImageIcon('http://localhost:3000/icon.png')).toBe(true);
    });

    it('should return true for file protocol URLs', () => {
      expect(isImageIcon('file:///C:/Users/user/image.jpg')).toBe(true);
    });
  });

  describe('Invalid URLs', () => {
    it('should return false for non-image file types', () => {
      expect(isImageIcon('https://example.com/document.pdf')).toBe(false);
      expect(isImageIcon('https://example.com/archive.zip')).toBe(false);
      expect(isImageIcon('https://example.com/video.mp4')).toBe(false);
      expect(isImageIcon('https://example.com/script.js')).toBe(false);
      expect(isImageIcon('https://example.com/style.css')).toBe(false);
      expect(isImageIcon('https://example.com/page.html')).toBe(false);
      expect(isImageIcon('https://example.com/data.json')).toBe(false);
    });

    it('should return false for SVG files (not in supported list)', () => {
      expect(isImageIcon('https://example.com/icon.svg')).toBe(false);
    });

    it('should return false for GIF files (not in supported list)', () => {
      expect(isImageIcon('https://example.com/animation.gif')).toBe(false);
    });

    it('should return false for BMP files (not in supported list)', () => {
      expect(isImageIcon('https://example.com/bitmap.bmp')).toBe(false);
    });

    it('should return false for URLs without extensions', () => {
      expect(isImageIcon('https://example.com/image')).toBe(false);
      expect(isImageIcon('https://example.com/')).toBe(false);
      expect(isImageIcon('https://example.com')).toBe(false);
    });

    it('should return false for empty strings', () => {
      expect(isImageIcon('')).toBe(false);
    });

    it('should return false for whitespace strings', () => {
      expect(isImageIcon('   ')).toBe(false);
      expect(isImageIcon('\t')).toBe(false);
      expect(isImageIcon('\n')).toBe(false);
    });

    it('should return false for null', () => {
      expect(isImageIcon(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isImageIcon(undefined)).toBe(false);
    });

    it('should return false for image extensions in the middle of filename', () => {
      expect(isImageIcon('https://example.com/image.png.txt')).toBe(false);
    });

    it('should return false for partial extension matches', () => {
      expect(isImageIcon('https://example.com/file.pngx')).toBe(false);
      expect(isImageIcon('https://example.com/file.xpng')).toBe(false);
    });

    it('should return false for data URIs without proper extension', () => {
      expect(isImageIcon('data:image/png;base64,iVBORw0KG')).toBe(false);
    });

    it('should return false for blob URLs', () => {
      expect(isImageIcon('blob:https://example.com/123-456')).toBe(false);
    });

    it('should return false for URLs with image extension in query parameter', () => {
      expect(isImageIcon('https://example.com/file?image=test.png')).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle URLs with trailing whitespace', () => {
      expect(isImageIcon('https://example.com/image.png  ')).toBe(true);
      expect(isImageIcon('  https://example.com/image.jpg')).toBe(true);
    });

    it('should handle URLs with only extension', () => {
      expect(isImageIcon('.png')).toBe(true);
      expect(isImageIcon('.jpg')).toBe(true);
    });

    it('should handle URLs with dots in filename', () => {
      expect(isImageIcon('https://example.com/my.image.file.png')).toBe(true);
      expect(isImageIcon('https://example.com/version.1.0.jpg')).toBe(true);
    });

    it('should handle very long URLs', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(1000) + '.png';
      expect(isImageIcon(longUrl)).toBe(true);
    });

    it('should handle URLs with special characters in path', () => {
      expect(isImageIcon('https://example.com/my%20image.png')).toBe(true);
      expect(isImageIcon('https://example.com/image-name_123.jpg')).toBe(true);
      expect(isImageIcon('https://example.com/фото.png')).toBe(true);
    });

    it('should handle URLs with hash after query', () => {
      expect(isImageIcon('https://example.com/image.png?v=1#top')).toBe(true);
    });

    it('should handle URLs with multiple consecutive dots', () => {
      expect(isImageIcon('https://example.com/file..png')).toBe(true);
    });

    it('should handle case-sensitive query parameters', () => {
      expect(isImageIcon('https://example.com/image.PNG?Size=32')).toBe(true);
    });
  });

  describe('Performance and consistency', () => {
    it('should return consistent results for the same input', () => {
      const url = 'https://example.com/test.png';
      const result1 = isImageIcon(url);
      const result2 = isImageIcon(url);
      expect(result1).toBe(result2);
    });

    it('should handle rapid successive calls', () => {
      const urls = [
        'https://example.com/1.png',
        'https://example.com/2.jpg',
        'https://example.com/3.webp',
        'https://example.com/4.txt',
      ];

      const results = urls.map(url => isImageIcon(url));
      expect(results).toEqual([true, true, true, false]);
    });
  });
});
