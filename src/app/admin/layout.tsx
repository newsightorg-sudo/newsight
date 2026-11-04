import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import AdminShell from '@/components/admin/AdminShell';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    return <div className="min-h-screen bg-white dark:bg-[#0B1220] text-[#174A7E] dark:text-[#F4F7FB]">{children}</div>;
  }

  return (
    <AdminShell userRole={user.role} userName={user.name}>
      {children}
    </AdminShell>
  );
}
