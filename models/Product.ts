// models/Product.ts
import mongoose, { Schema, model, models, Types } from 'mongoose';

const ProductSchema = new Schema(
  {
    // Reference back to the Store
    storeId: {
      type: Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },

    // Reference to the Category
    categoryId: {
      type: Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },

    // Basic product info
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },

    // Variant references
    sizeId: {
      type: Types.ObjectId,
      ref: 'Size',
      required: true,
      index: true,
    },
    colorId: {
      type: Types.ObjectId,
      ref: 'Color',
      required: true,
      index: true,
    },

    // Image URLs for this product
    images: [
      {
        type: String,
        required: true,
      },
    ],

    // OrderItem references (for any orders that include this product)
    orderItems: [
      {
        type: Types.ObjectId,
        ref: 'OrderItem',
      },
    ],
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

const Product = models.Product || model('Product', ProductSchema);
export default Product;
