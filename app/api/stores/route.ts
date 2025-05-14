import connectDB from '@/lib/mongodb';
import Store from '@/models/Store';
import { getAuth } from '@clerk/nextjs/server'; // Using Clerk for authentication
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    await connectDB(); // Ensure the database connection is established
    const body = await req.json();

    const nextReq = req as NextRequest;
    const { userId } = getAuth(nextReq); // Retrieve user ID from authentication

    const { name } = body; // Extract 'name' from the request body

    /* ------------------------------- Conditions ------------------------------- */
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (!name) {
      return new NextResponse('Name is required', { status: 400 });
    }

    /* --------------------------- Create a New Store --------------------------- */
    const store = await Store.create({
      name,
      userId,
    });

    // ✅ Ensure plain JavaScript object before returning
    const formattedStore = {
      id: store._id.toString(), // Convert `_id` to string
      name: store.name,
      userId: store.userId,
    };

    return NextResponse.json(formattedStore); // Return the created store as a JSON response
  } catch (error) {
    console.error(`[Stores > route.ts] ${error}`);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
