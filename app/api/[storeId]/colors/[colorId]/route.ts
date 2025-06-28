// app/api/[storeId]/colors/[colorId]/route.ts

import connectDB from '@/lib/mongodb';
import Color from '@/models/Color';
import Store from '@/models/Store';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';

/* ------------------------------ GET Color ------------------------------ */
export async function GET(_req: NextRequest, { params }: { params: { colorId: string } }) {
  try {
    await connectDB();
    const { colorId } = params;

    if (!colorId || !isValidObjectId(colorId)) {
      return new NextResponse('Color ID is required or invalid', { status: 400 });
    }

    const color = await Color.findById(colorId).lean();
    return NextResponse.json(color);
  } catch (error) {
    console.error('[COLOR_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

/* ---------------------------- PATCH Color ---------------------------- */
export async function PATCH(req: NextRequest, { params }: { params: { storeId: string; colorId: string } }) {
  try {
    await connectDB();
    const { userId } = getAuth(req);
    const { name, value } = await req.json();
    const { storeId, colorId } = params;

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    if (!name) {
      return new NextResponse('Name is required', { status: 400 });
    }
    if (!value) {
      return new NextResponse('Value is required', { status: 400 });
    }
    if (!storeId || !isValidObjectId(colorId)) {
      return new NextResponse('Store ID or Color ID is required or invalid', { status: 400 });
    }

    const storeByUserId = await Store.findOne({ _id: storeId, userId }).lean();
    if (!storeByUserId) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    const updated = await Color.findByIdAndUpdate(colorId, { name, value }, { new: true }).lean();

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[COLOR_PATCH]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/* --------------------------- DELETE Color --------------------------- */
export async function DELETE(req: NextRequest, { params }: { params: { storeId: string; colorId: string } }) {
  try {
    await connectDB();
    const { userId } = getAuth(req);
    const { storeId, colorId } = params;

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    if (!storeId || !isValidObjectId(colorId)) {
      return new NextResponse('Store ID or Color ID is required or invalid', { status: 400 });
    }

    const storeByUserId = await Store.findOne({ _id: storeId, userId }).lean();
    if (!storeByUserId) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    const deleted = await Color.findByIdAndDelete(colorId).lean();
    return NextResponse.json(deleted);
  } catch (error) {
    console.error('[COLOR_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
