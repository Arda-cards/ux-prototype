import type { Meta, StoryObj } from '@storybook/react';
import {
  Table2,
  ShoppingCart,
  PackageOpen,
  LayoutDashboard,
  Building2,
  Search,
  Plus,
  Edit,
  Trash,
  Package,
  MapPin,
  PackageMinus,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Filter,
  Download,
  Upload,
  Eye,
  EyeOff,
  Check,
  X,
  AlertTriangle,
  Info,
  Bell,
  User,
  Calendar,
  type LucideIcon,
} from 'lucide-react';

const meta: Meta = {
  title: 'Visual Elements/Icons',
};

export default meta;
type Story = StoryObj;

interface IconEntry {
  icon: LucideIcon;
  name: string;
}

const icons: IconEntry[] = [
  { icon: LayoutDashboard, name: 'LayoutDashboard' },
  { icon: Package, name: 'Package' },
  { icon: PackageOpen, name: 'PackageOpen' },
  { icon: PackageMinus, name: 'PackageMinus' },
  { icon: ShoppingCart, name: 'ShoppingCart' },
  { icon: Building2, name: 'Building2' },
  { icon: Table2, name: 'Table2' },
  { icon: BarChart3, name: 'BarChart3' },
  { icon: Settings, name: 'Settings' },
  { icon: Search, name: 'Search' },
  { icon: Plus, name: 'Plus' },
  { icon: Edit, name: 'Edit' },
  { icon: Trash, name: 'Trash' },
  { icon: MapPin, name: 'MapPin' },
  { icon: Filter, name: 'Filter' },
  { icon: Download, name: 'Download' },
  { icon: Upload, name: 'Upload' },
  { icon: Eye, name: 'Eye' },
  { icon: EyeOff, name: 'EyeOff' },
  { icon: Check, name: 'Check' },
  { icon: X, name: 'X' },
  { icon: AlertTriangle, name: 'AlertTriangle' },
  { icon: Info, name: 'Info' },
  { icon: Bell, name: 'Bell' },
  { icon: User, name: 'User' },
  { icon: Calendar, name: 'Calendar' },
  { icon: LogOut, name: 'LogOut' },
  { icon: ChevronLeft, name: 'ChevronLeft' },
  { icon: ChevronRight, name: 'ChevronRight' },
  { icon: ChevronDown, name: 'ChevronDown' },
];

export const IconGrid: Story = {
  render: () => (
    <div className="p-6 max-w-5xl">
      <h2 className="text-2xl font-bold text-foreground mb-2">Icon Library</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Icons from <code className="bg-secondary px-1.5 py-0.5 rounded text-xs">lucide-react</code>.
        Import individually as needed.
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-6 gap-4">
        {icons.map(({ icon: Icon, name }) => (
          <div
            key={name}
            className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <Icon size={24} className="text-foreground" />
            <span className="text-xs text-muted-foreground font-mono text-center leading-tight">
              {name}
            </span>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const IconSizes: Story = {
  render: () => (
    <div className="p-6 max-w-3xl">
      <h2 className="text-2xl font-bold text-foreground mb-6">Icon Sizes</h2>
      <div className="flex items-end gap-8">
        {[14, 16, 18, 20, 24, 32, 48].map((size) => (
          <div key={size} className="flex flex-col items-center gap-2">
            <Package size={size} className="text-foreground" />
            <span className="text-xs text-muted-foreground font-mono">{size}px</span>
          </div>
        ))}
      </div>
    </div>
  ),
};
