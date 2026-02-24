import { IFocus } from '../models/focus.model';
import { cleanUrlHelper } from './clean-url.helper';
import { buildRequestDomainVariants } from './request-domain-variants.helper';

export const getUniqueWebsitesHelper = (sites: IFocus.WebSite[]): IFocus.WebSite[] => {
  const uniqueMap = new Map<string, IFocus.WebSite>();

  sites.forEach(site => {
    if (!site.url) return;

    const variants = buildRequestDomainVariants(site.url);
    const baseDomain = variants[0];

    if (baseDomain && !uniqueMap.has(baseDomain)) {
      uniqueMap.set(baseDomain, {
        ...site,
        url: cleanUrlHelper(site.url),
      });
    }
  });

  return Array.from(uniqueMap.values());
};
