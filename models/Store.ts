import mongoose, { Schema, model, models } from 'mongoose';

const StoreSchema = new Schema(
  {
    name: { type: String, required: true },
    userId: { type: String, required: true },

    billboards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Billboard' }],
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    sizes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Size' }],
    colors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Color' }],
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  },
  { timestamps: true }
);

const Store = models.Store || model('Store', StoreSchema);
export default Store;
