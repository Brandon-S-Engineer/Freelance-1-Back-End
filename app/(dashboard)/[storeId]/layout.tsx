import Store from '@/models/Store';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import mongoose from 'mongoose';
import Navbar from '@/components/navbar';

export default async function DashboardLayout({ children, params }: { children: React.ReactNode; params: { storeId: string } }) {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // ✅ Validate storeId before querying to avoid errors
  if (!mongoose.Types.ObjectId.isValid(params.storeId)) {
    redirect('/');
  }

  const store = await Store.findOne({
    _id: params.storeId,
    userId: user.id,
  });

  // Redirect to homepage if the store doesn't exist or doesn't belong to the user
  if (!store) {
    redirect('/');
  }

  return (
    <>
      <div>
        <Navbar />
        {children}
      </div>
    </>
  );
}

//? Full express version
// import { redirect } from 'next/navigation';
// import { currentUser } from '@clerk/nextjs/server';
// import Navbar from '@/components/navbar';
// import connectDB from '@/lib/mongodb';
// import Store from '@/models/Store';
// import { cookies } from 'next/headers';

// export default async function DashboardLayout({ children, params }: { children: React.ReactNode; params: { storeId: string } }) {
//   const user = await currentUser(); // Fetch authenticated user

//   if (!user) {
//     redirect('/sign-in');
//   }

//   await connectDB(); // Ensure MongoDB connection

//   const layout = cookies().get('react-resizable-panels:layout');
//   const collapsed = cookies().get('react-resizable-panels:collapsed');

//   const defaultLayout = layout ? JSON.parse(layout.value) : undefined;
//   const defaultCollapsed = collapsed ? JSON.parse(collapsed.value) : undefined;

//   const store = await Store.findOne({
//     _id: params.storeId,
//     userId: user.id, // Clerk's user ID
//   });

//   if (!store) {
//     redirect('/');
//   }

//   return (
//     <>
//       <div className='min-h-screen'>
//         <Navbar />
//         {children}
//       </div>
//     </>
//   );
// }
