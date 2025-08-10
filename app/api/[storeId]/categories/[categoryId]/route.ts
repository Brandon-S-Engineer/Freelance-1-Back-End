/* app/api/[storeId]/categories/[categoryId]/route.ts */
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import Store from '@/models/Store';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

/* ───────────────────────────── GET (fetch category with billboard) ───────────────────────────── */
export async function GET(_req: NextRequest, { params }: { params: { categoryId: string } }) {
  try {
    await connectDB();

    if (!params.categoryId) {
      return new NextResponse('Category ID is required', { status: 400 });
    }

    const category = await Category.findById(params.categoryId)
      .populate('billboardId') // Includes full billboard data
      .lean();

    return NextResponse.json(category);
  } catch (error) {
    console.error('[CATEGORY_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/* ───────────────────────────── PATCH (update category) ───────────────────────────── */
export async function PATCH(req: NextRequest, { params }: { params: { storeId: string; categoryId: string } }) {
  try {
    await connectDB();
    const { userId } = getAuth(req);
    const { name, billboardId } = await req.json();

    if (!userId) return new NextResponse('Unauthorized', { status: 401 });
    if (!name) return new NextResponse('Name is Required', { status: 400 });
    if (!billboardId) return new NextResponse('Billboard ID is required', { status: 400 });
    if (!params.categoryId) return new NextResponse('Category ID is Required', { status: 400 });

    const storeByUserId = await Store.findOne({ _id: params.storeId, userId }).lean();
    if (!storeByUserId) return new NextResponse('Unauthorized', { status: 403 });

    const category = await Category.findByIdAndUpdate(params.categoryId, { name, billboardId }, { new: true }).lean();

    return NextResponse.json(category);
  } catch (error) {
    console.error('[CATEGORY_PATCH]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/* ───────────────────────────── DELETE (remove category) ───────────────────────────── */
export async function DELETE(req: NextRequest, { params }: { params: { storeId: string; categoryId: string } }) {
  try {
    await connectDB();
    const { userId } = getAuth(req);

    if (!userId) return new NextResponse('Unauthorized', { status: 401 });
    if (!params.categoryId) return new NextResponse('Category ID is Required', { status: 400 });

    const storeByUserId = await Store.findOne({ _id: params.storeId, userId }).lean();
    if (!storeByUserId) return new NextResponse('Unauthorized', { status: 403 });

    const category = await Category.findByIdAndDelete(params.categoryId).lean();

    return NextResponse.json(category);
  } catch (error) {
    console.error('[CATEGORY_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
