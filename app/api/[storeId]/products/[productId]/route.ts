import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Store from '@/models/Store';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';

/* ------------------------------ GET Product ------------------------------ */
export async function GET(_req: NextRequest, { params }: { params: { productId: string } }) {
  try {
    await connectDB();
    const { productId } = params;

    if (!productId || !isValidObjectId(productId)) {
      return new NextResponse('Product ID is required or invalid', { status: 400 });
    }

    const product = await Product.findById(productId).populate('categoryId', 'name').populate('sizeId', 'name').populate('colorId', 'value').lean();

    return NextResponse.json(product);
  } catch (error) {
    console.error('[PRODUCT_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

/* ---------------------------- PATCH Product ---------------------------- */
export async function PATCH(req: NextRequest, { params }: { params: { storeId: string; productId: string } }) {
  try {
    await connectDB();
    const { userId } = getAuth(req);
    const { name, price, categoryId, colorId, sizeId, images, isFeatured, isArchived } = await req.json();
    const { storeId, productId } = params;

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    if (!name || !Array.isArray(images) || images.length === 0 || typeof price !== 'number' || !categoryId || !sizeId || !colorId || !productId || !isValidObjectId(productId)) {
      return new NextResponse('All fields are required', { status: 400 });
    }

    const storeByUser = await Store.findOne({ _id: storeId, userId }).lean();
    if (!storeByUser) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    const updated = await Product.findByIdAndUpdate(
      productId,
      {
        name,
        price,
        categoryId,
        colorId,
        sizeId,
        isFeatured: Boolean(isFeatured),
        isArchived: Boolean(isArchived),
        images: images.map((img: { url: string }) => img.url),
      },
      { new: true }
    )
      .populate('categoryId', 'name')
      .populate('sizeId', 'name')
      .populate('colorId', 'value')
      .lean();

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PRODUCT_PATCH]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/* --------------------------- DELETE Product --------------------------- */
export async function DELETE(_req: NextRequest, { params }: { params: { storeId: string; productId: string } }) {
  try {
    await connectDB();
    const { userId } = getAuth(_req);
    const { storeId, productId } = params;

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    if (!productId || !isValidObjectId(productId)) {
      return new NextResponse('Product ID is required or invalid', { status: 400 });
    }

    const storeByUser = await Store.findOne({ _id: storeId, userId }).lean();
    if (!storeByUser) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    const deleted = await Product.findByIdAndDelete(productId).lean();
    return NextResponse.json(deleted);
  } catch (error) {
    console.error('[PRODUCT_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
