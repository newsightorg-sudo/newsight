import { cache } from 'react';
import { getDb } from './db';
import { 
  Article, Category, Reporter, VideoItem, PhotoStory, PhotoStoryItem, 
  LiveBlog, LiveUpdate, EditorialSettings, CommentItem, NewsletterSubscriber, Show 
} from './types';

// Fast in-memory cache with TTL (Time-To-Live in seconds)
interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const globalForCache = globalThis as unknown as { __newsight_data_cache?: Map<string, CacheEntry<any>> };
if (!globalForCache.__newsight_data_cache) {
  globalForCache.__newsight_data_cache = new Map<string, CacheEntry<any>>();
}
const dataMemoryCache = globalForCache.__newsight_data_cache;

function getFromCache<T>(key: string): T | null {
  const item = dataMemoryCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    dataMemoryCache.delete(key);
    return null;
  }
  return item.data as T;
}

function setToCache<T>(key: string, data: T, ttlSeconds = 120): T {
  dataMemoryCache.set(key, { data, expiry: Date.now() + ttlSeconds * 1000 });
  return data;
}

export function invalidateDataCache(pattern?: string): void {
  if (!pattern) {
    dataMemoryCache.clear();
    return;
  }
  for (const key of dataMemoryCache.keys()) {
    if (key.includes(pattern)) {
      dataMemoryCache.delete(key);
    }
  }
}

// Helper to convert DB objects into standard plain objects for React 19 Client Components
function toPlain<T>(obj: T): T {
  if (!obj) return obj;
  return JSON.parse(JSON.stringify(obj));
}

// Helper to map DB row to Article object
function mapArticleRow(row: any): Article {
  const plain = toPlain(row);
  return {
    ...plain,
    is_breaking: Number(plain.is_breaking),
    is_lead: Number(plain.is_lead),
    is_featured: Number(plain.is_featured),
    is_opinion: Number(plain.is_opinion),
    is_sponsored: Number(plain.is_sponsored),
    reading_time_minutes: Number(plain.reading_time_minutes || 4),
    views_count: Number(plain.views_count || 0)
  };
}

// Helper to map DB row to VideoItem object
function mapVideoRow(row: any): VideoItem {
  const plain = toPlain(row);
  return {
    ...plain,
    is_featured: Number(plain.is_featured || 0),
    views_count: Number(plain.views_count || 0)
  };
}

// 1. Editorial Settings
export const getEditorialSettings = cache(async (): Promise<EditorialSettings> => {
  const cached = getFromCache<EditorialSettings>('editorial_settings');
  if (cached) return cached;

  const db = getDb();
  let rows: { key: string, value: string }[] = [];
  try {
    rows = await db.prepare('SELECT key, value FROM editorial_settings').all<{ key: string, value: string }>();
  } catch (e) {
    // Return defaults if not initialized
  }
  
  const map: Record<string, string> = {};
  for (const r of rows) {
    map[r.key] = r.value;
  }

  const result = toPlain({
    publication_name: map.publication_name || 'NEWSIGHT',
    tagline: map.tagline || 'Professional Digital News & Video Journalism',
    logo_url: map.logo_url || '',
    primary_color: map.primary_color || '#080B11',
    accent_color: map.accent_color || '#E50914',
    breaking_banner_active: map.breaking_banner_active === '1' || map.breaking_banner_active === undefined,
    breaking_headline: map.breaking_headline || 'Global Semiconductor Summit: India Unveils ₹76,000 Cr Fabrication Corridor',
    breaking_url: map.breaking_url || '/article/global-semiconductor-summit-india-fabrication-corridor',
    breaking_time: map.breaking_time || 'LIVE UPDATE',
    contact_email: map.contact_email || 'editorial@newsight.media',
    contact_phone: map.contact_phone || '+91 11 4980 7700',
    address: map.address || 'NEWSIGHT Media Tower, 14 Cyber Boulevard, New Delhi 110001',
    twitter_url: map.twitter_url || 'https://x.com/oxyfiedorg?s=11',
    facebook_url: map.facebook_url || 'https://www.facebook.com/share/1LLfbwJwE3/?mibextid=wwXIfr',
    instagram_url: map.instagram_url || 'https://www.instagram.com/oxyfied._?obrf=ZW1tOXpiZHhsdncw&utm_source=qr',
    linkedin_url: map.linkedin_url || 'https://www.linkedin.com/company/oxyfied/',
    youtube_url: map.youtube_url || '',
    footer_text: map.footer_text || '© 2026 NEWSIGHT Digital Journalism Network. All rights reserved.',
    ads_enabled: map.ads_enabled !== '0',
    ad_image_url: map.ad_image_url || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=600&q=80',
    ad_target_url: map.ad_target_url || '/shows/special-investigation',
    ad_title: map.ad_title || 'NEWSIGHT Special Investigation Series',
    ad_active: map.ad_active !== '0',
    live_stream_url: map.live_stream_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    live_stream_title: map.live_stream_title || 'NEWSIGHT 24x7 Broadcast Stream',
    live_current_show: map.live_current_show || 'The Daily Brief with Editorial Desk',
    live_schedule_json: map.live_schedule_json || ''
  });

  return setToCache('editorial_settings', result, 300);
});

