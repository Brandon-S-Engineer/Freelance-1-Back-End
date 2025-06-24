import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import Store from '@/models/Store';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

/* ───────────────────────────── POST (create) ───────────────────────────── */
export async function POST(req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    await connectDB();

    const { userId } = getAuth(req);
    const { name, billboardId } = await req.json();

    if (!userId) return new NextResponse('Unauthenticated', { status: 401 });
    if (!name) return new NextResponse('Name is required', { status: 400 });
    if (!billboardId) return new NextResponse('Billboard ID is required', { status: 400 });
    if (!params.storeId) return new NextResponse('Store ID is required', { status: 400 });

    /* Ensure the store belongs to this user */
    const storeByUserId = await Store.findOne({ _id: params.storeId, userId }).lean();
    if (!storeByUserId) return new NextResponse('Unauthorized', { status: 403 });

    /* Create Category */
    const category = await Category.create({
      name,
      billboardId,
      storeId: params.storeId,
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('[Categories > route.ts, POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/* ───────────────────────────── GET (list) ──────────────────────────────── */
export async function GET(_req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    await connectDB();

    if (!params.storeId) return new NextResponse('Store ID is required', { status: 400 });

    const categories = await Category.find({ storeId: params.storeId }).lean();

    return NextResponse.json(categories);
  } catch (error) {
    console.error('[Categories > route.ts, GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
