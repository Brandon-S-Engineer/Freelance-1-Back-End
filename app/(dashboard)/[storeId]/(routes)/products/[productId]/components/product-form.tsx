'use client';

import * as z from 'zod';
import axios from 'axios';
import { useEffect, useState } from 'react';
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

/* --- Types --- */
interface Product {
  _id: string;
  name: string;
  price: number;
  promoPrice: number | null;
  categoryId: string;
  specPdfUrl?: string;
  images: string[];
  variants: Variant[];
  isFeatured: boolean;
  isArchived: boolean;
}
interface Variant {
  name: string;
  price: number;
  promoPrice: number | null;
}
interface Category {
  _id: string;
  name: string;
}
interface ProductFormProps {
  initialData: Product | null;
  categories: Category[];
}

/* --- Schema --- */
const money = z.coerce.number().nonnegative();

const formSchema = z
  .object({
    name: z.string().min(1),
    images: z.string().array(),
    price: z.coerce.number().min(1),
    promoPrice: money.min(1).nullable().optional(),
    categoryId: z.string().min(1),
    specPdfUrl: z.string().url().optional(),
    isFeatured: z.boolean().optional(),
    isArchived: z.boolean().optional(),
    variants: z
      .array(
        z.object({
          name: z.string().min(1),
          price: z.coerce.number().min(1),
          promoPrice: money.min(1).nullable().optional(),
        })
      )
      .optional(),
  })
  .refine((d) => d.promoPrice == null || d.promoPrice < d.price, { path: ['promoPrice'], message: 'El precio "Promo" debe ser menor que el precio actual.' });

type ProductFormValues = z.infer<typeof formSchema>;

/* --- Component --- */
export const ProductForm: React.FC<ProductFormProps> = ({ initialData, categories }) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? 'Edit Product' : 'Create Product';
  const toastMessage = initialData ? 'Product updated successfully' : 'Product created successfully';
  const actionLabel = initialData ? 'Guardar Cambios' : 'Crear';

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          images: initialData.images,
          price: initialData.price,
          promoPrice: initialData.promoPrice ?? null,
          categoryId: initialData.categoryId,
          isFeatured: initialData.isFeatured,
          isArchived: initialData.isArchived,
          specPdfUrl: initialData.specPdfUrl || '',
          variants: (initialData.variants || []).map((v) => ({
            name: v.name,
            price: v.price,
            promoPrice: v.promoPrice ?? null,
          })),
        }
      : {
          name: '',
          images: [],
          price: 0,
          promoPrice: null,
          categoryId: '',
          isFeatured: false,
          isArchived: false,
          specPdfUrl: '',
          variants: [],
        },
  });

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(`/api/${params.storeId}/products/${params.productId}`, data);
      } else {
        await axios.post(`/api/${params.storeId}/products`, data);
      }
      router.push(`/${params.storeId}/products`);
      router.refresh();
      toast.success(toastMessage);
    } catch {
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.storeId}/products/${params.productId}`);
      router.push(`/${params.storeId}/products`);
      router.refresh();
      toast.success('Product deleted successfully');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const handleMoneyChange = (onChange: (v: number | null) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, '');
    const num = raw === '' ? NaN : parseInt(raw, 10);
    onChange(isNaN(num) ? 0 : num);
  };

  const handleMoneyChangeNullable = (onChange: (v: number | null) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, '');
    if (raw === '') return onChange(null);
    const num = parseInt(raw, 10);
    onChange(isNaN(num) ? null : num);
  };

  // console.log('initialData.promoPrice ->', initialData?.promoPrice);

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
          description={title}
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
                    value={field.value}
                    disabled={loading}
                    onChange={(url) => field.onChange([...(field.value || []), url])}
                    onRemove={(url) => field.onChange((field.value || []).filter((img: string) => img !== url))}
                    onReorder={(urls) => field.onChange(urls)} // ✅ clave
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* <FormField
            control={form.control}
            name='images'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Images</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value}
                    disabled={loading}
                    onChange={(url) => field.onChange([...field.value, url])}
                    onRemove={(url) => field.onChange(field.value.filter((img) => img !== url))}
                  />
                </FormControl>
              </FormItem>
            )}
          /> */}

          {/* PDF */}
          <FormField
            control={form.control}
            name='specPdfUrl'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ficha Técnica (PDF)</FormLabel>
                <FormControl>
                  <Input
                    placeholder='https://.../file.pdf'
                    {...field}
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
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Base Price */}
            <FormField
              control={form.control}
              name='price'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Price</FormLabel>
                  <FormControl>
                    <Input
                      type='text'
                      disabled={loading}
                      placeholder='0'
                      value={field.value === 0 ? '' : field.value.toLocaleString()}
                      onChange={handleMoneyChange(field.onChange)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Base Promo Price */}
            <FormField
              control={form.control}
              name='promoPrice'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio promocional (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      type='text'
                      disabled={loading}
                      placeholder='Dejar vacío si no hay promoción'
                      value={field.value == null || field.value === 0 ? '' : field.value.toLocaleString()}
                      onChange={handleMoneyChangeNullable(field.onChange)}
                    />
                  </FormControl>
                  <FormDescription>Debe ser inferior al precio actual.</FormDescription>
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
                        <SelectValue placeholder='Select a category' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem
                          key={cat._id}
                          value={cat._id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          {/* Variants */}
          <div className='space-y-4'>
            <FormLabel>Versiones</FormLabel>

            {form.watch('variants')?.map((variant, index) => (
              <div
                key={index}
                className='grid grid-cols-1 md:grid-cols-4 gap-4 items-end'>
                {/* Name */}
                <FormField
                  control={form.control}
                  name={`variants.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='e.g. Renegade L2'
                          disabled={loading}
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Price */}
                <FormField
                  control={form.control}
                  name={`variants.${index}.price`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          type='text'
                          placeholder='0'
                          value={field.value === 0 ? '' : field.value.toLocaleString()}
                          onChange={handleMoneyChange(field.onChange)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Promo Price (optional) */}
                <FormField
                  control={form.control}
                  name={`variants.${index}.promoPrice`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio promocional (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          type='text'
                          placeholder='Dejar vacio si no hay promoción'
                          value={field.value == null || field.value === 0 ? '' : field.value.toLocaleString()}
                          onChange={handleMoneyChangeNullable(field.onChange)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* ✅ Remove button (right side) */}
                <div className='flex md:justify-end'>
                  <Button
                    type='button'
                    variant='destructive'
                    disabled={loading}
                    onClick={() => {
                      const updated = [...(form.getValues('variants') || [])];
                      updated.splice(index, 1);
                      form.setValue('variants', updated);
                    }}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}

            <Button
              type='button'
              variant='outline'
              onClick={() => {
                const updated = [...(form.getValues('variants') || []), { name: '', price: 0, promoPrice: null }];
                form.setValue('variants', updated);
              }}>
              Agregar Versión
            </Button>
          </div>

          {/* Checkboxes */}
          <div className='grid grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='isFeatured'
              render={({ field }) => (
                <FormItem className='flex items-start space-x-3 p-4 border rounded-md'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className='space-y-1'>
                    <FormLabel>Featured</FormLabel>
                    <FormDescription>This car will appear on the home page</FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='isArchived'
              render={({ field }) => (
                <FormItem className='flex items-start space-x-3 p-4 border rounded-md'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className='space-y-1'>
                    <FormLabel>Archived</FormLabel>
                    <FormDescription>This car will not be visible to clients</FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <Button
            type='submit'
            disabled={loading}
            className='ml-auto'>
            {actionLabel}
          </Button>
        </form>
      </Form>
    </>
  );
};
