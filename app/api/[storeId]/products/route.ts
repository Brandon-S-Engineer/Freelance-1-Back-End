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
    if (!userId) return new NextResponse('Unauthenticated', { status: 401 });

    const body = await req.json();
    const {
      name,
      price,
      promoPrice, // optional
      categoryId,
      variants, // optional
      specPdfUrl,
      images,
      isFeatured,
      isArchived,
    } = body;

    // basic
    if (!name) return new NextResponse('Name is required', { status: 400 });
    if (typeof price !== 'number' || price <= 0) return new NextResponse('Valid price is required', { status: 400 });
    if (!categoryId || !isValidObjectId(categoryId)) return new NextResponse('Valid category ID is required', { status: 400 });
    if (!Array.isArray(images) || images.length === 0) return new NextResponse('At least one image is required', { status: 400 });
    if (!params.storeId || !isValidObjectId(params.storeId)) return new NextResponse('Valid store ID is required', { status: 400 });

    // base promo (optional)
    if (promoPrice != null) {
      if (typeof promoPrice !== 'number' || promoPrice <= 0) return new NextResponse('Invalid promoPrice', { status: 400 });
      if (promoPrice >= price) return new NextResponse('promoPrice must be less than price', { status: 400 });
    }

    // variants (optional)
    let normalizedVariants: any[] = [];
    if (Array.isArray(variants)) {
      for (const v of variants) {
        if (!v?.name || typeof v?.price !== 'number' || v.price <= 0) {
          return new NextResponse('Each provided variant needs a valid name and price', { status: 400 });
        }
      }
      normalizedVariants = variants.map((v: any) => ({
        name: v.name,
        price: v.price,
        promoPrice: v.promoPrice ?? null,
      }));
    }

    // ownership
    const storeByUser = await Store.findOne({ _id: params.storeId, userId }).lean();
    if (!storeByUser) return new NextResponse('Unauthorized', { status: 403 });

    // create
    const product = await Product.create({
      name,
      price,
      promoPrice: promoPrice ?? null,
      isFeatured: Boolean(isFeatured),
      isArchived: Boolean(isArchived),
      categoryId,
      variants: normalizedVariants, // ✅ can be []
      specPdfUrl,
      storeId: params.storeId,
      images: images.map((img: any) => (typeof img === 'string' ? img : img.url)),
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('[PRODUCTS_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// export async function POST(req: NextRequest, { params }: { params: { storeId: string } }) {
//   try {
//     await connectDB();
//     const { userId } = getAuth(req);

//     const {
//       name,
//       price,
//       promoPrice, // optional base promo
//       categoryId,
//       variants, // optional varint
//       specPdfUrl,
//       images,
//       isFeatured,
//       isArchived,
//     } = await req.json();

//     // 1) Auth & basic checks
//     if (!userId) return new NextResponse('Unauthenticated', { status: 401 });
//     if (!name) return new NextResponse('Name is required', { status: 400 });

//     if (typeof price !== 'number' || price <= 0) {
//       return new NextResponse('Valid price is required', { status: 400 });
//     }

//     // ✅ Base promo validations (optional)
//     if (promoPrice != null) {
//       if (typeof promoPrice !== 'number' || promoPrice <= 0) {
//         return new NextResponse('Invalid promoPrice', { status: 400 });
//       }
//       if (promoPrice >= price) {
//         return new NextResponse('promoPrice must be less than price', { status: 400 });
//       }
//     }

//     if (!categoryId || !isValidObjectId(categoryId)) {
//       return new NextResponse('Valid category ID is required', { status: 400 });
//     }

//     if (!Array.isArray(variants) || variants.length === 0) {
//       return new NextResponse('At least one variant is required', { status: 400 });
//     }

//     // ✅ Variant validations (each with optional promo)
//     for (const v of variants) {
//       if (!v?.name || typeof v?.price !== 'number') {
//         return new NextResponse('Each variant needs a name and price', { status: 400 });
//       }
//       if (v.promoPrice != null) {
//         if (typeof v.promoPrice !== 'number' || v.promoPrice <= 0) {
//           return new NextResponse('Invalid variant promoPrice', { status: 400 });
//         }
//         if (v.promoPrice >= v.price) {
//           return new NextResponse('variant promoPrice must be less than variant price', { status: 400 });
//         }
//       }
//     }

//     if (!Array.isArray(images) || images.length === 0) {
//       return new NextResponse('At least one image is required', { status: 400 });
//     }

//     if (!params.storeId || !isValidObjectId(params.storeId)) {
//       return new NextResponse('Valid store ID is required', { status: 400 });
//     }

//     // 2) Ownership check
//     const storeByUser = await Store.findOne({ _id: params.storeId, userId }).lean();
//     if (!storeByUser) return new NextResponse('Unauthorized', { status: 403 });

//     // 3) Create
//     const product = await Product.create({
//       name,
//       price,
//       promoPrice: promoPrice ?? null, // ✅ base promo if provided
//       isFeatured: Boolean(isFeatured),
//       isArchived: Boolean(isArchived),
//       categoryId,
//       variants: variants.map((v: any) => ({
//         name: v.name,
//         price: v.price,
//         promoPrice: v.promoPrice ?? null, // ✅ per-variant promo if provided
//       })),
//       specPdfUrl,
//       storeId: params.storeId,
//       images: images.map((img: any) => (typeof img === 'string' ? img : img.url)),
//     });

//     return NextResponse.json(product);
//   } catch (error) {
//     console.error('[PRODUCTS_POST]', error);
//     return new NextResponse('Internal Server Error', { status: 500 });
//   }
// }

/* ------------------------------- GET (list products) ------------------------------- */
// /app/api/[storeId]/products/route.ts
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    await connectDB();

    const { storeId } = params;
    if (!storeId) return new NextResponse('Store ID is required', { status: 400 });

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId') || undefined;
    const isFeatured = searchParams.get('isFeatured');

    const filter: any = { storeId, isArchived: false };
    if (categoryId && isValidObjectId(categoryId)) filter.categoryId = categoryId;
    if (isFeatured !== null) filter.isFeatured = true;

    const products = await Product.find(filter)
      .populate('categoryId', 'name')
      .select('+variants +variants.promoPrice +promoPrice') // ✅
      .sort({ createdAt: -1 })
      .lean();

    const formatted = products.map((p: any) => ({
      ...p,
      promoPrice: p.promoPrice ?? null, // ✅ base
      variants: Array.isArray(p.variants) ? p.variants.map((v: any) => ({ ...v, promoPrice: v?.promoPrice ?? null })) : [],
    }));

    return NextResponse.json(formatted, { headers: { 'Cache-Control': 'no-store' } }); // ⛔️
  } catch (error) {
    console.error('[PRODUCTS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
