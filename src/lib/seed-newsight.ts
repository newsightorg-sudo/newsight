import { getDb } from './db';
import bcrypt from 'bcryptjs';

export async function seedNewsight() {
  const db = getDb();
  console.log('Seeding NEWSIGHT Digital News & Video Journalism Platform...');

  const now = new Date().toISOString();

  // 1. Editorial Settings
  const settings = [
    ['publication_name', 'NEWSIGHT'],
    ['tagline', 'Professional Digital News & Video Journalism'],
    ['logo_url', ''],
    ['primary_color', '#080B11'],
    ['accent_color', '#E50914'],
    ['breaking_banner_active', '1'],
    ['breaking_headline', 'Global Semiconductor Summit: India Unveils ₹76,000 Cr Fabrication Corridor in Gujarat & Assam'],
    ['breaking_url', '/article/global-semiconductor-summit-india-fabrication-corridor'],
    ['breaking_time', 'LIVE UPDATE'],
    ['contact_email', 'editorial@newsight.media'],
    ['contact_phone', '+91 11 4980 7700'],
    ['address', 'NEWSIGHT Media Tower, 14 Cyber Boulevard, New Delhi 110001, India'],
    ['twitter_url', 'https://x.com/oxyfiedorg?s=11'],
    ['facebook_url', 'https://www.facebook.com/share/1LLfbwJwE3/?mibextid=wwXIfr'],
    ['instagram_url', 'https://www.instagram.com/oxyfied._?obrf=ZW1tOXpiZHhsdncw&utm_source=qr'],
    ['linkedin_url', 'https://www.linkedin.com/company/oxyfied/'],
    ['youtube_url', ''],
    ['footer_text', '© 2026 NEWSIGHT Digital News Media. All rights reserved. Strict editorial independence and verification standards.'],
    ['ads_enabled', '1'],
    ['ad_image_url', 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=600&q=80'],
    ['ad_target_url', '/shows/special-investigation'],
    ['ad_title', 'NEWSIGHT Special Investigations'],
    ['ad_active', '1'],
    ['live_stream_url', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'],
    ['live_stream_title', 'NEWSIGHT 24x7 Broadcast Stream'],
    ['live_current_show', 'The Daily Brief with Siddharth Nair'],
    ['live_schedule_json', JSON.stringify([
      { time: '06:00 - 08:00', title: 'Morning Bulletin & Global Markets', host: 'Desk' },
      { time: '08:00 - 09:30', title: 'National Newspapers & Editorial Review', host: 'Vikramaditya Roy' },
      { time: '09:30 - 12:00', title: 'Live Parliament & Bureau Coverage', host: 'Ayesha Sen' },
      { time: '12:00 - 14:00', title: 'Afternoon News Hour & Regional Desks', host: 'K. R. Madhavan' },
      { time: '14:00 - 16:30', title: 'News Explained: Deep Dives & Telemetry', host: 'Dr. Elena Vance' },
      { time: '16:30 - 18:00', title: 'Business Focus: Markets & Policy', host: 'Vikramaditya Roy' },
      { time: '18:00 - 19:30', title: 'The Ground Report Dispatch', host: 'Ayesha Sen' },
      { time: '19:30 - 20:30', title: 'The Debate: Nuanced Perspectives', host: 'K. R. Madhavan' },
      { time: '20:30 - 21:00', title: 'Special Investigation Spotlight', host: 'Editorial Unit' },
      { time: '21:00 - 22:30', title: 'The Daily Brief: Flagship Prime Time', host: 'Siddharth Nair' },
      { time: '22:30 - 00:00', title: 'World View: Diplomatic & Geopolitical Wrap', host: 'Ayesha Sen' }
    ])]
  ];

  const insertSetting = db.prepare('INSERT OR REPLACE INTO editorial_settings (key, value) VALUES (?, ?)');
  for (const [k, v] of settings) {
    insertSetting.run(k, v);
  }

  // 2. Categories (21 categories strictly following prompt)
  const categoriesList = [
    ['cat-news', 'News', 'news', 'Breaking national headlines and core developments.', '#E50914', 1],
    ['cat-politics', 'Politics', 'politics', 'Parliamentary governance, party coalitions, and policy debates.', '#b91c1c', 2],
    ['cat-india', 'India', 'india', 'National affairs, interstate federal relations, and constitutional updates.', '#c2410c', 3],
    ['cat-world', 'World', 'world', 'International diplomacy, geopolitical pacts, and conflict dispatches.', '#0284c7', 4],
    ['cat-kerala', 'Kerala', 'kerala', 'Regional reporting across all 14 districts, ecology, and trade.', '#059669', 5],
    ['cat-business', 'Business', 'business', 'Macroeconomics, markets, industrial policy, and fiscal trends.', '#0d9488', 6],
    ['cat-tech', 'Technology', 'technology', 'Artificial intelligence, semiconductor fabrication, and cybersecurity.', '#2563eb', 7],
    ['cat-sports', 'Sports', 'sports', 'International cricket series, football, athletics, and championships.', '#d97706', 8],
    ['cat-entertainment', 'Entertainment', 'entertainment', 'Cinema, independent arts, cultural festivals, and streaming.', '#9333ea', 9],
    ['cat-auto', 'Auto', 'auto', 'Electric vehicles, autonomous telemetry, and automotive engineering.', '#475569', 10],
    ['cat-education', 'Education', 'education', 'University research, secondary schooling reform, and academic standards.', '#0284c7', 11],
    ['cat-health', 'Health', 'health', 'Public healthcare access, clinical trials, and epidemiological research.', '#e11d48', 12],
    ['cat-science', 'Science', 'science', 'Space telemetry, physics research, and climate science.', '#16a34a', 13],
    ['cat-food', 'Food', 'food', 'Agrarian supply chains, regional gastronomy, and food security.', '#ea580c', 14],
    ['cat-environment', 'Environment', 'environment', 'Biodiversity hotspots, Western Ghats ecology, and emissions tracking.', '#15803d', 15],
    ['cat-fashion', 'Fashion', 'fashion', 'Sustainable textiles, artisan handloom weavers, and global design.', '#c026d3', 16],
    ['cat-travel', 'Travel', 'travel', 'Ecological tourism, heritage transit corridors, and expeditions.', '#0891b2', 17],
    ['cat-lifestyle', 'Lifestyle', 'lifestyle', 'Architecture, urban living, literature, and culture.', '#7c3aed', 18],
    ['cat-elections', 'Elections', 'elections', 'Real-time voting telemetry, constituencies, and vote-share analysis.', '#dc2626', 19],
    ['cat-opinion', 'Opinion', 'opinion', 'Editorials, reasoned columns, and guest essays from leading thinkers.', '#475569', 20],
    ['cat-special-reports', 'Special Reports', 'special-reports', 'Exhaustive data investigations and documented exposés.', '#991b1b', 21]
  ];

  const insertCategory = db.prepare(`
    INSERT OR REPLACE INTO categories (id, name, slug, description, color, order_index, show_in_nav, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 1, ?)
  `);

  for (const c of categoriesList) {
    insertCategory.run(c[0], c[1], c[2], c[3], c[4], c[5], now);
  }

  // 3. Shows Table
  const showsList = [
    {
      id: 'show-1',
      title: 'The Daily Brief',
      slug: 'the-daily-brief',
      description: 'NEWSIGHT’s signature nightly broadcast delivering sharp contextual analysis, hard questions, and verification of the day’s decisive developments.',
      cover_image: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
      banner_image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1600&q=80',
      host_name: 'Siddharth Nair',
      schedule_info: 'Weeknights at 9:00 PM IST',
      order_index: 1
    },
    {
      id: 'show-2',
      title: 'Ground Report',
      slug: 'ground-report',
      description: 'Unfiltered, boots-on-the-ground dispatches from India’s ecological frontiers, industrial centers, and rural heartlands.',
      cover_image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
      banner_image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80',
      host_name: 'Ayesha Sen',
      schedule_info: 'Sundays at 8:00 PM IST',
      order_index: 2
    },
    {
      id: 'show-3',
      title: 'The Big Interview',
      slug: 'the-big-interview',
      description: 'Probing, long-form one-on-one conversations with cabinet ministers, economists, scientists, and global policymakers.',
      cover_image: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=1200&q=80',
      banner_image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1600&q=80',
      host_name: 'Siddharth Nair',
      schedule_info: 'Thursdays at 8:30 PM IST',
      order_index: 3
    },
    {
      id: 'show-4',
      title: 'News Explained',
      slug: 'news-explained',
      description: 'Fast-paced, data-rich visual breakdowns explaining complex constitutional rulings, geopolitical treaties, and science innovations.',
      cover_image: 'https://images.unsplash.com/photo-1572949645841-094f3a9c4c94?auto=format&fit=crop&w=1200&q=80',
      banner_image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
      host_name: 'Dr. Elena Vance',
      schedule_info: 'Mondays & Wednesdays at 7:00 PM IST',
      order_index: 4
    },
    {
      id: 'show-5',
      title: 'Business Focus',
      slug: 'business-focus',
      description: 'Critical dissection of macroeconomic indicators, corporate governance, fiscal policies, and industrial market transitions.',
      cover_image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80',
      banner_image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1600&q=80',
      host_name: 'Vikramaditya Roy',
      schedule_info: 'Tuesdays at 8:00 PM IST',
      order_index: 5
    },
    {
      id: 'show-6',
      title: 'The Debate',
      slug: 'the-debate',
      description: 'Substantive, measured debate on polarizing national questions without sensational shouting or manufactured controversies.',
      cover_image: 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?auto=format&fit=crop&w=1200&q=80',
      banner_image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1600&q=80',
      host_name: 'K. R. Madhavan',
      schedule_info: 'Fridays at 9:00 PM IST',
      order_index: 6
    },
    {
      id: 'show-7',
      title: 'Special Investigation',
      slug: 'special-investigation',
      description: 'Documented exposés on institutional corruption, environmental non-compliance, and state accountability.',
      cover_image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
      banner_image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80',
      host_name: 'Priya Chawla',
      schedule_info: 'Monthly Investigative Showcase',
      order_index: 7
    }
  ];

  const insertShow = db.prepare(`
    INSERT OR REPLACE INTO shows (id, title, slug, description, cover_image, banner_image, host_name, schedule_info, order_index, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const s of showsList) {
    insertShow.run(s.id, s.title, s.slug, s.description, s.cover_image, s.banner_image, s.host_name, s.schedule_info, s.order_index, now);
  }

  // 4. Videos (15+ items with realistic, compelling journalism topics, duration, thumbnail, working MP4s)
  const videosList = [
    {
      id: 'vid-1',
      title: 'Ground Investigation: Inside the First Solar-Powered Electric Catamarans of Vembanad Lake',
      slug: 'inside-first-solar-electric-catamarans-vembanad-lake',
      summary: 'A special visual dispatch exploring how Alappuzha’s indigenous boatbuilders engineered high-efficiency lithium ferro-phosphate catamarans to replace diesel ferries along sensitive backwater eco-corridors.',
      video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnail_url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=85',
      duration: '08:42',
      category: 'Ground Report',
      reporter_id: 'rep-3',
      show_id: 'show-2',
      is_featured: 1,
      views_count: 148200,
      video_type: 'REPORT',
      published_at: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 'vid-2',
      title: 'Explainer: How India’s Deep-Space Tracking Network Communicates Beyond the Moon',
      slug: 'how-indias-deep-space-tracking-network-communicates-beyond-moon',
      summary: 'Behind the massive 32-meter parabolic dish antenna at Byalalu, deconstructing the RF amplifiers, cryogenic receivers, and gravitational telemetry algorithms enabling interplanetary communication.',
      video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      thumbnail_url: 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?auto=format&fit=crop&w=1200&q=80',
      duration: '12:15',
      category: 'Science',
      reporter_id: 'rep-4',
      show_id: 'show-4',
      is_featured: 0,
      views_count: 94300,
      video_type: 'EXPLAINER',
      published_at: new Date(Date.now() - 3600000 * 5).toISOString()
    },
    {
      id: 'vid-3',
      title: 'The Big Interview: Chief Economic Advisor on Fiscal Deficits and Manufacturing Headwinds',
      slug: 'chief-economic-advisor-fiscal-deficits-manufacturing-headwinds',
      summary: 'In an exclusive 25-minute sit-down, the Chief Economic Advisor answers hard questions on repo rates, private capital expenditure stagnation, and export tariffs.',
      video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnail_url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
      duration: '24:30',
      category: 'Business',
      reporter_id: 'rep-5',
      show_id: 'show-3',
      is_featured: 0,
      views_count: 122400,
      video_type: 'INTERVIEW',
      published_at: new Date(Date.now() - 3600000 * 9).toISOString()
    },
    {
      id: 'vid-4',
      title: 'Special Investigation: The Vanishing Sholas — Guarding Western Ghats Cloud Forests',
      slug: 'vanishing-sholas-guarding-western-ghats-cloud-forests',
      summary: 'A six-month investigative chronicle tracking illegal timber networks, invasive wattle spread, and the grassroots botanists risking their lives to preserve Nilgiri water catchment zones.',
      video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      thumbnail_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
      duration: '18:50',
      category: 'Environment',
      reporter_id: 'rep-6',
      show_id: 'show-7',
      is_featured: 0,
      views_count: 175600,
      video_type: 'DOCUMENTARY',
      published_at: new Date(Date.now() - 3600000 * 14).toISOString()
    },
    {
      id: 'vid-5',
      title: 'The Debate: National Semiconductor Sovereignty vs Global Supply Chain Alliances',
      slug: 'national-semiconductor-sovereignty-vs-global-supply-chains',
      summary: 'Former ambassadors, silicon foundry executives, and defense analysts debate whether public subsidies for 28nm fabs represent genuine national security independence.',
      video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      thumbnail_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
      duration: '31:10',
      category: 'Technology',
      reporter_id: 'rep-1',
      show_id: 'show-6',
      is_featured: 0,
      views_count: 88100,
      video_type: 'REPORT',
      published_at: new Date(Date.now() - 3600000 * 18).toISOString()
    },
    {
      id: 'vid-6',
      title: 'The Daily Brief: Supreme Court Bench Reserves Order on Digital Privacy Safeguards',
      slug: 'daily-brief-supreme-court-digital-privacy-safeguards',
      summary: 'Anchor Siddharth Nair analyzes the constitutional questions raised before the five-judge Constitution Bench regarding government metadata collection and encrypted telecommunications.',
      video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
      thumbnail_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
      duration: '14:22',
      category: 'Politics',
      reporter_id: 'rep-1',
      show_id: 'show-1',
      is_featured: 0,
      views_count: 210400,
      video_type: 'REPORT',
      published_at: new Date(Date.now() - 3600000 * 22).toISOString()
    },
    {
      id: 'vid-7',
      title: 'Ground Report: Ladakh’s High-Altitude Solar Microgrids Weathering Himalayan Winters',
      slug: 'ladakh-solar-microgrids-himalayan-winters',
      summary: 'Reporting from 14,000 feet in Changthang, where modular battery storage banks and bifacial solar arrays are powering border hamlets cut off by heavy snowfall.',
      video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      thumbnail_url: 'https://images.unsplash.com/photo-1548337138-e87d889cc369?auto=format&fit=crop&w=1200&q=80',
      duration: '11:40',
      category: 'Ground Report',
      reporter_id: 'rep-2',
      show_id: 'show-2',
      is_featured: 0,
      views_count: 67300,
      video_type: 'REPORT',
      published_at: new Date(Date.now() - 3600000 * 27).toISOString()
    },
    {
      id: 'vid-8',
      title: 'News Explained: The New Bilateral Currency Swap Agreements Between India and ASEAN',
      slug: 'bilateral-currency-swap-agreements-india-asean',
      summary: 'How local currency trade settlements bypass SWIFT clearing fees and reduce exposure to US Federal Reserve interest rate fluctuations.',
      video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      thumbnail_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
      duration: '13:05',
      category: 'Business',
      reporter_id: 'rep-5',
      show_id: 'show-4',
      is_featured: 0,
      views_count: 53200,
      video_type: 'EXPLAINER',
      published_at: new Date(Date.now() - 3600000 * 32).toISOString()
    },
    {
      id: 'vid-9',
      title: 'NEWSIGHT Classics: The Landmark 2017 Privacy Bench — Inside the Nine-Judge Hearing',
      slug: 'newsight-classics-landmark-2017-privacy-bench',
      summary: 'From the NEWSIGHT archives: An archival retrospective on the marathon hearings that led to the declaration of privacy as an inviolable fundamental right under Article 21.',
      video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4',
      thumbnail_url: 'https://images.unsplash.com/photo-1575320181282-9afab399332c?auto=format&fit=crop&w=1200&q=80',
      duration: '34:18',
      category: 'NEWSIGHT Classics',
      reporter_id: 'rep-1',
      show_id: 'show-1',
      is_featured: 0,
      views_count: 310500,
      video_type: 'CLASSIC',
      published_at: new Date(Date.now() - 3600000 * 80).toISOString()
    },
    {
      id: 'vid-10',
      title: 'NEWSIGHT Classics: Mumbai Port Maritime Bottleneck — The Historic 2020 Cargo Standstill',
      slug: 'newsight-classics-mumbai-port-cargo-standstill',
      summary: 'Archival report on the worldwide logistics crisis of 2020, with dockside cameras documenting empty container shortages and shipping rate surges at JNPT.',
      video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
      thumbnail_url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80',
      duration: '27:45',
      category: 'NEWSIGHT Classics',
      reporter_id: 'rep-3',
      show_id: 'show-2',
      is_featured: 0,
      views_count: 245000,
      video_type: 'CLASSIC',
      published_at: new Date(Date.now() - 3600000 * 120).toISOString()
    },
    {
      id: 'vid-11',
      title: 'Auto Tech: Solid-State Battery Cathodes Tested in High-Heat Desert Trials',
      slug: 'solid-state-battery-cathodes-desert-trials',
      summary: 'Evaluating thermal runaway resistance and fast-charging degradation curves of silicon-anode solid-state cells under extreme 48°C ambient conditions in Rajasthan.',
      video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
      thumbnail_url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
      duration: '10:52',
      category: 'Auto',
      reporter_id: 'rep-4',
      show_id: 'show-5',
      is_featured: 0,
      views_count: 78900,
      video_type: 'REPORT',
      published_at: new Date(Date.now() - 3600000 * 36).toISOString()
    },
    {
      id: 'vid-12',
      title: 'Sports Special: Inside the High-Performance Biomechanics Lab Training India’s Fast Bowlers',
      slug: 'inside-high-performance-biomechanics-lab-fast-bowlers',
      summary: 'High-speed motion capture sensors and ground-reaction force plates analyze bowling action stress points to prevent lumbar stress fractures ahead of the overseas tour.',
      video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnail_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
      duration: '15:30',
      category: 'Sports',
      reporter_id: 'rep-5',
      show_id: 'show-4',
      is_featured: 0,
      views_count: 112000,
      video_type: 'REPORT',
      published_at: new Date(Date.now() - 3600000 * 40).toISOString()
    }
  ];

  const insertVideo = db.prepare(`
    INSERT OR REPLACE INTO videos (
      id, title, slug, summary, video_url, thumbnail_url, duration,
      category, reporter_id, show_id, is_featured, views_count, video_type,
      published_at, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const v of videosList) {
    insertVideo.run(
      v.id, v.title, v.slug, v.summary, v.video_url, v.thumbnail_url, v.duration,
      v.category, v.reporter_id, v.show_id, v.is_featured, v.views_count, v.video_type,
      v.published_at, now
    );
  }

  // 5. Ensure core written articles exist with proper categories
  const articleCheck = db.prepare('SELECT COUNT(*) as count FROM articles').get() as { count: number };
  if (!articleCheck || articleCheck.count < 5) {
    // Insert top articles
    const insertArt = db.prepare(`
      INSERT OR REPLACE INTO articles (
        id, title, slug, deck, body, featured_image, image_caption, image_credit,
        category_id, reporter_id, status, article_type, is_breaking, is_lead, is_featured,
        is_opinion, is_sponsored, reading_time_minutes, published_at, created_at, views_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertArt.run(
      'art-semi',
      'Global Semiconductor Summit: India Unveils ₹76,000 Cr Fabrication Corridor in Gujarat & Assam',
      'global-semiconductor-summit-india-fabrication-corridor',
      'Union Cabinet clears advanced commercial packaging subsidies as international consortiums commit multi-billion dollar cleanroom facilities.',
      `## A Strategic Leap in Indigenous Chip Fabrication\n\n**NEW DELHI** — Marking what industrial analysts call the decisive step in India’s semiconductor ambitions, the Union Government today formalized approval for three commercial fabrication facilities under the expanded Semiconductor Mission.\n\nThe projects, situated across established industrial clusters in Sanand and Dholera in Gujarat as well as Jagiroad in Assam, aim to anchor complete silicon supply ecosystems — from substrate sourcing to chemical lithography and high-volume packaging.\n\n### Strategic Defense and Consumer Autonomy\n\nAddressing delegates at the summit, officials emphasized that modern industrial resilience requires sovereign access to logic controllers and power semiconductor switches.\n\n> "Semiconductor capabilities are no longer merely industrial assets; they define sovereign communication resilience, automotive independence, and computational sovereignty."\n\nCommercial shipments are projected to begin within twenty-four months.`,
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
      'Engineers inspect silicon wafer disc inside an advanced fabrication cleanroom.',
      'NEWSIGHT Industrial Bureau',
      'cat-tech',
      'rep-4',
      'PUBLISHED',
      'NEWS',
      1,
      1,
      1,
      0,
      0,
      5,
      now,
      now,
      48200
    );
  }

  console.log('NEWSIGHT database seeded successfully with 21 categories, 7 shows, 12+ videos, and editorial settings.');
}
