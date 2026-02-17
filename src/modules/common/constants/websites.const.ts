import { FaviconHelper } from '../helpers/favicon.helper';
import { IFocus } from '../models/focus.model';
import { ICONS } from './icons.const';

/**
 * Website constants for Digital Zen Chrome Extension
 * Contains definitions of popular websites and social media platforms
 */

export const WEBSITE_X: Readonly<IFocus.WebSite> = {
  id: 'x',
  name: 'X',
  description: 'X',
  url: 'https://x.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://x.com'),
  iconUrl: ICONS.X,
  type: IFocus.EWebSiteType.SOCIAL_MEDIA,
  isActivated: true,
};

export const WEBSITE_INST: Readonly<IFocus.WebSite> = {
  id: 'instagram',
  name: 'Instagram',
  description: 'Instagram',
  url: 'https://www.instagram.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://www.instagram.com'),
  iconUrl: ICONS.INSTAGRAM,
  type: IFocus.EWebSiteType.SOCIAL_MEDIA,
  isActivated: true,
};

export const WEBSITE_FACEBOOK: Readonly<IFocus.WebSite> = {
  id: 'facebook',
  name: 'Facebook',
  description: 'Facebook',
  url: 'https://facebook.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://facebook.com'),
  iconUrl: ICONS.FACEBOOK,
  type: IFocus.EWebSiteType.SOCIAL_MEDIA,
  isActivated: true,
};

export const WEBSITE_TIKTOK: Readonly<IFocus.WebSite> = {
  id: 'tiktok',
  name: 'TikTok',
  description: 'TikTok',
  url: 'https://tiktok.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://tiktok.com'),
  iconUrl: ICONS.TIKTOK,
  type: IFocus.EWebSiteType.SOCIAL_MEDIA,
  isActivated: true,
};

export const WEBSITE_VK: Readonly<IFocus.WebSite> = {
  id: 'vk',
  name: 'VK',
  description: 'ВКонтакте',
  url: 'https://vk.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://vk.com'),
  iconUrl: ICONS.VK,
  type: IFocus.EWebSiteType.SOCIAL_MEDIA,
  isActivated: true,
};

export const WEBSITE_SNAPCHAT: Readonly<IFocus.WebSite> = {
  id: 'snapchat',
  name: 'Snapchat',
  description: 'Snapchat',
  url: 'https://snapchat.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://snapchat.com'),
  iconUrl: ICONS.SNAPCHAT,
  type: IFocus.EWebSiteType.SOCIAL_MEDIA,
  isActivated: true,
};

export const WEBSITE_LINKEDIN: Readonly<IFocus.WebSite> = {
  id: 'linkedin',
  name: 'LinkedIn',
  description: 'LinkedIn',
  url: 'https://linkedin.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://linkedin.com'),
  iconUrl: ICONS.LINKEDIN,
  type: IFocus.EWebSiteType.SOCIAL_MEDIA,
  isActivated: true,
};

export const WEBSITE_PINTEREST: Readonly<IFocus.WebSite> = {
  id: 'pinterest',
  name: 'Pinterest',
  description: 'Pinterest',
  url: 'https://pinterest.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://pinterest.com'),
  iconUrl: ICONS.PINTEREST,
  type: IFocus.EWebSiteType.SOCIAL_MEDIA,
  isActivated: true,
};

export const WEBSITE_YOUTUBE: Readonly<IFocus.WebSite> = {
  id: 'youtube',
  name: 'YouTube',
  description: 'YouTube',
  url: 'https://youtube.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://youtube.com'),
  iconUrl: ICONS.YOUTUBE,
  type: IFocus.EWebSiteType.SOCIAL_MEDIA,
  isActivated: true,
};

export const WEBSITE_REDDIT: Readonly<IFocus.WebSite> = {
  id: 'reddit',
  name: 'Reddit',
  description: 'Reddit',
  url: 'https://reddit.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://reddit.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.SOCIAL_MEDIA,
  isActivated: true,
};

