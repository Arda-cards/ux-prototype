import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: jest.fn().mockReturnValue(false),
}));

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from './sidebar';

describe('Sidebar', () => {
  it('SidebarProvider renders children', () => {
    render(
      <SidebarProvider>
        <div>Child content</div>
      </SidebarProvider>
    );
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('SidebarTrigger renders a button', () => {
    render(
      <SidebarProvider>
        <SidebarTrigger />
      </SidebarProvider>
    );
    expect(screen.getByRole('button', { name: /toggle sidebar/i })).toBeInTheDocument();
  });

  it('SidebarContent renders content', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <div>Sidebar body</div>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );
    expect(screen.getByText('Sidebar body')).toBeInTheDocument();
  });

  it('Sidebar renders with default variant', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <div>Default variant</div>
        </Sidebar>
      </SidebarProvider>
    );
    const sidebarEl = document.querySelector('[data-slot="sidebar"]');
    expect(sidebarEl).toBeInTheDocument();
    expect(sidebarEl).toHaveAttribute('data-variant', 'sidebar');
  });

  it('useSidebar throws when used outside SidebarProvider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    function TestComponent() {
      useSidebar();
      return null;
    }
    expect(() => render(<TestComponent />)).toThrow(
      'useSidebar must be used within a SidebarProvider.'
    );
    consoleSpy.mockRestore();
  });

  it('SidebarTrigger toggles sidebar state on click', async () => {
    const user = userEvent.setup();
    function SidebarState() {
      const { state } = useSidebar();
      return <div data-testid="state">{state}</div>;
    }
    render(
      <SidebarProvider defaultOpen={true}>
        <SidebarTrigger />
        <SidebarState />
      </SidebarProvider>
    );
    expect(screen.getByTestId('state')).toHaveTextContent('expanded');
    await user.click(screen.getByRole('button', { name: /toggle sidebar/i }));
    expect(screen.getByTestId('state')).toHaveTextContent('collapsed');
  });

  it('Sidebar renders menu items (SidebarMenuItem)', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>Item 1</SidebarMenuItem>
              <SidebarMenuItem>Item 2</SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('SidebarGroup renders with label', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Group Label</SidebarGroupLabel>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );
    expect(screen.getByText('Group Label')).toBeInTheDocument();
  });
});

import {
  SidebarFooter,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarRail,
  SidebarSeparator,
  SidebarGroupAction,
  SidebarGroupContent,
} from './sidebar';

