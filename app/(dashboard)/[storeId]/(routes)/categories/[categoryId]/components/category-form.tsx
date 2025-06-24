'use client';

import * as z from 'zod';
import axios from 'axios';
import { useState } from 'react';
import { Trash } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useRouter } from 'next/navigation';

import Heading from '@/components/ui/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { AlertModal } from '@/components/modals/alert-modal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

/* -------------------------------------------------------------------------- */
/*  Mongoose-style Type Definitions                                           */
/* -------------------------------------------------------------------------- */
interface Category {
  _id: string;
  name: string;
  billboardId: string;
}

interface Billboard {
  _id: string;
  label: string;
}

interface CategoryFormProps {
  initialData: Category | null;
  billboards: Billboard[];
}

/* -------------------------------------------------------------------------- */
/*  Zod Schema + Form Types                                                   */
/* -------------------------------------------------------------------------- */
const formSchema = z.object({
  name: z.string().min(1),
  billboardId: z.string().min(1),
});

type CategoryFormValues = z.infer<typeof formSchema>;

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */
export const CategoryForm: React.FC<CategoryFormProps> = ({ initialData, billboards }) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? 'Edit Category' : 'Create Category';
  const description = initialData ? 'Edit your Category' : 'Add a new Category';
  const toastMessage = initialData ? 'Category updated successfully' : 'Category created successfully';
  const actionLabel = initialData ? 'Save Changes' : 'Create';

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || { name: '', billboardId: '' },
  });

  /* ---------------------------------------------------------------------- */
  /*  Submit                                                                */
  /* ---------------------------------------------------------------------- */
  const onSubmit = async (data: CategoryFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(`/api/${params.storeId}/categories/${params.categoryId}`, data);
      } else {
        await axios.post(`/api/${params.storeId}/categories`, data);
      }
      router.push(`/${params.storeId}/categories`);
      router.refresh();
      toast.success(toastMessage);
    } catch {
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------------------------------------------- */
  /*  Delete                                                                */
  /* ---------------------------------------------------------------------- */
  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.storeId}/categories/${params.categoryId}`);
      router.push(`/${params.storeId}/categories`);
      router.refresh();
      toast.success('Category deleted successfully');
    } catch {
      toast.error('Make sure you deleted all products using this category first');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  /* ---------------------------------------------------------------------- */
  /*  Render                                                                */
  /* ---------------------------------------------------------------------- */
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
          <div className='grid grid-cols-3 gap-8'>
            {/* Name */}
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder='Category Name'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Billboard Select */}
            <FormField
              control={form.control}
              name='billboardId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billboard</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a Billboard' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {billboards.map((b) => (
                        <SelectItem
                          key={b._id}
                          value={b._id}>
                          {b.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            disabled={loading}
            className='ml-auto'
            type='submit'>
            {actionLabel}
          </Button>
        </form>
      </Form>
    </>
  );
};

// 5:32:50
// 'use client';

// import * as z from 'zod';
// import axios from 'axios';
// import { useState } from 'react';
// import { Trash } from 'lucide-react';
// import { useForm } from 'react-hook-form';
// import toast from 'react-hot-toast';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { useParams, useRouter } from 'next/navigation';

// import Heading from '@/components/ui/heading';
// import { Button } from '@/components/ui/button';
// import { Separator } from '@/components/ui/separator';
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
// import { Input } from '@/components/ui/input';
// import { AlertModal } from '@/components/modals/alert-modal';
// import { useOrigin } from '@/hooks/use-origin';
// import ImageUpload from '@/components/ui/image-upload';

// const formSchema = z.object({
//   name: z.string().min(3, { message: 'Store name is required, (min 3 characters).' }).max(25),
//   imageUrl: z.string().url(),
// });

// type CategoryFormValues = z.infer<typeof formSchema>;

// interface Category {
//   _id: string;
//   label: string;
//   imageUrl: string;
//   userId: string;
// }

// interface CategoryFormProps {
//   initialData: Category | null;
// }

// export const CategoryForm: React.FC<CategoryFormProps> = ({ initialData }) => {
//   const params = useParams();
//   const router = useRouter();
//   const origin = useOrigin();

//   const [open, setOpen] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const title = initialData ? 'Edit Category' : 'Craete a Category';
//   const description = initialData ? 'Edit your Category' : 'Add a new Category';
//   const toastMessage = initialData ? 'Category updated successfully' : 'Category created successfully';
//   const action = initialData ? 'Save Changes' : 'Create';

//   // ✅ Setup form validation with useForm
//   const form = useForm<CategoryFormValues>({
//     resolver: zodResolver(formSchema),
//     defaultValues: initialData || {
//       name: '',
//       imageUrl: '',
//     },
//   });

//   /* -------------------- Submit handler for updating store ------------------- */
//   const onSubmit = async (data: CategoryFormValues) => {
//     try {
//       setLoading(true);

//       if (initialData) {
//         await axios.patch(`/api/${params.storeId}/billboards/${params.billboardId}`, data);
//       } else {
//         await axios.post(`/api/${params.storeId}/billboards`, data);
//       }

//       router.refresh();
//       router.push(`/${params.storeId}/billboards`);
//       toast.success(toastMessage);
//     } catch (error) {
//       toast.error('Something went wrong.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* --------------------- Handler for deleting the store --------------------- */
//   const onDelete = async () => {
//     try {
//       setLoading(true);
//       await axios.delete(`/api/${params.storeId}/billboards/${params.billboardId}`);
//       router.refresh();
//       router.push(`/${params.storeId}/billboards`);
//       toast.success('Billboard deleted successfully');
//     } catch (error) {
//       toast.error('Make sure you deleted all categories using this billboard first');
//     } finally {
//       setLoading(false);
//       setOpen(false);
//     }
//   };

//   return (
//     <>
//       <AlertModal
//         isOpen={open}
//         onClose={() => setOpen(false)}
//         onConfirm={onDelete}
//         loading={loading}
//       />
//       <div className='flex items-center justify-between'>
//         <Heading
//           title={title}
//           description={description}
//         />

//         {initialData && (
//           <Button
//             disabled={loading}
//             variant='destructive'
//             size='icon'
//             onClick={() => setOpen(true)}>
//             <Trash className='h-4 w-4' />
//           </Button>
//         )}
//       </div>
//       <Separator />

//       <Form {...form}>
//         <form
//           onSubmit={form.handleSubmit(onSubmit)}
//           className='space-y-8 w-full'>
//           <FormField
//             control={form.control}
//             name='imageUrl'
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Background Image</FormLabel>
//                 <FormControl>
//                   <ImageUpload
//                     value={field.value ? [field.value] : []}
//                     disabled={loading}
//                     onChange={(url) => field.onChange(url)}
//                     onRemove={() => field.onChange('')}
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <div className='grid grid-cols-3 gap-8'>
//             <FormField
//               control={form.control}
//               name='name'
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Label</FormLabel>
//                   <FormControl>
//                     <Input
//                       disabled={loading}
//                       placeholder='Billboard label'
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//           </div>

//           <Button
//             disabled={loading}
//             className='ml-auto'
//             type='submit'>
//             {action}
//           </Button>
//         </form>
//       </Form>
//     </>
//   );
// };
