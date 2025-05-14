'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

// Enables React hooks and client-side rendering.

interface AlertModalProps {
  isOpen: boolean; // Modal visibility
  onClose: () => void; // Function to close the modal
  onConfirm: () => void; // Functio to confirm action in the modal
  loading: boolean; //Loading state to disable buttons
}

export const AlertModal: React.FC<AlertModalProps> = ({ isOpen, onClose, onConfirm, loading }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true); // Set mounted state to true after initail render
  }, []);

  if (!isMounted) return null; // Return null if component is not mounted yet

  return (
    <Modal
      title='Are you sure'
      description='This actions cannot be undone'
      isOpen={isOpen} // Modal's open state
      onClose={onClose} // Function to close the modal
    >
      <div className='pt-6 space-x-2 flex items-center justify-end'>
        <Button
          disabled={loading}
          variant='outline'
          onClick={onConfirm}>
          Cancel
        </Button>

        <Button
          disabled={loading}
          variant='destructive'
          onClick={onConfirm}>
          Continue
        </Button>
      </div>
    </Modal>
  );
};
