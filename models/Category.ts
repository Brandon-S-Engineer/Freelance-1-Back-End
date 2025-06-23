import mongoose, { Schema, model, models, Types } from 'mongoose';

const CategorySchema = new Schema(
  {
    storeId: {
      type: Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    billboardId: {
      type: Types.ObjectId,
      ref: 'Billboard',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Category = models.Category || model('Category', CategorySchema);
export default Category;
