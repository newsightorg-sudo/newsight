import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function TopVideosPage() {
  redirect('/category/top-stories');
}
