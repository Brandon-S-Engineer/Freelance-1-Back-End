import connectDB from '@/lib/mongodb';
import Size from '@/models/Size';
import Store from '@/models/Store';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';

/* ------------------------------ GET (fetch size) ------------------------------ */
export async function GET(_req: NextRequest, { params }: { params: { sizeId: string } }) {
  try {
    await connectDB();
    const { sizeId } = params;

    if (!sizeId || !isValidObjectId(sizeId)) {
      return new NextResponse('Size ID is required or invalid', { status: 400 });
    }

    const size = await Size.findById(sizeId).lean();
    return NextResponse.json(size);
  } catch (error) {
    console.error('[SIZE_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

/* ---------------------------- PATCH (update size) ---------------------------- */
export async function PATCH(req: NextRequest, { params }: { params: { storeId: string; sizeId: string } }) {
  try {
    await connectDB();
    const { userId } = getAuth(req);
    const { name, value } = await req.json();
    const { storeId, sizeId } = params;

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    if (!name) {
      return new NextResponse('Name is required', { status: 400 });
    }
    if (!value) {
      return new NextResponse('Value is required', { status: 400 });
    }
    if (!storeId || !isValidObjectId(sizeId)) {
      return new NextResponse('Store ID or Size ID is required or invalid', { status: 400 });
    }

    const storeByUserId = await Store.findOne({ _id: storeId, userId }).lean();
    if (!storeByUserId) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    const updated = await Size.findByIdAndUpdate(sizeId, { name, value }, { new: true }).lean();

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[SIZE_PATCH]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/* --------------------------- DELETE (remove size) --------------------------- */
export async function DELETE(req: NextRequest, { params }: { params: { storeId: string; sizeId: string } }) {
  try {
    await connectDB();
    const { userId } = getAuth(req);
    const { storeId, sizeId } = params;

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    if (!storeId || !isValidObjectId(sizeId)) {
      return new NextResponse('Store ID or Size ID is required or invalid', { status: 400 });
    }

    const storeByUserId = await Store.findOne({ _id: storeId, userId }).lean();
    if (!storeByUserId) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    const deleted = await Size.findByIdAndDelete(sizeId).lean();
    return NextResponse.json(deleted);
  } catch (error) {
    console.error('[SIZE_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
