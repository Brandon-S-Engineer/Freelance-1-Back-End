import { format } from 'date-fns';

import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { formatter } from '@/lib/utils';

import { OrderClient } from './components/client';
import { OrderColumn } from './components/columns';

const OrdersPage = async ({ params }: { params: { storeId: string } }) => {
  await connectDB();

  const orders = await Order.find({ storeId: params.storeId })
    .populate({
      path: 'orderItems',
      populate: { path: 'productId', select: 'name price' },
    })
    .sort({ createdAt: -1 })
    .lean<
      {
        _id: any;
        phone: string;
        address: string;
        isPaid: boolean;
        createdAt: Date;
        orderItems: {
          productId: { _id: any; name: string; price: number };
        }[];
      }[]
    >();

  const formattedOrders: OrderColumn[] = orders.map((item) => {
    const products = item.orderItems.map((oi) => oi.productId.name).join(', ');

    const totalPrice = formatter.format(item.orderItems.reduce((sum, oi) => sum + oi.productId.price, 0));

    return {
      id: item._id.toString(),
      phone: item.phone,
      address: item.address,
      products,
      totalPrice,
      isPaid: item.isPaid,
      createdAt: format(item.createdAt, 'MMMM do, yyyy'),
    };
  });

  return (
    <div className='flex-col'>
      <div className='flex-1 space-y-4 p-8 pt-6'>
        <OrderClient data={formattedOrders} />
      </div>
    </div>
  );
};

export default OrdersPage;
