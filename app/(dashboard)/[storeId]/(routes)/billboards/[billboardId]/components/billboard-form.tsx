'use client';

import * as z from 'zod'; // Zod for schema validation
import axios from 'axios';
import { useState } from 'react';
import { Trash } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useRouter } from 'next/navigation';

import Heading from '@/components/ui/heading'; // Component for titles
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { AlertModal } from '@/components/modals/alert-modal';
import { useOrigin } from '@/hooks/use-origin';
import ImageUpload from '@/components/ui/image-upload';

// ✅ Zod schema for validation
const formSchema = z.object({
  label: z.string().min(3, { message: 'Store name is required, (min 3 characters).' }).max(100),
  imageUrl: z.string().url(),
  // imageUrl: z.string().min(1), // Tutorial code - Not working
});

type BillboardFormValues = z.infer<typeof formSchema>;

// ✅ Define Store type for Mongoose
interface Billboard {
  _id: string;
  label: string;
  imageUrl: string;
  userId: string;
}

interface BillboardFormProps {
  initialData: Billboard | null; // Use the Mongoose-based StoreType instead of Prisma's Store model
}

export const BillboardForm: React.FC<BillboardFormProps> = ({ initialData }) => {
  const params = useParams(); // Hook to access URL parameters
  const router = useRouter(); // Hook to manage navigation
  const origin = useOrigin();

  const [open, setOpen] = useState(false); // Modal State
  const [loading, setLoading] = useState(false);

  const title = initialData ? 'Edit Billboard' : 'Craete a Billboard';
  const description = initialData ? 'Edit your Billboard' : 'Add a new billboard';
  const toastMessage = initialData ? 'Billboard updated successfully' : 'Billboard created successfully';
  const action = initialData ? 'Save Changes' : 'Create';

  // ✅ Setup form validation with useForm
  const form = useForm<BillboardFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      label: '',
      imageUrl: '',
    },
  });

  /* -------------------- Submit handler for updating store ------------------- */
  const onSubmit = async (data: BillboardFormValues) => {
    try {
      setLoading(true);

      if (initialData) {
        await axios.patch(`/api/${params.storeId}/billboards/${params.billboardId}`, data);
      } else {
        await axios.post(`/api/${params.storeId}/billboards`, data);
      }

      router.push(`/${params.storeId}/billboards`);
      router.refresh();
      toast.success(toastMessage);
    } catch (error) {
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  /* --------------------- Handler for deleting the store --------------------- */
  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.storeId}/billboards/${params.billboardId}`);
      router.push(`/${params.storeId}/billboards`);
      router.refresh();
      toast.success('Billboard deleted successfully');
    } catch (error) {
      toast.error('Make sure you deleted all categories using this billboard first');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className='flex items-center justify-between'>
        <Heading
          title={title}
          description={description}
        />

        {initialData && (
          <Button
            disabled={loading}
            variant='destructive'
            size='icon'
            onClick={() => setOpen(true)}>
            <Trash className='h-4 w-4' />
          </Button>
        )}
      </div>
      <Separator />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-8 w-full'>
          <FormField
            control={form.control}
            name='imageUrl'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Background Image</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value ? [field.value] : []}
                    disabled={loading}
                    onChange={(url) => field.onChange(url)}
                    onRemove={() => field.onChange('')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='grid grid-cols-3 gap-8'>
            <FormField
              control={form.control}
              name='label'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder='Billboard label'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            disabled={loading}
            className='ml-auto'
            type='submit'>
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
