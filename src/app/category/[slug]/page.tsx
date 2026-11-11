import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { 
  getCategoryBySlug, getArticlesByCategory, getVideosByCategory, getCategories 
} from '@/lib/data';
import PublicLayout from '@/components/public/PublicLayout';
import CategoryView from '@/components/public/CategoryView';

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const categories = await getCategories();
    return categories.map((cat) => ({
      slug: cat.slug,
    }));
  } catch (err) {
    console.warn('generateStaticParams error in category/[slug]:', err);
    return [];
  }
}

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: 'Category Not Found | NEWSIGHT' };

  return {
    title: `${category.name} | NEWSIGHT Digital Coverage`,
    description: category.description || `Verified reporting and video journalism in ${category.name}.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const [articles, videos] = await Promise.all([
    getArticlesByCategory(slug, 20),
    getVideosByCategory(category.name, 12)
  ]);

  return (
    <PublicLayout>
      <CategoryView category={category} articles={articles} videos={videos} />
    </PublicLayout>
  );
}
