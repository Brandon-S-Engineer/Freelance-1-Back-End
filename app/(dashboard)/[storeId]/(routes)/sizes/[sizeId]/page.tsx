/* app/(dashboard)/[storeId]/(routes)/sizes/[sizeId]/page.tsx */
import connectDB from '@/lib/mongodb';
import Size from '@/models/Size';
import { SizeForm } from './components/size-form';
import { isValidObjectId } from 'mongoose';

/* A minimal interface that matches what SizeForm expects */
interface LeanSize {
  _id: string;
  name: string;
  value: string;
}

const SizePage = async ({ params }: { params: { sizeId: string } }) => {
  await connectDB();

  let size: LeanSize | null = null;

  /* Only fetch if this is an existing size and the ID is valid */
  if (params.sizeId !== 'new' && isValidObjectId(params.sizeId)) {
    const found = await Size.findById(params.sizeId).lean<{
      _id: any;
      name: string;
      value: string;
    } | null>();

    if (found) {
      size = {
        _id: found._id.toString(),
        name: found.name,
        value: found.value,
      };
    }
  }

  return (
    <div className='flex-col'>
      <div className='flex-1 space-y-4 p-8 pt-6'>
        {/* Pass Size data (or null) to the form */}
        <SizeForm initialData={size} />
      </div>
    </div>
  );
};

export default SizePage;