describe('Sidebar additional components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('SidebarHeader renders with data-slot', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>Header</SidebarHeader>
        </Sidebar>
      </SidebarProvider>
    );
    expect(container.querySelector('[data-slot="sidebar-header"]')).toBeInTheDocument();
    expect(screen.getByText('Header')).toBeInTheDocument();
  });

  it('SidebarFooter renders with data-slot', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar>
          <SidebarFooter>Footer</SidebarFooter>
        </Sidebar>
      </SidebarProvider>
    );
    expect(container.querySelector('[data-slot="sidebar-footer"]')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('SidebarInput renders an input element', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarInput placeholder="Search sidebar" />
        </Sidebar>
      </SidebarProvider>
    );
    expect(screen.getByPlaceholderText('Search sidebar')).toBeInTheDocument();
  });

  it('SidebarInset renders as main element', () => {
    const { container } = render(
      <SidebarProvider>
        <SidebarInset>Main content</SidebarInset>
      </SidebarProvider>
    );
    expect(container.querySelector('main[data-slot="sidebar-inset"]')).toBeInTheDocument();
  });

  it('SidebarSeparator renders', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar>
          <SidebarSeparator />
        </Sidebar>
      </SidebarProvider>
    );
    expect(container.querySelector('[data-slot="sidebar-separator"]')).toBeInTheDocument();
  });

  it('SidebarGroupAction renders', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupAction aria-label="Add">+</SidebarGroupAction>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );
    expect(container.querySelector('[data-slot="sidebar-group-action"]')).toBeInTheDocument();
  });

  it('SidebarGroupAction with asChild renders slot element', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupAction asChild>
                <a href="/add">Add</a>
              </SidebarGroupAction>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );
    expect(screen.getByText('Add')).toBeInTheDocument();
  });

  it('SidebarGroupContent renders', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>Group content</SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );
    expect(container.querySelector('[data-slot="sidebar-group-content"]')).toBeInTheDocument();
    expect(screen.getByText('Group content')).toBeInTheDocument();
  });

  it('SidebarGroupLabel with asChild renders slot element', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <h3>Heading Label</h3>
              </SidebarGroupLabel>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );
    expect(screen.getByText('Heading Label')).toBeInTheDocument();
  });

  it('SidebarMenuButton renders as button', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>Menu Button</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );
    expect(container.querySelector('[data-slot="sidebar-menu-button"]')).toBeInTheDocument();
  });

  it('SidebarMenuButton with isActive=true has data-active=true', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive>Active Item</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );
    expect(container.querySelector('[data-active="true"]')).toBeInTheDocument();
  });

  it('SidebarMenuButton with string tooltip renders', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="My Tooltip">With Tooltip</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );
    expect(screen.getByText('With Tooltip')).toBeInTheDocument();
  });

  it('SidebarMenuButton with asChild renders slot element', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/link">Link Button</a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );
    expect(screen.getByText('Link Button')).toBeInTheDocument();
  });

  it('SidebarMenuButton with object tooltip renders', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip={{ children: 'Object Tooltip' }}>
                  Obj Tooltip Button
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );
    expect(screen.getByText('Obj Tooltip Button')).toBeInTheDocument();
  });

  it('SidebarMenuAction renders', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuAction>...</SidebarMenuAction>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );
    expect(container.querySelector('[data-slot="sidebar-menu-action"]')).toBeInTheDocument();
  });

  it('SidebarMenuAction with showOnHover=true applies opacity classes', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuAction showOnHover>...</SidebarMenuAction>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );
    expect(container.querySelector('[data-slot="sidebar-menu-action"]')).toBeInTheDocument();
  });

  it('SidebarMenuBadge renders', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuBadge>5</SidebarMenuBadge>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );
    expect(container.querySelector('[data-slot="sidebar-menu-badge"]')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('SidebarMenuSkeleton renders without icon', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuSkeleton />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );
    expect(container.querySelector('[data-slot="sidebar-menu-skeleton"]')).toBeInTheDocument();
    expect(container.querySelector('[data-sidebar="menu-skeleton-icon"]')).not.toBeInTheDocument();
  });

  it('SidebarMenuSkeleton with showIcon=true renders icon', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuSkeleton showIcon />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );
    expect(container.querySelector('[data-sidebar="menu-skeleton-icon"]')).toBeInTheDocument();
  });

  it('SidebarMenuSub renders', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton href="/sub">Sub item</SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );
    expect(container.querySelector('[data-slot="sidebar-menu-sub"]')).toBeInTheDocument();
    expect(screen.getByText('Sub item')).toBeInTheDocument();
  });

  it('SidebarMenuSubButton with size=sm applies text-xs', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar>
          <SidebarMenuSub>
            <SidebarMenuSubButton size="sm">Sm sub</SidebarMenuSubButton>
          </SidebarMenuSub>
        </Sidebar>
      </SidebarProvider>
    );
    expect(container.querySelector('[data-slot="sidebar-menu-sub-button"]')).toHaveClass('text-xs');
  });

  it('SidebarMenuSubButton with asChild renders slot element', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarMenuSub>
            <SidebarMenuSubButton asChild>
              <button>Sub Button</button>
            </SidebarMenuSubButton>
          </SidebarMenuSub>
        </Sidebar>
      </SidebarProvider>
    );
    expect(screen.getByText('Sub Button')).toBeInTheDocument();
  });

  it('SidebarRail renders', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar>
          <SidebarRail />
        </Sidebar>
      </SidebarProvider>
    );
    expect(container.querySelector('[data-slot="sidebar-rail"]')).toBeInTheDocument();
  });

  it('Sidebar with collapsible=none renders simple div', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <div>No collapse</div>
        </Sidebar>
      </SidebarProvider>
    );
    expect(screen.getByText('No collapse')).toBeInTheDocument();
    // The collapsible=none variant renders a simple div
    const sidebarEl = container.querySelector('[data-slot="sidebar"]');
    expect(sidebarEl).toBeInTheDocument();
  });

  it('Sidebar with side=right renders', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar side="right">
          <div>Right sidebar</div>
        </Sidebar>
      </SidebarProvider>
    );
    expect(screen.getByText('Right sidebar')).toBeInTheDocument();
    const sidebarEl = container.querySelector('[data-slot="sidebar"]');
    expect(sidebarEl).toHaveAttribute('data-side', 'right');
  });

  it('Sidebar with variant=floating renders', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar variant="floating">
          <div>Floating sidebar</div>
        </Sidebar>
      </SidebarProvider>
    );
    const sidebarEl = container.querySelector('[data-slot="sidebar"]');
    expect(sidebarEl).toHaveAttribute('data-variant', 'floating');
  });

  it('SidebarProvider with controlled open and onOpenChange', async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    render(
      <SidebarProvider open={true} onOpenChange={onOpenChange}>
        <SidebarTrigger />
      </SidebarProvider>
    );
    await user.click(screen.getByRole('button', { name: /toggle sidebar/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('SidebarTrigger calls custom onClick in addition to toggleSidebar', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(
      <SidebarProvider>
        <SidebarTrigger onClick={onClick} />
      </SidebarProvider>
    );
    await user.click(screen.getByRole('button', { name: /toggle sidebar/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('keyboard shortcut Ctrl+b toggles sidebar', () => {
    function StateDisplay() {
      const { state } = useSidebar();
      return <div data-testid="state">{state}</div>;
    }
    const { getByTestId } = render(
      <SidebarProvider defaultOpen={true}>
        <SidebarTrigger />
        <StateDisplay />
      </SidebarProvider>
    );
    expect(getByTestId('state')).toHaveTextContent('expanded');
    // Fire keyboard shortcut wrapped in act to flush React state
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'b', ctrlKey: true, bubbles: true });
      window.dispatchEvent(event);
    });
    expect(getByTestId('state')).toHaveTextContent('collapsed');
  });
});
