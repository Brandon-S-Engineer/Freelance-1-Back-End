import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Store from '@/models/Store';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';

/* ------------------------------ POST (create product) ------------------------------ */
export async function POST(req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    await connectDB();

    const { userId } = getAuth(req);
    const { name, price, categoryId, colorId, sizeId, images, isFeatured, isArchived } = await req.json();

    if (!userId) {
      return new NextResponse('Unauthenticated', { status: 401 });
    }
    if (!name) {
      return new NextResponse('Name is required', { status: 400 });
    }
    if (!images || !images.length) {
      return new NextResponse('Images are required', { status: 400 });
    }
    if (typeof price !== 'number' || price <= 0) {
      return new NextResponse('Price is required', { status: 400 });
    }
    if (!categoryId || !isValidObjectId(categoryId)) {
      return new NextResponse('Category ID is required', { status: 400 });
    }
    if (!sizeId || !isValidObjectId(sizeId)) {
      return new NextResponse('Size ID is required', { status: 400 });
    }
    if (!colorId || !isValidObjectId(colorId)) {
      return new NextResponse('Color ID is required', { status: 400 });
    }
    if (!params.storeId) {
      return new NextResponse('Store ID is required', { status: 400 });
    }

    const storeByUser = await Store.findOne({
      _id: params.storeId,
      userId,
    }).lean();
    if (!storeByUser) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    const product = await Product.create({
      name,
      price,
      isFeatured: Boolean(isFeatured),
      isArchived: Boolean(isArchived),
      categoryId,
      colorId,
      sizeId,
      storeId: params.storeId,
      images: images.map((img: { url: string }) => img.url),
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('[PRODUCTS_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/* ------------------------------- GET (list products) ------------------------------- */
export async function GET(req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    await connectDB();

    const { storeId } = params;
    if (!storeId) {
      return new NextResponse('Store ID is required', { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId') || undefined;
    const colorId = searchParams.get('colorId') || undefined;
    const sizeId = searchParams.get('sizeId') || undefined;
    const isFeatured = searchParams.get('isFeatured');

    const filter: any = {
      storeId,
      isArchived: false,
    };
    if (categoryId && isValidObjectId(categoryId)) filter.categoryId = categoryId;
    if (colorId && isValidObjectId(colorId)) filter.colorId = colorId;
    if (sizeId && isValidObjectId(sizeId)) filter.sizeId = sizeId;
    if (isFeatured !== null) filter.isFeatured = true;

    const products = await Product.find(filter).populate('categoryId', 'name').populate('sizeId', 'name').populate('colorId', 'value').sort({ createdAt: -1 }).lean();

    return NextResponse.json(products);
  } catch (error) {
    console.error('[PRODUCTS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
