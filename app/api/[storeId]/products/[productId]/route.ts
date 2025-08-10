// /app/api/products/[productId]/route.ts

import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Store from '@/models/Store';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';

export const dynamic = 'force-dynamic'; // ⛔️ evita cache en Next
export const revalidate = 0;

export async function GET(_req: NextRequest, { params }: { params: { productId: string } }) {
  try {
    await connectDB();

    const { productId } = params;
    if (!productId || !isValidObjectId(productId)) {
      return new NextResponse('Product ID is required or invalid', { status: 400 });
    }

    let product = await Product.findById(productId).populate<{ categoryId: { name: string } }>('categoryId', 'name').select('+variants +variants.name +variants.price +variants.promoPrice +promoPrice').lean();

    if (!product) return new NextResponse('Not Found', { status: 404 });

    const variants = Array.isArray((product as any).variants) ? (product as any).variants : [];

    product = {
      ...product,

      promoPrice: product.promoPrice ?? null,
      variants: variants.map((v: any) => ({
        ...v,
        promoPrice: v?.promoPrice ?? null,
      })),
    };

    return NextResponse.json(product, { headers: { 'Cache-Control': 'no-store' } }); // ⛔️
  } catch (error) {
    console.error('[PRODUCT_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/* --------------------------- PATCH Product --------------------------- */
export async function PATCH(req: NextRequest, { params }: { params: { storeId: string; productId: string } }) {
  try {
    await connectDB();
    const { userId } = getAuth(req);
    if (!userId) return new NextResponse('Unauthorized', { status: 401 });

    const { storeId, productId } = params;
    if (!isValidObjectId(storeId) || !isValidObjectId(productId)) {
      return new NextResponse('Invalid ids', { status: 400 });
    }

    // Ownership
    const storeByUser = await Store.findOne({ _id: storeId, userId }).lean();
    if (!storeByUser) return new NextResponse('Unauthorized', { status: 403 });

    const body = await req.json();

    const current = await Product.findById(productId).lean();
    if (!current) return new NextResponse('Not Found', { status: 404 });

    // ---------- Validaciones mínimas ----------
    const nextBasePrice = typeof body.price === 'number' ? body.price : current.price;

    if (body.promoPrice != null) {
      if (typeof body.promoPrice !== 'number' || body.promoPrice <= 0) {
        return new NextResponse('Invalid promoPrice', { status: 400 });
      }
      if (body.promoPrice >= nextBasePrice) {
        return new NextResponse('promoPrice must be less than price', { status: 400 });
      }
    }

    if (Array.isArray(body.variants)) {
      for (const v of body.variants) {
        if (!v?.name || typeof v?.price !== 'number') {
          return new NextResponse('Each variant needs a name and price', { status: 400 });
        }
        if (v.promoPrice != null) {
          if (typeof v.promoPrice !== 'number' || v.promoPrice <= 0) {
            return new NextResponse('Invalid variant promoPrice', { status: 400 });
          }
          if (v.promoPrice >= v.price) {
            return new NextResponse('variant promoPrice must be less than variant price', { status: 400 });
          }
        }
      }
    }

    // ---------- Construir $set / $unset ----------
    const $set: any = {};
    const $unset: any = {};

    if (typeof body.name === 'string') $set.name = body.name;
    if (typeof body.price === 'number') $set.price = body.price;

    // ✅ Base promo: set (número) o unset (null). Si es undefined, no tocar.
    if (body.promoPrice === null) {
      $unset.promoPrice = ''; // elimina el campo
    } else if (typeof body.promoPrice === 'number') {
      $set.promoPrice = body.promoPrice;
    }

    if (body.categoryId && isValidObjectId(body.categoryId)) $set.categoryId = body.categoryId;

    if (Array.isArray(body.images)) {
      $set.images = body.images.map((img: any) => (typeof img === 'string' ? img : img.url));
    }

    if (Array.isArray(body.variants)) {
      $set.variants = body.variants.map((v: any) => ({
        _id: v._id,
        name: v.name,
        price: v.price,
        promoPrice: v.promoPrice ?? null,
      }));
    }

    if (typeof body.isFeatured === 'boolean') $set.isFeatured = body.isFeatured;
    if (typeof body.isArchived === 'boolean') $set.isArchived = body.isArchived;
    if (typeof body.specPdfUrl === 'string' || body.specPdfUrl === null) $set.specPdfUrl = body.specPdfUrl;

    // Limpia objetos vacíos para no enviar operadores vacíos
    const update: any = {};
    if (Object.keys($set).length) update.$set = $set;
    if (Object.keys($unset).length) update.$unset = $unset;

    console.log('[PATCH] incoming promoPrice:', body.promoPrice, 'update =>', update);

    const updated = await Product.findByIdAndUpdate(productId, update, {
      new: true,
      runValidators: true,
    })
      .populate('categoryId', 'name')
      .lean();

    // Debug rápido
    console.log('[PATCH] saved promoPrice:', updated?.promoPrice);

    return NextResponse.json(updated);
  } catch (err) {
    console.error('[PRODUCT_PATCH]', err);
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
