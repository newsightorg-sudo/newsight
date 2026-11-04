import { getDb } from '@/lib/db';

export async function GET() {
  const db = getDb();
  const articles = db.prepare("SELECT slug, published_at FROM articles WHERE status = 'PUBLISHED' ORDER BY published_at DESC LIMIT 100").all() as any[];
  const categories = db.prepare('SELECT slug FROM categories').all() as any[];

  const baseUrl = 'https://dailysignal.com';

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>always</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/regional/kerala</loc>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/live</loc>
    <changefreq>always</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/video</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/photos</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/opinion</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/reporters</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  ${categories.map(c => `
  <url>
    <loc>${baseUrl}/category/${c.slug}</loc>
    <changefreq>hourly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
  ${articles.map(a => `
  <url>
    <loc>${baseUrl}/article/${a.slug}</loc>
    <lastmod>${new Date(a.published_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>`).join('')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
