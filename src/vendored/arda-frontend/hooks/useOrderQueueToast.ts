import { useState, useCallback } from 'react';

export const useOrderQueueToast = () => {
  const [isToastVisible, setIsToastVisible] = useState(false);

  const showToast = useCallback(() => {
    setIsToastVisible(true);
  }, []);

  const hideToast = useCallback(() => {
    setIsToastVisible(false);
  }, []);

  const handleUndo = useCallback(() => {
    // TODO: Implement undo functionality
    console.log('Undo clicked - item removed from order queue');
    hideToast();
  }, [hideToast]);

  return {
    isToastVisible,
    showToast,
    hideToast,
    handleUndo,
  };
};
