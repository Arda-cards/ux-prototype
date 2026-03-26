import type { Meta, StoryObj } from '@storybook/react-vite';
import { Search, DollarSign, AtSign } from 'lucide-react';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
} from './input-group';

const meta = {
  title: 'Components/Canary/Atoms/InputGroup',
  component: InputGroup,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Composable input group with inline-start, inline-end, block-start, and block-end addon positions. ' +
          'Supports text addons, button addons, and both input and textarea controls.',
      },
    },
  },
} satisfies Meta<typeof InputGroup>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: () => (
    <div className="w-72">
      <InputGroup>
        <InputGroupAddon align="inline-start">
          <InputGroupText>
            <Search />
          </InputGroupText>
        </InputGroupAddon>
        <InputGroupInput placeholder="Search items..." />
      </InputGroup>
    </div>
  ),
};

export const WithButton: Story = {
  render: () => (
    <div className="w-72">
      <InputGroup>
        <InputGroupInput placeholder="Enter email..." />
        <InputGroupAddon align="inline-end">
          <InputGroupButton>Send</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
};

export const WithTextarea: Story = {
  render: () => (
    <div className="w-72">
      <InputGroup>
        <InputGroupAddon align="block-start">
          <InputGroupText>Notes</InputGroupText>
        </InputGroupAddon>
        <InputGroupTextarea placeholder="Add a note..." rows={3} />
      </InputGroup>
    </div>
  ),
};

export const AllVariants: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex flex-col gap-6 max-w-sm">
      <div className="flex items-center gap-4">
        <span className="w-36 text-sm text-muted-foreground shrink-0">Inline start</span>
        <InputGroup className="flex-1">
          <InputGroupAddon align="inline-start">
            <InputGroupText>
              <DollarSign />
            </InputGroupText>
          </InputGroupAddon>
          <InputGroupInput placeholder="0.00" />
        </InputGroup>
      </div>
      <div className="flex items-center gap-4">
        <span className="w-36 text-sm text-muted-foreground shrink-0">Inline end</span>
        <InputGroup className="flex-1">
          <InputGroupInput placeholder="username" />
          <InputGroupAddon align="inline-end">
            <InputGroupText>
              <AtSign />
            </InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      </div>
      <div className="flex items-center gap-4">
        <span className="w-36 text-sm text-muted-foreground shrink-0">Block start</span>
        <InputGroup className="flex-1">
          <InputGroupAddon align="block-start">
            <InputGroupText>Label</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput placeholder="Value" />
        </InputGroup>
      </div>
      <div className="flex items-center gap-4">
        <span className="w-36 text-sm text-muted-foreground shrink-0">Block end</span>
        <InputGroup className="flex-1">
          <InputGroupInput placeholder="Value" />
          <InputGroupAddon align="block-end">
            <InputGroupText>Hint text below</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      </div>
      <div className="flex items-center gap-4">
        <span className="w-36 text-sm text-muted-foreground shrink-0">With button</span>
        <InputGroup className="flex-1">
          <InputGroupInput placeholder="Enter value..." />
          <InputGroupAddon align="inline-end">
            <InputGroupButton>Go</InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
      <div className="flex items-center gap-4">
        <span className="w-36 text-sm text-muted-foreground shrink-0">Textarea</span>
        <InputGroup className="flex-1">
          <InputGroupAddon align="block-start">
            <InputGroupText>Notes</InputGroupText>
          </InputGroupAddon>
          <InputGroupTextarea placeholder="Add notes..." rows={2} />
        </InputGroup>
      </div>
    </div>
  ),
};

export const Playground: Story = {
  argTypes: {
    className: { control: 'text' },
  },
  args: {
    className: 'w-72',
  },
  render: (args) => (
    <InputGroup {...args}>
      <InputGroupAddon align="inline-start">
        <InputGroupText>
          <DollarSign />
        </InputGroupText>
      </InputGroupAddon>
      <InputGroupInput placeholder="0.00" type="number" />
    </InputGroup>
  ),
};
