// app/(dashboard)/[storeId]/(routes)/products/page.tsx

import { format } from 'date-fns';

import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

// ← Add these imports so Mongoose registers their schemas
import Category from '@/models/Category';
import Size from '@/models/Size';
import Color from '@/models/Color';

import { formatter } from '@/lib/utils';
import { ProductClient } from './components/client';
import { ProductColumn } from './components/columns';

const ProductsPage = async ({ params }: { params: { storeId: string } }) => {
  await connectDB();

  const products = await Product.find({ storeId: params.storeId }).populate('categoryId', 'name').sort({ createdAt: -1 }).lean<
    {
      _id: any;
      name: string;
      isFeatured: boolean;
      isArchived: boolean;
      price: number;
      categoryId: { name: string };
      createdAt: Date;
    }[]
  >();

  const formattedProducts: ProductColumn[] = products.map((item) => ({
    id: item._id.toString(),
    name: item.name,
    isFeatured: item.isFeatured,
    isArchived: item.isArchived,
    price: formatter.format(item.price),
    category: item.categoryId.name,
    size: '',
    color: '',
    createdAt: format(new Date(item.createdAt), 'MMMM do, yyyy'),
  }));

  return (
    <div className='flex-col'>
      <div className='flex-1 space-y-4 p-8 pt-6'>
        <ProductClient data={formattedProducts} />
      </div>
    </div>
  );
};

export default ProductsPage;
