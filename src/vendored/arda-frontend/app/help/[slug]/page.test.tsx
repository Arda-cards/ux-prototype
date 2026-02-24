import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import HelpArticlePage from './page';

const mockBack = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), back: mockBack, replace: jest.fn() }),
  usePathname: () => '/help/test-article',
  useParams: () => ({ slug: 'test-article' }),
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

const mockFetchHubSpotKnowledgeArticle = jest.fn();
jest.mock('@/lib/hubspot-knowledge', () => ({
  fetchHubSpotKnowledgeArticle: (...args: unknown[]) => mockFetchHubSpotKnowledgeArticle(...args),
}));

const mockArticle = {
  id: '1',
  name: 'Test Help Article',
  slug: 'test-article',
  content: '<p>This is the help content</p>',
  category: 'General',
};

describe('HelpArticlePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loading state', () => {
    it('shows loading message while fetching', async () => {
      mockFetchHubSpotKnowledgeArticle.mockImplementation(
        () => new Promise(() => {})
      );

      render(<HelpArticlePage params={Promise.resolve({ slug: 'test-article' })} />);
      expect(screen.getByText('Loading help article...')).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('shows error when article not found (null response)', async () => {
      mockFetchHubSpotKnowledgeArticle.mockResolvedValue(null);

      render(<HelpArticlePage params={Promise.resolve({ slug: 'test-article' })} />);

      await waitFor(() => {
        expect(screen.getByText(/Help article not found/)).toBeInTheDocument();
      });
    });

    it('shows error when fetch throws', async () => {
      mockFetchHubSpotKnowledgeArticle.mockRejectedValue(new Error('Connection failed'));

      render(<HelpArticlePage params={Promise.resolve({ slug: 'test-article' })} />);

      await waitFor(() => {
        expect(screen.getByText(/Connection failed/)).toBeInTheDocument();
      });
    });

    it('shows Back to Dashboard button on error', async () => {
      mockFetchHubSpotKnowledgeArticle.mockResolvedValue(null);

      render(<HelpArticlePage params={Promise.resolve({ slug: 'test-article' })} />);

      await waitFor(() => {
        expect(screen.getByText(/Back to Dashboard/)).toBeInTheDocument();
      });
    });
  });

  describe('success state with HTML content', () => {
    it('renders article content', async () => {
      mockFetchHubSpotKnowledgeArticle.mockResolvedValue(mockArticle);

      render(<HelpArticlePage params={Promise.resolve({ slug: 'test-article' })} />);

      await waitFor(() => {
        expect(screen.getByText('This is the help content')).toBeInTheDocument();
      });
    });

    it('shows article name in breadcrumb', async () => {
      mockFetchHubSpotKnowledgeArticle.mockResolvedValue(mockArticle);

      render(<HelpArticlePage params={Promise.resolve({ slug: 'test-article' })} />);

      await waitFor(() => {
        expect(screen.getByText('Test Help Article')).toBeInTheDocument();
      });
    });

    it('shows Dashboard breadcrumb link', async () => {
      mockFetchHubSpotKnowledgeArticle.mockResolvedValue(mockArticle);

      render(<HelpArticlePage params={Promise.resolve({ slug: 'test-article' })} />);

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });
    });
  });

  describe('success state with markdown content', () => {
    it('renders markdown headings and paragraphs', async () => {
      const articleWithMarkdown = {
        ...mockArticle,
        content: '# Main Heading\n## Sub Heading\n### Third Level\nParagraph text\n- List item\n1. Ordered',
      };
      mockFetchHubSpotKnowledgeArticle.mockResolvedValue(articleWithMarkdown);

      render(<HelpArticlePage params={Promise.resolve({ slug: 'test-article' })} />);

      await waitFor(() => {
        expect(screen.getByText('Main Heading')).toBeInTheDocument();
      });
    });

    it('renders paragraph text in markdown', async () => {
      const articleWithMarkdown = {
        ...mockArticle,
        content: 'Simple paragraph',
      };
      mockFetchHubSpotKnowledgeArticle.mockResolvedValue(articleWithMarkdown);

      render(<HelpArticlePage params={Promise.resolve({ slug: 'test-article' })} />);

      await waitFor(() => {
        expect(screen.getByText('Simple paragraph')).toBeInTheDocument();
      });
    });

    it('shows content coming soon when content is empty', async () => {
      const articleEmpty = { ...mockArticle, content: '' };
      mockFetchHubSpotKnowledgeArticle.mockResolvedValue(articleEmpty);

      render(<HelpArticlePage params={Promise.resolve({ slug: 'test-article' })} />);

      await waitFor(() => {
        expect(screen.getByText('Content coming soon...')).toBeInTheDocument();
      });
    });
  });

  describe('fetch is called with correct slug', () => {
    it('calls fetchHubSpotKnowledgeArticle with the slug param', async () => {
      mockFetchHubSpotKnowledgeArticle.mockResolvedValue(mockArticle);

      render(<HelpArticlePage params={Promise.resolve({ slug: 'some-article-slug' })} />);

      await waitFor(() => {
        expect(mockFetchHubSpotKnowledgeArticle).toHaveBeenCalledWith('some-article-slug');
      });
    });
  });
});
