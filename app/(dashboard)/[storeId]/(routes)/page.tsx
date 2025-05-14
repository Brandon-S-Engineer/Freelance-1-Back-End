import connectDB from '@/lib/mongodb';
import Store from '@/models/Store';

interface DashboardPageProps {
  params: { storeId: string };
}

const DashboardPage: React.FC<DashboardPageProps> = async ({ params }) => {
  await connectDB(); // Ensure MongoDB connection

  const store = await Store.findById(params.storeId);

  return <div>Active Store: {store?.name ?? 'Not Found'}</div>;
};

export default DashboardPage;
