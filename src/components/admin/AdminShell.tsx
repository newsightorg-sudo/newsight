'use client';

import React, { useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopHeader from '@/components/admin/AdminTopHeader';
import { UserRole } from '@/lib/types';

interface AdminShellProps {
  userRole?: UserRole;
  userName?: string;
  children: React.ReactNode;
}

export default function AdminShell({
  userRole,
  userName,
  children,
}: AdminShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-white dark:bg-[#0B1220] text-[#174A7E] dark:text-[#F4F7FB] font-sans transition-colors">
      {/* Sidebar */}
      <AdminSidebar
        userRole={userRole}
        userName={userName}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Sticky Top Header */}
        <AdminTopHeader
          userName={userName}
          userRole={userRole}
          onOpenMobileSidebar={() => setIsMobileOpen(true)}
        />

        {/* Page Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1920px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

