import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArdaSearchInput } from './search-input';

const meta = {
  title: 'Components/Canary/Atoms/SearchInput',
  component: ArdaSearchInput,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof ArdaSearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Search',
  },
};

export const WithValue: Story = {
  args: {
    placeholder: 'Search',
    value: 'baseball cards',
  },
};

export const CustomWidth: Story = {
  args: {
    placeholder: 'Search items...',
    maxWidth: '240px',
  },
};
