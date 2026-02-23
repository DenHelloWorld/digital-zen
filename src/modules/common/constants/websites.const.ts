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
  url: 'https://instagram.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://instagram.com'),
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
  url: 'https://threads.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://threads.com'),
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
  url: 'https://copilot.microsoft.com/',
  imageUrl: FaviconHelper.getGoogleUrl('https://copilot.microsoft.com/'),
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
  url: 'https://open.spotify.com/',
  imageUrl: FaviconHelper.getGoogleUrl('https://open.spotify.com/'),
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
  imageUrl: FaviconHelper.getGoogleUrl('https://store.steampowered.com'),
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
  url: 'https://edition.cnn.com/',
  imageUrl: FaviconHelper.getGoogleUrl('https://edition.cnn.com/'),
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

export const WEBSITE_NOTION: Readonly<IFocus.WebSite> = {
  id: 'notion',
  name: 'Notion',
  description: 'Notion',
  url: 'https://notion.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://notion.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.WORK_DEVELOPMENT,
  isActivated: true,
};

export const WEBSITE_MIRO: Readonly<IFocus.WebSite> = {
  id: 'miro',
  name: 'Miro',
  description: 'Miro',
  url: 'https://miro.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://miro.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.WORK_DEVELOPMENT,
  isActivated: true,
};

// --- COMMUNICATION ---
export const WEBSITE_GMAIL: Readonly<IFocus.WebSite> = {
  id: 'gmail',
  name: 'Gmail',
  description: 'Google Mail',
  url: 'https://mail.google.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://mail.google.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.COMMUNICATION,
  isActivated: true,
};

export const WEBSITE_OUTLOOK: Readonly<IFocus.WebSite> = {
  id: 'outlook',
  name: 'Outlook',
  description: 'Microsoft Outlook',
  url: 'https://outlook.live.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://outlook.live.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.COMMUNICATION,
  isActivated: true,
};

export const WEBSITE_SLACK: Readonly<IFocus.WebSite> = {
  id: 'slack',
  name: 'Slack',
  description: 'Slack Web',
  url: 'https://app.slack.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://slack.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.COMMUNICATION,
  isActivated: true,
};

