import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser, canPublish } from '@/lib/auth';

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await req.json();

    const validStatuses = ['DRAFT', 'IN_REVIEW', 'APPROVED', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid article status.' }, { status: 400 });
    }

    if ((status === 'APPROVED' || status === 'PUBLISHED' || status === 'ARCHIVED') && !canPublish(user.role)) {
      return NextResponse.json(
        { error: 'Only Editors and Administrators have permission to approve or publish content.' },
        { status: 403 }
      );
    }

    const db = getDb();
    const now = new Date().toISOString();

    let updateQuery = 'UPDATE articles SET status = ?, updated_at = ?';
    const queryParams: any[] = [status, now];

    if (status === 'PUBLISHED') {
      updateQuery += ', published_at = COALESCE(published_at, ?)';
      queryParams.push(now);
    }

    updateQuery += ' WHERE id = ?';
    queryParams.push(id);

    db.prepare(updateQuery).run(...queryParams);

    return NextResponse.json({
      success: true,
      message: `Article status updated to ${status}.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Status transition error.' },
      { status: 500 }
    );
  }
}
