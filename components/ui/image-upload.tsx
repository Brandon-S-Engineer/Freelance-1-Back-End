'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ImagePlus, Trash } from 'lucide-react';
import { CldUploadWidget } from 'next-cloudinary';
import { Button } from '@/components/ui/button';

// 🧲 dnd-kit
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ImageUploadProps {
  disabled?: boolean;
  onChange: (value: string) => void;
  onRemove: (value: string) => void;
  onReorder?: (urls: string[]) => void; // ✅
  value: string[];
}

const SortableImage: React.FC<{
  url: string;
  onRemove: (value: string) => void;
}> = ({ url, onRemove }) => {
  // Cada item debe tener un id estable; usamos la propia URL.
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: url });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // cursor "grabbable" para UX clara
    cursor: 'grab',
  } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className='relative w-[12.5rem] h-[12.5rem] rounded-md overflow-hidden' // 200px = 12.5rem
    >
      <div className='z-10 absolute top-2 right-2'>
        <Button
          type='button'
          onClick={() => onRemove(url)}
          variant='destructive'
          size='icon'>
          <Trash className='h-4 w-4' />
        </Button>
      </div>

      <Image
        fill
        className='object-cover'
        alt='image'
        src={url || 'https://via.placeholder.com/200'}
      />
    </div>
  );
};

const ImageUpload: React.FC<ImageUploadProps> = ({ disabled, onChange, onRemove, onReorder, value }) => {
  const [isMounted, setIsMounted] = useState(false);

  // Sensores dnd (puntero/mouse/touch)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onUpload = (result: any) => {
    onChange(result.info.secure_url);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = value.findIndex((u) => u === active.id);
    const newIndex = value.findIndex((u) => u === over.id);
    const reordered = arrayMove(value, oldIndex, newIndex);

    // Emitimos el nuevo orden al padre
    onReorder?.(reordered);
  };

  if (!isMounted) return null;

  return (
    <div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}>
        <SortableContext
          items={value}
          strategy={verticalListSortingStrategy}>
          <div className='mb-4 flex flex-wrap items-center gap-4'>
            {value.map((url) => (
              <SortableImage
                key={url}
                url={url}
                onRemove={onRemove}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <CldUploadWidget
        onUpload={onUpload}
        uploadPreset='asdqwe'>
        {({ open }) => {
          const handleClick = () => {
            setTimeout(() => open(), 100);
          };

          return (
            <Button
              type='button'
              disabled={disabled}
              variant='secondary'
              onClick={handleClick}>
              <ImagePlus className='h-4 w-4 mr-2' />
              Sube las imagenes
            </Button>
          );
        }}
      </CldUploadWidget>
    </div>
  );
};

export default ImageUpload;

// 'use client';

// import Image from 'next/image';
// import { useEffect, useState } from 'react';
// import { ImagePlus, Trash } from 'lucide-react';
// import { CldUploadWidget } from 'next-cloudinary';

// import { Button } from '@/components/ui/button';

// interface ImageUploadProps {
//   disabled?: boolean;
//   onChange: (value: string) => void; // Callback function
//   onRemove: (value: string) => void;
//   value: string[]; // Array of strings
// }

// const ImageUpload: React.FC<ImageUploadProps> = ({ disabled, onChange, onRemove, value }) => {
//   const [isMounted, setIsMounted] = useState(false);

//   useEffect(() => {
//     setIsMounted(true);
//   }, []);

//   const onUpload = (result: any) => {
//     //? On successful image upload, update the list of images with the new uploaded image URL.
//     onChange(result.info.secure_url);
//   };

//   if (!isMounted) {
//     return null; // Prevent hydration errors
//   }

//   return (
//     <div>
//       <div className='mb-4 flex items-center gap-4'>
//         {/* Iterate over Images */}
//         {value.map((url) => (
//           <div
//             key={url}
//             className='relative w-[200px] h-[200px] rounded-md overflow-hidden'>
//             <div className='z-10 absolute top-2 right-2'>
//               <Button
//                 type='button'
//                 onClick={() => onRemove(url)}
//                 variant='destructive'
//                 size='icon'>
//                 <Trash className='h-4 w-4' />
//               </Button>
//             </div>

//             <Image
//               fill
//               className='object-cover'
//               alt='image'
//               src={url || 'https://via.placeholder.com/200'}
//             />
//           </div>
//         ))}
//       </div>

//       <CldUploadWidget
//         onUpload={onUpload}
//         uploadPreset='asdqwe'>
//         {({ open }) => {
//           const handleClick = () => {
//             setTimeout(() => open(), 100);
//           };

//           return (
//             <Button
//               type='button'
//               disabled={disabled}
//               variant='secondary'
//               onClick={handleClick}>
//               <ImagePlus className='h-4 w-4 mr-2' />
//               Sube las imagenes
//             </Button>
//           );
//         }}
//       </CldUploadWidget>
//     </div>
//   );
// };

// export default ImageUpload;
