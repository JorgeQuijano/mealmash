# Blog Post Specification

## File Structure

All blog posts live in `src/content/blog/` as `.mdx` files.

```
src/content/blog/
├── first-post.mdx
├── SPEC.md          ← you are here
└── [new-post].mdx
```

## Frontmatter

Every post **must** include frontmatter at the top:

```yaml
---
title: "Post Title"
date: "YYYY-MM-DD"
author: "Author Name"
tags: ["tag1", "tag2"]
slug: "url-friendly-slug"     # optional, defaults to filename
excerpt: "Short description" # optional, used in listings
---
```

| Field    | Required | Description                                      |
|----------|----------|--------------------------------------------------|
| `title`  | Yes      | Display title of the post                        |
| `date`   | Yes      | Publication date in ISO format                   |
| `author` | Yes      | Author's display name                            |
| `tags`   | No       | Array of topic tags shown below the post        |
| `slug`   | No       | URL slug (defaults to filename without extension)|
| `excerpt`| No       | Short summary for the blog listing page         |

## Content Guidelines

### Structure
- Start with a level-1 heading (`# Title`) — this is the H1, matches the frontmatter title
- Use level-2 (`##`) and level-3 (`###`) headings for sections
- Keep paragraphs concise — aim for 3-4 sentences max
- Use bullet or numbered lists for breakdowns

### Style
- **Tone**: Friendly, helpful, casual. Think: a chef friend who also happens to be great at tech.
- **Audience**: Home cooks, meal preppers, busy professionals looking to eat better
- **Length**: 400–1200 words typical. Go longer if the topic demands it.
- **Format**: Plain markdown first. MDX components only when plain markdown falls short.

### Do
- Lead with value — answer "what will I learn or gain?" in the first section
- Use concrete examples, recipes, or scenarios when possible
- Include a clear call-to-action or next step at the end
- Cross-link to other blog posts when relevant

### Don't
- Don't start with "Welcome to our blog" or generic intros
- Don't use filler phrases ("In today's fast-paced world...")
- Don't bury the point — get to the useful content quickly
- Don't mix topics — one post = one main idea

## MDX Features

Standard markdown works as expected. For special cases:

```mdx
# Standard imports work
import SomeComponent from '@/components/SomeComponent';

# You can use JSX in your content
<Callout type="info">This is highlighted.</Callout>
```

If you need a custom component, add it to `src/components/` and import it in the post.

## Adding a New Post

1. Create a new `.mdx` file in `src/content/blog/`
2. Add the required frontmatter
3. Write the content
4. Import and register the post in:
   - `src/app/blog/page.tsx` — for the listing page
   - `src/app/blog/[slug]/page.tsx` — for the individual post route

## Auto-discovery (Future)

This spec covers static imports. A future iteration may add glob-based auto-discovery to eliminate the manual registration step — but for now, each new post needs to be imported explicitly.
