import connectDB from '@/lib/mongodb';
import Store from '@/models/Store';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

/* ------------------------------ Patch Handler ----------------------------- */
export async function PATCH(req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    await connectDB(); // Ensure database connection

    // 1. Authenticate user
    const { userId } = getAuth(req);
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 2. Parse request body
    const { name } = await req.json();
    if (!name) {
      return new NextResponse('Name is Required', { status: 400 });
    }

    // 3. Extract 'storeId' from params
    const { storeId } = params;
    if (!storeId) {
      return new NextResponse('Store ID is Required', { status: 400 });
    }

    // 4. Find and update the store
    const store = await Store.findOneAndUpdate(
      { _id: storeId, userId },
      { name },
      { new: true } // Return updated document
    );

    if (!store) {
      return new NextResponse('Store not found', { status: 404 });
    }

    //? Return updated store as JSON to the client for UI Update
    return NextResponse.json(store);
  } catch (error: any) {
    console.error(`[Stores > [storeId] > route.ts, PATCH] ${error}`);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/* ----------------------------- Delete Handler ----------------------------- */
export async function DELETE(req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    await connectDB(); // Ensure database connection

    // 1. Authenticate user
    const { userId } = getAuth(req);
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 2. Extract 'storeId' from params
    const { storeId } = params;

    if (!storeId) {
      return new NextResponse('Store ID is Required', { status: 400 });
    }

    // 3. Find and delete the store
    const store = await Store.findOneAndDelete({ _id: storeId, userId });

    if (!store) {
      return new NextResponse('Store not found', { status: 404 });
    }

    //? Return deleted store as JSON to the client for UI Update
    return NextResponse.json(store);
  } catch (error: any) {
    console.error('[Stores > [storeId] > route.ts, DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
