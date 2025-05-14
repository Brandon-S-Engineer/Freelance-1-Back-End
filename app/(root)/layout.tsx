import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Store from '@/models/Store';

export default async function SetupLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser(); // Get authenticated user

  if (!user) {
    redirect('/sign-in'); // Redirect if not authenticated
  }

  await connectDB(); // Ensure MongoDB connection

  // Find the first store associated with the authenticated user
  const store = await Store.findOne({ userId: user.id }).lean<{ _id: string; name: string } | null>();

  if (store) {
    redirect(`/${store._id.toString()}`); // If store exists redirect to the store's dashboard
  }

  return <>{children}</>;
}
