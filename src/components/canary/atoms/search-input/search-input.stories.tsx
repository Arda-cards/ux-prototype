import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArdaSearchInput } from './search-input';

const meta = {
  title: 'Components/Canary/Atoms/SearchInput',
  component: ArdaSearchInput,
  parameters: { layout: 'centered' },
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

export const AllVariants: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex flex-col gap-4 max-w-md">
      <div className="flex items-center gap-3">
        <span className="w-32 text-sm text-muted-foreground">Default</span>
        <ArdaSearchInput placeholder="Search" />
      </div>
      <div className="flex items-center gap-3">
        <span className="w-32 text-sm text-muted-foreground">With value</span>
        <ArdaSearchInput placeholder="Search" value="baseball cards" onChange={() => undefined} />
      </div>
      <div className="flex items-center gap-3">
        <span className="w-32 text-sm text-muted-foreground">Custom width</span>
        <ArdaSearchInput placeholder="Search items..." maxWidth="240px" />
      </div>
      <div className="flex items-center gap-3">
        <span className="w-32 text-sm text-muted-foreground">Full width</span>
        <ArdaSearchInput placeholder="Search everything..." maxWidth="100%" className="flex-1" />
      </div>
    </div>
  ),
};

export const Playground: Story = {
  argTypes: {
    placeholder: { control: 'text' },
    value: { control: 'text' },
    maxWidth: { control: 'text' },
  },
  args: {
    placeholder: 'Search',
    value: '',
    maxWidth: '373px',
  },
};