export async function updateEditorialSettings(settings: Partial<Record<string, string>>): Promise<void> {
  const db = getDb();
  for (const [key, val] of Object.entries(settings)) {
    await db.prepare('INSERT OR REPLACE INTO editorial_settings (key, value) VALUES (?, ?)').run(key, String(val));
  }
  invalidateDataCache('editorial_settings');
}

// 2. Categories
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Top Stories', slug: 'top-stories', description: 'Real-time coverage and breaking developments.', color: '#E50914', order_index: 1, show_in_nav: 1, created_at: '2026-01-01T00:00:00Z' },
  { id: 'cat-news', name: 'News', slug: 'news', description: 'National and global headlines.', color: '#075DEB', order_index: 2, show_in_nav: 1, created_at: '2026-01-01T00:00:00Z' },
  { id: 'cat-politics', name: 'Politics', slug: 'politics', description: 'Parliamentary coverage, elections, and public policy.', color: '#079FE3', order_index: 3, show_in_nav: 1, created_at: '2026-01-01T00:00:00Z' },
  { id: 'cat-india', name: 'India', slug: 'india', description: 'Comprehensive reporting from across India.', color: '#F59E0B', order_index: 4, show_in_nav: 1, created_at: '2026-01-01T00:00:00Z' },
  { id: 'cat-world', name: 'World', slug: 'world', description: 'Geopolitics, diplomacy, and global affairs.', color: '#8B5CF6', order_index: 5, show_in_nav: 1, created_at: '2026-01-01T00:00:00Z' },
  { id: 'cat-kerala', name: 'Kerala', slug: 'kerala', description: 'Regional investigations and state affairs from Kerala.', color: '#10B981', order_index: 6, show_in_nav: 1, created_at: '2026-01-01T00:00:00Z' },
  { id: 'cat-business', name: 'Business', slug: 'business', description: 'Financial markets, macroeconomic analysis, and corporate filings.', color: '#14B8A6', order_index: 7, show_in_nav: 1, created_at: '2026-01-01T00:00:00Z' },
  { id: 'cat-tech', name: 'Technology', slug: 'technology', description: 'Semiconductors, AI architecture, and tech policy.', color: '#6366F1', order_index: 8, show_in_nav: 1, created_at: '2026-01-01T00:00:00Z' },
  { id: 'cat-sports', name: 'Sports', slug: 'sports', description: 'Tournaments, athletics, and sports reporting.', color: '#EF4444', order_index: 9, show_in_nav: 1, created_at: '2026-01-01T00:00:00Z' },
  { id: 'cat-science', name: 'Science', slug: 'science', description: 'Space exploration, astrophysics, and climate telemetry.', color: '#06B6D4', order_index: 10, show_in_nav: 1, created_at: '2026-01-01T00:00:00Z' },
  { id: 'cat-environment', name: 'Environment', slug: 'environment', description: 'Ecological investigations and climate policy.', color: '#22C55E', order_index: 11, show_in_nav: 1, created_at: '2026-01-01T00:00:00Z' },
  { id: 'cat-investigations', name: 'Investigations', slug: 'investigations', description: 'In-depth investigative reports.', color: '#EC4899', order_index: 12, show_in_nav: 1, created_at: '2026-01-01T00:00:00Z' },
  { id: 'cat-opinion', name: 'Opinion', slug: 'opinion', description: 'Editorial commentary and expert perspectives.', color: '#A855F7', order_index: 13, show_in_nav: 1, created_at: '2026-01-01T00:00:00Z' },
  { id: 'cat-entertainment', name: 'Entertainment', slug: 'entertainment', description: 'Cinema, arts, and cultural commentary.', color: '#F43F5E', order_index: 14, show_in_nav: 0, created_at: '2026-01-01T00:00:00Z' },
  { id: 'cat-lifestyle', name: 'Lifestyle', slug: 'lifestyle', description: 'Culture, society, and modern life.', color: '#84CC16', order_index: 15, show_in_nav: 0, created_at: '2026-01-01T00:00:00Z' },
  { id: 'cat-travel', name: 'Travel', slug: 'travel', description: 'Expeditions and field reporting.', color: '#0EA5E9', order_index: 16, show_in_nav: 0, created_at: '2026-01-01T00:00:00Z' },
  { id: 'cat-elections', name: 'Elections', slug: 'elections', description: 'Democracy in action and electoral data.', color: '#F97316', order_index: 17, show_in_nav: 0, created_at: '2026-01-01T00:00:00Z' },
  { id: 'cat-special-reports', name: 'Special Reports', slug: 'special-reports', description: 'Special visual dispatches and series.', color: '#E11D48', order_index: 18, show_in_nav: 0, created_at: '2026-01-01T00:00:00Z' }
];

export const getCategories = cache(async (showInNavOnly = false): Promise<Category[]> => {
  const cacheKey = `categories_${showInNavOnly}`;
  const cached = getFromCache<Category[]>(cacheKey);
  if (cached) return cached;

  try {
    const db = getDb();
    const query = showInNavOnly 
      ? 'SELECT * FROM categories WHERE show_in_nav = 1 ORDER BY order_index ASC' 
      : 'SELECT * FROM categories ORDER BY order_index ASC';
    const rows = await db.prepare(query).all<Category>();
    if (rows && rows.length > 0) {
      return setToCache(cacheKey, toPlain(rows), 300);
    }
  } catch (e) {
    console.warn('[data] getCategories DB query failed, using defaults:', e);
  }

  const fallback = showInNavOnly 
    ? DEFAULT_CATEGORIES.filter(c => c.show_in_nav === 1) 
    : DEFAULT_CATEGORIES;
  return setToCache(cacheKey, fallback, 300);
});

