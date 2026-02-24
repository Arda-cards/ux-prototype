'use client';

import {
  XIcon,
  ListIcon,
  DockIcon,
  ShoppingCartIcon,
  MessageCircleQuestionIcon,
  ChevronRightIcon,
  HeadphonesIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@frontend/lib/utils';
import { fetchHelpTopics } from '@frontend/lib/hubspot-knowledge';
import { HubSpotKnowledgeArticle } from '@frontend/types/hubspot';

interface HelpPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpPanel({ isOpen, onClose }: HelpPanelProps) {
  const [helpTopics, setHelpTopics] = useState<HubSpotKnowledgeArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && helpTopics.length === 0) {
      fetchHelpTopics()
        .then((topics) => {
          setHelpTopics(topics);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Failed to fetch help topics:', err);
          setError('Failed to load help topics');
          setLoading(false);
        });
    }
  }, [isOpen, helpTopics.length]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as Element).id === 'help-overlay') {
      onClose();
    }
  };

  const handleHelpTopicClick = (topic: HubSpotKnowledgeArticle) => {
    if (topic.isExternal && topic.url) {
      // Open external URL in new tab for external articles
      window.open(topic.url, '_blank');
    } else {
      // Navigate to internal help article page
      window.location.href = `/help/${topic.slug}`;
    }
  };

  const getIconForTopic = (iconName?: string) => {
    switch (iconName) {
      case 'ListIcon':
        return <ListIcon className='h-5 w-5 text-base-foreground' />;
      case 'DockIcon':
        return <DockIcon className='h-5 w-5 text-base-foreground' />;
      case 'ShoppingCartIcon':
        return <ShoppingCartIcon className='h-5 w-5 text-base-foreground' />;
      case 'MessageCircleQuestionIcon':
        return <MessageCircleQuestionIcon className='h-5 w-5 text-base-foreground' />;
      case 'HeadphonesIcon':
        return <HeadphonesIcon className='h-5 w-5 text-base-foreground' />;
      default:
        return <MessageCircleQuestionIcon className='h-5 w-5 text-base-foreground' />;
    }
  };

  return (
    <div
      id='help-overlay'
      onClick={handleOverlayClick}
      className={cn(
        'fixed inset-0 z-50 flex justify-end transition-all duration-300',
        isOpen ? 'visible opacity-100' : 'invisible opacity-0'
      )}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(0px)',
      }}
    >
      <div
        className={cn(
          'relative w-96 h-full bg-white border-l border-border p-6 flex flex-col gap-4 shadow-xl transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <button
          className='absolute top-4 right-4 text-foreground opacity-70 hover:opacity-100'
          onClick={onClose}
        >
          <XIcon className='h-4 w-4' />
        </button>

        <div className='flex flex-col gap-2'>
          <h2 className='text-[18px] font-semibold text-base-foreground font-geist'>
            Need help?
          </h2>
          <p className='text-sm text-muted-foreground font-geist'>
            Tap a topic. Get unstuck.
          </p>
        </div>

        <div className='flex flex-col gap-4 pt-4 border-t border-border'>
          {loading ? (
            <div className='text-sm text-muted-foreground'>Loading help topics...</div>
          ) : error ? (
            <div className='text-sm text-destructive'>Failed to load help topics</div>
          ) : (
            helpTopics.map((topic) => (
              <HelpItem
                key={topic.id}
                icon={getIconForTopic(topic.helpTopicIcon)}
                title={topic.name || 'Untitled'}
                description={topic.summary || ''}
                onClick={() => handleHelpTopicClick(topic)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

interface HelpItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
}

function HelpItem({ icon, title, description, onClick }: HelpItemProps) {
  return (
    <div 
      className='flex items-center justify-between gap-4 hover:bg-muted px-2 py-3 rounded-md cursor-pointer transition-colors'
      onClick={onClick}
    >
      <div className='flex items-start gap-4'>
        <div className='w-12 h-12 flex items-center justify-center bg-white border border-border rounded-lg shadow-sm'>
          {icon}
        </div>
        <div className='flex flex-col'>
          <span className='text-base font-semibold text-base-card-foreground font-geist'>
            {title}
          </span>
          <span className='text-sm text-muted-foreground font-geist'>
            {description}
          </span>
        </div>
      </div>
      <ChevronRightIcon
        className='h-5 w-5'
        style={{ color: 'var(--base-foreground, #0A0A0A)' }}
      />
    </div>
  );
}
