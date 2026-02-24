"use client";
import { useEffect, useState } from 'react';
import { fetchHubSpotBlogPosts } from '@frontend/lib/hubspot';
import { Card } from '@frontend/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';

interface PostItem {
  id: string;
  name?: string;
  url?: string;
  slug?: string;
  featuredImage?: string;
  postSummary?: string;
  publishDate?: string;
}

export function HubSpotPostsPanel() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetchHubSpotBlogPosts({ limit: 3 });

        if (mounted) {
          setPosts(Array.isArray(res) ? res : []);
        }
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <Card className='border border-border p-4 rounded-[10px]'>
        <div className='text-sm text-muted-foreground'>Loading resources…</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className='border border-border p-4 rounded-[10px]'>
        <div className='text-sm text-destructive'>Unable to load resources.</div>
      </Card>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <Card className='border border-border p-4 rounded-[10px]'>
        <div className='text-sm text-muted-foreground'>No blog posts available.</div>
      </Card>
    );
  }

  return (
    <div className='flex flex-col gap-4 w-full'>
      {posts.map((post) => (
        post.slug ? (
          <Link
            key={post.id}
            href={`/blogs/${post.slug}`}
            className='w-full pt-4 pb-4 bg-card shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.10)] rounded-[14px] border border-border flex flex-col justify-start items-start gap-4 hover:bg-muted transition-colors cursor-pointer'
          >
            <div className='w-full px-6 flex justify-start items-start gap-2'>
              <div className='flex-1 flex flex-col justify-start items-start gap-1.5'>
                <h4 className='w-full text-[16px] font-semibold text-foreground font-geist leading-4'>
                  {post.name || 'Untitled'}
                </h4>
                <p className='w-full text-[14px] text-muted-foreground font-normal font-geist leading-5'>
                  {post.postSummary || ''}
                </p>
              </div>
            </div>
            {post.featuredImage && (
              <div className='w-full flex flex-col justify-start items-start gap-2'>
                <Image
                  src={post.featuredImage}
                  alt={post.name || 'Resource'}
                  width={600}
                  height={140}
                  className='w-full h-[140px] object-cover'
                />
              </div>
            )}
          </Link>
        ) : (
          <div
            key={post.id}
            className='w-full pt-4 pb-4 bg-card shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.10)] rounded-[14px] border border-border flex flex-col justify-start items-start gap-4'
          >
            <div className='w-full px-6 flex justify-start items-start gap-2'>
              <div className='flex-1 flex flex-col justify-start items-start gap-1.5'>
                <h4 className='w-full text-[16px] font-semibold text-foreground font-geist leading-4'>
                  {post.name || 'Untitled'}
                </h4>
                <p className='w-full text-[14px] text-muted-foreground font-normal font-geist leading-5'>
                  {post.postSummary || ''}
                </p>
              </div>
            </div>
            {post.featuredImage && (
              <div className='w-full flex flex-col justify-start items-start gap-2'>
                <Image
                  src={post.featuredImage}
                  alt={post.name || 'Resource'}
                  width={600}
                  height={140}
                  className='w-full h-[140px] object-cover'
                />
              </div>
            )}
          </div>
        )
      ))}
    </div>
  );
}

export default HubSpotPostsPanel;