export const WEBSITE_DISCORD: Readonly<IFocus.WebSite> = {
  id: 'discord',
  name: 'Discord',
  description: 'Discord',
  url: 'https://discord.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://discord.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.SOCIAL_MEDIA,
  isActivated: true,
};

export const WEBSITE_TWITCH: Readonly<IFocus.WebSite> = {
  id: 'twitch',
  name: 'Twitch',
  description: 'Twitch',
  url: 'https://twitch.tv',
  imageUrl: FaviconHelper.getGoogleUrl('https://twitch.tv'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.SOCIAL_MEDIA,
  isActivated: true,
};

export const WEBSITE_THREADS: Readonly<IFocus.WebSite> = {
  id: 'threads',
  name: 'Threads',
  description: 'Threads',
  url: 'https://threads.net',
  imageUrl: FaviconHelper.getGoogleUrl('https://threads.net'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.SOCIAL_MEDIA,
  isActivated: true,
};

export const WEBSITE_BLUESKY: Readonly<IFocus.WebSite> = {
  id: 'bluesky',
  name: 'Bluesky',
  description: 'Bluesky',
  url: 'https://bsky.app',
  imageUrl: FaviconHelper.getGoogleUrl('https://bsky.app'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.SOCIAL_MEDIA,
  isActivated: true,
};

export const WEBSITE_MASTODON: Readonly<IFocus.WebSite> = {
  id: 'mastodon',
  name: 'Mastodon',
  description: 'Mastodon',
  url: 'https://mastodon.social',
  imageUrl: FaviconHelper.getGoogleUrl('https://mastodon.social'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.SOCIAL_MEDIA,
  isActivated: true,
};

export const WEBSITE_TUMBLR: Readonly<IFocus.WebSite> = {
  id: 'tumblr',
  name: 'Tumblr',
  description: 'Tumblr',
  url: 'https://tumblr.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://tumblr.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.SOCIAL_MEDIA,
  isActivated: true,
};

export const WEBSITE_CHATGPT: Readonly<IFocus.WebSite> = {
  id: 'chatgpt',
  name: 'ChatGPT',
  description: 'ChatGPT',
  url: 'https://chatgpt.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://chatgpt.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.AI,
  isActivated: true,
};

export const WEBSITE_CLAUDE: Readonly<IFocus.WebSite> = {
  id: 'claude',
  name: 'Claude',
  description: 'Claude AI',
  url: 'https://claude.ai',
  imageUrl: FaviconHelper.getGoogleUrl('https://claude.ai'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.AI,
  isActivated: true,
};

export const WEBSITE_GEMINI: Readonly<IFocus.WebSite> = {
  id: 'gemini',
  name: 'Gemini',
  description: 'Gemini AI',
  url: 'https://gemini.google.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://gemini.google.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.AI,
  isActivated: true,
};

export const WEBSITE_BING_CHAT: Readonly<IFocus.WebSite> = {
  id: 'bing-chat',
  name: 'Bing Chat',
  description: 'Bing AI Chat',
  url: 'https://bing.com/chat',
  imageUrl: FaviconHelper.getGoogleUrl('https://bing.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.AI,
  isActivated: true,
};

export const WEBSITE_GROK: Readonly<IFocus.WebSite> = {
  id: 'grok',
  name: 'Grok',
  description: 'Grok AI',
  url: 'https://x.ai',
  imageUrl: FaviconHelper.getGoogleUrl('https://x.ai'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.AI,
  isActivated: true,
};

export const WEBSITE_PERPLEXITY: Readonly<IFocus.WebSite> = {
  id: 'perplexity',
  name: 'Perplexity',
  description: 'Perplexity AI',
  url: 'https://perplexity.ai',
  imageUrl: FaviconHelper.getGoogleUrl('https://perplexity.ai'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.AI,
  isActivated: true,
};

export const WEBSITE_GITHUB_COPILOT: Readonly<IFocus.WebSite> = {
  id: 'github-copilot',
  name: 'GitHub Copilot',
  description: 'GitHub Copilot',
  url: 'https://github.com/features/copilot',
  imageUrl: FaviconHelper.getGoogleUrl('https://github.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.AI,
  isActivated: true,
};

export const WEBSITE_MIDJOURNEY: Readonly<IFocus.WebSite> = {
  id: 'midjourney',
  name: 'Midjourney',
  description: 'Midjourney AI',
  url: 'https://midjourney.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://midjourney.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.AI,
  isActivated: true,
};

export const WEBSITE_POE: Readonly<IFocus.WebSite> = {
  id: 'poe',
  name: 'Poe',
  description: 'Poe AI',
  url: 'https://poe.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://poe.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.AI,
  isActivated: true,
};

export const WEBSITE_NETFLIX: Readonly<IFocus.WebSite> = {
  id: 'netflix',
  name: 'Netflix',
  description: 'Netflix',
  url: 'https://netflix.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://netflix.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.ENTERTAINMENT,
  isActivated: true,
};

export const WEBSITE_SPOTIFY: Readonly<IFocus.WebSite> = {
  id: 'spotify',
  name: 'Spotify',
  description: 'Spotify',
  url: 'https://spotify.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://spotify.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.ENTERTAINMENT,
  isActivated: true,
};

export const WEBSITE_HULU: Readonly<IFocus.WebSite> = {
  id: 'hulu',
  name: 'Hulu',
  description: 'Hulu',
  url: 'https://hulu.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://hulu.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.ENTERTAINMENT,
  isActivated: true,
};

export const WEBSITE_DISNEY_PLUS: Readonly<IFocus.WebSite> = {
  id: 'disney-plus',
  name: 'Disney+',
  description: 'Disney+',
  url: 'https://disneyplus.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://disneyplus.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.ENTERTAINMENT,
  isActivated: true,
};

export const WEBSITE_PRIME_VIDEO: Readonly<IFocus.WebSite> = {
  id: 'prime-video',
  name: 'Prime Video',
  description: 'Prime Video',
  url: 'https://primevideo.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://primevideo.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.ENTERTAINMENT,
  isActivated: true,
};

export const WEBSITE_HBO_MAX: Readonly<IFocus.WebSite> = {
  id: 'hbo-max',
  name: 'HBO Max',
  description: 'HBO Max',
  url: 'https://hbomax.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://hbomax.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.ENTERTAINMENT,
  isActivated: true,
};

export const WEBSITE_PARAMOUNT_PLUS: Readonly<IFocus.WebSite> = {
  id: 'paramount-plus',
  name: 'Paramount+',
  description: 'Paramount+',
  url: 'https://paramountplus.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://paramountplus.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.ENTERTAINMENT,
  isActivated: true,
};

export const WEBSITE_STEAM: Readonly<IFocus.WebSite> = {
  id: 'steam',
  name: 'Steam',
  description: 'Steam Store & Community',
  url: 'https://store.steampowered.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://steampowered.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.ENTERTAINMENT,
  isActivated: true,
};

export const WEBSITE_9GAG: Readonly<IFocus.WebSite> = {
  id: '9gag',
  name: '9GAG',
  description: '9GAG',
  url: 'https://9gag.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://9gag.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.ENTERTAINMENT,
  isActivated: true,
};

export const WEBSITE_AMAZON: Readonly<IFocus.WebSite> = {
  id: 'amazon',
  name: 'Amazon',
  description: 'Amazon',
  url: 'https://amazon.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://amazon.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.SHOPPING,
  isActivated: true,
};

export const WEBSITE_ALIEXPRESS: Readonly<IFocus.WebSite> = {
  id: 'aliexpress',
  name: 'AliExpress',
  description: 'AliExpress',
  url: 'https://aliexpress.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://aliexpress.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.SHOPPING,
  isActivated: true,
};

export const WEBSITE_EBAY: Readonly<IFocus.WebSite> = {
  id: 'ebay',
  name: 'eBay',
  description: 'eBay',
  url: 'https://ebay.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://ebay.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.SHOPPING,
  isActivated: true,
};

export const WEBSITE_MEDIUM: Readonly<IFocus.WebSite> = {
  id: 'medium',
  name: 'Medium',
  description: 'Medium',
  url: 'https://medium.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://medium.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.NEWS,
  isActivated: true,
};

export const WEBSITE_QUORA: Readonly<IFocus.WebSite> = {
  id: 'quora',
  name: 'Quora',
  description: 'Quora',
  url: 'https://quora.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://quora.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.NEWS,
  isActivated: true,
};

export const WEBSITE_WIKIPEDIA: Readonly<IFocus.WebSite> = {
  id: 'wikipedia',
  name: 'Wikipedia',
  description: 'Wikipedia',
  url: 'https://wikipedia.org',
  imageUrl: FaviconHelper.getGoogleUrl('https://wikipedia.org'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.NEWS,
  isActivated: true,
};

export const WEBSITE_BBC: Readonly<IFocus.WebSite> = {
  id: 'bbc',
  name: 'BBC',
  description: 'BBC',
  url: 'https://bbc.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://bbc.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.NEWS,
  isActivated: true,
};

export const WEBSITE_CNN: Readonly<IFocus.WebSite> = {
  id: 'cnn',
  name: 'CNN',
  description: 'CNN',
  url: 'https://cnn.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://cnn.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.NEWS,
  isActivated: true,
};

export const WEBSITE_REUTERS: Readonly<IFocus.WebSite> = {
  id: 'reuters',
  name: 'Reuters',
  description: 'Reuters',
  url: 'https://reuters.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://reuters.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.NEWS,
  isActivated: true,
};

export const WEBSITE_COURSERA: Readonly<IFocus.WebSite> = {
  id: 'coursera',
  name: 'Coursera',
  description: 'Coursera',
  url: 'https://coursera.org',
  imageUrl: FaviconHelper.getGoogleUrl('https://coursera.org'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.EDUCATION,
  isActivated: true,
};

export const WEBSITE_UDEMY: Readonly<IFocus.WebSite> = {
  id: 'udemy',
  name: 'Udemy',
  description: 'Udemy',
  url: 'https://udemy.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://udemy.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.EDUCATION,
  isActivated: true,
};

export const WEBSITE_KHAN_ACADEMY: Readonly<IFocus.WebSite> = {
  id: 'khan-academy',
  name: 'Khan Academy',
  description: 'Khan Academy',
  url: 'https://khanacademy.org',
  imageUrl: FaviconHelper.getGoogleUrl('https://khanacademy.org'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.EDUCATION,
  isActivated: true,
};

export const WEBSITE_STACK_OVERFLOW: Readonly<IFocus.WebSite> = {
  id: 'stack-overflow',
  name: 'Stack Overflow',
  description: 'Stack Overflow',
  url: 'https://stackoverflow.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://stackoverflow.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.WORK_DEVELOPMENT,
  isActivated: true,
};

export const WEBSITE_HACKER_NEWS: Readonly<IFocus.WebSite> = {
  id: 'hacker-news',
  name: 'Hacker News',
  description: 'Hacker News',
  url: 'https://news.ycombinator.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://ycombinator.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.WORK_DEVELOPMENT,
  isActivated: true,
};

export const WEBSITE_HABR: Readonly<IFocus.WebSite> = {
  id: 'habr',
  name: 'Habr',
  description: 'Habr',
  url: 'https://habr.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://habr.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.WORK_DEVELOPMENT,
  isActivated: true,
};
/**
 * Array of all social media websites
 */
export const WEBSITES_SOCIAL_MEDIA: Readonly<readonly IFocus.WebSite[]> = Object.freeze([
  WEBSITE_X,
  WEBSITE_INST,
  WEBSITE_FACEBOOK,
  WEBSITE_PINTEREST,
  WEBSITE_LINKEDIN,
  WEBSITE_SNAPCHAT,
  WEBSITE_VK,
  WEBSITE_TIKTOK,
  WEBSITE_YOUTUBE,
  WEBSITE_REDDIT,
  WEBSITE_DISCORD,
  WEBSITE_TWITCH,
  WEBSITE_THREADS,
  WEBSITE_BLUESKY,
  WEBSITE_MASTODON,
  WEBSITE_TUMBLR,
]);

export const WEBSITES_AI: Readonly<readonly IFocus.WebSite[]> = Object.freeze([
  WEBSITE_CHATGPT,
  WEBSITE_CLAUDE,
  WEBSITE_GEMINI,
  WEBSITE_BING_CHAT,
  WEBSITE_GROK,
  WEBSITE_PERPLEXITY,
  WEBSITE_GITHUB_COPILOT,
  WEBSITE_MIDJOURNEY,
  WEBSITE_POE,
]);

export const WEBSITES_ENTERTAINMENT: Readonly<readonly IFocus.WebSite[]> = Object.freeze([
  WEBSITE_NETFLIX,
  WEBSITE_SPOTIFY,
  WEBSITE_HULU,
  WEBSITE_DISNEY_PLUS,
  WEBSITE_PRIME_VIDEO,
  WEBSITE_HBO_MAX,
  WEBSITE_PARAMOUNT_PLUS,
  WEBSITE_STEAM,
  WEBSITE_9GAG,
]);

export const WEBSITES_SHOPPING: Readonly<readonly IFocus.WebSite[]> = Object.freeze([
  WEBSITE_AMAZON,
  WEBSITE_ALIEXPRESS,
  WEBSITE_EBAY,
]);

export const WEBSITES_NEWS: Readonly<readonly IFocus.WebSite[]> = Object.freeze([
  WEBSITE_MEDIUM,
  WEBSITE_QUORA,
  WEBSITE_WIKIPEDIA,
  WEBSITE_BBC,
  WEBSITE_CNN,
  WEBSITE_REUTERS,
]);

export const WEBSITES_EDUCATION: Readonly<readonly IFocus.WebSite[]> = Object.freeze([
  WEBSITE_COURSERA,
  WEBSITE_UDEMY,
  WEBSITE_KHAN_ACADEMY,
]);

export const WEBSITES_WORK_DEVELOPMENT: Readonly<readonly IFocus.WebSite[]> = Object.freeze([
  WEBSITE_STACK_OVERFLOW,
  WEBSITE_HACKER_NEWS,
  WEBSITE_HABR,
]);

/**
 * Unblockable website links for Digital Zen Chrome Extension
 * These links are never blockable and always accessible
 */
export const WEBSITE_PRIVACY_POLICY: Readonly<IFocus.WebSite> = {
  id: 'privacy-policy',
  name: 'Privacy Policy',
  description: 'Digital Zen Privacy Policy',
  url: 'https://digital-zen.csmpoint.com/api/privacy-policy.php',
  imageUrl: '',
  iconUrl: ICONS.PRIVACY_TIP,
  type: IFocus.EWebSiteType.UNBLOCKABLE,
  isActivated: false,
};

/**
 * Array of all unblockable websites
 * These websites should never be blocked by the extension
 */
export const WEBSITES_UNBLOCKABLE: Readonly<readonly IFocus.WebSite[]> = Object.freeze([
  WEBSITE_PRIVACY_POLICY,
]);

export const ALL_PRESET_WEBSITES: Record<IFocus.IWebSiteType, readonly IFocus.WebSite[]> =
  Object.freeze({
    [IFocus.EWebSiteType.FROM_CURRENT_PERIOD]: [],
    [IFocus.EWebSiteType.AI]: WEBSITES_AI,
    [IFocus.EWebSiteType.EDUCATION]: WEBSITES_EDUCATION,
    [IFocus.EWebSiteType.SOCIAL_MEDIA]: WEBSITES_SOCIAL_MEDIA,
    [IFocus.EWebSiteType.ENTERTAINMENT]: WEBSITES_ENTERTAINMENT,
    [IFocus.EWebSiteType.SHOPPING]: WEBSITES_SHOPPING,
    [IFocus.EWebSiteType.NEWS]: WEBSITES_NEWS,
    [IFocus.EWebSiteType.WORK_DEVELOPMENT]: WEBSITES_WORK_DEVELOPMENT,
    [IFocus.EWebSiteType.DEFAULT]: [],
    [IFocus.EWebSiteType.UNBLOCKABLE]: WEBSITES_UNBLOCKABLE,
  });
