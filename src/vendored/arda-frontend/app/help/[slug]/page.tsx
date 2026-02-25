"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, Home } from 'lucide-react';
import { Button } from '@frontend/components/ui/button';
import { AppSidebar } from '@frontend/components/app-sidebar';
import { AppHeader } from '@frontend/components/common/app-header';
import { SidebarInset, SidebarProvider } from '@frontend/components/ui/sidebar';
import { fetchHubSpotKnowledgeArticle } from '@frontend/lib/hubspot-knowledge';
import { HubSpotKnowledgeArticle } from '@frontend/types/hubspot';

interface HelpArticlePageProps {
  params: Promise<{ slug: string }>;
}

export default function HelpArticlePage({ params }: HelpArticlePageProps) {
  const router = useRouter();
  const [article, setArticle] = useState<HubSpotKnowledgeArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resolvedParams = await params;
        const foundArticle = await fetchHubSpotKnowledgeArticle(resolvedParams.slug);

        if (mounted) {
          console.log('Attempting to find article for slug:', resolvedParams.slug);
          console.log('Found article:', foundArticle);
          if (foundArticle) {
            setArticle(foundArticle);
          } else {
            setError('Help article not found');
          }
        }
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : 'Failed to load help article');
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
          <div className="flex items-center justify-center h-full pt-20">
            <p className="text-muted-foreground">Loading help article...</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (error || (!article && !loading)) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <AppHeader />
        <SidebarInset>
          <div className="flex flex-col items-center justify-center h-full p-4 text-center pt-20">
            <p className="text-destructive text-lg mb-4">Error: {error || 'Help article not found.'}</p>
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!article) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <AppHeader />
        <SidebarInset>
          <div className="flex items-center justify-center h-full pt-20">
            <p className="text-muted-foreground">Loading help article...</p>
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
          {/* Breadcrumbs */}
          <div className="max-w-4xl mx-auto px-6 pt-20 pb-4">
              <nav className="flex items-center space-x-2 text-sm text-base-muted-foreground">
                <Link href="/dashboard" className="flex items-center hover:text-base-foreground transition-colors">
                  <Home className="h-4 w-4 mr-1" />
                  Dashboard
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-base-foreground font-medium">{article.name}</span>
              </nav>
          </div>

          {/* Help Article Content */}
          <div className="max-w-4xl mx-auto px-6 py-12">
            <article className="prose prose-lg max-w-none">
              {article.content ? (
                <div className="text-foreground leading-relaxed">
                  {/* Check if content is HTML */}
                  {article.content.includes('<') ? (
                    <div 
                      dangerouslySetInnerHTML={{ __html: article.content }} 
                      className="prose prose-lg max-w-none
                        [&_h1]:text-4xl [&_h1]:md:text-5xl [&_h1]:font-bold [&_h1]:text-foreground [&_h1]:mb-8 [&_h1]:mt-12 [&_h1]:first:mt-0 [&_h1]:leading-tight
                        [&_h2]:text-2xl [&_h2]:md:text-3xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mb-6 [&_h2]:mt-10 [&_h2]:leading-tight
                        [&_h3]:text-xl [&_h3]:md:text-2xl [&_h3]:font-medium [&_h3]:text-foreground [&_h3]:mb-4 [&_h3]:mt-8
                        [&_p]:text-lg [&_p]:md:text-xl [&_p]:leading-8 [&_p]:md:leading-9 [&_p]:mb-6 [&_p]:last:mb-0 [&_p]:text-foreground
                        [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-6
                        [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-6
                        [&_li]:text-lg [&_li]:leading-7
                        [&_span]:text-foreground [&_strong]:font-semibold [&_strong]:text-foreground
                        [&_img]:shadow-md [&_img]:my-8
                        [&_a]:text-blue-600 [&_a]:hover:text-blue-800 [&_a]:underline [&_a]:font-medium
                        [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:pl-6 [&_blockquote]:italic [&_blockquote]:text-muted-foreground
                        [&_code]:bg-gray-100 [&_code]:dark:bg-gray-800 [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_code]:text-sm
                        [&_pre]:bg-gray-100 [&_pre]:dark:bg-gray-800 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto
                        /* Hide duplicate breadcrumb navigation */
                        [&>div:first-child>div:first-child>ol]:hidden
                        [&>div:first-child>div:first-child>div:first-child>ol]:hidden" 
                    />
                  ) : (
                    // Fallback for markdown content
                    article.content.split('\n').map((line, index) => {
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
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground mb-4">Content coming soon...</p>
                  <p className="text-sm text-muted-foreground">
                    This help article is being prepared. Please check back later.
                  </p>
                </div>
              )}
            </article>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