export const WEBSITE_TELEGRAM: Readonly<IFocus.WebSite> = {
  id: 'telegram',
  name: 'Telegram',
  description: 'Telegram Web',
  url: 'https://web.telegram.org',
  imageUrl: FaviconHelper.getGoogleUrl('https://telegram.org'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.COMMUNICATION,
  isActivated: true,
};

// --- FINANCE & CRYPTO ---
export const WEBSITE_BINANCE: Readonly<IFocus.WebSite> = {
  id: 'binance',
  name: 'Binance',
  description: 'Binance Exchange',
  url: 'https://binance.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://binance.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.FINANCE_CRYPTO,
  isActivated: true,
};

export const WEBSITE_TRADINGVIEW: Readonly<IFocus.WebSite> = {
  id: 'tradingview',
  name: 'TradingView',
  description: 'Trading Charts',
  url: 'https://tradingview.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://tradingview.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.FINANCE_CRYPTO,
  isActivated: true,
};

export const WEBSITE_COINMARKETCAP: Readonly<IFocus.WebSite> = {
  id: 'coinmarketcap',
  name: 'CoinMarketCap',
  description: 'Crypto Prices',
  url: 'https://coinmarketcap.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://coinmarketcap.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.FINANCE_CRYPTO,
  isActivated: true,
};

// --- HEALTH & FITNESS ---
export const WEBSITE_MYFITNESSPAL: Readonly<IFocus.WebSite> = {
  id: 'myfitnesspal',
  name: 'MyFitnessPal',
  description: 'Calorie Counter',
  url: 'https://myfitnesspal.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://myfitnesspal.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.HEALTH_FITNESS,
  isActivated: true,
};

export const WEBSITE_STRAVA: Readonly<IFocus.WebSite> = {
  id: 'strava',
  name: 'Strava',
  description: 'Strava Activity',
  url: 'https://strava.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://strava.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.HEALTH_FITNESS,
  isActivated: true,
};

// --- ADULT ---
export const WEBSITE_PORNHUB: Readonly<IFocus.WebSite> = {
  id: 'pornhub',
  name: 'Pornhub',
  description: 'Pornhub',
  url: 'https://pornhub.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://pornhub.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.ADULT,
  isActivated: true,
};

export const WEBSITE_XNXX: Readonly<IFocus.WebSite> = {
  id: 'xnxx',
  name: 'XNXX',
  description: 'XNXX',
  url: 'https://xnxx.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://xnxx.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.ADULT,
  isActivated: true,
};

export const WEBSITE_DUOLINGO: Readonly<IFocus.WebSite> = {
  id: 'duolingo',
  name: 'Duolingo',
  description: 'Language Learning',
  url: 'https://duolingo.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://duolingo.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.EDUCATION,
  isActivated: true,
};

export const WEBSITE_EDX: Readonly<IFocus.WebSite> = {
  id: 'edx',
  name: 'edX',
  description: 'University Courses',
  url: 'https://edx.org',
  imageUrl: FaviconHelper.getGoogleUrl('https://edx.org'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.EDUCATION,
  isActivated: true,
};

export const WEBSITE_ETSY: Readonly<IFocus.WebSite> = {
  id: 'etsy',
  name: 'Etsy',
  description: 'Handmade & Vintage',
  url: 'https://etsy.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://etsy.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.SHOPPING,
  isActivated: true,
};

export const WEBSITE_TEMU: Readonly<IFocus.WebSite> = {
  id: 'temu',
  name: 'Temu',
  description: 'Temu Shopping',
  url: 'https://temu.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://temu.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.SHOPPING,
  isActivated: true,
};

export const WEBSITE_XVIDEOS: Readonly<IFocus.WebSite> = {
  id: 'xvideos',
  name: 'XVideos',
  description: 'XVideos',
  url: 'https://xvideos.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://xvideos.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.ADULT,
  isActivated: true,
};

export const WEBSITE_XHAMSTER: Readonly<IFocus.WebSite> = {
  id: 'xhamster',
  name: 'xHamster',
  description: 'xHamster',
  url: 'https://xhamster.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://xhamster.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.ADULT,
  isActivated: true,
};

export const WEBSITE_CHATURBATE: Readonly<IFocus.WebSite> = {
  id: 'chaturbate',
  name: 'Chaturbate',
  description: 'Chaturbate Live',
  url: 'https://chaturbate.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://chaturbate.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.ADULT,
  isActivated: true,
};

export const WEBSITE_FITBIT: Readonly<IFocus.WebSite> = {
  id: 'fitbit',
  name: 'Fitbit',
  description: 'Activity Tracking',
  url: 'https://www.fitbit.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://fitbit.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.HEALTH_FITNESS,
  isActivated: true,
};

export const WEBSITE_NIKE_TRAINING: Readonly<IFocus.WebSite> = {
  id: 'nike-training',
  name: 'Nike Training',
  description: 'Fitness & Workouts',
  url: 'https://www.nike.com/ntc-app',
  imageUrl: FaviconHelper.getGoogleUrl('https://nike.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.HEALTH_FITNESS,
  isActivated: true,
};

export const WEBSITE_HEALTHLINE: Readonly<IFocus.WebSite> = {
  id: 'healthline',
  name: 'Healthline',
  description: 'Health Information',
  url: 'https://www.healthline.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://healthline.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.HEALTH_FITNESS,
  isActivated: true,
};

export const WEBSITE_COINBASE: Readonly<IFocus.WebSite> = {
  id: 'coinbase',
  name: 'Coinbase',
  description: 'Crypto Exchange',
  url: 'https://www.coinbase.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://coinbase.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.FINANCE_CRYPTO,
  isActivated: true,
};

export const WEBSITE_YAHOO_FINANCE: Readonly<IFocus.WebSite> = {
  id: 'yahoo-finance',
  name: 'Yahoo Finance',
  description: 'Stock Market & News',
  url: 'https://finance.yahoo.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://finance.yahoo.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.FINANCE_CRYPTO,
  isActivated: true,
};

export const WEBSITE_WHATSAPP: Readonly<IFocus.WebSite> = {
  id: 'whatsapp',
  name: 'WhatsApp',
  description: 'WhatsApp Web',
  url: 'https://web.whatsapp.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://whatsapp.com'),
  iconUrl: ICONS.GLOBE,
  type: IFocus.EWebSiteType.COMMUNICATION,
  isActivated: true,
};

export const WEBSITES_COMMUNICATION: Readonly<readonly IFocus.WebSite[]> = Object.freeze([
  WEBSITE_GMAIL,
  WEBSITE_OUTLOOK,
  WEBSITE_TELEGRAM,
  WEBSITE_SLACK,
  WEBSITE_WHATSAPP,
]);

export const WEBSITES_FINANCE_CRYPTO: Readonly<readonly IFocus.WebSite[]> = Object.freeze([
  WEBSITE_BINANCE,
  WEBSITE_TRADINGVIEW,
  WEBSITE_COINMARKETCAP,
  WEBSITE_COINBASE,
  WEBSITE_YAHOO_FINANCE,
]);

export const WEBSITES_HEALTH_FITNESS: Readonly<readonly IFocus.WebSite[]> = Object.freeze([
  WEBSITE_MYFITNESSPAL,
  WEBSITE_STRAVA,
  WEBSITE_FITBIT,
  WEBSITE_NIKE_TRAINING,
  WEBSITE_HEALTHLINE,
]);
export const WEBSITES_ADULT: Readonly<readonly IFocus.WebSite[]> = Object.freeze([
  WEBSITE_PORNHUB,
  WEBSITE_XNXX,
  WEBSITE_XVIDEOS,
  WEBSITE_XHAMSTER,
  WEBSITE_CHATURBATE,
]);

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
  WEBSITE_ETSY,
  WEBSITE_TEMU,
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
  WEBSITE_DUOLINGO,
  WEBSITE_EDX,
]);

