import { NextResponse } from 'next/server';
import { incrementMonthlyPageView } from '@/lib/data';

export async function POST() {
  try {
    await incrementMonthlyPageView();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Track view error:', error);
    return NextResponse.json({ error: 'Nezettseg mentese sikertelen.' }, { status: 500 });
  }
}
