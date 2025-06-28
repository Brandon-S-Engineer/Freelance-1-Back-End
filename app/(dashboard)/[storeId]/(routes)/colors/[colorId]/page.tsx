// app/(dashboard)/[storeId]/(routes)/colors/[colorId]/page.tsx

import connectDB from '@/lib/mongodb';
import Color from '@/models/Color';
import { isValidObjectId } from 'mongoose';
import { ColorForm } from './components/color-form';

/** Minimal interface matching the ColorForm’s expectations */
interface LeanColor {
  _id: string;
  name: string;
  value: string;
}

const ColorPage = async ({ params }: { params: { colorId: string } }) => {
  await connectDB();

  let color: LeanColor | null = null;

  if (params.colorId !== 'new' && isValidObjectId(params.colorId)) {
    const found = await Color.findById(params.colorId).lean<{
      _id: any;
      name: string;
      value: string;
    } | null>();

    if (found) {
      color = {
        _id: found._id.toString(),
        name: found.name,
        value: found.value,
      };
    }
  }

  return (
    <div className='flex-col'>
      <div className='flex-1 space-y-4 p-8 pt-6'>
        <ColorForm initialData={color} />
      </div>
    </div>
  );
};

export default ColorPage;
