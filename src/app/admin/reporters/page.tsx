import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { getReporters } from '@/lib/data';
import ReportersManagementView from '@/components/admin/ReportersManagementView';

export const dynamic = 'force-dynamic';

export default async function AdminReportersPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/admin/login');
  }

  // Only Administrator (SUPER_ADMIN) can access reporter & credential management
  if (!isAdmin(user.role)) {
    redirect('/admin');
  }

  // Load all reporters including inactive and with credential details
  const reporters = await getReporters(true);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <ReportersManagementView
        initialReporters={reporters}
        currentUserRole={user.role}
      />
    </div>
  );
}
