import api from '@frontend/lib/api';
import { HubSpotKnowledgeArticle, HubSpotListResponse } from '@frontend/types/hubspot';

/**
 * HubSpot Knowledge Base Client Library
 * Handles all HubSpot Knowledge Base API communication with defensive programming
 */

export async function fetchHubSpotKnowledgeArticles(params?: {
  limit?: number;
  searchTerm?: string;
}): Promise<HubSpotKnowledgeArticle[]> {
  try {
    const limit = params?.limit ?? 20;
    const searchTerm = params?.searchTerm ?? '*';

    const response = await api.get<{ 
      ok: boolean; 
      data?: { 
        results?: unknown[] 
      };
      error?: string;
    }>('/hubspot', {
      params: {
        path: '/cms/v3/site-search/search',
        type: 'KNOWLEDGE_ARTICLE',
        q: searchTerm,
        limit,
      },
    });

    // Handle API errors gracefully
    if (response.data.error) {
      console.error('HubSpot Knowledge Base API error:', response.data.error);
      return [];
    }

    const results = (response.data?.data as HubSpotListResponse<HubSpotKnowledgeArticle> | undefined)?.results;
    if (!Array.isArray(results)) {
      console.warn('HubSpot Knowledge Base API returned no results or invalid format');
      return [];
    }

    // Debug: Check what fields are actually available in HubSpot API response
    if (results.length > 0) {
      console.log('HubSpot Knowledge Base API response fields:', Object.keys(results[0]));
      console.log('Full first result:', results[0]);
    }

    // Defensive mapping in case fields are missing
    return results.map((r) => {
      const rawArticle = r as unknown as Record<string, unknown>;
      
      // Extract slug from URL
      const url = (rawArticle.url as string) || '';
      const slug = url.split('/').pop() || '';
      
      return {
        id: String(rawArticle.id || ''),
        name: (rawArticle.title as string) || '',
        slug: slug,
        url: url,
        summary: (rawArticle.description as string) || '',
        content: '', // Site Search doesn't return full content
        createdAt: '',
        updatedAt: '',
        publishedAt: '',
        authorName: '',
        category: (rawArticle.category as string) || '',
        tags: Array.isArray(rawArticle.tags) ? rawArticle.tags as string[] : [],
      };
    });
  } catch (error) {
    console.error('Failed to fetch HubSpot knowledge articles:', error);
    return [];
  }
}

/**
 * Scrape the full content from a HubSpot knowledge article URL using our API endpoint
 */
