/**
 * Unit tests for src/lib/hubspot.ts
 * Covers: fetchHubSpotBlogPosts, fetchHubSpotBlogPost
 */

// ---------------------------------------------------------------------------
// Mock axios-based `api` module BEFORE importing hubspot
// ---------------------------------------------------------------------------

jest.mock('@/lib/api');

import api from '@frontend/lib/api';
import {
  fetchHubSpotBlogPosts,
  fetchHubSpotBlogPost,
} from './hubspot';

const mockApiGet = api.get as jest.Mock;

// Silence noisy logs from the code under test
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const RAW_POST = {
  id: '123',
  name: 'Hello World',
  slug: 'blog/hello-world',
  url: 'https://arda.com/blog/hello-world',
  featuredImage: 'https://img.example.com/img.jpg',
  metaDescription: 'A test post',
  content: 'Full content here',
  publishDate: '2024-01-01T00:00:00Z',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-02T00:00:00Z',
};

function makeApiResponse(overrides: Record<string, unknown> = {}) {
  return {
    data: {
      ok: true,
      data: { results: [RAW_POST] },
      ...overrides,
    },
  };
}

// ---------------------------------------------------------------------------
// fetchHubSpotBlogPosts
// ---------------------------------------------------------------------------

describe('fetchHubSpotBlogPosts', () => {
  it('calls /hubspot with correct params and returns mapped posts', async () => {
    mockApiGet.mockResolvedValueOnce(makeApiResponse());

    const posts = await fetchHubSpotBlogPosts({ limit: 3, order: '-publishDate' });

    expect(mockApiGet).toHaveBeenCalledWith('/hubspot', expect.objectContaining({
      params: expect.objectContaining({
        path: '/cms/v3/blogs/posts',
        limit: 3,
        order: '-publishDate',
      }),
    }));
    expect(posts).toHaveLength(1);
    expect(posts[0].id).toBe('123');
    expect(posts[0].name).toBe('Hello World');
  });

  it('defaults limit=5 and order=-publishDate when no params provided', async () => {
    mockApiGet.mockResolvedValueOnce(makeApiResponse());
    await fetchHubSpotBlogPosts();
    const params = mockApiGet.mock.calls[0][1].params;
    expect(params.limit).toBe(5);
    expect(params.order).toBe('-publishDate');
  });

  it('strips blog/ prefix from slug', async () => {
    mockApiGet.mockResolvedValueOnce(makeApiResponse());
    const posts = await fetchHubSpotBlogPosts();
    expect(posts[0].slug).toBe('hello-world');
  });

  it('leaves slug unchanged when it does not start with blog/', async () => {
    mockApiGet.mockResolvedValueOnce(makeApiResponse());
    await fetchHubSpotBlogPosts();
    // RAW_POST.slug starts with 'blog/' and is stripped above
    // Test a non-blog/ slug:
    mockApiGet.mockResolvedValueOnce({
      data: { ok: true, data: { results: [{ ...RAW_POST, slug: 'other-slug' }] } },
    });
    const posts2 = await fetchHubSpotBlogPosts();
    expect(posts2[0].slug).toBe('other-slug');
  });

  it('uses postSummary field when metaDescription absent', async () => {
    const post = { ...RAW_POST, metaDescription: undefined, postSummary: 'Summary text' };
    mockApiGet.mockResolvedValueOnce({ data: { ok: true, data: { results: [post] } } });
    const posts = await fetchHubSpotBlogPosts();
    expect(posts[0].postSummary).toBe('Summary text');
  });

  it('falls back to content truncated when no description fields present', async () => {
    const post = {
      id: '2', name: 'Post', slug: 'post', url: '', featuredImage: '',
      content: 'A'.repeat(200), publishDate: '', createdAt: '', updatedAt: '',
    };
    mockApiGet.mockResolvedValueOnce({ data: { ok: true, data: { results: [post] } } });
    const posts = await fetchHubSpotBlogPosts();
    const first = posts[0];
    expect(first).toBeDefined();
    expect(first?.postSummary).toContain('...');
    expect((first?.postSummary ?? '').length).toBeLessThanOrEqual(155);
  });

  it('returns [] when response.data.error is set', async () => {
    mockApiGet.mockResolvedValueOnce({ data: { error: 'API rate limit' } });
    const posts = await fetchHubSpotBlogPosts();
    expect(posts).toEqual([]);
  });

  it('returns [] when results is not an array', async () => {
    mockApiGet.mockResolvedValueOnce({ data: { ok: true, data: { results: null } } });
    const posts = await fetchHubSpotBlogPosts();
    expect(posts).toEqual([]);
  });

  it('returns [] when data.data is undefined', async () => {
    mockApiGet.mockResolvedValueOnce({ data: { ok: true } });
    const posts = await fetchHubSpotBlogPosts();
    expect(posts).toEqual([]);
  });

  it('returns [] when api.get throws', async () => {
    mockApiGet.mockRejectedValueOnce(new Error('Network error'));
    const posts = await fetchHubSpotBlogPosts();
    expect(posts).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// fetchHubSpotBlogPost
// ---------------------------------------------------------------------------

describe('fetchHubSpotBlogPost', () => {
  const SLUG = 'hello-world'; // after stripping 'blog/'

  function makeListResponse() {
    return makeApiResponse();
  }

  function makeDetailResponse(overrides: Record<string, unknown> = {}) {
    return {
      data: {
        ok: true,
        data: {
          content: 'Full detailed content',
          postBody: '',
          name: 'Hello World',
          authorName: 'Jane Doe',
          authorEmail: 'jane@example.com',
          blogAuthor: { name: 'Jane Doe', email: 'jane@example.com', bio: 'Bio text' },
          ...overrides,
        },
      },
    };
  }

  it('returns null when no post matches the slug', async () => {
    mockApiGet.mockResolvedValueOnce(makeApiResponse());
    const result = await fetchHubSpotBlogPost('nonexistent-slug');
    expect(result).toBeNull();
  });

  it('returns merged post with full content when detail fetch succeeds', async () => {
    mockApiGet
      .mockResolvedValueOnce(makeListResponse())     // list call
      .mockResolvedValueOnce(makeDetailResponse());  // detail call

    const result = await fetchHubSpotBlogPost(SLUG);
    expect(result).not.toBeNull();
    expect(result!.content).toBe('Full detailed content');
    expect(result!.authorName).toBe('Jane Doe');
  });

  it('merges blogAuthor bio into authorBio', async () => {
    mockApiGet
      .mockResolvedValueOnce(makeListResponse())
      .mockResolvedValueOnce(makeDetailResponse());

    const result = await fetchHubSpotBlogPost(SLUG);
    expect(result!.authorBio).toBe('Bio text');
  });

  it('falls back to basicPost when detail fetch returns error field', async () => {
    mockApiGet
      .mockResolvedValueOnce(makeListResponse())
      .mockResolvedValueOnce({ data: { error: 'Not found' } });

    const result = await fetchHubSpotBlogPost(SLUG);
    expect(result).not.toBeNull();
    expect(result!.id).toBe('123'); // from basic post
  });

  it('falls back to basicPost when detail fetch throws', async () => {
    mockApiGet
      .mockResolvedValueOnce(makeListResponse())
      .mockRejectedValueOnce(new Error('Timeout'));

    const result = await fetchHubSpotBlogPost(SLUG);
    expect(result).not.toBeNull();
    expect(result!.id).toBe('123');
  });

  it('falls back to basicPost when fullPostData is falsy', async () => {
    mockApiGet
      .mockResolvedValueOnce(makeListResponse())
      .mockResolvedValueOnce({ data: { ok: true, data: null } });

    const result = await fetchHubSpotBlogPost(SLUG);
    expect(result!.id).toBe('123');
  });

  it('returns null when list fetch throws', async () => {
    mockApiGet.mockRejectedValueOnce(new Error('Network error'));
    const result = await fetchHubSpotBlogPost(SLUG);
    expect(result).toBeNull();
  });

  it('uses postBody as fallback for content when content is missing', async () => {
    mockApiGet
      .mockResolvedValueOnce(makeListResponse())
      .mockResolvedValueOnce(makeDetailResponse({ content: '', postBody: 'Post body text' }));

    const result = await fetchHubSpotBlogPost(SLUG);
    expect(result!.content).toBe('Post body text');
  });

  it('falls back to ARDA Team for authorName when missing from full data', async () => {
    mockApiGet
      .mockResolvedValueOnce(makeListResponse())
      .mockResolvedValueOnce(makeDetailResponse({ authorName: '', blogAuthor: {} }));

    const result = await fetchHubSpotBlogPost(SLUG);
    expect(result!.authorName).toBe('ARDA Team');
  });
});
