"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@frontend/components/ui/button';
import { AppSidebar } from '@frontend/components/app-sidebar';
import { AppHeader } from '@frontend/components/common/app-header';
import { SidebarInset, SidebarProvider } from '@frontend/components/ui/sidebar';
import { fetchHubSpotBlogPost } from '@frontend/lib/hubspot';
import { HubSpotBlogPost } from '@frontend/types/hubspot';

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

export default function BlogPage({ params }: BlogPageProps) {
  const router = useRouter();
  const [post, setPost] = useState<HubSpotBlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resolvedParams = await params;
        const foundPost = await fetchHubSpotBlogPost(resolvedParams.slug);

        if (mounted) {
          console.log('Attempting to find post for slug:', resolvedParams.slug); // Debug what we got
          console.log('Found post:', foundPost);
          if (foundPost) {
            setPost(foundPost);
          } else {
            setError('Blog post not found');
          }
        }
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : 'Failed to load blog post');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [params]);

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <AppHeader />
        <SidebarInset>
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading blog post...</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (error || !post) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <AppHeader />
        <SidebarInset>
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <p className="text-destructive text-lg mb-4">Error: {error || 'Blog post not found.'}</p>
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <AppHeader />
      <SidebarInset>
        <div className="w-full">
          {/* Blog Hero Section */}
          <div className="relative">
            {post.featuredImage && (
              <div className="relative h-[50vh] w-full overflow-hidden">
                <Image
                  src={post.featuredImage}
                  alt={post.name || 'Blog post'}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 p-8">
                  <div className="max-w-4xl mx-auto h-full flex flex-col justify-between">
                    {/* Top positioning for back button */}
                    <div className="flex justify-between items-start pt-12">
                      <Button
                        onClick={() => router.back()}
                        className="group backdrop-blur-md bg-black/40 hover:bg-black/60 border-white/30 hover:border-white/50 text-white shadow-xl transition-all duration-200 ease-out hover:scale-105 px-6 py-3 rounded-full"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        <span className="font-medium">Back to Dashboard</span>
                      </Button>
                      {/* Optional: Add other action buttons like share, edit, etc. */}
                    </div>
                    
                    {/* Bottom positioning for title and description */}
                    <div className="pb-8">
                      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                        {post.name}
                      </h1>
                      <p className="text-white/90 text-lg leading-relaxed">
                        {post.postSummary}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Blog Content */}
          <div className="max-w-4xl mx-auto px-6 py-12">
            {!post.featuredImage && (
              <div className="mb-12">
                <Button
                  onClick={() => router.back()}
                  className="group relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-900 transition-all duration-200 hover:scale-105 shadow-lg rounded-full px-6 py-3"
                >
                  <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  <span className="font-medium">Back to Dashboard</span>
                </Button>
                <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                  {post.name}
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                  {post.postSummary}
                </p>
              </div>
            )}

            {/* Blog Content - Open Layout */}
            <article className="prose prose-lg max-w-none">
              {post.content ? (
                <div className="text-foreground leading-relaxed">
                  {/* Check if content is HTML */}
                  {post.content.includes('<p>') || post.content.includes('<h') ? (
                    <div 
                      dangerouslySetInnerHTML={{ __html: post.content }} 
                      className="
                        [&>h1]:text-4xl [&>h1]:md:text-5xl [&>h1]:font-bold [&>h1]:text-foreground [&>h1]:mb-8 [&>h1]:mt-12 [&>h1]:first:mt-0 [&>h1]:leading-tight
                        [&>h2]:text-2xl [&>h2]:md:text-3xl [&>h2]:font-semibold [&>h2]:text-foreground [&>h2]:mb-6 [&>h2]:mt-10 [&>h2]:leading-tight
                        [&>h3]:text-xl [&>h3]:md:text-2xl [&>h3]:font-medium [&>h3]:text-foreground [&>h3]:mb-4 [&>h3]:mt-8
                        [&>p]:text-lg [&>p]:md:text-xl [&>p]:leading-8 [&>p]:md:leading-9 [&>p]:mb-6 [&>p]:last:mb-0 [&>p]:text-foreground
                        [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:mb-6
                        [&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:mb-6
                        [&>li]:text-lg [&>li]:leading-7
                        [&>span]:text-foreground [&>strong]:font-semibold [&>strong]:text-foreground" 
                    />
                  ) : (
                    // Fallback for markdown content
                    post.content.split('\n').map((line, index) => {
                      if (line.startsWith('# ')) {
                        return (
                          <h1 key={index} className="text-4xl md:text-5xl font-bold text-foreground mb-8 mt-12 first:mt-0 leading-tight">
                            {line.replace('# ', '')}
                          </h1>
                        );
                      }
                      if (line.startsWith('## ')) {
                        return (
                          <h2 key={index} className="text-2xl md:text-3xl font-semibold text-foreground mb-6 mt-10 leading-tight">
                            {line.replace('## ', '')}
                          </h2>
                        );
                      }
                      if (line.startsWith('### ')) {
                        return (
                          <h3 key={index} className="text-xl md:text-2xl font-medium text-foreground mb-4 mt-8">
                            {line.replace('### ', '')}
                          </h3>
                        );
                      }
                      if (line.startsWith('- ')) {
                        return (
                          <ul key={index} className="list-disc ml-6 mb-6">
                            <li className="text-lg leading-7">{line.replace('- ', '')}</li>
                          </ul>
                        );
                      }
                      if (line.trim().match(/^\d+\./)) {
                        const content = line.replace(/^\d+\.\s*/, '');
                        return (
                          <ol key={index} className="list-decimal ml-6 mb-6">
                            <li className="text-lg leading-7">{content}</li>
                          </ol>
                        );
                      }
                      if (line.trim() === '') {
                        return <div key={index} className="h-4" />;
                      }
                      return (
                        <p key={index} className="text-lg md:text-xl leading-8 md:leading-9 mb-6 last:mb-0 text-foreground">
                          {line}
                        </p>
                      );
                    })
                  )}
                </div>
              ) : (
                <p className="text-lg text-foreground leading-8">Blog content coming soon...</p>
              )}
            </article>

            {/* Author section - Show for all posts with proper author info */}
            <div className="mt-16 pt-8 border-t border-border/50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {(post.authorName || 'ARDA Team').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-lg text-foreground">
                    {post.authorName || 'ARDA Team'}
                  </p>
                  {post.authorBio && (
                    <p className="text-sm text-muted-foreground mb-1">{post.authorBio}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {post.publishDate ? 
                      `Published on ${new Date(post.publishDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long', 
                        day: 'numeric'
                      })}` : ''
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
