import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Star } from 'lucide-react';

import { TokenChip } from './token-chip';
import { TooltipProvider } from '../../primitives/tooltip';

const meta: Meta = {
  title: 'Components/Canary/Atoms/TokenChip',
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
};

export default meta;

/** Plain chip with the × remove button. */
export const Default: StoryObj = {
  render: function DefaultStory() {
    const [values, setValues] = useState([
      'pepper@starkindustries.com',
      'orders@starkindustries.com',
    ]);
    return (
      <div className="flex flex-wrap items-center gap-1.5 p-8">
        {values.map((v) => (
          <TokenChip key={v} value={v} onRemove={() => setValues(values.filter((x) => x !== v))} />
        ))}
      </div>
    );
  },
};

/** Hover a chip: it expands to reveal the inline action before the ×. */
export const WithAction: StoryObj = {
  render: function WithActionStory() {
    const [defaultEmail, setDefaultEmail] = useState('pepper@starkindustries.com');
    const emails = ['pepper@starkindustries.com', 'orders@starkindustries.com'];
    return (
      <div className="p-8">
        <div className="flex flex-wrap items-center gap-1.5">
          {emails.map((v) => (
            <TokenChip
              key={v}
              value={v}
              action={
                v === defaultEmail
                  ? null
                  : {
                      label: `Set ${v} as the default`,
                      icon: <Star className="h-3 w-3" aria-hidden="true" />,
                      onAction: () => setDefaultEmail(v),
                    }
              }
              onRemove={() => {}}
            />
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Default: <code>{defaultEmail}</code>
        </p>
      </div>
    );
  },
};

/** Without onRemove the chip is display-only. */
export const ReadOnly: StoryObj = {
  render: () => (
    <div className="p-8">
      <TokenChip value="pepper@starkindustries.com" />
    </div>
  ),
};
