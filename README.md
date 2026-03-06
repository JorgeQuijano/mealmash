# MealMash 🍳

<p align="center">
  <strong>Stop asking "What's for dinner?" — Meal planning made deliciously simple.</strong>
</p>

<p align="center">
  <a href="https://mealmash.com">
    <img src="https://img.shields.io/badge/website-mealmash.com" alt="Website">
  </a>
  <a href="https://github.com/JorgeQuijano/mealmash">
    <img src="https://img.shields.io/badge/GitHub-View_on_GitHub-blue" alt="GitHub">
  </a>
  <a href="https://vercel.com">
    <img src="https://img.shields.io/badge/Deployed%20on-Vercel-black" alt="Vercel">
  </a>
  <a href="https://supabase.com">
    <img src="https://img.shields.io/badge/Backend-Supabase-green" alt="Supabase">
  </a>
</p>

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [API Routes](#api-routes)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 About

**MealMash** is a full-stack meal planning web application that helps users decide what to cook, track their pantry inventory, plan weekly meals, and generate shopping lists — all in one place.

Whether you can't decide what to make for dinner, want to use ingredients you already have, or need to plan meals for the week, MealMash has you covered.

### Core Problems Solved

- **Decision Fatigue**: "What's for dinner?" becomes effortless with the spin wheel randomizer
- **Food Waste**: Track pantry items and get alerts before ingredients go bad
- **Meal Planning**: Plan weekly meals with balanced, varied options
- **Shopping**: Auto-generate shopping lists from meal plans

---

## ✨ Features

### 1. 🍰 Spin the Dinner Wheel
Can't decide? Let fate choose! Spin the fun meal randomizer and discover new favorites instantly.

- Visual spin wheel with recipe segments
- Filter by category (breakfast, lunch, dinner, snack, dessert)
- Instant recipe selection

### 2. 🥕 Recipe Finder by Ingredients
Enter what you have in your fridge, and we'll find delicious recipes you can make right now.

- Search recipes by available ingredients
- Smart matching algorithm (70%+ ingredient match)
- Full recipe details with instructions

### 3. 🛒 Auto Shopping Lists
Your weekly meal plan automatically generates a shopping list. Just swipe, shop, and cook.

- Manual item addition
- Check off items as you shop
- Clear completed items

### 4. 📦 Pantry Inventory Tracker
Know what you have before you buy. Track ingredients and get alerts before they go bad.

- Add/edit/delete pantry items
- Categorize ingredients
- Track quantities and expiration dates
- Expiring items highlight

### 5. 📅 Weekly Meal Plans
Plan your week with balanced, varied meals. Save time and reduce food waste.

- 7-day week view
- Add recipes to specific dates/meal types
- Navigate between weeks
- Today button for quick access

### 6. 🍳 What Can I Make?
AI-powered suggestions based on your pantry inventory.

- Match recipes to pantry ingredients
- Show match percentage
- One-click add to meal plan

### 7. ❤️ Favorites
Save your favorite recipes for quick access.

- Heart any recipe
- Dedicated favorites page
- Persistent across sessions

---

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 19, Next.js 16 (App Router) |
| **Styling** | Tailwind CSS 4, shadcn/ui |
| **Backend** | Supabase (PostgreSQL, Auth, Edge Functions) |
| **Caching** | Upstash (Redis) |
| **Deployment** | Vercel |
| **Icons** | Lucide React |
| **Animations** | Framer Motion |
| **Fonts** | Geist (Next.js Font) |

### Key Dependencies

```json
{
  "next": "^16.1.6",
  "react": "^19.2.3",
  "@supabase/ssr": "^0.9.0",
  "@supabase/supabase-js": "^2.98.0",
  "@upstash/ratelimit": "^2.0.8",
  "@upstash/redis": "^1.36.3",
  "framer-motion": "^12.34.3",
  "lucide-react": "^0.575.0",
  "next-themes": "^0.4.6",
  "tailwindcss": "^4"
}
```

---

## 📂 Project Structure

```
mealmash/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Landing page
│   │   ├── layout.tsx         # Root layout
│   │   ├── dashboard/         # User dashboard (protected)
│   │   ├── recipes/           # Recipe browsing & favorites
│   │   ├── pantry/            # Pantry management
│   │   ├── meal-plan/         # Weekly meal planner
│   │   ├── shopping-list/     # Shopping list management
│   │   ├── suggestions/       # Recipe suggestions
│   │   ├── random/            # Spin wheel randomizer
│   │   ├── settings/          # User settings
│   │   ├── login/             # Authentication
│   │   ├── admin/             # Admin panel
│   │   └── api/              # API routes
│   │       ├── auth/
│   │       ├── ingredients/
│   │       ├── meal-plans/
│   │       └── pantry/
│   │
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   ├── mobile-nav.tsx    # Mobile bottom navigation
│   │   ├── desktop-nav.tsx   # Desktop sidebar navigation
│   │   ├── recipe-modal.tsx  # Recipe detail modal
│   │   ├── ingredient-search.tsx
│   │   ├── ExpiringRecipeModal.tsx
│   │   └── theme-provider.tsx
│   │
│   ├── lib/
│   │   ├── supabase.ts       # Supabase client & auth helpers
│   │   ├── images.ts         # Image URL helpers
│   │   └── utils.ts          # Utility functions
│   │
│   └── config/
│       └── site.ts           # Site configuration (features, pricing, etc.)
│
├── public/                   # Static assets
├── supabase/                # Supabase migrations
├── scripts/                 # Utility scripts
├── SUPABASE_SCHEMA.sql      # Database schema
├── next.config.mjs          # Next.js configuration
├── tailwind.config.ts       # Tailwind configuration
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **npm** or **pnpm**
- **Supabase** account (for backend)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/JorgeQuijano/mealmash.git
   cd mealmash
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` with your Supabase credentials (see [Environment Variables](#environment-variables))

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the app**
   - Landing page: http://localhost:3000
   - Login page: http://localhost:3000/login

### Building for Production

```bash
npm run build
npm start
```

---

## 🔐 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Upstash Redis (for rate limiting)
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
```

### Getting Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Go to **Settings → API**
4. Copy the **Project URL** and **anon public** key

---

## 🗄️ Database Schema

The database uses **PostgreSQL** with **Row Level Security (RLS)** for security.

### Core Tables

| Table | Description |
|-------|-------------|
| `user_profiles` | User profile data (linked to auth.users) |
| `recipes` | Global recipe database (admin-managed) |
| `user_favorites` | User favorite recipes |
| `pantry_items` | User's pantry inventory |
| `meal_plans` | User's weekly meal plan |
| `shopping_list` | User's shopping list items |
| `ingredients` | Standardized ingredient library |

### Key Features

- **RLS Policies**: Users can only access their own data
- **Public Recipes**: Anyone can read recipes, only admins can modify
- **Auto-profile Creation**: Profile created automatically on signup via trigger

### Sample Data

The schema includes sample recipes for testing. Run the SQL in Supabase SQL Editor to populate.

---

## 🌐 API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/callback` | GET | OAuth callback handler |
| `/api/ingredients/search` | GET | Search ingredients |
| `/api/pantry/sync` | POST | Sync pantry items |
| `/api/meal-plans/week` | GET/POST | Get/create meal plans |
| `/api/shopping-list` | GET/POST/DELETE | Manage shopping list |

---

## 📦 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Import your GitHub repository
   - Add environment variables in Vercel project settings

3. **Deploy**
   - Vercel auto-deploys on every push to `main`
   - Custom domain can be configured in project settings

### Database Migration

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `SUPABASE_SCHEMA.sql`
3. Run the SQL to create tables and policies

---

## 🤝 Contributing

Contributions are welcome! Here's how to help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and commit: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Coding Standards

- Use TypeScript for type safety
- Follow ESLint configuration
- Use Tailwind CSS for styling
- Keep components small and focused
- Write semantic commit messages

---

## 📄 License

This project is licensed under the **MIT License** — see the LICENSE file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - React framework
- [Supabase](https://supabase.com) - Open-source Firebase alternative
- [shadcn/ui](https://ui.shadcn.com) - Beautiful, accessible components
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
- [Vercel](https://vercel.com) - Deployment platform

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/JorgeQuijano">Jorge Quijano</a>
</p>
