import React from 'react';
import { ExternalLink } from 'lucide-react';

interface TruncatedLinkProps {
  href: string;
  maxLength?: number;
  className?: string;
  showIcon?: boolean;
}

export const TruncatedLink: React.FC<TruncatedLinkProps> = ({
  href,
  className = '',
  showIcon = true,
  maxLength = 40,
}) => {
  // Handle empty or invalid href
  if (!href || href === '#' || href.trim() === '') {
    return (
      <span className={`text-base text-[#737373] font-normal ${className}`}>
        No link available
      </span>
    );
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  const handleIconClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  // Truncate the display text if it's longer than maxLength
  const displayText =
    href.length > maxLength ? `${href.substring(0, maxLength)}...` : href;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <a
        href={href}
        onClick={handleClick}
        className='text-base text-blue-600 font-semibold break-all hover:text-blue-700 hover:underline cursor-pointer'
        title={href}
        target='_blank'
        rel='noopener noreferrer'
      >
        {displayText}
      </a>
      {showIcon && (
        <button
          onClick={handleIconClick}
          className='flex-shrink-0 p-0.5 hover:bg-gray-100 rounded transition-colors'
          title='Open in new tab'
        >
          <ExternalLink className='w-4 h-4 text-[#0a0a0a] hover:text-[#0a0a0a]' />
        </button>
      )}
    </div>
  );
};
