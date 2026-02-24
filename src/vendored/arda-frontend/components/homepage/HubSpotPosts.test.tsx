/**
 * Unit tests for src/components/homepage/HubSpotPosts.tsx
 * Covers: loading state, error state, empty posts, posts with/without slug, posts with/without image
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

// Mock fetchHubSpotBlogPosts
const mockFetchHubSpotBlogPosts = jest.fn();
jest.mock('@/lib/hubspot', () => ({
  fetchHubSpotBlogPosts: (...args: unknown[]) => mockFetchHubSpotBlogPosts(...args),
}));

import { HubSpotPostsPanel } from './HubSpotPosts';

describe('HubSpotPostsPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', () => {
    // Never resolves so we can observe the loading state
    mockFetchHubSpotBlogPosts.mockReturnValue(new Promise(() => {}));
    render(<HubSpotPostsPanel />);
    expect(screen.getByText(/Loading resources/i)).toBeInTheDocument();
  });

  it('shows error state when fetch throws', async () => {
    mockFetchHubSpotBlogPosts.mockRejectedValue(new Error('Network error'));
    render(<HubSpotPostsPanel />);

    await waitFor(() => {
      expect(screen.getByText(/Unable to load resources/i)).toBeInTheDocument();
    });
  });

  it('shows "No blog posts available" when posts array is empty', async () => {
    mockFetchHubSpotBlogPosts.mockResolvedValue([]);
    render(<HubSpotPostsPanel />);

    await waitFor(() => {
      expect(screen.getByText(/No blog posts available/i)).toBeInTheDocument();
    });
  });

  it('shows "No blog posts available" when response is null', async () => {
    mockFetchHubSpotBlogPosts.mockResolvedValue(null);
    render(<HubSpotPostsPanel />);

    await waitFor(() => {
      expect(screen.getByText(/No blog posts available/i)).toBeInTheDocument();
    });
  });

  it('renders posts with slug as links', async () => {
    mockFetchHubSpotBlogPosts.mockResolvedValue([
      {
        id: '1',
        name: 'Getting Started Guide',
        slug: 'getting-started',
        postSummary: 'Learn the basics',
        featuredImage: '',
        publishDate: '2025-01-01',
      },
    ]);
    render(<HubSpotPostsPanel />);

    await waitFor(() => {
      expect(screen.getByText('Getting Started Guide')).toBeInTheDocument();
    });

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/blogs/getting-started');
  });

  it('renders posts without slug as plain divs (no link)', async () => {
    mockFetchHubSpotBlogPosts.mockResolvedValue([
      {
        id: '2',
        name: 'Post Without Slug',
        slug: '',
        postSummary: 'No slug here',
        featuredImage: '',
        publishDate: '2025-02-01',
      },
    ]);
    render(<HubSpotPostsPanel />);

    await waitFor(() => {
      expect(screen.getByText('Post Without Slug')).toBeInTheDocument();
    });

    // Should not be a link
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('renders post summary text', async () => {
    mockFetchHubSpotBlogPosts.mockResolvedValue([
      {
        id: '3',
        name: 'Tutorial Post',
        slug: 'tutorial',
        postSummary: 'This is a summary of the tutorial.',
        featuredImage: '',
        publishDate: '2025-03-01',
      },
    ]);
    render(<HubSpotPostsPanel />);

    await waitFor(() => {
      expect(screen.getByText('This is a summary of the tutorial.')).toBeInTheDocument();
    });
  });

  it('renders featured image when provided with slug', async () => {
    mockFetchHubSpotBlogPosts.mockResolvedValue([
      {
        id: '4',
        name: 'Post With Image',
        slug: 'post-with-image',
        postSummary: 'Has an image',
        featuredImage: 'https://example.com/image.jpg',
        publishDate: '2025-04-01',
      },
    ]);
    render(<HubSpotPostsPanel />);

    await waitFor(() => {
      expect(screen.getByRole('img')).toBeInTheDocument();
    });
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('renders featured image when provided without slug', async () => {
    mockFetchHubSpotBlogPosts.mockResolvedValue([
      {
        id: '5',
        name: 'No Slug With Image',
        slug: '',
        postSummary: 'Has an image but no slug',
        featuredImage: 'https://example.com/no-slug-image.jpg',
        publishDate: '2025-05-01',
      },
    ]);
    render(<HubSpotPostsPanel />);

    await waitFor(() => {
      expect(screen.getByRole('img')).toBeInTheDocument();
    });
  });

  it('does not render image when featuredImage is empty', async () => {
    mockFetchHubSpotBlogPosts.mockResolvedValue([
      {
        id: '6',
        name: 'Post Without Image',
        slug: 'no-image',
        postSummary: 'No image here',
        featuredImage: '',
        publishDate: '2025-06-01',
      },
    ]);
    render(<HubSpotPostsPanel />);

    await waitFor(() => {
      expect(screen.getByText('Post Without Image')).toBeInTheDocument();
    });

    expect(screen.queryByRole('img')).toBeNull();
  });

  it('shows "Untitled" when post name is missing', async () => {
    mockFetchHubSpotBlogPosts.mockResolvedValue([
      {
        id: '7',
        name: '',
        slug: 'no-name',
        postSummary: '',
        featuredImage: '',
        publishDate: '2025-07-01',
      },
    ]);
    render(<HubSpotPostsPanel />);

    await waitFor(() => {
      expect(screen.getByText('Untitled')).toBeInTheDocument();
    });
  });

  it('renders multiple posts', async () => {
    mockFetchHubSpotBlogPosts.mockResolvedValue([
      { id: '1', name: 'Post One', slug: 'post-one', postSummary: '', featuredImage: '' },
      { id: '2', name: 'Post Two', slug: 'post-two', postSummary: '', featuredImage: '' },
      { id: '3', name: 'Post Three', slug: '', postSummary: '', featuredImage: '' },
    ]);
    render(<HubSpotPostsPanel />);

    await waitFor(() => {
      expect(screen.getByText('Post One')).toBeInTheDocument();
      expect(screen.getByText('Post Two')).toBeInTheDocument();
      expect(screen.getByText('Post Three')).toBeInTheDocument();
    });
  });

  it('passes limit:3 to fetchHubSpotBlogPosts', async () => {
    mockFetchHubSpotBlogPosts.mockResolvedValue([]);
    render(<HubSpotPostsPanel />);

    await waitFor(() => {
      expect(mockFetchHubSpotBlogPosts).toHaveBeenCalledWith({ limit: 3 });
    });
  });

  it('shows error message (not "Unable") when fetch throws non-Error object', async () => {
    mockFetchHubSpotBlogPosts.mockRejectedValue('string error');
    render(<HubSpotPostsPanel />);

    await waitFor(() => {
      expect(screen.getByText(/Unable to load resources/i)).toBeInTheDocument();
    });
  });
});
