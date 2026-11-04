import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getCategories, getReporters } from '@/lib/data';
import ArticleForm from '@/components/admin/ArticleForm';

export default async function CreateArticlePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/admin/login');
  }

  const categories = getCategories(false);
  const reporters = getReporters();

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <ArticleForm
        categories={categories}
        reporters={reporters}
        userRole={user.role}
        isEditing={false}
      />
    </div>
  );
}
