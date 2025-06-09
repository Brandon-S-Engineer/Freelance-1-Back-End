import connectDB from '@/lib/mongodb';
import Billboard from '@/models/Billboard';
import Store from '@/models/Store';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

/* ------------------------------ POST ------------------------------ */
export async function POST(req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    await connectDB();

    const { userId } = getAuth(req);
    const { label, imageUrl } = await req.json();

    if (!userId) {
      return new NextResponse('Unauthenticated', { status: 401 });
    }

    if (!label) {
      return new NextResponse('Label is required', { status: 400 });
    }

    if (!imageUrl) {
      return new NextResponse('Image URL is required', { status: 400 });
    }

    if (!params.storeId) {
      return new NextResponse('Store ID is required', { status: 400 });
    }

    // Ensure store belongs to user
    const storeByUserId = await Store.findOne({ _id: params.storeId, userId }).lean();
    if (!storeByUserId) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    const billboard = await Billboard.create({
      label,
      imageUrl,
      storeId: params.storeId,
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.error(`[Billboards > route.ts, POST]`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/* ------------------------------ GET ------------------------------ */
export async function GET(req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    await connectDB();

    if (!params.storeId) {
      return new NextResponse('Store ID is required', { status: 400 });
    }

    const billboards = await Billboard.find({ storeId: params.storeId }).lean();

    return NextResponse.json(billboards);
  } catch (error) {
    console.error(`[Billboards > route.ts, GET]`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
