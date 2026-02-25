export interface HubSpotBlogPost {
  id: string;
  name?: string;
  slug?: string;
  url?: string;
  featuredImage?: string;
  postSummary?: string;
  metaDescription?: string;
  content?: string;
  publishDate?: string;
  createdAt?: string;
  updatedAt?: string;
  authorName?: string;
  authorEmail?: string;
  authorBio?: string;
}

export interface HubSpotKnowledgeArticle {
  id: string;
  name?: string;
  slug?: string;
  url?: string;
  summary?: string;
  content?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  authorName?: string;
  category?: string;
  tags?: string[];
  // Custom properties for help topics
  helpTopicIcon?: string;
  isExternal?: boolean;
}

export interface HubSpotListResponse<T> {
  total?: number;
  paging?: unknown;
  results?: T[];
}
