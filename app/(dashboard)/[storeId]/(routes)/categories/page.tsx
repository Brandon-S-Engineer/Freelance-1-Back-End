import { format } from 'date-fns';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import { CategoryClient } from './components/client';
import { CategoryColumn } from './components/columns';

const CategoriesPage = async ({ params }: { params: { storeId: string } }) => {
  await connectDB();

  type CategoryWithBillboard = {
    _id: any;
    name: string;
    billboardId: {
      label: string;
    };
    createdAt: Date;
  };

  const categories = await Category.find({ storeId: params.storeId })
    .populate('billboardId') // This includes full billboard doc
    .lean<CategoryWithBillboard[]>();

  const formattedCategories: CategoryColumn[] = categories.map((item) => ({
    id: item._id.toString(),
    name: item.name,
    billboardLabel: item.billboardId?.label || '-', // Extract label from populated object
    createdAt: format(new Date(item.createdAt), 'MMMM do, yyyy'),
  }));

  return (
    <div className='flex-col'>
      <div className='flex-1 space-y-4 p-8 pt-6'>
        <CategoryClient data={formattedCategories} />
      </div>
    </div>
  );
};

export default CategoriesPage;

// import { format } from 'date-fns';
// import connectDB from '@/lib/mongodb';
// import Category from '@/models/Category';

// import { CategoryClient } from './components/client';
// import { CategoryColumn } from './components/columns';

// const CategoriesPage = async ({ params }: { params: { storeId: string } }) => {
//   await connectDB();

//   const categories = await Category.find({ storeId: params.storeId }).sort({ createdAt: -1 }).lean<
//     {
//       _id: string;
//       name: string;
//       createdAt: Date;
//       billboardId: { _id: string; label: string };
//     }[]
//   >();

//   const formattedCategories: CategoryColumn[] = categories.map((category) => ({
//     id: category._id.toString(),
//     name: category.name,
//     billboardLabel: category.billboardId.label,
//     createdAt: format(new Date(category.createdAt), 'MMMM do, yyyy'),
//   }));

//   return (
//     <div className='flex-col'>
//       <div className='flex-1 space-y-4 p-8 pt-6'>
//         <CategoryClient data={formattedCategories} />
//       </div>
//     </div>
//   );
// };

// export default CategoriesPage;
