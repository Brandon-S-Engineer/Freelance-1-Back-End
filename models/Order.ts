import mongoose, { Schema, model, models, Types } from 'mongoose';

const OrderSchema = new Schema(
  {
    storeId: {
      type: Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true, // @@index([storeId])
    },
    orderItems: [
      {
        type: Types.ObjectId,
        ref: 'OrderItem',
      },
    ],
    isPaid: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    address: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true, // createdAt / updatedAt
  }
);

const Order = models.Order || model('Order', OrderSchema);
export default Order;
