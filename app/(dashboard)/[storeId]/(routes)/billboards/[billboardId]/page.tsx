import connectDB from '@/lib/mongodb';
import Billboard from '@/models/Billboard';
import { BillboardForm } from './components/billboard-form';

const BillboardPage = async ({ params }: { params: { billboardId: string } }) => {
  await connectDB(); // Ensure database connection

  // Validate if the ID has a valid MongoDB ObjectID length (24 characters)
  if (params.billboardId.length !== 24) {
    return (
      <div className='flex-col'>
        <div className='flex-1 space-y-4 p-8 pt-6'>
          <BillboardForm initialData={null} /> {/* Pass null for new billboard */}
        </div>
      </div>
    );
  }

  // Fetch the billboard from MongoDB
  const billboard = await Billboard.findById(params.billboardId).lean<{
    _id: string;
    label: string;
    imageUrl: string;
    userId: string;
  } | null>();

  return (
    <div className='flex-col'>
      <div className='flex-1 space-y-4 p-8 pt-6'>
        <BillboardForm initialData={billboard} />
      </div>
    </div>
  );
};

export default BillboardPage;
