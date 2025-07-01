import { format } from 'date-fns';

import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { formatter } from '@/lib/utils';

import { ProductClient } from './components/client';
import { ProductColumn } from './components/columns';

const ProductsPage = async ({ params }: { params: { storeId: string } }) => {
  await connectDB();

  const products = await Product.find({ storeId: params.storeId }).populate('categoryId', 'name').populate('sizeId', 'name').populate('colorId', 'value').sort({ createdAt: -1 }).lean<
    {
      _id: any;
      name: string;
      isFeatured: boolean;
      isArchived: boolean;
      price: number;
      categoryId: { name: string };
      sizeId: { name: string };
      colorId: { value: string };
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
    size: item.sizeId.name,
    color: item.colorId.value,
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
