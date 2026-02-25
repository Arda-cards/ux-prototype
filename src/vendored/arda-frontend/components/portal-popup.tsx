import React from 'react';

interface PortalPopupProps {
  overlayColor?: string;
  bottom?: number;
  relativeLayerRef?: React.RefObject<HTMLElement | null>;
  onOutsideClick?: () => void;
  children: React.ReactNode;
}

const PortalPopup: React.FC<PortalPopupProps> = ({
  overlayColor = 'rgba(0, 0, 0, 0.3)',
  bottom = 4,
  relativeLayerRef,
  onOutsideClick,
  children,
}) => {
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onOutsideClick?.();
    }
  };

  return (
    <div
      className='fixed inset-0 z-50'
      style={{ backgroundColor: overlayColor }}
      onClick={handleOverlayClick}
    >
      <div
        className='absolute'
        style={{
          top: relativeLayerRef?.current?.offsetTop
            ? `${
                relativeLayerRef.current.offsetTop +
                relativeLayerRef.current.offsetHeight +
                bottom
              }px`
            : `${bottom}px`,
          left: relativeLayerRef?.current?.offsetLeft || 0,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PortalPopup;
