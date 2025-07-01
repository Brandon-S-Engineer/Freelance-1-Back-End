import mongoose, { Schema, model, models, Types } from 'mongoose';

const OrderItemSchema = new Schema(
  {
    orderId: {
      type: Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true, // @@index([orderId])
    },
    productId: {
      type: Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true, // @@index([productId])
    },
  },
  {
    // no timestamps: OrderItem doesn’t have createdAt/updatedAt in Prisma
    timestamps: false,
  }
);

const OrderItem = models.OrderItem || model('OrderItem', OrderItemSchema);
export default OrderItem;