async function scrapeArticleContent(url: string): Promise<string> {
  try {
    const response = await fetch(`/api/scrape-article?url=${encodeURIComponent(url)}`);
    
    if (!response.ok) {
      throw new Error(`Failed to scrape article: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.content) {
      return data.content;
    }
    
    return '<p>Content could not be extracted from the article.</p>';
  } catch (error) {
    console.error('Failed to scrape article content:', error);
    return '<p>Failed to load article content.</p>';
  }
}

/**
 * Process main page content to convert external links to internal navigation
 */
function processMainPageContent(content: string): string {
  console.log('NEW processMainPageContent input length:', content.length);
  
  // Convert external links to internal navigation - keep it simple and safe
  const processedContent = content.replace(/https:\/\/help\.arda\.cards\/([^"'\s>]+)/g, (match, slug) => {
    const cleanSlug = slug.replace(/[^\w-]/g, '');
    return `/help/${cleanSlug}`;
  });

  console.log('NEW After link conversion length:', processedContent.length);
  
  return processedContent;
}

/**
 * Extract title from HTML content
 */
function extractTitleFromContent(content: string): string {
  // Try to extract title from h1 tag first
  const h1Match = content.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1Match) {
    return h1Match[1].trim();
  }
  
  // Try to extract title from h2 tag
  const h2Match = content.match(/<h2[^>]*>([^<]+)<\/h2>/i);
  if (h2Match) {
    return h2Match[1].trim();
  }
  
  // Try to extract title from page title tag
  const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    return titleMatch[1].trim();
  }
  
  return '';
}

/**
 * Fetch a specific article by URL
 */
async function fetchSpecificArticle(slug: string, url: string): Promise<HubSpotKnowledgeArticle | null> {
  try {
    console.log('Fetching specific article:', slug, 'from:', url);
    
    const fullContent = await scrapeArticleContent(url);
    
    if (!fullContent || fullContent.includes('Content could not be extracted') || fullContent.includes('Failed to load')) {
      console.log(`Failed to scrape content for ${slug} from ${url}`);
      return null;
    }

    // Check if we got meaningful content (not just basic HTML structure)
    const hasMeaningfulContent = fullContent.length > 200 && 
                                 (fullContent.includes('<h1>') || fullContent.includes('<h2>') || fullContent.includes('<p>'));
    
    console.log(`Content check for ${slug}: length=${fullContent.length}, hasMeaningful=${hasMeaningfulContent}`);
    
    if (!hasMeaningfulContent) {
      console.log(`Content too short or not meaningful for ${slug}`);
      return null;
    }

    // Extract title from content
    const extractedTitle = extractTitleFromContent(fullContent);
    console.log(`Extracted title for ${slug}: "${extractedTitle}"`);
    
    // Process content for internal navigation and add CSS classes
    const processedContent = processMainPageContent(fullContent);
    console.log(`NEW Processed content length for ${slug}: ${processedContent.length}`);
    
    // Use the processed content directly without additional styling
    const finalContent = processedContent;

    // Determine article name - use extracted title or fallback to slug-based naming
    let articleName: string;
    let summary: string;
    let category: string;
    
    if (extractedTitle) {
      articleName = extractedTitle;
      summary = 'Help article from ARDA knowledge base.';
      category = 'Help';
    } else {
      // Fallback to slug-based naming for known articles
      switch (slug) {
        case 'ordering-items':
          articleName = 'Ordering Items';
          summary = 'Need it. Order it. Delivered.';
          category = 'Ordering';
          break;
        case 'useful-tips':
          articleName = 'Useful Tips';
          summary = 'Shortcuts, tricks, and pro moves.';
          category = 'Tips';
          break;
        default:
          // Convert slug to readable title
          articleName = slug.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ');
          summary = 'Help article from ARDA knowledge base.';
          category = 'Help';
      }
    }

    return {
      id: `${slug}-specific`,
      name: articleName,
      slug: slug,
      url: url,
      summary: summary,
      content: finalContent,
      createdAt: '',
      updatedAt: '',
      publishedAt: '',
      authorName: '',
      category: category,
      tags: [slug],
    };
  } catch (error) {
    console.error(`Failed to fetch specific article ${slug}:`, error);
    return null;
  }
}

/**
 * Get a specific knowledge article by slug
 */
export async function fetchHubSpotKnowledgeArticle(slug: string): Promise<HubSpotKnowledgeArticle | null> {
  try {
    // Special handling for getting-started slug
    if (slug === 'getting-started') {
      return await fetchGettingStartedMainPage();
    }

    // Special handling for specific problematic articles that don't work with general search
    const specificArticleMappings: Record<string, string> = {
      'how-to-run-a-world-class-shop-as-the-arda-manager-cloud': 'https://help.arda.cards/how-to-run-a-world-class-shop-as-the-arda-manager-cloud',
      'how-to-get-cultural-buy-in-for-kanban-0': 'https://help.arda.cards/how-to-get-cultural-buy-in-for-kanban-0',
      'how-to-go-from-no-system-to-world-class-operations-on-arda-0': 'https://help.arda.cards/how-to-go-from-no-system-to-world-class-operations-on-arda-0',
      'navigating-the-arda-platform': 'https://help.arda.cards/navigating-the-arda-platform',
      'arda-items-page': 'https://help.arda.cards/arda-items-page',
      'adding-items-in-arda': 'https://help.arda.cards/adding-items-in-arda',
      'editing-items-in-arda': 'https://help.arda.cards/editing-items-in-arda',
    };

    if (specificArticleMappings[slug]) {
      const article = await fetchSpecificArticle(slug, specificArticleMappings[slug]);
      if (article) return article;
    }

    // Special handling for ordering-items slug
    if (slug === 'ordering-items') {
      const article = await fetchSpecificArticle('ordering-items', 'https://help.arda.cards/ordering-items');
      if (article) return article;
      // Return error message directly for specific slugs
      return {
        id: `not-found-${slug}`,
        name: 'Page Not Found',
        slug: slug,
        url: '',
        summary: 'This page could not be found.',
        content: `
          <div style="text-align: center; padding: 60px 20px; max-width: 600px; margin: 0 auto;">
            <h2 style="font-size: 2rem; font-weight: bold; color: #1e293b; margin-bottom: 16px;">Uh-Oh. This page knows nothing.</h2>
            <p style="font-size: 1.125rem; color: #64748b; line-height: 1.6; margin-bottom: 32px;">
              But the pursuit of knowledge is never-ending, so while we investigate, try the search above.
            </p>
           
          </div>
        `,
        createdAt: '',
        updatedAt: '',
        publishedAt: '',
        authorName: '',
        category: 'Not Found',
        tags: ['not-found'],
      };
    }

    // Special handling for useful-tips slug
    if (slug === 'useful-tips') {
      const article = await fetchSpecificArticle('useful-tips', 'https://help.arda.cards/useful-tips');
      if (article) return article;
      // Return error message directly for specific slugs
      return {
        id: `not-found-${slug}`,
        name: 'Page Not Found',
        slug: slug,
        url: '',
        summary: 'This page could not be found.',
        content: `
          <div style="text-align: center; padding: 60px 20px; max-width: 600px; margin: 0 auto;">
            <h2 style="font-size: 2rem; font-weight: bold; color: #1e293b; margin-bottom: 16px;">Uh-Oh. This page knows nothing.</h2>
            <p style="font-size: 1.125rem; color: #64748b; line-height: 1.6; margin-bottom: 32px;">
              But the pursuit of knowledge is never-ending, so while we investigate, try the search above.
            </p>
           
          </div>
        `,
        createdAt: '',
        updatedAt: '',
        publishedAt: '',
        authorName: '',
        category: 'Not Found',
        tags: ['not-found'],
      };
    }

    // Extract search term from slug
    const searchTerm = slug.replace(/-/g, ' ');
    
    // Search for articles matching this slug
    const articles = await fetchHubSpotKnowledgeArticles({ 
      limit: 20, 
      searchTerm: searchTerm 
    });
    
    console.log(`Searching for slug: ${slug}, found ${articles.length} articles`);
    
    // Find article by exact slug match first
    let article = articles.find(a => 
      a.slug === slug ||
      a.url?.includes(slug)
    );
    
    // If no exact match, find by title/slug similarity
    if (!article) {
      article = articles.find(a => 
        a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.url?.includes(searchTerm.replace(/\s+/g, '-'))
      );
    }
    
    // Take the first result if no specific match
    if (!article && articles.length > 0) {
      article = articles[0];
      console.log(`Using first result for slug: ${slug}`);
    }
    
    if (!article) {
      console.log('Knowledge article not found for slug:', slug);
      return {
        id: `not-found-${slug}`,
        name: 'Page Not Found',
        slug: slug,
        url: '',
        summary: 'This page could not be found.',
        content: `
          <div style="text-align: center; padding: 60px 20px; max-width: 600px; margin: 0 auto;">
            <h2 style="font-size: 2rem; font-weight: bold; color: #1e293b; margin-bottom: 16px;">Uh-Oh. This page knows nothing.</h2>
            <p style="font-size: 1.125rem; color: #64748b; line-height: 1.6; margin-bottom: 32px;">
              But the pursuit of knowledge is never-ending, so while we investigate, try the search above.
            </p>
           
          </div>
        `,
        createdAt: '',
        updatedAt: '',
        publishedAt: '',
        authorName: '',
        category: 'Not Found',
        tags: ['not-found'],
      };
    }

    console.log('Found knowledge article:', article.id, article.name);

    // Clean the title and summary from HTML tags
    const cleanTitle = article.name?.replace(/<[^>]*>/g, '') || 'Untitled';
    const cleanSummary = article.summary?.replace(/<[^>]*>/g, '') || '';

    // Scrape the full content from the article URL
    let fullContent = '';
    
    if (article.url) {
      console.log('Scraping content from:', article.url);
      fullContent = await scrapeArticleContent(article.url);
      
      // Process content for internal navigation and add CSS classes
      if (fullContent) {
        fullContent = processMainPageContent(fullContent);
        
        // Add CSS classes to headings for proper styling
        fullContent = fullContent
          .replace(/<h1[^>]*>/gi, '<h1 class="text-4xl md:text-5xl font-bold text-foreground mb-8 mt-12 first:mt-0 leading-tight">')
          .replace(/<h2[^>]*>/gi, '<h2 class="text-2xl md:text-3xl font-semibold text-foreground mb-6 mt-10 leading-tight">')
          .replace(/<h3[^>]*>/gi, '<h3 class="text-xl md:text-2xl font-medium text-foreground mb-4 mt-8">')
          .replace(/<h4[^>]*>/gi, '<h4 class="text-lg md:text-xl font-medium text-foreground mb-3 mt-6">')
          .replace(/<h5[^>]*>/gi, '<h5 class="text-base md:text-lg font-medium text-foreground mb-2 mt-4">')
          .replace(/<h6[^>]*>/gi, '<h6 class="text-sm md:text-base font-medium text-foreground mb-2 mt-4">');

        // Add CSS classes to paragraphs and links
        fullContent = fullContent
          .replace(/<p[^>]*>/gi, '<p class="text-lg md:text-xl leading-8 md:leading-9 mb-6 last:mb-0 text-foreground">')
          .replace(/<a[^>]*href="(https?:\/\/[^"]+)"[^>]*>/gi, '<a href="$1" class="text-blue-600 hover:text-blue-800 underline font-medium" target="_blank" rel="noopener noreferrer">');
      }
    }

    return {
      ...article,
      name: cleanTitle,
      summary: cleanSummary,
      content: fullContent || `
        <h1>${cleanTitle}</h1>
        <p>${cleanSummary}</p>
        <div class="external-link-notice" style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 16px; margin: 24px 0;">
          <p style="margin: 0 0 8px 0; font-weight: 600; color: #0c4a6e;">📖 Complete Article Available</p>
          <p style="margin: 0 0 12px 0; color: #374151;">This is a summary from our knowledge base. For the complete article with detailed instructions, please visit:</p>
          <p style="margin: 0;"><a href="${article.url}" target="_blank" rel="noopener noreferrer" style="color: #0ea5e9; text-decoration: none; font-weight: 500;">${article.url}</a></p>
        </div>
      `,
      authorName: article.authorName || '',
    };
  } catch (error) {
    console.error('Failed to fetch HubSpot knowledge article:', error);
    return null;
  }
}

/**
 * Special function to handle the getting-started main page
 */
async function fetchGettingStartedMainPage(): Promise<HubSpotKnowledgeArticle | null> {
  try {
    const url = 'https://help.arda.cards/getting-started-arda-cloud';
    console.log('Loading getting-started main page from:', url);
    
    const fullContent = await scrapeArticleContent(url);
    
    if (!fullContent) {
      return null;
    }

    // Process content for internal navigation
    const processedContent = processMainPageContent(fullContent);
    
    // Use processed content directly without adding extra subpages section
    const finalContent = processedContent;

    return {
      id: 'getting-started-main',
      name: 'Getting Started - Arda Cloud',
      slug: 'getting-started',
      url: url,
      summary: 'Complete guide to getting started with Arda Cloud platform',
      content: finalContent,
      createdAt: '',
      updatedAt: '',
      publishedAt: '',
      authorName: '',
      category: 'Getting Started',
      tags: ['getting-started', 'orientation', 'guide'],
    };
  } catch (error) {
    console.error('Failed to fetch getting-started main page:', error);
    return null;
  }
}

/**
 * Get specific help topics for the help panel
 * This maps the 4 specific help topics to their corresponding knowledge articles
 */
export async function fetchHelpTopics(): Promise<HubSpotKnowledgeArticle[]> {
  try {
    // Map specific help topics to their search terms and articles
    const helpTopicMappings = [
      {
        title: 'Getting started',
        description: 'From zero to Arda, in minutes.',
        slug: 'getting-started',
        icon: 'ListIcon',
        searchTerm: 'getting started arda cloud',
        hubspotId: '242906964685', // Navigating the Arda Platform - main entry point
        url: 'https://help.arda.cards/getting-started-arda-cloud',
        isMainPage: true, // This is a main page with subpages
      },
      {
        title: 'Creating and managing items',
        description: 'Inventory? Handled.',
        slug: 'adding-items-in-arda',
        icon: 'DockIcon',
        searchTerm: 'adding items',
        hubspotId: '242906993396', // From diagnostic results
        url: 'https://help.arda.cards/adding-items-in-arda',
        isMainPage: false,
      },
      {
        title: 'Ordering items',
        description: 'Need it. Order it. Delivered.',
        slug: 'ordering-items',
        icon: 'ShoppingCartIcon',
        searchTerm: 'placing orders',
        hubspotId: '232594079448', // From diagnostic results
        url: 'https://help.arda.cards/ordering-items',
        isMainPage: false,
      },
      {
        title: 'Useful tips',
        description: 'Shortcuts, tricks, and pro moves.',
        slug: 'useful-tips',
        icon: 'MessageCircleQuestionIcon',
        searchTerm: 'tips',
        hubspotId: '233268175603', // From diagnostic results
        url: 'https://help.arda.cards/useful-tips',
        isMainPage: false,
      },
      {
        title: 'Submit a ticket',
        description: 'Need direct support? We\'re here to help.',
        slug: 'submit-a-ticket',
        icon: 'HeadphonesIcon',
        searchTerm: 'support ticket',
        hubspotId: '', // External link, no HubSpot ID
        url: 'https://www.arda.cards/submit-a-ticket',
        isMainPage: false,
      }
    ];

    const helpTopics: HubSpotKnowledgeArticle[] = [];
    
    for (const mapping of helpTopicMappings) {
      try {
        // Check if this is an external link (not from help.arda.cards)
        const isExternal = mapping.url && !mapping.url.includes('help.arda.cards');
        
        // Skip HubSpot search for external links
        if (isExternal) {
          helpTopics.push({
            id: `external-${mapping.slug}`,
            name: mapping.title,
            summary: mapping.description,
            slug: mapping.slug,
            url: mapping.url!,
            helpTopicIcon: mapping.icon,
            isExternal: true,
          } as HubSpotKnowledgeArticle & { helpTopicIcon: string; isExternal: boolean });
          continue;
        }
        
        // Search for articles matching this topic
        const articles = await fetchHubSpotKnowledgeArticles({ 
          limit: 10, 
          searchTerm: mapping.searchTerm 
        });
        
        // Find the best matching article
        let article = articles.find(a => 
          mapping.hubspotId && a.id === mapping.hubspotId
        );
        
        // If no exact ID match, find by title/slug similarity
        if (!article) {
          article = articles.find(a => 
            a.name?.toLowerCase().includes(mapping.title.toLowerCase()) ||
            a.slug === mapping.slug ||
            a.url?.includes(mapping.slug)
          );
        }
        
        // Take the first result if no specific match
        if (!article && articles.length > 0) {
          article = articles[0];
        }
        
        if (article) {
          // Found article in HubSpot - use it with internal navigation
          helpTopics.push({
            ...article,
            name: mapping.title,
            summary: mapping.description,
            slug: mapping.slug,
            // Add custom properties for UI
            helpTopicIcon: mapping.icon,
            isExternal: false, // This will navigate internally
          } as HubSpotKnowledgeArticle & { helpTopicIcon: string; isExternal: boolean });
        } else {
          // If article not found in HubSpot, create a placeholder with external URL
          helpTopics.push({
            id: `external-${mapping.slug}`,
            name: mapping.title,
            summary: mapping.description,
            slug: mapping.slug,
            url: mapping.url || `https://help.arda.cards/${mapping.slug}`,
            helpTopicIcon: mapping.icon,
            isExternal: false, // Default to internal navigation
          } as HubSpotKnowledgeArticle & { helpTopicIcon: string; isExternal: boolean });
        }
      } catch (searchError) {
        console.error(`Failed to search for topic "${mapping.title}":`, searchError);
        // Fallback to external URL
        helpTopics.push({
          id: `external-${mapping.slug}`,
          name: mapping.title,
          summary: mapping.description,
          slug: mapping.slug,
          url: `https://help.arda.cards/${mapping.slug}`,
          helpTopicIcon: mapping.icon,
          isExternal: true,
        } as HubSpotKnowledgeArticle & { helpTopicIcon: string; isExternal: boolean });
      }
    }

    return helpTopics;
  } catch (error) {
    console.error('Failed to fetch help topics:', error);
    // Return fallback topics with external URLs
    return [
      {
        id: 'external-getting-started',
        name: 'Getting started',
        summary: 'From zero to Arda, in minutes.',
        slug: 'getting-started-with-arda',
        url: 'https://help.arda.cards/getting-started-with-arda',
        helpTopicIcon: 'ListIcon',
        isExternal: true,
      },
      {
        id: 'external-adding-items',
        name: 'Creating and managing items',
        summary: 'Inventory? Handled.',
        slug: 'adding-items-in-arda',
        url: 'https://help.arda.cards/adding-items-in-arda',
        helpTopicIcon: 'DockIcon',
        isExternal: true,
      },
      {
        id: 'external-ordering',
        name: 'Ordering items',
        summary: 'Need it. Order it. Delivered.',
        slug: 'ordering-items',
        url: 'https://help.arda.cards/ordering-items',
        helpTopicIcon: 'ShoppingCartIcon',
        isExternal: true,
      },
      {
        id: 'external-tips',
        name: 'Useful tips',
        summary: 'Shortcuts, tricks, and pro moves.',
        slug: 'useful-tips',
        url: 'https://help.arda.cards/useful-tips',
        helpTopicIcon: 'MessageCircleQuestionIcon',
        isExternal: true,
      },
      {
        id: 'external-submit-ticket',
        name: 'Submit a ticket',
        summary: 'Need direct support? We\'re here to help.',
        slug: 'submit-a-ticket',
        url: 'https://www.arda.cards/submit-a-ticket',
        helpTopicIcon: 'HeadphonesIcon',
        isExternal: true,
      },
    ] as HubSpotKnowledgeArticle[];
  }
}
