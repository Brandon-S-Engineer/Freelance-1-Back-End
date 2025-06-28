// app/api/[storeId]/colors/route.ts

import connectDB from '@/lib/mongodb';
import Color from '@/models/Color';
import Store from '@/models/Store';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    await connectDB();

    const { userId } = getAuth(req);
    const { name, value } = await req.json();

    if (!userId) {
      return new NextResponse('Unauthenticated', { status: 401 });
    }
    if (!name) {
      return new NextResponse('Name is required', { status: 400 });
    }
    if (!value) {
      return new NextResponse('Value is required', { status: 400 });
    }
    if (!params.storeId) {
      return new NextResponse('Store ID is required', { status: 400 });
    }

    const storeByUserId = await Store.findOne({ _id: params.storeId, userId }).lean();
    if (!storeByUserId) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    const color = await Color.create({
      name,
      value,
      storeId: params.storeId,
    });

    return NextResponse.json(color);
  } catch (error) {
    console.error('[COLORS_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(_req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    await connectDB();

    if (!params.storeId) {
      return new NextResponse('Store ID is required', { status: 400 });
    }

    const colors = await Color.find({ storeId: params.storeId }).lean();

    return NextResponse.json(colors);
  } catch (error) {
    console.error('[COLORS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
