import { getDb } from './db';
import { 
  Article, Category, Reporter, VideoItem, PhotoStory, PhotoStoryItem, 
  LiveBlog, LiveUpdate, EditorialSettings, CommentItem, NewsletterSubscriber, Show 
} from './types';

// Helper to convert SQLite null-prototype objects into standard plain objects for React 19 Client Components
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
export function getEditorialSettings(): EditorialSettings {
  const db = getDb();
  let rows: { key: string, value: string }[] = [];
  try {
    rows = db.prepare('SELECT key, value FROM editorial_settings').all() as { key: string, value: string }[];
  } catch (e) {
    // Return defaults if not initialized
  }
  
  const map: Record<string, string> = {};
  for (const r of rows) {
    map[r.key] = r.value;
  }

  return toPlain({
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
    youtube_url: map.youtube_url || 'https://youtube.com/@newsight',
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
}

export function updateEditorialSettings(settings: Partial<Record<string, string>>): void {
  const db = getDb();
  const stmt = db.prepare('INSERT OR REPLACE INTO editorial_settings (key, value) VALUES (?, ?)');
  for (const [key, val] of Object.entries(settings)) {
    stmt.run(key, String(val));
  }
}

// 2. Categories
export function getCategories(showInNavOnly = false): Category[] {
  const db = getDb();
  const query = showInNavOnly 
    ? 'SELECT * FROM categories WHERE show_in_nav = 1 ORDER BY order_index ASC' 
    : 'SELECT * FROM categories ORDER BY order_index ASC';
  return toPlain(db.prepare(query).all() as unknown as Category[]);
}

export function getCategoryBySlug(slug: string): Category | null {
  const db = getDb();
  const cat = db.prepare('SELECT * FROM categories WHERE slug = ?').get(slug);
  return cat ? toPlain(cat as unknown as Category) : null;
}

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

export function getLeadArticle(): Article | null {
  const db = getDb();
  const row = db.prepare(`
    ${ARTICLE_SELECT}
    WHERE a.status = 'PUBLISHED' AND a.is_lead = 1
    ORDER BY a.published_at DESC LIMIT 1
  `).get();
  return row ? mapArticleRow(row) : null;
}

export function getBreakingArticle(): Article | null {
  const db = getDb();
  const row = db.prepare(`
    ${ARTICLE_SELECT}
    WHERE a.status = 'PUBLISHED' AND a.is_breaking = 1
    ORDER BY a.published_at DESC LIMIT 1
  `).get();
  return row ? mapArticleRow(row) : null;
}

export function getSecondaryArticles(limit = 3): Article[] {
  const db = getDb();
  const rows = db.prepare(`
    ${ARTICLE_SELECT}
    WHERE a.status = 'PUBLISHED' AND a.is_lead = 0
    ORDER BY a.published_at DESC LIMIT ?
  `).all(limit);
  return rows.map(mapArticleRow);
}

export function getLatestArticles(limit = 10, offset = 0): Article[] {
  const db = getDb();
  const rows = db.prepare(`
    ${ARTICLE_SELECT}
    WHERE a.status = 'PUBLISHED'
    ORDER BY a.published_at DESC LIMIT ? OFFSET ?
  `).all(limit, offset);
  return rows.map(mapArticleRow);
}

export function getArticlesByCategory(categorySlug: string, limit = 12): Article[] {
  const db = getDb();
  const rows = db.prepare(`
    ${ARTICLE_SELECT}
    WHERE a.status = 'PUBLISHED' AND c.slug = ?
    ORDER BY a.published_at DESC LIMIT ?
  `).all(categorySlug, limit);
  return rows.map(mapArticleRow);
}

export function getKeralaArticles(district?: string, limit = 8): Article[] {
  const db = getDb();
  if (district && district !== 'All') {
    const rows = db.prepare(`
      ${ARTICLE_SELECT}
      WHERE a.status = 'PUBLISHED' AND c.slug = 'kerala' AND a.district = ?
      ORDER BY a.published_at DESC LIMIT ?
    `).all(district, limit);
    return rows.map(mapArticleRow);
  }
  const rows = db.prepare(`
    ${ARTICLE_SELECT}
    WHERE a.status = 'PUBLISHED' AND c.slug = 'kerala'
    ORDER BY a.published_at DESC LIMIT ?
  `).all(limit);
  return rows.map(mapArticleRow);
}

export function getOpinionArticles(limit = 4): Article[] {
  const db = getDb();
  const rows = db.prepare(`
    ${ARTICLE_SELECT}
    WHERE a.status = 'PUBLISHED' AND (a.is_opinion = 1 OR c.slug = 'opinion')
    ORDER BY a.published_at DESC LIMIT ?
  `).all(limit);
  return rows.map(mapArticleRow);
}

export function getInvestigativeArticles(limit = 4): Article[] {
  const db = getDb();
  const rows = db.prepare(`
    ${ARTICLE_SELECT}
    WHERE a.status = 'PUBLISHED' AND (a.article_type = 'INVESTIGATION' OR c.slug = 'investigations')
    ORDER BY a.published_at DESC LIMIT ?
  `).all(limit);
  return rows.map(mapArticleRow);
}

export function getArticleBySlug(slug: string): Article | null {
  const db = getDb();
  const row = db.prepare(`
    ${ARTICLE_SELECT}
    WHERE a.slug = ?
  `).get(slug);

  if (!row) return null;

  // Increment view count
  try {
    db.prepare('UPDATE articles SET views_count = views_count + 1 WHERE slug = ?').run(slug);
  } catch (e) {
    // Non-fatal
  }

  return mapArticleRow(row);
}

export function getRelatedArticles(articleId: string, categoryId: string, limit = 3): Article[] {
  const db = getDb();
  const rows = db.prepare(`
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

export function getVideos(limit = 12, featuredOnly = false): VideoItem[] {
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
  const rows = db.prepare(query).all(limit);
  return rows.map(mapVideoRow);
}

export function getFeaturedVideos(limit = 6): VideoItem[] {
  return getVideos(limit, true);
}

export function getJustAddedVideos(limit = 8): VideoItem[] {
  const db = getDb();
  const rows = db.prepare(`
    ${VIDEO_SELECT}
    ORDER BY v.published_at DESC LIMIT ?
  `).all(limit);
  return rows.map(mapVideoRow);
}

export function getTopVideos(limit = 8): VideoItem[] {
  const db = getDb();
  const rows = db.prepare(`
    ${VIDEO_SELECT}
    ORDER BY v.views_count DESC, v.published_at DESC LIMIT ?
  `).all(limit);
  return rows.map(mapVideoRow);
}

export function getClassicVideos(limit = 8): VideoItem[] {
  const db = getDb();
  const rows = db.prepare(`
    ${VIDEO_SELECT}
    WHERE v.video_type = 'CLASSIC' OR v.category = 'NEWSIGHT Classics' OR v.category = 'Classics'
    ORDER BY v.published_at DESC LIMIT ?
  `).all(limit);
  if (rows.length === 0) {
    // Fallback to older highly viewed videos
    const fallbackRows = db.prepare(`
      ${VIDEO_SELECT}
      ORDER BY v.published_at ASC LIMIT ?
    `).all(limit);
    return fallbackRows.map(mapVideoRow);
  }
  return rows.map(mapVideoRow);
}

export function getVideoBySlug(slug: string): VideoItem | null {
  const db = getDb();
  const row = db.prepare(`
    ${VIDEO_SELECT}
    WHERE v.slug = ?
  `).get(slug);

  if (!row) return null;

  try {
    db.prepare('UPDATE videos SET views_count = views_count + 1 WHERE slug = ?').run(slug);
  } catch (_) {}

  return mapVideoRow(row);
}

export function getVideosByCategory(categorySlug: string, limit = 12): VideoItem[] {
  const db = getDb();
  const term = `%${categorySlug}%`;
  const rows = db.prepare(`
    ${VIDEO_SELECT}
    WHERE v.category LIKE ? OR LOWER(v.category) = LOWER(?)
    ORDER BY v.published_at DESC LIMIT ?
  `).all(term, categorySlug, limit);
  return rows.map(mapVideoRow);
}

export function getVideosByShow(showIdOrSlug: string, limit = 20): VideoItem[] {
  const db = getDb();
  const rows = db.prepare(`
    ${VIDEO_SELECT}
    WHERE v.show_id = ? OR s.slug = ?
    ORDER BY v.published_at DESC LIMIT ?
  `).all(showIdOrSlug, showIdOrSlug, limit);
  return rows.map(mapVideoRow);
}

export function getRelatedVideos(videoId: string, category: string, limit = 4): VideoItem[] {
  const db = getDb();
  const rows = db.prepare(`
    ${VIDEO_SELECT}
    WHERE v.id != ? AND (v.category = ? OR 1=1)
    ORDER BY v.published_at DESC LIMIT ?
  `).all(videoId, category, limit);
  return rows.map(mapVideoRow);
}

export function searchVideos(query: string, limit = 20): VideoItem[] {
  const db = getDb();
  const term = `%${query.trim()}%`;
  const rows = db.prepare(`
    ${VIDEO_SELECT}
    WHERE v.title LIKE ? OR v.summary LIKE ? OR v.category LIKE ?
    ORDER BY v.published_at DESC LIMIT ?
  `).all(term, term, term, limit);
  return rows.map(mapVideoRow);
}

// 4B. Shows
export function getShows(): Show[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT 
      s.*,
      (SELECT COUNT(*) FROM videos v WHERE v.show_id = s.id) as episode_count
    FROM shows s
    ORDER BY s.order_index ASC, s.created_at ASC
  `).all() as unknown as Show[];

  return toPlain(rows);
}

export function getShowBySlug(slug: string): (Show & { videos: VideoItem[] }) | null {
  const db = getDb();
  const row = db.prepare(`
    SELECT 
      s.*,
      (SELECT COUNT(*) FROM videos v WHERE v.show_id = s.id) as episode_count
    FROM shows s
    WHERE s.slug = ?
  `).get(slug) as unknown as Show | undefined;

  if (!row) return null;

  const show = toPlain(row) as Show & { videos: VideoItem[] };
  show.videos = getVideosByShow(show.id, 30);
  return show;
}

export function getShowById(id: string): Show | null {
  const db = getDb();
  const row = db.prepare(`
    SELECT 
      s.*,
      (SELECT COUNT(*) FROM videos v WHERE v.show_id = s.id) as episode_count
    FROM shows s
    WHERE s.id = ?
  `).get(id) as unknown as Show | undefined;

  return row ? toPlain(row) : null;
}


// 5. Photo Stories
export function getPhotoStories(limit = 4): PhotoStory[] {
  const db = getDb();
  const rawStories = db.prepare(`
    SELECT * FROM photo_stories ORDER BY published_at DESC LIMIT ?
  `).all(limit) as unknown as PhotoStory[];

  const stories = toPlain(rawStories);

  for (const story of stories) {
    const items = db.prepare(`
      SELECT * FROM photo_story_items WHERE photo_story_id = ? ORDER BY order_index ASC
    `).all(story.id) as unknown as PhotoStoryItem[];
    story.items = toPlain(items);
  }

  return stories;
}

export function getPhotoStoryBySlug(slug: string): PhotoStory | null {
  const db = getDb();
  const rawStory = db.prepare('SELECT * FROM photo_stories WHERE slug = ?').get(slug) as unknown as PhotoStory | undefined;
  if (!rawStory) return null;

  const story = toPlain(rawStory);

  const items = db.prepare(`
    SELECT * FROM photo_story_items WHERE photo_story_id = ? ORDER BY order_index ASC
  `).all(story.id) as unknown as PhotoStoryItem[];
  story.items = toPlain(items);
  return story;
}

// 6. Live Blogs & Updates
export function getLiveBlogs(): LiveBlog[] {
  const db = getDb();
  return toPlain(db.prepare(`
    SELECT 
      lb.*,
      r.name as reporter_name,
      r.avatar_url as reporter_avatar,
      c.name as category_name
    FROM live_blogs lb
    LEFT JOIN reporters r ON lb.reporter_id = r.id
    LEFT JOIN categories c ON lb.category_id = c.id
    ORDER BY lb.updated_at DESC
  `).all() as unknown as LiveBlog[]);
}

export function getLiveBlogBySlug(slug: string): LiveBlog | null {
  const db = getDb();
  const rawBlog = db.prepare(`
    SELECT 
      lb.*,
      r.name as reporter_name,
      r.avatar_url as reporter_avatar,
      c.name as category_name
    FROM live_blogs lb
    LEFT JOIN reporters r ON lb.reporter_id = r.id
    LEFT JOIN categories c ON lb.category_id = c.id
    WHERE lb.slug = ?
  `).get(slug) as unknown as LiveBlog | undefined;

  if (!rawBlog) return null;

  const blog = toPlain(rawBlog);

  const updates = db.prepare(`
    SELECT * FROM live_updates 
    WHERE live_blog_id = ? 
    ORDER BY created_at DESC
  `).all(blog.id) as unknown as LiveUpdate[];

  blog.updates = toPlain(updates);
  return blog;
}

export function getLiveUpdates(liveBlogId: string, limit = 50): LiveUpdate[] {
  const db = getDb();
  return toPlain(db.prepare(`
    SELECT * FROM live_updates 
    WHERE live_blog_id = ? 
    ORDER BY created_at DESC LIMIT ?
  `).all(liveBlogId, limit) as unknown as LiveUpdate[]);
}

// 7. Reporters
export function getReporters(): Reporter[] {
  const db = getDb();
  return toPlain(db.prepare('SELECT * FROM reporters WHERE is_active = 1 ORDER BY name ASC').all() as unknown as Reporter[]);
}

export function getReporterBySlug(slug: string): Reporter | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM reporters WHERE slug = ?').get(slug);
  return row ? toPlain(row as unknown as Reporter) : null;
}

export function getArticlesByReporter(reporterId: string, limit = 10): Article[] {
  const db = getDb();
  const rows = db.prepare(`
    ${ARTICLE_SELECT}
    WHERE a.status = 'PUBLISHED' AND a.reporter_id = ?
    ORDER BY a.published_at DESC LIMIT ?
  `).all(reporterId, limit);
  return rows.map(mapArticleRow);
}

// 8. Search
export function searchArticles(query: string, options?: { category?: string, type?: string, district?: string, sort?: string }): Article[] {
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

  const rows = db.prepare(sql).all(...params);
  return rows.map(mapArticleRow);
}

// 9. Admin Stats & Management
export function getEditorialStats() {
  const db = getDb();
  const published = (db.prepare("SELECT COUNT(*) as count FROM articles WHERE status = 'PUBLISHED'").get() as any)?.count || 0;
  const inReview = (db.prepare("SELECT COUNT(*) as count FROM articles WHERE status = 'IN_REVIEW'").get() as any)?.count || 0;
  const drafts = (db.prepare("SELECT COUNT(*) as count FROM articles WHERE status = 'DRAFT'").get() as any)?.count || 0;
  const scheduled = (db.prepare("SELECT COUNT(*) as count FROM articles WHERE status = 'SCHEDULED'").get() as any)?.count || 0;
  const totalReporters = (db.prepare("SELECT COUNT(*) as count FROM reporters WHERE is_active = 1").get() as any)?.count || 0;
  const totalVideos = (db.prepare("SELECT COUNT(*) as count FROM videos").get() as any)?.count || 0;
  const totalLiveBlogs = (db.prepare("SELECT COUNT(*) as count FROM live_blogs WHERE status = 'ACTIVE'").get() as any)?.count || 0;
  const subscribers = (db.prepare("SELECT COUNT(*) as count FROM newsletter_subscribers WHERE is_active = 1").get() as any)?.count || 0;

  return {
    published: Number(published),
    inReview: Number(inReview),
    drafts: Number(drafts),
    scheduled: Number(scheduled),
    totalReporters: Number(totalReporters),
    totalVideos: Number(totalVideos),
    totalLiveBlogs: Number(totalLiveBlogs),
    subscribers: Number(subscribers)
  };
}

export function getAllArticlesAdmin(status?: string): Article[] {
  const db = getDb();
  if (status && status !== 'ALL') {
    const rows = db.prepare(`
      ${ARTICLE_SELECT}
      WHERE a.status = ?
      ORDER BY a.created_at DESC
    `).all(status);
    return rows.map(mapArticleRow);
  }
  const rows = db.prepare(`
    ${ARTICLE_SELECT}
    ORDER BY a.created_at DESC
  `).all();
  return rows.map(mapArticleRow);
}

export function getAllVideosAdmin(): VideoItem[] {
  const db = getDb();
  const rows = db.prepare(`
    ${VIDEO_SELECT}
    ORDER BY v.created_at DESC
  `).all();
  return rows.map(mapVideoRow);
}

export function getAllShowsAdmin(): Show[] {
  return getShows();
}

export function getCommentsForArticle(articleId: string): CommentItem[] {
  const db = getDb();
  const comments = db.prepare(`
    SELECT * FROM comments 
    WHERE article_id = ? AND status = 'APPROVED'
    ORDER BY created_at DESC
  `).all(articleId) as unknown as CommentItem[];
  return toPlain(comments);
}

