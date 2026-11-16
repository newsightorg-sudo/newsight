import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function VideoHubPage() {
  redirect('/category/top-stories');
}