export const getCategoryBySlug = cache(async (slug: string): Promise<Category | null> => {
  const normalizedSlug = slug.toLowerCase().trim();
  const cacheKey = `category_slug_${normalizedSlug}`;
  const cached = getFromCache<Category | null>(cacheKey);
  if (cached !== null) return cached;

  try {
    const db = getDb();
    const cat = await db.prepare('SELECT * FROM categories WHERE slug = ?').get<Category>(normalizedSlug);
    if (cat) {
      return setToCache(cacheKey, toPlain(cat), 300);
    }
  } catch (e) {
    console.warn(`[data] getCategoryBySlug('${normalizedSlug}') DB query failed:`, e);
  }

  const fallback = DEFAULT_CATEGORIES.find(c => c.slug === normalizedSlug) || null;
  return setToCache(cacheKey, fallback, 300);
});

// 3. Articles
const ARTICLE_SELECT = `
  SELECT 
    a.*,
    c.name as category_name,
    c.slug as category_slug,
    c.color as category_color,
    r.name as reporter_name,
    r.title as reporter_title,
    r.slug as reporter_slug,
    r.avatar_url as reporter_avatar
  FROM articles a
  LEFT JOIN categories c ON a.category_id = c.id
  LEFT JOIN reporters r ON a.reporter_id = r.id
`;

export async function getLeadArticle(): Promise<Article | null> {
  const db = getDb();
  const row = await db.prepare(`
    ${ARTICLE_SELECT}
    WHERE a.status = 'PUBLISHED' AND a.is_lead = 1
    ORDER BY a.published_at DESC LIMIT 1
  `).get();
  return row ? mapArticleRow(row) : null;
}

export const getBreakingArticle = cache(async (): Promise<Article | null> => {
  const cached = getFromCache<Article | null>('breaking_article');
  if (cached !== null) return cached;

  const db = getDb();
  const row = await db.prepare(`
    ${ARTICLE_SELECT}
    WHERE a.status = 'PUBLISHED' AND a.is_breaking = 1
    ORDER BY a.published_at DESC LIMIT 1
  `).get();
  const result = row ? mapArticleRow(row) : null;
  return setToCache('breaking_article', result, 30);
});

export async function getSecondaryArticles(limit = 3): Promise<Article[]> {
  const db = getDb();
  const rows = await db.prepare(`
    ${ARTICLE_SELECT}
    WHERE a.status = 'PUBLISHED' AND a.is_lead = 0
    ORDER BY a.published_at DESC LIMIT ?
  `).all(limit);
  return rows.map(mapArticleRow);
}

export const getLatestArticles = cache(async (limit = 10, offset = 0): Promise<Article[]> => {
  const cacheKey = `latest_articles_${limit}_${offset}`;
  const cached = getFromCache<Article[]>(cacheKey);
  if (cached) return cached;

  const db = getDb();
  const rows = await db.prepare(`
    ${ARTICLE_SELECT}
    WHERE a.status = 'PUBLISHED'
    ORDER BY a.published_at DESC LIMIT ? OFFSET ?
  `).all(limit, offset);
  const result = rows.map(mapArticleRow);
  return setToCache(cacheKey, result, 30);
});

export const getArticlesByCategory = cache(async (categorySlug: string, limit = 12): Promise<Article[]> => {
  const cacheKey = `articles_cat_${categorySlug}_${limit}`;
  const cached = getFromCache<Article[]>(cacheKey);
  if (cached) return cached;

  const db = getDb();
  if (categorySlug === 'top-stories') {
    const rows = await db.prepare(`
      ${ARTICLE_SELECT}
      WHERE a.status = 'PUBLISHED'
      ORDER BY a.views_count DESC, a.published_at DESC LIMIT ?
    `).all(limit);
    const result = rows.map(mapArticleRow);
    return setToCache(cacheKey, result, 60);
  }

  const rows = await db.prepare(`
    ${ARTICLE_SELECT}
    WHERE a.status = 'PUBLISHED' AND c.slug = ?
    ORDER BY a.published_at DESC LIMIT ?
  `).all(categorySlug, limit);

  const result = rows.map(mapArticleRow);
  return setToCache(cacheKey, result, 60);
});

export async function getKeralaArticles(district?: string, limit = 8): Promise<Article[]> {
  const db = getDb();
  if (district && district !== 'All') {
    const rows = await db.prepare(`
      ${ARTICLE_SELECT}
      WHERE a.status = 'PUBLISHED' AND c.slug = 'kerala' AND a.district = ?
      ORDER BY a.published_at DESC LIMIT ?
    `).all(district, limit);
    return rows.map(mapArticleRow);
  }
  const rows = await db.prepare(`
    ${ARTICLE_SELECT}
    WHERE a.status = 'PUBLISHED' AND c.slug = 'kerala'
    ORDER BY a.published_at DESC LIMIT ?
  `).all(limit);
  return rows.map(mapArticleRow);
}

