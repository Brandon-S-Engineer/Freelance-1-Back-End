'use client';

import * as z from 'zod';
import axios from 'axios';
import { useState } from 'react';
import { Trash } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useRouter } from 'next/navigation';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Heading from '@/components/ui/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { AlertModal } from '@/components/modals/alert-modal';
import ImageUpload from '@/components/ui/image-upload';
import { Checkbox } from '@/components/ui/checkbox';

/* -------------------------------------------------------------------------- */
/*  TS interfaces matching your Mongoose data structures                      */
/* -------------------------------------------------------------------------- */
interface Product {
  _id: string;
  name: string;
  price: number;
  categoryId: string;
  sizeId: string;
  colorId: string;
  images: string[];
  isFeatured: boolean;
  isArchived: boolean;
}

interface Category {
  _id: string;
  name: string;
}

interface Size {
  _id: string;
  name: string;
  value: string;
}

interface Color {
  _id: string;
  name: string;
  value: string;
}

interface ProductFormProps {
  initialData: Product | null;
  categories: Category[];
  sizes: Size[];
  colors: Color[];
}

/* -------------------------------------------------------------------------- */
/*  Zod schema for form validation                                            */
/* -------------------------------------------------------------------------- */
const formSchema = z.object({
  name: z.string().min(1),
  images: z.object({ url: z.string() }).array(),
  price: z.coerce.number().min(1),
  categoryId: z.string().min(1),
  colorId: z.string().min(1),
  sizeId: z.string().min(1),
  isFeatured: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});

type ProductFormValues = z.infer<typeof formSchema>;

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */
export const ProductForm: React.FC<ProductFormProps> = ({ initialData, categories, sizes, colors }) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? 'Edit Product' : 'Create Product';
  const description = initialData ? 'Edit your Product' : 'Add a new Product';
  const toastMessage = initialData ? 'Product updated successfully' : 'Product created successfully';
  const actionLabel = initialData ? 'Save Changes' : 'Create';

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          images: initialData.images.map((url) => ({ url })),
          price: initialData.price,
          categoryId: initialData.categoryId,
          colorId: initialData.colorId,
          sizeId: initialData.sizeId,
          isFeatured: initialData.isFeatured,
          isArchived: initialData.isArchived,
        }
      : {
          name: '',
          images: [],
          price: 0,
          categoryId: '',
          colorId: '',
          sizeId: '',
          isFeatured: false,
          isArchived: false,
        },
  });

  /* ---------------------------------------------------------------------- */
  /*  Submit                                                                */
  /* ---------------------------------------------------------------------- */
  const onSubmit = async (data: ProductFormValues) => {
    try {
      setLoading(true);

      if (initialData) {
        await axios.patch(`/api/${params.storeId}/products/${params.productId}`, data);
      } else {
        await axios.post(`/api/${params.storeId}/products`, data);
      }

      await router.push(`/${params.storeId}/products`);
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
      await axios.delete(`/api/${params.storeId}/products/${params.productId}`);
      await router.push(`/${params.storeId}/products`);
      router.refresh();
      toast.success('Product deleted successfully');
    } catch {
      toast.error('Something went wrong');
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
          {/* Images */}
          <FormField
            control={form.control}
            name='images'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Images</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value.map((image) => image.url)}
                    disabled={loading}
                    onChange={(url) => field.onChange([...field.value, { url }])}
                    onRemove={(url) => field.onChange(field.value.filter((img) => img.url !== url))}
                  />
                </FormControl>
              </FormItem>
            )}
          />

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
                      placeholder='Product Name'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price */}
            <FormField
              control={form.control}
              name='price'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      disabled={loading}
                      placeholder='9.90'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={form.control}
              name='categoryId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a Category' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem
                          key={c._id}
                          value={c._id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Size */}
            <FormField
              control={form.control}
              name='sizeId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Size</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a Size' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sizes.map((s) => (
                        <SelectItem
                          key={s._id}
                          value={s._id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Color */}
            <FormField
              control={form.control}
              name='colorId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a Color' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {colors.map((c) => (
                        <SelectItem
                          key={c._id}
                          value={c._id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Featured */}
            <FormField
              control={form.control}
              name='isFeatured'
              render={({ field }) => (
                <FormItem className='flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className='space-y-1 leading-none'>
                    <FormLabel>Featured</FormLabel>
                    <FormDescription>This product will appear on the home page</FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* Archived */}
            <FormField
              control={form.control}
              name='isArchived'
              render={({ field }) => (
                <FormItem className='flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className='space-y-1 leading-none'>
                    <FormLabel>Archived</FormLabel>
                    <FormDescription>This product will not appear in the store</FormDescription>
                  </div>
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
