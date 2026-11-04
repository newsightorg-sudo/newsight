import React from 'react';
import NewsightHeader from './NewsightHeader';
import NewsightSidebar from './NewsightSidebar';
import BreakingNewsBar from './BreakingNewsBar';
import NewsightFooter from './NewsightFooter';
import MobileBottomNav from './MobileBottomNav';
import { getEditorialSettings, getCategories, getShows, getBreakingArticle } from '@/lib/data';
import { getCurrentUser } from '@/lib/auth';

interface PublicLayoutProps {
  children: React.ReactNode;
  hideSidebar?: boolean;
  user?: any;
  settings?: any;
  categories?: any;
  activeSidebar?: string;
}

export default async function PublicLayout({
  children,
  hideSidebar = false,
  user: initialUser,
  settings: initialSettings,
  categories: initialCategories,
  activeSidebar
}: PublicLayoutProps) {
  const user = initialUser !== undefined ? initialUser : await getCurrentUser();
  const settings = initialSettings || getEditorialSettings();
  const categories = initialCategories || getCategories(true);
  const shows = getShows();
  const breakingStory = getBreakingArticle();

  const breakingAlert = {
    title: breakingStory?.title || settings.breaking_headline,
    url: breakingStory ? `/article/${breakingStory.slug}` : settings.breaking_url,
    time: settings.breaking_time
  };

  const adSettings = {
    ad_active: settings.ad_active,
    ad_image_url: settings.ad_image_url,
    ad_target_url: settings.ad_target_url,
    ad_title: settings.ad_title
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* 1. Sticky Top Header */}
      <NewsightHeader
        user={user}
        breakingNews={breakingAlert}
        categories={categories}
        shows={shows}
      />

      {/* 2. Breaking News Strip */}
      <BreakingNewsBar
        active={settings.breaking_banner_active}
        headline={breakingAlert.title}
        url={breakingAlert.url}
        timeLabel={breakingAlert.time}
      />

      {/* 3. Middle Area: Sidebar + Main Content */}
      <div className="flex flex-1 w-full max-w-[1920px] mx-auto pb-14 md:pb-0">
        {!hideSidebar && <NewsightSidebar adSettings={adSettings} activeItem={activeSidebar} />}

        <main className="flex-1 min-w-0 w-full overflow-hidden">
          {children}
        </main>
      </div>

      {/* 4. Mobile Bottom Navigation Bar (Phone only) */}
      <MobileBottomNav />

      {/* 5. Footer */}
      <NewsightFooter settings={settings} />
    </div>
  );
}