export const getOpinionArticles = cache(async (limit = 4): Promise<Article[]> => {
  const cacheKey = `opinion_articles_${limit}`;
  const cached = getFromCache<Article[]>(cacheKey);
  if (cached) return cached;

  const db = getDb();
  const rows = await db.prepare(`
    ${ARTICLE_SELECT}
    WHERE a.status = 'PUBLISHED' AND (a.is_opinion = 1 OR c.slug = 'opinion')
    ORDER BY a.published_at DESC LIMIT ?
  `).all(limit);
  const result = rows.map(mapArticleRow);
  return setToCache(cacheKey, result, 30);
});

export async function getInvestigativeArticles(limit = 4): Promise<Article[]> {
  const db = getDb();
  const rows = await db.prepare(`
    ${ARTICLE_SELECT}
    WHERE a.status = 'PUBLISHED' AND (a.article_type = 'INVESTIGATION' OR c.slug = 'investigations')
    ORDER BY a.published_at DESC LIMIT ?
  `).all(limit);
  return rows.map(mapArticleRow);
}

export const getArticleBySlug = cache(async (slug: string): Promise<Article | null> => {
  const cacheKey = `article_slug_${slug}`;
  const cached = getFromCache<Article | null>(cacheKey);
  if (cached !== null) return cached;

  const db = getDb();
  const row = await db.prepare(`
    ${ARTICLE_SELECT}
    WHERE a.slug = ?
  `).get(slug);

  if (!row) {
    setToCache(cacheKey, null, 15);
    return null;
  }

  // Increment view count asynchronously in the background
  try {
    db.prepare('UPDATE articles SET views_count = views_count + 1 WHERE slug = ?').run(slug).catch(() => {});
  } catch (_) {}

  const result = mapArticleRow(row);
  return setToCache(cacheKey, result, 30);
});

export async function getRelatedArticles(articleId: string, categoryId: string, limit = 3): Promise<Article[]> {
  const db = getDb();
  const rows = await db.prepare(`
    ${ARTICLE_SELECT}
    WHERE a.status = 'PUBLISHED' AND a.id != ? AND a.category_id = ?
    ORDER BY a.published_at DESC LIMIT ?
  `).all(articleId, categoryId, limit);
  return rows.map(mapArticleRow);
}

// 4. Videos & Shows
const VIDEO_SELECT = `
  SELECT 
    v.*,
    r.name as reporter_name,
    r.avatar_url as reporter_avatar,
    r.title as reporter_title,
    s.title as show_title,
    s.slug as show_slug
  FROM videos v
  LEFT JOIN reporters r ON v.reporter_id = r.id
  LEFT JOIN shows s ON v.show_id = s.id
`;

export const getVideos = cache(async (limit = 12, featuredOnly = false): Promise<VideoItem[]> => {
  const cacheKey = `videos_${limit}_${featuredOnly}`;
  const cached = getFromCache<VideoItem[]>(cacheKey);
  if (cached) return cached;

  const db = getDb();
  const query = featuredOnly
    ? `
      ${VIDEO_SELECT}
      WHERE v.is_featured = 1
      ORDER BY v.published_at DESC LIMIT ?
    `
    : `
      ${VIDEO_SELECT}
      ORDER BY v.published_at DESC LIMIT ?
    `;
  const rows = await db.prepare(query).all(limit);
  const result = rows.map(mapVideoRow);
  return setToCache(cacheKey, result, 30);
});

export const getFeaturedVideos = cache(async (limit = 6): Promise<VideoItem[]> => {
  return await getVideos(limit, true);
});

export const getJustAddedVideos = cache(async (limit = 8): Promise<VideoItem[]> => {
  const cacheKey = `videos_just_added_${limit}`;
  const cached = getFromCache<VideoItem[]>(cacheKey);
  if (cached) return cached;

  const db = getDb();
  const rows = await db.prepare(`
    ${VIDEO_SELECT}
    ORDER BY v.published_at DESC LIMIT ?
  `).all(limit);
  const result = rows.map(mapVideoRow);
  return setToCache(cacheKey, result, 30);
});

export const getTopVideos = cache(async (limit = 8): Promise<VideoItem[]> => {
  const cacheKey = `videos_top_${limit}`;
  const cached = getFromCache<VideoItem[]>(cacheKey);
  if (cached) return cached;

  const db = getDb();
  const rows = await db.prepare(`
    ${VIDEO_SELECT}
    ORDER BY v.views_count DESC, v.published_at DESC LIMIT ?
  `).all(limit);
  const result = rows.map(mapVideoRow);
  return setToCache(cacheKey, result, 30);
});

export async function getClassicVideos(limit = 8): Promise<VideoItem[]> {
  const db = getDb();
  const rows = await db.prepare(`
    ${VIDEO_SELECT}
    WHERE v.video_type = 'CLASSIC' OR v.category = 'NEWSIGHT Classics' OR v.category = 'Classics'
    ORDER BY v.published_at DESC LIMIT ?
  `).all(limit);
  if (rows.length === 0) {
    const fallbackRows = await db.prepare(`
      ${VIDEO_SELECT}
      ORDER BY v.published_at ASC LIMIT ?
    `).all(limit);
    return fallbackRows.map(mapVideoRow);
  }
  return rows.map(mapVideoRow);
}

