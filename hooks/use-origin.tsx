import { useState, useEffect } from 'react';

// Custom hook to get the window's origin
export const useOrigin = () => {
  const [mounted, setMounted] = useState(false);

  // Get the window;s origin if available, otherwise return an empty string
  const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Return null if component isn't mounted

  return origin; // return the origin if mounted
};
