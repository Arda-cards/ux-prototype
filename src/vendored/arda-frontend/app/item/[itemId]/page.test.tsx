import { screen, waitFor } from '@testing-library/react';
import { renderWithAll } from '@frontend/test-utils/render-with-providers';
import ItemDetailPage from './page';

// Mock next/navigation with mutable pathname
const mockReplace = jest.fn();
const mockPush = jest.fn();
let mockPathname = '/item/test-item-id-123';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: jest.fn(),
    replace: mockReplace,
  }),
  useParams: () => ({ itemId: 'test-item-id-123' }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => mockPathname,
}));

// Mock ItemsPage (the heavy component this page delegates to)
jest.mock('@/app/items/page', () => {
  return function MockItemsPage() {
    return <div data-testid="items-page">Items Page Content</div>;
  };
});

describe('ItemDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname = '/item/test-item-id-123';
  });

  it('renders ItemsPage and does not redirect for a clean URL', async () => {
    renderWithAll(<ItemDetailPage />);

    await waitFor(() => {
      expect(screen.getByTestId('items-page')).toBeInTheDocument();
    });
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('redirects to clean URL when pathname has extra segments', async () => {
    mockPathname = '/item/test-item-id-123/label';

    renderWithAll(<ItemDetailPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/item/test-item-id-123');
    });
  });
});
