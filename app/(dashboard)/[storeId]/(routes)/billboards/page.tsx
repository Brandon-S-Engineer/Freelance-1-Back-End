const BillboardsPage = () => {
  return (
    <div className='flex-col'>
      <div className='flex-1 space-y-4 p-8 pt-6'>
        <p>Hello</p>
        {/* <BillboardClient /> */}
      </div>
    </div>
  );
};

export default BillboardsPage;

//? Complete component
// import { format } from 'date-fns'; // Format dates
// import connectDB from '@/lib/mongodb';
// import Billboard from '@/models/Billboard'; // Import Mongoose model

// import { BillboardClient } from './components/client';
// import { BillboardColumn } from './components/columns';

// const BillboardsPage = async ({ params }: { params: { storeId: string } }) => {
//   await connectDB(); // Ensure database connection

//   // Fetch billboards from MongoDB where storeId matches the given params
//   const billboards = await Billboard.find({ storeId: params.storeId })
//     .sort({ createdAt: -1 }) // Order by creation date (descending)
//     .lean<{ _id: string; label: string; createdAt: Date }[]>(); // Ensure correct return type

//   // Format the fetched billboards data
//   const formattedBillboards: BillboardColumn[] = billboards.map((billboard) => ({
//     id: billboard._id.toString(), // Convert ObjectId to string
//     label: billboard.label,
//     createdAt: format(new Date(billboard.createdAt), 'MMMM do, yyyy'), // Format date
//   }));

//   return (
//     <div className='flex-col'>
//       <div className='flex-1 space-y-4 p-8 pt-6'>
//         <BillboardClient data={formattedBillboards} />
//       </div>
//     </div>
//   );
// };

// export default BillboardsPage;
