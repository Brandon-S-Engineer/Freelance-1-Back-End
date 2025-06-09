import mongoose, { Schema, model, models } from 'mongoose';

const BillboardSchema = new Schema(
  {
    label: { type: String, required: true },
    imageUrl: { type: String, required: true },
    storeId: { type: String, required: true }, // Links to a Store
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Billboard = models.Billboard || model('Billboard', BillboardSchema);

export default Billboard;

// import mongoose, { Schema, model, models, Document, Types } from 'mongoose';

// /* ------------------------------------------------------------------ */
// /*  Schema                                                            */
// /* ------------------------------------------------------------------ */
// interface BillboardDoc extends Document {
//   label: string;
//   imageUrl: string;
//   storeId: Types.ObjectId;
//   createdAt: Date;
//   updatedAt: Date;
// }

// const BillboardSchema = new Schema<BillboardDoc>(
//   {
//     label: { type: String, required: true },
//     imageUrl: { type: String, required: true },
//     storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
//   },
//   {
//     timestamps: true,

//     /* ---------- Plain-object transform for React Server → Client ---------- */
//     toJSON: {
//       virtuals: true,
//       transform(_doc, ret) {
//         // Cast to any so TypeScript won't complain when we mutate
//         const r: any = ret;

//         r.id = r._id.toString();
//         r.storeId = r.storeId?.toString();
//         r.createdAt = r.createdAt?.toISOString();
//         r.updatedAt = r.updatedAt?.toISOString();

//         delete r._id;
//         delete r.__v;
//         return r;
//       },
//     },
//   }
// );

// /* ------------------------------------------------------------------ */
// /*  Model export (reuse existing model in dev)                         */
// /* ------------------------------------------------------------------ */
// const Billboard = (models.Billboard as mongoose.Model<BillboardDoc>) || model<BillboardDoc>('Billboard', BillboardSchema);

// export default Billboard;
