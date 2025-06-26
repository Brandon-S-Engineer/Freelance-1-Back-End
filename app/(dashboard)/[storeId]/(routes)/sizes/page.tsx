import { format } from 'date-fns';

import connectDB from '@/lib/mongodb';
import Size from '@/models/Size';
import { SizesClient } from './components/client';
import { SizeColumn } from './components/columns';

const SizesPage = async ({ params }: { params: { storeId: string } }) => {
  await connectDB();

  const sizes = await Size.find({ storeId: params.storeId }).sort({ createdAt: -1 }).lean<
    {
      _id: any;
      name: string;
      value: string;
      createdAt: Date;
    }[]
  >();

  const formattedSizes: SizeColumn[] = sizes.map((item) => ({
    id: item._id.toString(),
    name: item.name,
    value: item.value,
    createdAt: format(new Date(item.createdAt), 'MMMM do, yyyy'),
  }));

  return (
    <div className='flex-col'>
      <div className='flex-1 space-y-4 p-8 pt-6'>
        <SizesClient data={formattedSizes} />
      </div>
    </div>
  );
};

export default SizesPage;
