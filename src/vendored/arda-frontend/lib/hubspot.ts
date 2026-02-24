import api from '@frontend/lib/api';
import { HubSpotBlogPost, HubSpotListResponse } from '@frontend/types/hubspot';

/**
 * HubSpot Client Library
 * Handles all HubSpot API communication with defensive programming
 */

export async function fetchHubSpotBlogPosts(params?: {
  limit?: number;
  order?: string;
}): Promise<HubSpotBlogPost[]> {
  try {
    const limit = params?.limit ?? 5;
    const order = params?.order ?? '-publishDate';

    const response = await api.get<{ 
      ok: boolean; 
      data?: { 
        results?: unknown[] 
      };
      error?: string;
    }>('/hubspot', {
      params: {
        path: '/cms/v3/blogs/posts',
        state: 'PUBLISHED',
        limit,
        order,
      },
    });

    // Handle API errors gracefully
    if (response.data.error) {
      console.error('HubSpot API error:', response.data.error);
      return [];
    }

    const results = (response.data?.data as HubSpotListResponse<HubSpotBlogPost> | undefined)?.results;
    if (!Array.isArray(results)) {
      console.warn('HubSpot API returned no results or invalid format');
      return [];
    }

    // Debug: Check what fields are actually available in HubSpot API response
    if (results.length > 0) {
      console.log('HubSpot API response fields:', Object.keys(results[0]));
      console.log('Full first result:', results[0]);
    }

    // Defensive mapping in case fields are missing
    return results.map((r) => {
      const rawPost = r as unknown as Record<string, unknown>;
      // Check what description/summary fields are available
      const description = (rawPost.metaDescription as string || 
                        rawPost.meta_description as string || 
                        rawPost.postSummary as string || 
                        rawPost.summary as string ||
                        rawPost.description as string || 
                        '') as string;
      
      // Clean slug from HubSpot to remove any blog/ prefix
      let cleanSlug = (rawPost.slug as string || '') as string;
      if (cleanSlug.startsWith('blog/')) {
        cleanSlug = cleanSlug.substring(5); // Remove 'blog/' prefix
      }
      
      return {
        id: String(rawPost.id || ''),
        name: (rawPost.name as string) || '',
        slug: cleanSlug,
        url: (rawPost.url as string) || '',
        featuredImage: (rawPost.featuredImage as string) || '',
        postSummary: description || 
                    ((rawPost.content as string) ? (rawPost.content as string).substring(0, 150) + '...' : '') || '',
        content: (rawPost.content as string) || '',
        publishDate: (rawPost.publishDate as string) || '',
        createdAt: (rawPost.createdAt as string) || '',
        updatedAt: (rawPost.updatedAt as string) || '',
      };
    });
  } catch (error) {
    console.error('Failed to fetch HubSpot blog posts:', error);
    return [];
  }
}

/**
 * Get a specific blog post by slug
 */
export async function fetchHubSpotBlogPost(slug: string): Promise<HubSpotBlogPost | null> {
  try {
    // First get the basic post info
    const allPosts = await fetchHubSpotBlogPosts({ limit: 50 });
    const basicPost = allPosts.find((post) => post.slug === slug);
    
    if (!basicPost) {
      console.log('Basic post not found for slug:', slug);
      return null;
    }

    console.log('Found basic post:', basicPost.id);

    // Now fetch the FULL content for this specific post
    try {
      const response = await api.get<{ 
        ok: boolean; 
        data?: Record<string, unknown>;
        error?: string;
      }>('/hubspot', {
        params: {
          path: `/cms/v3/blogs/posts/${basicPost.id}`,
          // Add properties parameter to get full content and author info
          properties: 'content,postBody,name,slug,featuredImage,metaDescription,authorName,authorEmail,blogAuthor'
        },
      });

      if (response.data.error) {
        console.error('HubSpot individual post API error:', response.data.error);
        return basicPost; // Return basic post if full fetch fails
      }

      const fullPostData = response.data.data;
      console.log('Full post data:', fullPostData);

      if (fullPostData) {
        const fullData = fullPostData as unknown as Record<string, unknown>;
        const blogAuthor = (fullData.blogAuthor as unknown as Record<string, unknown>) || {};
        
        // Merge full content with basic post and author info
        return {
          ...basicPost,
          content: (fullData.content as string) || (fullData.postBody as string) || basicPost.content || '',
          name: (fullData.name as string) || basicPost.name,
          authorName: (fullData.authorName as string) || (blogAuthor.name as string) || basicPost.authorName || 'ARDA Team',
          authorEmail: (fullData.authorEmail as string) || (blogAuthor.email as string) || basicPost.authorEmail || '',
          authorBio: (blogAuthor.bio as string) || basicPost.authorBio || '',
        };
      }

      return basicPost;
    } catch (fullContentError) {
      console.error('Failed to fetch full post content:', fullContentError);
      return basicPost; // Fallback to basic post
    }
  } catch (error) {
    console.error('Failed to fetch HubSpot blog post:', error);
    return null;
  }
}

// Private App tokens don't need refresh - they work indefinitely
// Simple and fuck a lot easier than OAuth complexity :)
