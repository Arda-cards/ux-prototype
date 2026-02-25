import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import BlogPage from './page';

const mockBack = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), back: mockBack, replace: jest.fn() }),
  usePathname: () => '/blogs/test-slug',
  useParams: () => ({ slug: 'test-slug' }),
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/components/app-sidebar', () => ({
  AppSidebar: () => <div data-testid="app-sidebar" />,
}));

jest.mock('@/components/common/app-header', () => ({
  AppHeader: () => <div data-testid="app-header" />,
}));

jest.mock('@/components/ui/sidebar', () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarInset: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean }) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

const mockFetchHubSpotBlogPost = jest.fn();
jest.mock('@/lib/hubspot', () => ({
  fetchHubSpotBlogPost: (...args: unknown[]) => mockFetchHubSpotBlogPost(...args),
}));

const mockPost = {
  id: '1',
  name: 'Test Blog Post',
  slug: 'test-slug',
  postSummary: 'This is a test summary',
  content: '<p>This is the blog content</p>',
  featuredImage: '',
  authorName: 'Test Author',
  authorBio: 'Author bio here',
  publishDate: '2024-01-15T00:00:00Z',
};

describe('BlogPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBack.mockClear();
  });

  describe('loading state', () => {
    it('shows loading message while fetching', async () => {
      mockFetchHubSpotBlogPost.mockImplementation(
        () => new Promise(() => {}) // never resolves
      );

      render(<BlogPage params={Promise.resolve({ slug: 'test-slug' })} />);
      expect(screen.getByText('Loading blog post...')).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('shows error when post not found', async () => {
      mockFetchHubSpotBlogPost.mockResolvedValue(null);

      render(<BlogPage params={Promise.resolve({ slug: 'test-slug' })} />);

      await waitFor(() => {
        expect(screen.getByText(/Blog post not found/)).toBeInTheDocument();
      });
    });

    it('shows error when fetch throws', async () => {
      mockFetchHubSpotBlogPost.mockRejectedValue(new Error('Network error'));

      render(<BlogPage params={Promise.resolve({ slug: 'test-slug' })} />);

      await waitFor(() => {
        expect(screen.getByText(/Network error/)).toBeInTheDocument();
      });
    });

    it('shows Back to Dashboard button on error', async () => {
      mockFetchHubSpotBlogPost.mockResolvedValue(null);

      render(<BlogPage params={Promise.resolve({ slug: 'test-slug' })} />);

      await waitFor(() => {
        expect(screen.getByText(/Back to Dashboard/)).toBeInTheDocument();
      });
    });
  });

  describe('success state with HTML content', () => {
    it('shows post content with HTML', async () => {
      mockFetchHubSpotBlogPost.mockResolvedValue(mockPost);

      render(<BlogPage params={Promise.resolve({ slug: 'test-slug' })} />);

      await waitFor(() => {
        expect(screen.getByText('This is the blog content')).toBeInTheDocument();
      });
    });

    it('shows author name', async () => {
      mockFetchHubSpotBlogPost.mockResolvedValue(mockPost);

      render(<BlogPage params={Promise.resolve({ slug: 'test-slug' })} />);

      await waitFor(() => {
        expect(screen.getByText('Test Author')).toBeInTheDocument();
      });
    });

    it('shows author bio', async () => {
      mockFetchHubSpotBlogPost.mockResolvedValue(mockPost);

      render(<BlogPage params={Promise.resolve({ slug: 'test-slug' })} />);

      await waitFor(() => {
        expect(screen.getByText('Author bio here')).toBeInTheDocument();
      });
    });

    it('shows publish date', async () => {
      mockFetchHubSpotBlogPost.mockResolvedValue(mockPost);

      render(<BlogPage params={Promise.resolve({ slug: 'test-slug' })} />);

      await waitFor(() => {
        expect(screen.getByText(/Published on/)).toBeInTheDocument();
      });
    });
  });

  describe('success state without featured image', () => {
    it('renders post title in content area when no featured image', async () => {
      const postWithoutImage = { ...mockPost, featuredImage: '' };
      mockFetchHubSpotBlogPost.mockResolvedValue(postWithoutImage);

      render(<BlogPage params={Promise.resolve({ slug: 'test-slug' })} />);

      await waitFor(() => {
        expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
      });
    });

    it('renders post summary', async () => {
      const postWithoutImage = { ...mockPost, featuredImage: '' };
      mockFetchHubSpotBlogPost.mockResolvedValue(postWithoutImage);

      render(<BlogPage params={Promise.resolve({ slug: 'test-slug' })} />);

      await waitFor(() => {
        expect(screen.getByText('This is a test summary')).toBeInTheDocument();
      });
    });
  });

  describe('success state with featured image', () => {
    it('renders post with featured image', async () => {
      const postWithImage = {
        ...mockPost,
        featuredImage: 'https://example.com/image.jpg',
      };
      mockFetchHubSpotBlogPost.mockResolvedValue(postWithImage);

      render(<BlogPage params={Promise.resolve({ slug: 'test-slug' })} />);

      await waitFor(() => {
        expect(screen.getByAltText('Test Blog Post')).toBeInTheDocument();
      });
    });
  });

  describe('markdown content fallback', () => {
    it('renders markdown-formatted content', async () => {
      const postWithMarkdown = {
        ...mockPost,
        content: '# Heading 1\n## Heading 2\n### Heading 3\n- List item\n1. Ordered item\n\nParagraph text',
      };
      mockFetchHubSpotBlogPost.mockResolvedValue(postWithMarkdown);

      render(<BlogPage params={Promise.resolve({ slug: 'test-slug' })} />);

      await waitFor(() => {
        expect(screen.getByText('Heading 1')).toBeInTheDocument();
      });
    });

    it('renders paragraph in markdown content', async () => {
      const postWithMarkdown = {
        ...mockPost,
        content: 'Paragraph text\nAnother line',
      };
      mockFetchHubSpotBlogPost.mockResolvedValue(postWithMarkdown);

      render(<BlogPage params={Promise.resolve({ slug: 'test-slug' })} />);

      await waitFor(() => {
        expect(screen.getByText('Paragraph text')).toBeInTheDocument();
      });
    });

    it('renders empty content fallback', async () => {
      const postWithNoContent = { ...mockPost, content: '' };
      mockFetchHubSpotBlogPost.mockResolvedValue(postWithNoContent);

      render(<BlogPage params={Promise.resolve({ slug: 'test-slug' })} />);

      await waitFor(() => {
        expect(screen.getByText('Blog content coming soon...')).toBeInTheDocument();
      });
    });

    it('uses fallback "ARDA Team" when no author', async () => {
      const postNoAuthor = { ...mockPost, authorName: undefined, publishDate: undefined };
      mockFetchHubSpotBlogPost.mockResolvedValue(postNoAuthor);

      render(<BlogPage params={Promise.resolve({ slug: 'test-slug' })} />);

      await waitFor(() => {
        expect(screen.getByText('ARDA Team')).toBeInTheDocument();
      });
    });
  });

  describe('fetch is called with correct slug', () => {
    it('calls fetchHubSpotBlogPost with the slug param', async () => {
      mockFetchHubSpotBlogPost.mockResolvedValue(mockPost);

      render(<BlogPage params={Promise.resolve({ slug: 'my-post-slug' })} />);

      await waitFor(() => {
        expect(mockFetchHubSpotBlogPost).toHaveBeenCalledWith('my-post-slug');
      });
    });
  });
});
