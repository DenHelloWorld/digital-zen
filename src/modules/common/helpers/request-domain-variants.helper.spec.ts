import { buildRequestDomainVariants } from './request-domain-variants.helper';

describe('buildRequestDomainVariants', () => {
  it('returns both clean and www variants for https://www.example.com', () => {
    expect(buildRequestDomainVariants('https://www.example.com')).toEqual([
      'example.com',
      'www.example.com',
    ]);
  });

  it('still produces the www variant when passed a bare hostname', () => {
    expect(buildRequestDomainVariants('example.com')).toEqual(['example.com', 'www.example.com']);
  });

  it('returns an empty array for empty inputs', () => {
    expect(buildRequestDomainVariants('')).toEqual([]);
    expect(buildRequestDomainVariants('   ')).toEqual([]);
  });
});
