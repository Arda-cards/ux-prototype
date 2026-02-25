import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

interface OrderQueueToastProps {
  isVisible: boolean;
  onUndo?: () => void;
  onClose?: () => void;
}

const OrderQueueToast: React.FC<OrderQueueToastProps> = ({
  isVisible,
  onUndo,
  onClose,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);

      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(() => {
          onClose?.();
        }, 300);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed  top-4 left-1/2 transform -translate-x-1/2 z-[9999] transition-all duration-300 ${
        isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <div className='w-full max-w-[400px] relative shadow-[0px_4px_12px_-1px_rgba(0,0,0,0.1)] rounded-lg bg-white border border-[#e5e5e5] box-border flex flex-row items-center justify-start p-4 gap-6 text-left text-sm text-[#0a0a0a] font-geist'>
        <div className='w-5 h-5 relative overflow-hidden flex-shrink-0'>
          <div className='absolute h-[80%] w-full top-[10%] right-[10%] bottom-[10%] left-[10%] max-w-full overflow-hidden max-h-full bg-black rounded-full flex items-center justify-center'>
            <Check className='w-3 h-3 text-white' />
          </div>
        </div>

        <div className='flex-1 flex flex-col items-start justify-start gap-0.5'>
          <div className='self-stretch relative leading-5 font-medium'>
            Order up!
          </div>
          <div className='self-stretch relative leading-5 opacity-90'>
            Added to order queue.
          </div>
        </div>

        <button
          onClick={onUndo}
          className='shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded bg-[#fc5a29] h-6 flex flex-row items-center justify-center px-2 box-border cursor-pointer text-xs text-[#fafafa] font-medium hover:bg-[#e54a1a] transition-colors duration-200'
        >
          Undo
        </button>
      </div>
    </div>
  );
};

export default OrderQueueToast;
