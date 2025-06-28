// app/(dashboard)/[storeId]/(routes)/colors/page.tsx

import { format } from 'date-fns';

import connectDB from '@/lib/mongodb';
import Color from '@/models/Color';
import { ColorsClient } from './components/client';
import { ColorColumn } from './components/columns';

const ColorsPage = async ({ params }: { params: { storeId: string } }) => {
  await connectDB();

  const colors = await Color.find({ storeId: params.storeId }).sort({ createdAt: -1 }).lean<
    {
      _id: any;
      name: string;
      value: string;
      createdAt: Date;
    }[]
  >();

  const formattedColors: ColorColumn[] = colors.map((item) => ({
    id: item._id.toString(),
    name: item.name,
    value: item.value,
    createdAt: format(new Date(item.createdAt), 'MMMM do, yyyy'),
  }));

  return (
    <div className='flex-col'>
      <div className='flex-1 space-y-4 p-8 pt-6'>
        <ColorsClient data={formattedColors} />
      </div>
    </div>
  );
};

export default ColorsPage;
