import type { Meta, StoryObj } from '@storybook/react-vite';
import { Sparkles, Bell, Zap, AlertCircle, Star, Check } from 'lucide-react';

import { Badge } from './badge';

const meta = {
  title: 'Components/Canary/Atoms/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline', 'ghost', 'link', 'error-overlay'],
      description: 'Visual variant.',
    },
    size: {
      control: 'radio',
      options: ['default', 'sm'],
      description: 'Size — default (20px) or sm (16px).',
    },
    icon: {
      control: 'select',
      options: ['none', 'Sparkles', 'Bell', 'Zap', 'AlertCircle', 'Star', 'Check'],
      mapping: {
        none: undefined,
        Sparkles,
        Bell,
        Zap,
        AlertCircle,
        Star,
        Check,
      },
      description: 'Icon component rendered before children.',
    },
    iconColor: {
      control: 'select',
      options: [
        'inherit',
        'text-primary',
        'text-muted-foreground',
        'text-purple-500',
        'text-blue-500',
      ],
      mapping: {
        inherit: undefined,
      },
      description: 'CSS color class for the icon.',
    },
    collapsible: {
      control: 'boolean',
      description: 'Show icon-only at rest, expand on hover.',
    },
    count: {
      control: 'number',
      description: 'Numeric count (overrides children).',
    },
    max: {
      control: 'number',
      description: 'Maximum count before showing +.',
    },
    children: {
      control: 'text',
      description: 'Text content.',
    },
  },
  args: {
    variant: 'secondary',
    size: 'default',
    children: 'Badge',
    collapsible: false,
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
