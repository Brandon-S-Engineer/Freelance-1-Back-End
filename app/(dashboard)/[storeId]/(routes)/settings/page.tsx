import { getAuth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import connectDB from '@/lib/mongodb';
import Store from '@/models/Store';

import { SettingsForm } from './components/settings-form';
import { headers } from 'next/headers';

interface SettingsPageProps {
  params: {
    storeId: string; // Expect storeId to be passed as param
  };
}

const SettingsPage: React.FC<SettingsPageProps> = async ({ params }) => {
  await connectDB(); // Ensure database connection

  // Construct a NextRequest-like object for Clerk authentication
  const nextRequest = { headers: headers() } as any;
  const { userId } = getAuth(nextRequest);

  if (!userId) {
    redirect('/sign-in');
  }

  // Fetch store associated with the authenticated user
  const store = await Store.findOne({ _id: params.storeId, userId }).lean<{ _id: string; name: string; userId: string } | null>();

  if (!store) {
    redirect('/');
  }

  const formattedStore = {
    ...store,
    _id: store._id.toString(), // This makes `_id` safe for Client Component
  };

  return (
    <div className='flex-col'>
      <div className='flex-1 space-y-4 p-8 py-6'>
        <SettingsForm initialData={formattedStore} />
      </div>
    </div>
  );
};

export default SettingsPage;
