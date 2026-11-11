'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, FileText, CheckSquare, Radio, Video, Film,
  Users, FolderTree, Image as ImageIcon, Mail, Settings, 
  ExternalLink, LogOut, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { UserRole } from '@/lib/types';

interface AdminSidebarProps {
  userRole?: UserRole;
  userName?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  adminOnly?: boolean;
}

interface NavGroup {
  groupName: string;
  items: NavItem[];
}

export default function AdminSidebar({
  userRole,
  userName,
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const navigationGroups: NavGroup[] = [
    {
      groupName: 'NEWSROOM',
      items: [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Articles', href: '/admin/articles', icon: FileText },
        { name: 'Review Queue', href: '/admin/review-queue', icon: CheckSquare, badge: 'Workflow' },
        { name: 'Reporters & Staff', href: '/admin/reporters', icon: Users, adminOnly: true },
        { name: 'Categories & Desks', href: '/admin/categories', icon: FolderTree },
      ],
    },
    {
      groupName: 'MEDIA',
      items: [
        { name: 'Media Library', href: '/admin/media', icon: ImageIcon },
        { name: 'Video Journalism', href: '/admin/videos', icon: Video },
        { name: 'Shows & Programs', href: '/admin/shows', icon: Film },
      ],
    },
    {
      groupName: 'COMMUNITY',
      items: [
        { name: 'Subscribers', href: '/admin/subscribers', icon: Mail },
        { name: 'Live Blogs', href: '/admin/live-blogs', icon: Radio },
      ],
    },
    {
      groupName: 'SYSTEM',
      items: [
        { name: 'Platform Settings', href: '/admin/settings', icon: Settings, adminOnly: true },
      ],
    },
  ];

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-[#0D1626] border-r border-[#E2EAF2] dark:border-[#27364B] font-sans text-xs transition-all duration-200 select-none">
      {/* Brand Header */}
      <div className="h-16 px-4 border-b border-[#E2EAF2] dark:border-[#27364B] flex items-center justify-between shrink-0">
        <Link href="/" className="flex items-center gap-2.5 overflow-hidden group">
          <img
            src="/logo3.png"
            alt="NEWSIGHT"
            className="h-7 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
          />
          {!isCollapsed && (
            <span className="text-[10px] font-mono tracking-widest px-1.5 py-0.5 rounded bg-[#E5F2FC] text-[#087FC1] dark:bg-[#131F32] dark:text-[#079FE3] font-bold border border-[#DCE7F2] dark:border-[#27364B]">
              CMS
            </span>
          )}
        </Link>

        {/* Mobile Close Button */}
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-[#71869C] hover:text-[#174A7E] hover:bg-[#F0F7FD] dark:hover:bg-[#131F32] lg:hidden"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Desktop Collapse Button */}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-[#71869C] hover:text-[#174A7E] dark:hover:text-[#F4F7FB] hover:bg-[#F0F7FD] dark:hover:bg-[#131F32] transition"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* User Profile Area (Pale Blue Background, No Dark Gray) */}
      {!isCollapsed ? (
        <div className="p-3.5 m-3 rounded-xl bg-[#F0F7FD] dark:bg-[#131F32] border border-[#E2EAF2] dark:border-[#27364B] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#1261A6] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {(userName || 'Admin').charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <span className="font-bold text-[#174A7E] dark:text-[#F4F7FB] block truncate text-xs leading-tight">
                {userName || 'Staff Journalist'}
              </span>
              <span className="text-[10px] text-[#087FC1] font-mono font-bold tracking-wider block uppercase leading-tight mt-0.5">
                {userRole || 'REPORTER'}
              </span>
            </div>
          </div>
          <Link
            href="/admin/settings"
            title="Account Settings"
            className="p-1.5 rounded-lg text-[#356DA8] dark:text-[#B6C3D4] hover:text-[#087FC1] dark:hover:text-white hover:bg-white/80 dark:hover:bg-[#1A2942] transition"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="p-3 border-b border-[#E2EAF2] dark:border-[#27364B] flex justify-center shrink-0">
          <div
            className="w-8 h-8 rounded-full bg-[#1261A6] text-white flex items-center justify-center font-bold text-xs shadow-xs"
            title={`${userName || 'Admin'} (${userRole || 'REPORTER'})`}
          >
            {(userName || 'Admin').charAt(0).toUpperCase()}
          </div>
        </div>
      )}

      {/* Navigation Groups */}
      <nav className="flex-1 px-2.5 py-3 space-y-4 overflow-y-auto min-h-0">
        {navigationGroups.map((group) => {
          // Filter out adminOnly items if not authorized
          const visibleItems = group.items.filter((item) => !item.adminOnly || userRole === 'SUPER_ADMIN');
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.groupName} className="space-y-1">
              {!isCollapsed && (
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#71869C] dark:text-[#7890A8] px-3 py-1 font-mono">
                  {group.groupName}
                </div>
              )}
              {visibleItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    title={isCollapsed ? item.name : undefined}
                    onClick={onCloseMobile}
                    className={`relative flex items-center ${
                      isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
                    } rounded-lg font-medium transition group ${
                      isActive
                        ? 'bg-[#E5F2FC] dark:bg-[#1A2942] text-[#087FC1] font-bold shadow-xs'
                        : 'text-[#294767] dark:text-[#B6C3D4] hover:bg-[#F0F7FD] dark:hover:bg-[#131F32] hover:text-[#087FC1] dark:hover:text-[#F4F7FB]'
                    }`}
                  >
                    {/* Active Left Indicator Bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#087FC1] rounded-r" />
                    )}

                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? 'text-[#087FC1]'
                            : 'text-[#356DA8] dark:text-[#7890A8] group-hover:text-[#087FC1]'
                        }`}
                      />
                      {!isCollapsed && <span className="truncate">{item.name}</span>}
                    </div>

                    {!isCollapsed && item.badge && (
                      <span className="bg-[#E5F2FC] text-[#087FC1] dark:bg-[#131F32] dark:text-[#079FE3] text-[9px] px-1.5 py-0.5 font-mono uppercase font-bold rounded border border-[#DCE7F2] dark:border-[#27364B]">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Footer / Sign Out Button */}
      <div className="mt-auto p-3 border-t border-[#E2EAF2] dark:border-[#27364B] shrink-0 bg-white dark:bg-[#0B1220]/40">
        <button
          type="button"
          onClick={handleLogout}
          title={isCollapsed ? 'Exit Newsroom' : undefined}
          className={`w-full flex items-center ${
            isCollapsed ? 'justify-center p-2' : 'justify-center gap-2 px-3 py-2'
          } rounded-lg text-[#294767] dark:text-[#B6C3D4] hover:text-[#D71920] hover:bg-red-50 dark:hover:bg-red-950/30 transition font-semibold cursor-pointer`}
        >
          <LogOut className="w-4 h-4 shrink-0 text-[#71869C] group-hover:text-[#D71920]" />
          {!isCollapsed && <span>Exit Newsroom</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Vertical Sidebar */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 h-full transition-all duration-200 z-40 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer with Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <aside className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
