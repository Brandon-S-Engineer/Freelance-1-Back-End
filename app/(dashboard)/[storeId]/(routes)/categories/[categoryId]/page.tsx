import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import Billboard from '@/models/Billboard';
import { CategoryForm } from './components/category-form';

/* ——— Plain TS interfaces that match your Mongoose docs ——— */
interface LeanCategory {
  _id: string;
  name: string;
  billboardId: string;
}

interface LeanBillboard {
  _id: string;
  label: string;
}

const CategoryPage = async ({ params }: { params: { categoryId: string; storeId: string } }) => {
  await connectDB();

  /* ------------------------------------------------------------------ */
  /* 1. Category (only if we’re editing)                                */
  /* ------------------------------------------------------------------ */
  let category: LeanCategory | null = null;

  if (params.categoryId !== 'new') {
    const found = await Category.findById(params.categoryId).lean<{
      _id: any; // raw ObjectId
      name: string;
      billboardId: string;
    } | null>();

    if (found) {
      category = {
        _id: found._id.toString(),
        name: found.name,
        billboardId: found.billboardId,
      };
    }
  }

  /* ------------------------------------------------------------------ */
  /* 2. Billboards for the <Select>                                     */
  /* ------------------------------------------------------------------ */
  const rawBillboards = await Billboard.find({
    storeId: params.storeId,
  }).lean<
    {
      _id: any;
      label: string;
    }[]
  >();

  const billboards: LeanBillboard[] = rawBillboards.map((b) => ({
    _id: b._id.toString(),
    label: b.label,
  }));

  /* ------------------------------------------------------------------ */
  /* 3. Render                                                          */
  /* ------------------------------------------------------------------ */
  return (
    <div className='flex-col'>
      <div className='flex-1 space-y-4 p-8 pt-6'>
        <CategoryForm
          billboards={billboards}
          initialData={category}
        />
      </div>
    </div>
  );
};

export default CategoryPage;

// 5:32:50
// import connectDB from '@/lib/mongodb';
// import Billboard from '@/models/Billboard';
// import { CategoryForm } from './components/category-form';

// const CategoryPage = async ({ params }: { params: { categoryId: string } }) => {
//   await connectDB();

//   if (params.categoryId.length !== 24) {
//     return (
//       <div className='flex-col'>
//         <div className='flex-1 space-y-4 p-8 pt-6'>
//           <CategoryForm initialData={null} />
//         </div>
//       </div>
//     );
//   }

//   const category = await Billboard.findById(params.categoryId).lean<{
//     _id: string;
//     label: string;
//     imageUrl: string;
//     userId: string;
//   } | null>();

//   return (
//     <div className='flex-col'>
//       <div className='flex-1 space-y-4 p-8 pt-6'>
//         <CategoryForm initialData={category} />
//       </div>
//     </div>
//   );
// };

// export default CategoryPage;
