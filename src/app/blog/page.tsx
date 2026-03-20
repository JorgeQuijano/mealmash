import Link from 'next/link';
import {getAllPosts} from '@/lib/posts';
import BlogHeader from '@/components/BlogHeader';

export const metadata = {
  title: 'Blog | Mealmash',
  description: 'Meal prep tips, recipes, and updates from Mealmash.',
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <BlogHeader />
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-stone-800 dark:text-stone-100 mb-8">Blog</h1>
          <div className="space-y-8">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg p-6 hover:border-orange-300 dark:hover:border-orange-600 transition-colors"
              >
                <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-2">
                  {post.title}
                </h2>
                <p className="text-stone-500 dark:text-stone-400 text-sm mb-3">
                  {post.date}
                </p>
                {post.excerpt && (
                  <p className="text-stone-600 dark:text-stone-400 mb-3">{post.excerpt}</p>
                )}
                <div className="flex gap-2">
                  {post.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
