/**
 * Returns the hostname variants used for Chrome's declarativeNetRequest rules.
 * The returned list always contains the hostname without the `www.` prefix and,
 * if that variant differs, the same hostname with the `www.` prefix.
 * @param value - A URL or hostname to normalize.
 * @returns An array with the cleaned hostname and optionally its `www.` variant.
 */
export const buildRequestDomainVariants = (value: string): string[] => {
  if (!value) {
    return [];
  }

  const normalizedValue = value.trim();
  if (!normalizedValue) {
    return [];
  }

  const candidate = /^https?:\/\//i.test(normalizedValue)
    ? normalizedValue
    : `https://${normalizedValue}`;
  let hostname: string;

  try {
    hostname = new URL(candidate).hostname.toLowerCase();
  } catch {
    hostname = normalizedValue
      .replace(/^https?:\/\//i, '')
      .split('/')[0]
      .toLowerCase();
  }

  const cleanDomain = hostname.replace(/^www\./, '');
  if (!cleanDomain) {
    return [];
  }

  const variants = [cleanDomain, `www.${cleanDomain}`].filter(Boolean);
  const uniqueVariants = Array.from(new Set(variants));
  return uniqueVariants;
};
