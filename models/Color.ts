import mongoose, { Schema, model, models, Types } from 'mongoose';

const ColorSchema = new Schema(
  {
    storeId: {
      type: Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true, // mirrors @@index([storeId])
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: String,
      required: true,
      trim: true,
    },
    products: [
      {
        type: Types.ObjectId,
        ref: 'Product',
      },
    ],
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

const Color = models.Color || model('Color', ColorSchema);
export default Color;
