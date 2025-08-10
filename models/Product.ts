// models/Product.ts
import mongoose, { Schema, model, models, Types, Document } from 'mongoose';

// Shared TypeScript interfaces for clarity and reuse
export interface Variant {
  _id: string;
  name: string;
  price: number;
  promoPrice: number | null;
}

export interface CategoryRef {
  name: string;
}

export interface ProductType extends Document {
  _id: string;
  storeId: string;
  categoryId: Types.ObjectId | CategoryRef;
  name: string;
  price: number;
  promoPrice: number | null;
  isFeatured: boolean;
  isArchived: boolean;
  variants: Variant[]; // always normalized to array
  images: string[];
  specPdfUrl?: string;
  orderItems: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// Subschema for product variants
const VariantSchema = new Schema<Variant>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
  },
  promoPrice: {
    type: Number,
    default: null,
  },
});

const ProductSchema = new Schema<Partial<ProductType>>(
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
    promoPrice: {
      type: Number,
      default: null,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },

    // Variants for different versions of the product
    variants: {
      type: [VariantSchema],
      default: [],
    },

    // Images URLs for this product
    images: [
      {
        type: String,
        required: true,
      },
    ],

    // PDF technical sheet URL
    specPdfUrl: {
      type: String,
      required: false,
    },

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
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id; // optional convenience
        delete ret.__v;
      },
    },
  }
);

// Use generic to help TS inference on the model
const Product = (models.Product as mongoose.Model<ProductType>) || model<ProductType>('Product', ProductSchema as any);
export default Product;
