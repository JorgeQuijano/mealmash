import Link from 'next/link';
import {notFound} from 'next/navigation';
import {getPostBySlug, getPostSlugs} from '@/lib/posts';
import BlogHeader from '@/components/BlogHeader';
import ReactMarkdown from 'react-markdown';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

interface PageProps {
  params: Promise<{slug: string}>;
}

export async function generateStaticParams() {
  const slugs = getPostSlugs();
  return slugs.map((slug) => ({slug}));
}

export async function generateMetadata({params}: PageProps) {
  const {slug} = await params;
  const post = getPostBySlug(slug);
  if (!post) return {title: 'Post Not Found'};
  return {
    title: `${post.title} | Mealmash Blog`,
    description: post.excerpt || `${post.title} - Mealmash Blog`,
  };
}

export default async function BlogPostPage({params}: PageProps) {
  const {slug} = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const fullPath = path.join(process.cwd(), 'src/content/blog', `${slug}.mdx`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const {content} = matter(fileContents);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <BlogHeader />
      <main className="pt-24 pb-16 px-4">
        <article className="max-w-3xl mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-8 transition-colors"
          >
            ← Back to Blog
          </Link>
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-stone-800 dark:text-stone-100 mb-3">
              {post.title}
            </h1>
            <p className="text-stone-500 dark:text-stone-400">
              {post.date}
            </p>
            <div className="flex gap-2 mt-3">
              {post.tags?.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </header>
          <div className="prose prose-lg dark:prose-invert max-w-none text-stone-700 dark:text-stone-300">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </article>
      </main>
    </div>
  );
}
