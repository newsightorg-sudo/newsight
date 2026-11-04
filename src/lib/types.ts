export type UserRole = 'SUPER_ADMIN' | 'EDITOR' | 'REPORTER' | 'VIDEO_JOURNALIST' | 'CONTRIBUTOR';

export type ArticleStatus = 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';

export type ArticleType = 'NEWS' | 'ANALYSIS' | 'OPINION' | 'INVESTIGATION' | 'EXPLAINER' | 'GROUND_REPORT';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash?: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface Reporter {
  id: string;
  user_id?: string;
  name: string;
  slug: string;
  title: string;
  beat: string;
  bio: string;
  avatar_url: string;
  email: string;
  twitter?: string;
  linkedin?: string;
  is_active: number;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  order_index: number;
  show_in_nav: number;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  deck: string;
  body: string;
  featured_image: string;
  image_caption?: string;
  image_credit?: string;
  category_id: string;
  category_name?: string;
  category_slug?: string;
  category_color?: string;
  reporter_id: string;
  reporter_name?: string;
  reporter_title?: string;
  reporter_slug?: string;
  reporter_avatar?: string;
  status: ArticleStatus;
  article_type: ArticleType;
  is_breaking: number;
  is_lead: number;
  is_featured: number;
  is_opinion: number;
  is_sponsored: number;
  reading_time_minutes: number;
  district?: string;
  source_attribution?: string;
  correction_notice?: string;
  scheduled_at?: string;
  published_at?: string;
  updated_at?: string;
  created_at: string;
  views_count: number;
  tags?: Tag[];
}

export interface Show {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_image: string;
  banner_image?: string;
  host_name?: string;
  schedule_info?: string;
  order_index: number;
  created_at: string;
  episode_count?: number;
  videos?: VideoItem[];
}

export interface VideoItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  video_url: string;
  thumbnail_url: string;
  duration: string;
  category: string;
  reporter_id?: string;
  reporter_name?: string;
  reporter_title?: string;
  reporter_slug?: string;
  reporter_avatar?: string;
  show_id?: string;
  show_title?: string;
  show_slug?: string;
  views_count?: number;
  video_type?: 'REPORT' | 'INTERVIEW' | 'DOCUMENTARY' | 'EXPLAINER' | 'LIVE_REPLAY' | 'SHORT' | 'CLASSIC';
  is_featured: number;
  published_at: string;
  created_at: string;
}

export interface PhotoStory {
  id: string;
  title: string;
  slug: string;
  summary: string;
  featured_image: string;
  photographer: string;
  published_at: string;
  created_at: string;
  items?: PhotoStoryItem[];
}

export interface PhotoStoryItem {
  id: string;
  photo_story_id: string;
  image_url: string;
  caption: string;
  credit?: string;
  order_index: number;
}

export interface LiveBlog {
  id: string;
  title: string;
  slug: string;
  summary: string;
  status: 'ACTIVE' | 'CONCLUDED' | 'PAUSED';
  reporter_id?: string;
  reporter_name?: string;
  reporter_avatar?: string;
  category_id?: string;
  category_name?: string;
  started_at: string;
  updated_at: string;
  created_at: string;
  updates?: LiveUpdate[];
}

export interface LiveUpdate {
  id: string;
  live_blog_id: string;
  title: string;
  content: string;
  image_url?: string;
  author_name: string;
  is_key_event: number;
  timestamp: string;
  created_at: string;
}

export interface MediaAsset {
  id: string;
  filename: string;
  url: string;
  alt_text: string;
  caption?: string;
  credit?: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  edition_preference: string;
  is_active: number;
  subscribed_at: string;
}

export interface EditorialSettings {
  publication_name: string;
  tagline: string;
  logo_url?: string;
  primary_color: string;
  accent_color: string;
  breaking_banner_active: boolean;
  breaking_headline: string;
  breaking_url: string;
  breaking_time: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  twitter_url: string;
  facebook_url: string;
  instagram_url: string;
  youtube_url: string;
  linkedin_url?: string;
  footer_text: string;
  ads_enabled: boolean;
  ad_image_url?: string;
  ad_target_url?: string;
  ad_title?: string;
  ad_active?: boolean;
  live_stream_url?: string;
  live_stream_title?: string;
  live_current_show?: string;
  live_schedule_json?: string;
}

export interface CommentItem {
  id: string;
  article_id: string;
  author_name: string;
  author_email: string;
  content: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
}

