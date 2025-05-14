'use client';

import { Check, ChevronsUpDown, PlusCircle, Store as StoreIcon } from 'lucide-react';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useStoreModal } from '@/hooks/use-store-modal';
import { cn } from '@/lib/utils';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';

// Define the expected Store structure since we no longer use Prisma types
interface Store {
  _id: string;
  name: string;
}

interface StoreSwitcherProps {
  items: Store[]; // Updated to use Mongoose store structure
  className?: string;
}

export default function StoreSwitcher({ className, items = [] }: StoreSwitcherProps) {
  const storeModal = useStoreModal(); // Modal control functions
  const params = useParams(); // Dynamic parameters from the URL
  const router = useRouter(); // Router to navigate between stores

  // Format items for display
  const formattedItems = items.map((item) => ({
    label: item.name,
    value: item._id, // Mongoose uses `_id` instead of `id`
  }));

  // Find current active store
  const currentStore = formattedItems.find((item) => item.value === params.storeId);

  const [open, setOpen] = useState(false); // State to control Popover visibility

  // Function to handle Store Selection and Route Navigation
  const onStoreSelect = (store: { value: string; label: string }) => {
    setOpen(false); // Close popover
    router.push(`/${store.value}`); // Navigate to the selected store
  };

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          role='combobox'
          aria-expanded={open}
          aria-label='Select a store'
          className={cn('w-[200px] justify-between', className)}>
          <StoreIcon className='mr-2 h-4 w-4' />
          {currentStore?.label || 'Select a store'} {/* Show selected store's label */}
          <ChevronsUpDown className='ml-auto h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>

      <PopoverContent className='w-[200px] p-0'>
        <Command>
          <CommandList role='listbox'>
            <CommandInput placeholder='Search Store' />
            <CommandEmpty>No Store Found</CommandEmpty>

            {/* Group of Stores */}
            <CommandGroup heading='Stores'>
              {formattedItems.map((store) => (
                <CommandItem
                  key={store.value}
                  onSelect={() => onStoreSelect(store)}
                  className='text-sm'>
                  <StoreIcon className='mr-2 h-4 w-4' />
                  {store.label}
                  {/* Show check icon if current store is selected */}
                  <Check className={cn('ml-auto h-4 w-4', currentStore?.value === store.value ? 'opacity-100' : 'opacity-0')} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>

          <CommandSeparator />

          <CommandList>
            <CommandGroup>
              <CommandItem
                data-value='create store'
                onSelect={() => {
                  setOpen(false); // Close Popover
                  storeModal.onOpen(); // Open modal to create a new store using Zustand
                }}>
                <PlusCircle className='mr-2 h-5 w-5' /> {/* Plus icon */}
                Create Store
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
