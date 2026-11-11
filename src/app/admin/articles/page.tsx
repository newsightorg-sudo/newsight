import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getAllArticlesAdmin, getCategories, getReporters } from '@/lib/data';
import ArticleManagementView from '@/components/admin/ArticleManagementView';

interface ArticlesPageProps {
  searchParams: Promise<{ status?: string; author?: string }>;
}

export default async function AdminArticlesPage({ searchParams }: ArticlesPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/admin/login');
  }

  const { status = 'ALL', author = 'ALL' } = await searchParams;
  const [articles, categories, reporters] = await Promise.all([
    getAllArticlesAdmin('ALL'),
    getCategories(),
    getReporters()
  ]);

  return (
    <ArticleManagementView
      initialArticles={articles}
      categories={categories}
      reporters={reporters}
      userRole={user.role}
      initialStatus={status}
      initialAuthor={author}
    />
  );
}
