import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getCategories, getReporters } from '@/lib/data';
import ArticleForm from '@/components/admin/ArticleForm';

interface CreateArticlePageProps {
  searchParams: Promise<{ reporterId?: string }>;
}

export default async function CreateArticlePage({ searchParams }: CreateArticlePageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/admin/login');
  }

  const { reporterId } = (await searchParams) || {};
  const categories = await getCategories(false);
  const reporters = await getReporters();

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <ArticleForm
        categories={categories}
        reporters={reporters}
        userRole={user.role}
        isEditing={false}
        defaultReporterId={reporterId}
      />
    </div>
  );
}
