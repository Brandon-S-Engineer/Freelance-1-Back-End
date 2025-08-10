import connectDB from '@/lib/mongodb';
import Billboard from '@/models/Billboard';
import Store from '@/models/Store';
import { getAuth } from '@clerk/nextjs/server';
import { isValidObjectId } from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';

/* ---------------------------- GET Billboard ---------------------------- */
export async function GET(req: NextRequest, { params }: { params: { billboardId: string } }) {
  try {
    await connectDB();

    if (!params.billboardId || !isValidObjectId(params.billboardId)) {
      return new NextResponse('Billboard ID is required or invalid', { status: 400 });
    }

    const billboard = await Billboard.findById(params.billboardId).lean();

    return NextResponse.json(billboard);
  } catch (error) {
    console.error('[BILLBOARD_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/* --------------------------- PATCH Billboard -------------------------- */
export async function PATCH(req: NextRequest, { params }: { params: { storeId: string; billboardId: string } }) {
  try {
    await connectDB();

    const { userId } = getAuth(req);
    const { label, imageUrl } = await req.json();

    if (!userId) return new NextResponse('Unauthorized', { status: 401 });
    if (!label) return new NextResponse('Label is required', { status: 400 });
    if (!imageUrl) return new NextResponse('Image URL is required', { status: 400 });
    if (!params.billboardId || !isValidObjectId(params.billboardId)) {
      return new NextResponse('Billboard ID is required or invalid', { status: 400 });
    }

    const storeByUserId = await Store.findOne({ _id: params.storeId, userId }).lean();
    if (!storeByUserId) return new NextResponse('Unauthorized', { status: 403 });

    const updated = await Billboard.findByIdAndUpdate(params.billboardId, { label, imageUrl }, { new: true }).lean();

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[BILLBOARD_PATCH]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/* -------------------------- DELETE Billboard -------------------------- */
export async function DELETE(req: NextRequest, { params }: { params: { storeId: string; billboardId: string } }) {
  try {
    await connectDB();

    const { userId } = getAuth(req);
    if (!userId) return new NextResponse('Unauthorized', { status: 401 });

    if (!params.billboardId || !isValidObjectId(params.billboardId)) {
      return new NextResponse('Billboard ID is required or invalid', { status: 400 });
    }

    const storeByUserId = await Store.findOne({ _id: params.storeId, userId }).lean();
    if (!storeByUserId) return new NextResponse('Unauthorized', { status: 403 });

    const deleted = await Billboard.findByIdAndDelete(params.billboardId).lean();

    return NextResponse.json(deleted);
  } catch (error) {
    console.error('[BILLBOARD_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
