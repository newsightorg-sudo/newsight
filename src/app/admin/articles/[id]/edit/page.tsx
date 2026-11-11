import React from 'react';
import { redirect, notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getCategories, getReporters } from '@/lib/data';
import { getDb } from '@/lib/db';
import ArticleForm from '@/components/admin/ArticleForm';

interface EditArticlePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/admin/login');
  }

  const { id } = await params;
  const db = getDb();
  const article = await db.prepare('SELECT * FROM articles WHERE id = ?').get(id) as any;

  if (!article) {
    notFound();
  }

  const categories = await getCategories(false);
  const reporters = await getReporters();

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <ArticleForm
        initialArticle={article}
        categories={categories}
        reporters={reporters}
        userRole={user.role}
        isEditing={true}
      />
    </div>
  );
}
