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
export const getCategories = cache(async (showInNavOnly = false): Promise<Category[]> => {
  const cacheKey = `categories_${showInNavOnly}`;
  const cached = getFromCache<Category[]>(cacheKey);
  if (cached) return cached;

  const db = getDb();
  const query = showInNavOnly 
    ? 'SELECT * FROM categories WHERE show_in_nav = 1 ORDER BY order_index ASC' 
    : 'SELECT * FROM categories ORDER BY order_index ASC';
  const rows = await db.prepare(query).all<Category>();
  const result = toPlain(rows);
  return setToCache(cacheKey, result, 300);
});

export const getCategoryBySlug = cache(async (slug: string): Promise<Category | null> => {
  const cacheKey = `category_slug_${slug}`;
  const cached = getFromCache<Category | null>(cacheKey);
  if (cached !== null) return cached;

  const db = getDb();
  const cat = await db.prepare('SELECT * FROM categories WHERE slug = ?').get<Category>(slug);
  const result = cat ? toPlain(cat) : null;
  return setToCache(cacheKey, result, 300);
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
export const getShows = cache(async (): Promise<Show[]> => {
  const cached = getFromCache<Show[]>('shows_all');
  if (cached) return cached;

  const db = getDb();
  const rows = await db.prepare(`
    SELECT 
      s.*,
      (SELECT COUNT(*) FROM videos v WHERE v.show_id = s.id) as episode_count
    FROM shows s
    ORDER BY s.order_index ASC, s.created_at ASC
  `).all<Show>();

  const result = toPlain(rows);
  return setToCache('shows_all', result, 300);
});

export const getShowBySlug = cache(async (slug: string): Promise<(Show & { videos: VideoItem[] }) | null> => {
  const cacheKey = `show_slug_${slug}`;
  const cached = getFromCache<(Show & { videos: VideoItem[] }) | null>(cacheKey);
  if (cached !== null) return cached;

  const db = getDb();
  const row = await db.prepare(`
    SELECT 
      s.*,
      (SELECT COUNT(*) FROM videos v WHERE v.show_id = s.id) as episode_count
    FROM shows s
    WHERE s.slug = ?
  `).get<Show>(slug);

  if (!row) {
    setToCache(cacheKey, null, 15);
    return null;
  }

  const show = toPlain(row) as Show & { videos: VideoItem[] };
  show.videos = await getVideosByShow(show.id, 30);
  return setToCache(cacheKey, show, 60);
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
export const getReporters = cache(async (includeInactive = false): Promise<Reporter[]> => {
  const cacheKey = `reporters_${includeInactive}`;
  const cached = getFromCache<Reporter[]>(cacheKey);
  if (cached) return cached;

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
  const result = toPlain(rows.map(r => ({
    ...r,
    has_credentials: Boolean(r.user_id),
    reports_count: Number(r.reports_count || 0)
  })));
  return setToCache(cacheKey, result, 60);
});

export const getReporterBySlug = cache(async (slug: string): Promise<Reporter | null> => {
  const cacheKey = `reporter_slug_${slug}`;
  const cached = getFromCache<Reporter | null>(cacheKey);
  if (cached !== null) return cached;

  const db = getDb();
  const row = await db.prepare('SELECT * FROM reporters WHERE slug = ?').get<Reporter>(slug);
  const result = row ? toPlain(row) : null;
  return setToCache(cacheKey, result, 60);
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
