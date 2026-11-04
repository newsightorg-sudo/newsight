import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'news.db');

// Preserve singleton across fast reloads
const globalForDb = global as unknown as { __sqlite_db?: DatabaseSync };

export function getDb(): DatabaseSync {
  if (!globalForDb.__sqlite_db) {
    const db = new DatabaseSync(dbPath);
    try { db.exec('PRAGMA busy_timeout = 10000;'); } catch (_) {}
    try { db.exec('PRAGMA foreign_keys = ON;'); } catch (_) {}
    try { db.exec('PRAGMA journal_mode = WAL;'); } catch (_) {}
    initSchema(db);
    globalForDb.__sqlite_db = db;
  }
  return globalForDb.__sqlite_db;
}

function initSchema(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'REPORTER',
      avatar_url TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reporters (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      beat TEXT NOT NULL,
      bio TEXT NOT NULL,
      avatar_url TEXT NOT NULL,
      email TEXT NOT NULL,
      twitter TEXT,
      linkedin TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      color TEXT,
      order_index INTEGER NOT NULL DEFAULT 0,
      show_in_nav INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      deck TEXT NOT NULL,
      body TEXT NOT NULL,
      featured_image TEXT NOT NULL,
      image_caption TEXT,
      image_credit TEXT,
      category_id TEXT NOT NULL,
      reporter_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'DRAFT',
      article_type TEXT NOT NULL DEFAULT 'NEWS',
      is_breaking INTEGER NOT NULL DEFAULT 0,
      is_lead INTEGER NOT NULL DEFAULT 0,
      is_featured INTEGER NOT NULL DEFAULT 0,
      is_opinion INTEGER NOT NULL DEFAULT 0,
      is_sponsored INTEGER NOT NULL DEFAULT 0,
      reading_time_minutes INTEGER NOT NULL DEFAULT 4,
      district TEXT,
      source_attribution TEXT,
      correction_notice TEXT,
      scheduled_at TEXT,
      published_at TEXT,
      updated_at TEXT,
      created_at TEXT NOT NULL,
      views_count INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
      FOREIGN KEY (reporter_id) REFERENCES reporters(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS article_tags (
      article_id TEXT NOT NULL,
      tag_id TEXT NOT NULL,
      PRIMARY KEY (article_id, tag_id),
      FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS videos (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      summary TEXT NOT NULL,
      video_url TEXT NOT NULL,
      thumbnail_url TEXT NOT NULL,
      duration TEXT NOT NULL,
      category TEXT NOT NULL,
      reporter_id TEXT,
      is_featured INTEGER NOT NULL DEFAULT 0,
      published_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (reporter_id) REFERENCES reporters(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS photo_stories (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      summary TEXT NOT NULL,
      featured_image TEXT NOT NULL,
      photographer TEXT NOT NULL,
      published_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS photo_story_items (
      id TEXT PRIMARY KEY,
      photo_story_id TEXT NOT NULL,
      image_url TEXT NOT NULL,
      caption TEXT NOT NULL,
      credit TEXT,
      order_index INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (photo_story_id) REFERENCES photo_stories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS live_blogs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      summary TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      reporter_id TEXT,
      category_id TEXT,
      started_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (reporter_id) REFERENCES reporters(id) ON DELETE SET NULL,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS live_updates (
      id TEXT PRIMARY KEY,
      live_blog_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      image_url TEXT,
      author_name TEXT NOT NULL,
      is_key_event INTEGER NOT NULL DEFAULT 0,
      timestamp TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (live_blog_id) REFERENCES live_blogs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS media_assets (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      url TEXT NOT NULL,
      alt_text TEXT NOT NULL,
      caption TEXT,
      credit TEXT,
      file_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      edition_preference TEXT NOT NULL DEFAULT 'India',
      is_active INTEGER NOT NULL DEFAULT 1,
      subscribed_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      article_id TEXT NOT NULL,
      author_name TEXT NOT NULL,
      author_email TEXT NOT NULL,
      content TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'APPROVED',
      created_at TEXT NOT NULL,
      FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS shows (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      cover_image TEXT NOT NULL,
      banner_image TEXT,
      host_name TEXT,
      schedule_info TEXT,
      order_index INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS editorial_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    -- Create indexes for fast news queries
    CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
    CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at DESC);
    CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_id);
    CREATE INDEX IF NOT EXISTS idx_articles_reporter ON articles(reporter_id);
    CREATE INDEX IF NOT EXISTS idx_articles_district ON articles(district);
    CREATE INDEX IF NOT EXISTS idx_live_updates_blog ON live_updates(live_blog_id, timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_videos_featured ON videos(is_featured);
    CREATE INDEX IF NOT EXISTS idx_shows_order ON shows(order_index ASC);
  `);

  // Run dynamic safe alterations for videos schema
  try {
    db.exec('ALTER TABLE videos ADD COLUMN show_id TEXT REFERENCES shows(id) ON DELETE SET NULL;');
  } catch (_) {}
  try {
    db.exec('ALTER TABLE videos ADD COLUMN views_count INTEGER NOT NULL DEFAULT 0;');
  } catch (_) {}
  try {
    db.exec("ALTER TABLE videos ADD COLUMN video_type TEXT NOT NULL DEFAULT 'REPORT';");
  } catch (_) {}
}

export const db = getDb();
