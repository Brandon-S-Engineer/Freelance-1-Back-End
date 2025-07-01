import { format } from 'date-fns';

import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import Billboard from '@/models/Billboard'; // 👈  force-register schema

import { CategoryClient } from './components/client';
import { CategoryColumn } from './components/columns';

const CategoriesPage = async ({ params }: { params: { storeId: string } }) => {
  await connectDB();

  type CategoryWithBillboard = {
    _id: any;
    name: string;
    billboardId: { label: string };
    createdAt: Date;
  };

  const categories = await Category.find({ storeId: params.storeId })
    .populate('billboardId', 'label') // only need the label field
    .lean<CategoryWithBillboard[]>();

  const formatted: CategoryColumn[] = categories.map((c) => ({
    id: c._id.toString(),
    name: c.name,
    billboardLabel: c.billboardId?.label ?? '-',
    createdAt: format(c.createdAt, 'MMMM do, yyyy'),
  }));

  return (
    <div className='flex-col'>
      <div className='flex-1 space-y-4 p-8 pt-6'>
        <CategoryClient data={formatted} />
      </div>
    </div>
  );
};

export default CategoriesPage;
