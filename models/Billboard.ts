import mongoose, { Schema, model, models } from 'mongoose';

const BillboardSchema = new Schema(
  {
    label: { type: String, required: true },
    storeId: { type: String, required: true }, // Links to a Store
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Billboard = models.Billboard || model('Billboard', BillboardSchema);

export default Billboard;
