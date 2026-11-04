import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getAllArticlesAdmin, getCategories, getReporters } from '@/lib/data';
import ArticleManagementView from '@/components/admin/ArticleManagementView';

interface ArticlesPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminArticlesPage({ searchParams }: ArticlesPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/admin/login');
  }

  const { status = 'ALL' } = await searchParams;
  const articles = getAllArticlesAdmin('ALL');
  const categories = getCategories();
  const reporters = getReporters();

  return (
    <ArticleManagementView
      initialArticles={articles}
      categories={categories}
      reporters={reporters}
      userRole={user.role}
      initialStatus={status}
    />
  );
}
