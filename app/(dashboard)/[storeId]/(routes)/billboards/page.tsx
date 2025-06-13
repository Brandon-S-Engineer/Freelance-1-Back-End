import { format } from 'date-fns';
import connectDB from '@/lib/mongodb';
import Billboard from '@/models/Billboard';

import { BillboardClient } from './components/client';
import { BillboardColumn } from './components/columns';

const BillboardsPage = async ({ params }: { params: { storeId: string } }) => {
  await connectDB();

  const billboards = await Billboard.find({ storeId: params.storeId }).sort({ createdAt: -1 }).lean<{ _id: string; label: string; createdAt: Date }[]>();

  const formattedBillboards: BillboardColumn[] = billboards.map((billboard) => ({
    id: billboard._id.toString(),
    label: billboard.label,
    createdAt: format(new Date(billboard.createdAt), 'MMMM do, yyyy'),
  }));

  return (
    <div className='flex-col'>
      <div className='flex-1 space-y-4 p-8 pt-6'>
        <BillboardClient data={formattedBillboards} />
      </div>
    </div>
  );
};

export default BillboardsPage;

// import { BillboardClient } from './components/client';

// const BillboardsPage = () => {
//   return (
//     <div className='flex-col'>
//       <div className='flex-1 space-y-4 p-8 pt-6'>
//         <BillboardClient />
//       </div>
//     </div>
//   );
// };

// export default BillboardsPage;