export const WEBSITES_WORK_DEVELOPMENT: Readonly<readonly IFocus.WebSite[]> = Object.freeze([
  WEBSITE_STACK_OVERFLOW,
  WEBSITE_HACKER_NEWS,
  WEBSITE_HABR,
  WEBSITE_NOTION,
  WEBSITE_MIRO,
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

export const WEBSITES_LIBRARY_PRESET: Record<string, readonly IFocus.WebSite[]> = Object.freeze({
  [IFocus.EWebSiteType.DEFAULT]: [],
  [IFocus.EWebSiteType.AI]: WEBSITES_AI,
  [IFocus.EWebSiteType.WORK_DEVELOPMENT]: WEBSITES_WORK_DEVELOPMENT,
  [IFocus.EWebSiteType.EDUCATION]: WEBSITES_EDUCATION,
  [IFocus.EWebSiteType.FINANCE_CRYPTO]: WEBSITES_FINANCE_CRYPTO,
  [IFocus.EWebSiteType.HEALTH_FITNESS]: WEBSITES_HEALTH_FITNESS,
  [IFocus.EWebSiteType.COMMUNICATION]: WEBSITES_COMMUNICATION,
  [IFocus.EWebSiteType.SOCIAL_MEDIA]: WEBSITES_SOCIAL_MEDIA,
  [IFocus.EWebSiteType.ENTERTAINMENT]: WEBSITES_ENTERTAINMENT,
  [IFocus.EWebSiteType.SHOPPING]: WEBSITES_SHOPPING,
  [IFocus.EWebSiteType.NEWS]: WEBSITES_NEWS,
  [IFocus.EWebSiteType.ADULT]: WEBSITES_ADULT,
  [IFocus.EWebSiteType.UNBLOCKABLE]: WEBSITES_UNBLOCKABLE,
  [IFocus.EWebSiteType.DELETE]: [],
});

export const FOLDER_EMOJI_COLLECTION: readonly string[] = Object.freeze([
  '🎯',
  '🚀',
  '💻',
  '📈',
  '🛠️',
  '📅',
  '📝',

  '📚',
  '🎓',
  '🧠',
  '💡',
  '🧪',
  '🌍',

  '💬',
  '📱',
  '👥',
  '💌',
  '📢',

  '💰',
  '💳',
  '📊',
  '💎',

  '🎮',
  '🎬',
  '🎧',
  '🎨',
  '📸',
  '🍿',
  '✏️',

  '🍏',
  '💪',
  '🧘',
  '🏃',
  '🚴',

  '🛍️',
  '🛒',
  '📦',

  '✈️',
  '🏝️',
  '☕',
  '🍕',

  '🔒',
  '🛡️',
  '⚙️',
  '⚡',
  '🔌',

  '🔞',
  '🍷',
  '🚬',
  '🍕',

  '📁',
  '📂',
  '✨',
  '🔥',
  '⭐',
]);