export const getVideoBySlug = cache(async (slug: string): Promise<VideoItem | null> => {
  const cacheKey = `video_slug_${slug}`;
  const cached = getFromCache<VideoItem | null>(cacheKey);
  if (cached !== null) return cached;

  const db = getDb();
  const row = await db.prepare(`
    ${VIDEO_SELECT}
    WHERE v.slug = ?
  `).get(slug);

  if (!row) {
    setToCache(cacheKey, null, 15);
    return null;
  }

  try {
    db.prepare('UPDATE videos SET views_count = views_count + 1 WHERE slug = ?').run(slug).catch(() => {});
  } catch (_) {}

  const result = mapVideoRow(row);
  return setToCache(cacheKey, result, 30);
});

export const getVideosByCategory = cache(async (categorySlug: string, limit = 12): Promise<VideoItem[]> => {
  const cacheKey = `videos_cat_${categorySlug}_${limit}`;
  const cached = getFromCache<VideoItem[]>(cacheKey);
  if (cached) return cached;

  const db = getDb();
  if (categorySlug.toLowerCase().includes('top') || categorySlug.toLowerCase() === 'top-stories') {
    const rows = await db.prepare(`
      ${VIDEO_SELECT}
      ORDER BY v.views_count DESC, v.published_at DESC LIMIT ?
    `).all(limit);
    const result = rows.map(mapVideoRow);
    return setToCache(cacheKey, result, 60);
  }

  const term = `%${categorySlug}%`;
  const rows = await db.prepare(`
    ${VIDEO_SELECT}
    WHERE v.category LIKE ? OR LOWER(v.category) = LOWER(?)
    ORDER BY v.published_at DESC LIMIT ?
  `).all(term, categorySlug, limit);

  const result = rows.map(mapVideoRow);
  return setToCache(cacheKey, result, 60);
});

export async function getVideosByShow(showIdOrSlug: string, limit = 20): Promise<VideoItem[]> {
  const db = getDb();
  const rows = await db.prepare(`
    ${VIDEO_SELECT}
    WHERE v.show_id = ? OR s.slug = ?
    ORDER BY v.published_at DESC LIMIT ?
  `).all(showIdOrSlug, showIdOrSlug, limit);
  return rows.map(mapVideoRow);
}

export async function getRelatedVideos(videoId: string, category: string, limit = 4): Promise<VideoItem[]> {
  const db = getDb();
  const rows = await db.prepare(`
    ${VIDEO_SELECT}
    WHERE v.id != ? AND (v.category = ? OR 1=1)
    ORDER BY v.published_at DESC LIMIT ?
  `).all(videoId, category, limit);
  return rows.map(mapVideoRow);
}

export async function searchVideos(query: string, limit = 20): Promise<VideoItem[]> {
  const db = getDb();
  const term = `%${query.trim()}%`;
  const rows = await db.prepare(`
    ${VIDEO_SELECT}
    WHERE v.title LIKE ? OR v.summary LIKE ? OR v.category LIKE ?
    ORDER BY v.published_at DESC LIMIT ?
  `).all(term, term, term, limit);
  return rows.map(mapVideoRow);
}

