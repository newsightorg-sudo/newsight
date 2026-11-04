'use client';

import React from 'react';
import { UserRole } from '@/lib/types';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  userRole?: UserRole;
  actions?: React.ReactNode;
}

export default function AdminHeader({
  title,
  subtitle,
  actions,
}: AdminHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 mb-6 border-b border-[#DCE7F2] dark:border-[#27364B] font-sans">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#174A7E] dark:text-[#F4F7FB] tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-[#496784] dark:text-[#B6C3D4] max-w-3xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
