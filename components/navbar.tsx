import { UserButton } from '@clerk/nextjs';
import { getAuth } from '@clerk/nextjs/server';

import connectDB from '@/lib/mongodb';
import Store from '@/models/Store';

import StoreSwitcher from '@/components/store-switcher';
import { MainNav } from '@/components/main-nav';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

const Navbar = async () => {
  // Construct a NextRequest-like object for getAuth()
  const nextRequest = { headers: headers() } as any;
  const { userId } = getAuth(nextRequest);

  if (!userId) {
    redirect('/sign-in');
  }

  await connectDB(); // Ensure DB connection

  const stores = await Store.find({ userId }).lean<{ _id: string; name: string; userId: string }[]>();

  const formattedStores = stores.map((store) => ({
    ...store,
    _id: store._id.toString(), // Ensure `_id` is a plain string
  }));

  return (
    <div className='border-b'>
      <div className='flex h-16 items-center px-4'>
        <StoreSwitcher items={formattedStores} />

        <MainNav className='mx-6' />

        <div className='ml-auto flex items-center space-x-4'>
          <UserButton afterSignOutUrl='/' />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