// 4B. Shows
export const DEFAULT_SHOWS: Show[] = [
  { id: 'show-1', title: 'The Daily Brief', slug: 'the-daily-brief', description: 'Comprehensive morning intelligence briefing covering national security, geopolitics, and constitutional law.', host_name: 'Siddharth Nair', schedule_info: 'Weekdays 08:00 AM IST', cover_image: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80', order_index: 1, created_at: '2026-01-01T00:00:00Z', episode_count: 5 },
  { id: 'show-2', title: 'Ground Report', slug: 'ground-report', description: 'Investigative field dispatches and telemetry inspections from India’s critical infrastructure corridors.', host_name: 'K. R. Madhavan', schedule_info: 'Saturdays 09:00 PM IST', cover_image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80', order_index: 2, created_at: '2026-01-01T00:00:00Z', episode_count: 4 },
  { id: 'show-3', title: 'The Big Interview', slug: 'the-big-interview', description: 'Uncompromising dialogues with cabinet ministers, chief justices, corporate chiefs, and defense strategists.', host_name: 'Vikramaditya Roy', schedule_info: 'Sundays 08:00 PM IST', cover_image: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=1200&q=80', order_index: 3, created_at: '2026-01-01T00:00:00Z', episode_count: 3 },
  { id: 'show-4', title: 'News Explained', slug: 'news-explained', description: 'Visual breakdowns and constitutional analyses of the most intricate policy decisions.', host_name: 'Ayesha Sen', schedule_info: 'Tuesdays & Thursdays 07:00 PM IST', cover_image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80', order_index: 4, created_at: '2026-01-01T00:00:00Z', episode_count: 4 },
  { id: 'show-5', title: 'Business Focus', slug: 'business-focus', description: 'Deep market analysis, fiscal policy scrutiny, and supply chain telemetry.', host_name: 'Priya Chawla', schedule_info: 'Daily Market Close 05:30 PM IST', cover_image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80', order_index: 5, created_at: '2026-01-01T00:00:00Z', episode_count: 2 },
  { id: 'show-6', title: 'The Debate', slug: 'the-debate', description: 'Prime-time adversarial debate on constitutional governance and public policy.', host_name: 'Siddharth Nair', schedule_info: 'Weekdays 09:00 PM IST', cover_image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80', order_index: 6, created_at: '2026-01-01T00:00:00Z', episode_count: 3 },
  { id: 'show-7', title: 'Special Investigation', slug: 'special-investigation', description: 'Long-term investigative journalism exposing systemic corruption and corporate misconduct.', host_name: 'Dr. Elena Vance', schedule_info: 'Monthly Special Edition', cover_image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80', order_index: 7, created_at: '2026-01-01T00:00:00Z', episode_count: 2 }
];

export const getShows = cache(async (): Promise<Show[]> => {
  const cached = getFromCache<Show[]>('shows_all');
  if (cached) return cached;

  try {
    const db = getDb();
    const rows = await db.prepare(`
      SELECT 
        s.*,
        (SELECT COUNT(*) FROM videos v WHERE v.show_id = s.id) as episode_count
      FROM shows s
      ORDER BY s.order_index ASC, s.created_at ASC
    `).all<Show>();

    if (rows && rows.length > 0) {
      return setToCache('shows_all', toPlain(rows), 300);
    }
  } catch (e) {
    console.warn('[data] getShows DB query failed, using defaults:', e);
  }

  return setToCache('shows_all', DEFAULT_SHOWS, 300);
});

export const getShowBySlug = cache(async (slug: string): Promise<(Show & { videos: VideoItem[] }) | null> => {
  const normalizedSlug = slug.toLowerCase().trim();
  const cacheKey = `show_slug_${normalizedSlug}`;
  const cached = getFromCache<(Show & { videos: VideoItem[] }) | null>(cacheKey);
  if (cached !== null) return cached;

  let show: (Show & { videos: VideoItem[] }) | null = null;
  try {
    const db = getDb();
    const row = await db.prepare(`
      SELECT 
        s.*,
        (SELECT COUNT(*) FROM videos v WHERE v.show_id = s.id) as episode_count
      FROM shows s
      WHERE s.slug = ?
    `).get<Show>(normalizedSlug);

    if (row) {
      show = toPlain(row) as Show & { videos: VideoItem[] };
      show.videos = await getVideosByShow(show.id, 30);
    }
  } catch (e) {
    console.warn(`[data] getShowBySlug('${normalizedSlug}') DB query failed:`, e);
  }

  if (!show) {
    const fallback = DEFAULT_SHOWS.find(s => s.slug === normalizedSlug);
    if (fallback) {
      show = { ...fallback, videos: [] };
    }
  }

  return setToCache(cacheKey, show, show ? 300 : 15);
});

export async function getShowById(id: string): Promise<Show | null> {
  const db = getDb();
  const row = await db.prepare(`
    SELECT 
      s.*,
      (SELECT COUNT(*) FROM videos v WHERE v.show_id = s.id) as episode_count
    FROM shows s
    WHERE s.id = ?
  `).get<Show>(id);

  return row ? toPlain(row) : null;
}

// 5. Photo Stories
export async function getPhotoStories(limit = 4): Promise<PhotoStory[]> {
  const db = getDb();
  const rawStories = await db.prepare(`
    SELECT * FROM photo_stories ORDER BY published_at DESC LIMIT ?
  `).all<PhotoStory>(limit);

  const stories = toPlain(rawStories);

  for (const story of stories) {
    const items = await db.prepare(`
      SELECT * FROM photo_story_items WHERE photo_story_id = ? ORDER BY order_index ASC
    `).all<PhotoStoryItem>(story.id);
    story.items = toPlain(items);
  }

  return stories;
}

export const getPhotoStoryBySlug = cache(async (slug: string): Promise<PhotoStory | null> => {
  const cacheKey = `photostory_slug_${slug}`;
  const cached = getFromCache<PhotoStory | null>(cacheKey);
  if (cached !== null) return cached;

  const db = getDb();
  const rawStory = await db.prepare('SELECT * FROM photo_stories WHERE slug = ?').get<PhotoStory>(slug);
  if (!rawStory) {
    setToCache(cacheKey, null, 15);
    return null;
  }

  const story = toPlain(rawStory);

  const items = await db.prepare(`
    SELECT * FROM photo_story_items WHERE photo_story_id = ? ORDER BY order_index ASC
  `).all<PhotoStoryItem>(story.id);
  story.items = toPlain(items);
  return setToCache(cacheKey, story, 60);
});

// 6. Live Blogs & Updates
export async function getLiveBlogs(): Promise<LiveBlog[]> {
  const db = getDb();
  const rows = await db.prepare(`
    SELECT 
      lb.*,
      r.name as reporter_name,
      r.avatar_url as reporter_avatar,
      c.name as category_name
    FROM live_blogs lb
    LEFT JOIN reporters r ON lb.reporter_id = r.id
    LEFT JOIN categories c ON lb.category_id = c.id
    ORDER BY lb.updated_at DESC
  `).all<LiveBlog>();
  return toPlain(rows);
}

export async function getLiveBlogBySlug(slug: string): Promise<LiveBlog | null> {
  const db = getDb();
  const rawBlog = await db.prepare(`
    SELECT 
      lb.*,
      r.name as reporter_name,
      r.avatar_url as reporter_avatar,
      c.name as category_name
    FROM live_blogs lb
    LEFT JOIN reporters r ON lb.reporter_id = r.id
    LEFT JOIN categories c ON lb.category_id = c.id
    WHERE lb.slug = ?
  `).get<LiveBlog>(slug);

  if (!rawBlog) return null;

  const blog = toPlain(rawBlog);

  const updates = await db.prepare(`
    SELECT * FROM live_updates 
    WHERE live_blog_id = ? 
    ORDER BY created_at DESC
  `).all<LiveUpdate>(blog.id);

  blog.updates = toPlain(updates);
  return blog;
}

export async function getLiveUpdates(liveBlogId: string, limit = 50): Promise<LiveUpdate[]> {
  const db = getDb();
  const rows = await db.prepare(`
    SELECT * FROM live_updates 
    WHERE live_blog_id = ? 
    ORDER BY created_at DESC LIMIT ?
  `).all<LiveUpdate>(liveBlogId, limit);
  return toPlain(rows);
}

// 7. Reporters
export const DEFAULT_REPORTERS: Reporter[] = [
  { id: 'rep-1', name: 'Siddharth Nair', slug: 'siddharth-nair', title: 'Editor-in-Chief & Legal Affairs Lead', beat: 'Constitutional Governance & Judiciary', bio: 'Siddharth has spent over two decades covering the Supreme Court of India, parliamentary jurisprudence, and institutional reform.', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', email: 'siddharth.nair@newsight.media', is_active: 1, created_at: '2026-01-01T00:00:00Z', reports_count: 14 },
  { id: 'rep-2', name: 'Ayesha Sen', slug: 'ayesha-sen', title: 'Diplomatic Editor', beat: 'Geopolitics & Multilateral Pacts', bio: 'Ayesha reports on South Asian security architectures, Indo-Pacific maritime pacts, and UN climate assemblies from New Delhi and multilateral summits.', avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80', email: 'ayesha.sen@newsight.media', is_active: 1, created_at: '2026-01-01T00:00:00Z', reports_count: 11 },
  { id: 'rep-3', name: 'K. R. Madhavan', slug: 'k-r-madhavan', title: 'Southern Bureau Chief', beat: 'Kerala, Coastal Ecology & Maritime Trade', bio: 'Stationed in Kochi and Thiruvananthapuram, Madhavan oversees Southern state coverage with deep expertise in Western Ghats conservation and port infrastructure.', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', email: 'madhavan@newsight.media', is_active: 1, created_at: '2026-01-01T00:00:00Z', reports_count: 9 },
  { id: 'rep-4', name: 'Dr. Elena Vance', slug: 'elena-vance', title: 'Science & Aerospace Correspondent', beat: 'Space Exploration, Quantum Tech & Grid Transitions', bio: 'With a PhD in Astro-geophysics and twelve years in science reporting, Elena deconstructs deep-space satellite missions, fusion research, and national renewable grid transformations.', avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80', email: 'elena.vance@newsight.media', is_active: 1, created_at: '2026-01-01T00:00:00Z', reports_count: 8 },
  { id: 'rep-5', name: 'Vikramaditya Roy', slug: 'vikramaditya-roy', title: 'Chief Economic Analyst', beat: 'Macroeconomics, Banking & Trade Policy', bio: 'Vikramaditya scrutinizes monetary policy resolutions, fiscal deficits, sovereign bond issuances, and global trade realignments.', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', email: 'vikram.roy@newsight.media', is_active: 1, created_at: '2026-01-01T00:00:00Z', reports_count: 7 },
  { id: 'rep-6', name: 'Priya Chawla', slug: 'priya-chawla', title: 'Investigative Desk Reporter', beat: 'Environmental Compliance & Corporate Transparency', bio: 'Priya specializes in data-driven public interest investigations, tracking environmental violations, riverbed resource extraction, and corporate governance accountability.', avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80', email: 'priya.chawla@newsight.media', is_active: 1, created_at: '2026-01-01T00:00:00Z', reports_count: 6 }
];

export const getReporters = cache(async (includeInactive = false): Promise<Reporter[]> => {
  const cacheKey = `reporters_${includeInactive}`;
  const cached = getFromCache<Reporter[]>(cacheKey);
  if (cached) return cached;

  try {
    const db = getDb();
    const whereClause = includeInactive ? '' : 'WHERE r.is_active = 1';
    const query = `
      SELECT 
        r.*,
        u.email as user_email,
        u.role as user_role,
        (SELECT COUNT(*) FROM articles a WHERE a.reporter_id = r.id) as reports_count
      FROM reporters r
      LEFT JOIN users u ON r.user_id = u.id
      ${whereClause}
      ORDER BY r.name ASC
    `;
    const rows = await db.prepare(query).all<any>();
    if (rows && rows.length > 0) {
      const result = toPlain(rows.map(r => ({
        ...r,
        has_credentials: Boolean(r.user_id),
        reports_count: Number(r.reports_count || 0)
      })));
      return setToCache(cacheKey, result, 60);
    }
  } catch (e) {
    console.warn('[data] getReporters DB query failed, using defaults:', e);
  }

  const fallback = includeInactive 
    ? DEFAULT_REPORTERS 
    : DEFAULT_REPORTERS.filter(r => r.is_active === 1);
  return setToCache(cacheKey, fallback, 60);
});

export const getReporterBySlug = cache(async (slug: string): Promise<Reporter | null> => {
  const normalizedSlug = slug.toLowerCase().trim();
  const cacheKey = `reporter_slug_${normalizedSlug}`;
  const cached = getFromCache<Reporter | null>(cacheKey);
  if (cached !== null) return cached;

  try {
    const db = getDb();
    const row = await db.prepare('SELECT * FROM reporters WHERE slug = ?').get<Reporter>(normalizedSlug);
    if (row) {
      return setToCache(cacheKey, toPlain(row), 60);
    }
  } catch (e) {
    console.warn(`[data] getReporterBySlug('${normalizedSlug}') DB query failed:`, e);
  }

  const fallback = DEFAULT_REPORTERS.find(r => r.slug === normalizedSlug) || null;
  return setToCache(cacheKey, fallback, fallback ? 60 : 15);
});

export async function getArticlesByReporter(reporterId: string, limit = 10): Promise<Article[]> {
  const db = getDb();
  const rows = await db.prepare(`
    ${ARTICLE_SELECT}
    WHERE a.status = 'PUBLISHED' AND a.reporter_id = ?
    ORDER BY a.published_at DESC LIMIT ?
  `).all(reporterId, limit);
  return rows.map(mapArticleRow);
}

// 8. Search
export async function searchArticles(query: string, options?: { category?: string, type?: string, district?: string, sort?: string }): Promise<Article[]> {
  const db = getDb();
  let sql = `
    ${ARTICLE_SELECT}
    WHERE a.status = 'PUBLISHED'
  `;
  const params: any[] = [];

  if (query && query.trim()) {
    sql += ` AND (a.title LIKE ? OR a.deck LIKE ? OR a.body LIKE ? OR r.name LIKE ?)`;
    const term = `%${query.trim()}%`;
    params.push(term, term, term, term);
  }

  if (options?.category && options.category !== 'all') {
    sql += ` AND c.slug = ?`;
    params.push(options.category);
  }

  if (options?.type && options.type !== 'all') {
    sql += ` AND a.article_type = ?`;
    params.push(options.type);
  }

  if (options?.district && options.district !== 'all') {
    sql += ` AND a.district = ?`;
    params.push(options.district);
  }

  if (options?.sort === 'views') {
    sql += ` ORDER BY a.views_count DESC LIMIT 30`;
  } else {
    sql += ` ORDER BY a.published_at DESC LIMIT 30`;
  }

  const rows = await db.prepare(sql).all(...params);
  return rows.map(mapArticleRow);
}

// 9. Admin Stats & Management
export async function getEditorialStats() {
  const db = getDb();
  const [
    articleCounts,
    totalReportersRow,
    totalVideosRow,
    totalLiveBlogsRow,
    subscribersRow
  ] = await Promise.all([
    db.prepare(`
      SELECT 
        COUNT(CASE WHEN status = 'PUBLISHED' THEN 1 END) as published,
        COUNT(CASE WHEN status = 'IN_REVIEW' THEN 1 END) as in_review,
        COUNT(CASE WHEN status = 'DRAFT' THEN 1 END) as drafts,
        COUNT(CASE WHEN status = 'SCHEDULED' THEN 1 END) as scheduled
      FROM articles
    `).get<{ published: number, in_review: number, drafts: number, scheduled: number }>(),
    db.prepare("SELECT COUNT(*) as count FROM reporters WHERE is_active = 1").get<{ count: string | number }>(),
    db.prepare("SELECT COUNT(*) as count FROM videos").get<{ count: string | number }>(),
    db.prepare("SELECT COUNT(*) as count FROM live_blogs WHERE status = 'ACTIVE'").get<{ count: string | number }>(),
    db.prepare("SELECT COUNT(*) as count FROM newsletter_subscribers WHERE is_active = 1").get<{ count: string | number }>()
  ]);

  return {
    published: Number(articleCounts?.published || 0),
    inReview: Number(articleCounts?.in_review || 0),
    drafts: Number(articleCounts?.drafts || 0),
    scheduled: Number(articleCounts?.scheduled || 0),
    totalReporters: Number(totalReportersRow?.count || 0),
    totalVideos: Number(totalVideosRow?.count || 0),
    totalLiveBlogs: Number(totalLiveBlogsRow?.count || 0),
    subscribers: Number(subscribersRow?.count || 0)
  };
}

export async function getAllArticlesAdmin(status = 'ALL'): Promise<Article[]> {
  const db = getDb();
  if (status && status !== 'ALL') {
    const rows = await db.prepare(`
      ${ARTICLE_SELECT}
      WHERE a.status = ?
      ORDER BY a.created_at DESC
    `).all(status);
    return rows.map(mapArticleRow);
  }
  const rows = await db.prepare(`
    ${ARTICLE_SELECT}
    ORDER BY a.created_at DESC
  `).all();
  return rows.map(mapArticleRow);
}

export async function getAllVideosAdmin(): Promise<VideoItem[]> {
  const db = getDb();
  const rows = await db.prepare(`
    ${VIDEO_SELECT}
    ORDER BY v.created_at DESC
  `).all();
  return rows.map(mapVideoRow);
}

export async function getAllShowsAdmin(): Promise<Show[]> {
  return await getShows();
}

export async function getCommentsForArticle(articleId: string): Promise<CommentItem[]> {
  const db = getDb();
  const comments = await db.prepare(`
    SELECT * FROM comments 
    WHERE article_id = ? AND status = 'APPROVED'
    ORDER BY created_at DESC
  `).all<CommentItem>(articleId);
  return toPlain(comments);
}
