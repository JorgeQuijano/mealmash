export const siteConfig = {
  name: "MealClaw",
  tagline: "Stop staring at the fridge at 6pm",
  description: "Tell MealClaw what's in your kitchen. We'll tell you what to cook tonight.",
  url: "https://mealclaw.com",
  
  nav: {
    links: [
      { label: "How It Works", href: "#how-it-works" },
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Blog", href: "/blog" },
    ],
    cta: { label: "Start Cooking Better", href: "/login" },
  },
  
  hero: {
    badge: "🍳 No more 6pm panic",
    title: "Stop Staring at the Fridge at 6pm",
    subtitle: "Tell us what you have in your kitchen. We'll find delicious recipes you can make tonight — before the food goes bad. No more 'I don't know what's for dinner.'",
    cta: { text: "Start Cooking Better", href: "/login" },
    secondaryCta: { text: "See How It Works", href: "#how-it-works" },
  },
  
  howItWorks: {
    badge: "How It Works",
    title: "Three steps to dinner done",
    steps: [
      {
        number: "1",
        title: "Tell us what you have",
        description: "Add ingredients from your fridge, pantry, or just type what you're thinking about cooking. We match it all."
      },
      {
        number: "2",
        title: "We find what to make",
        description: "Get recipe suggestions based on your ingredients — with a match percentage so you know how close you are."
      },
      {
        number: "3",
        title: "Plan, shop, cook",
        description: "Add to your weekly plan, auto-generate a shopping list, and cook without the decision paralysis."
      }
    ]
  },

  features: [
    {
      icon: "Carrot",
      title: "Recipe Finder by Ingredients",
      description: "Tell us what's in your fridge. We'll show you recipes you can actually make right now — with a match percentage so nothing's guesswork."
    },
    {
      icon: "Warehouse",
      title: "Pantry Tracker",
      description: "Track what you have. Get alerts before ingredients go bad. No more food rotting in the back of the fridge."
    },
    {
      icon: "Wheelchair",
      title: "Spin the Dinner Wheel",
      description: "Can't decide? Let fate choose. Spin the wheel when you've got too many options and just want dinner to happen."
    },
    {
      icon: "CalendarDays",
      title: "Weekly Meal Plans",
      description: "Plan your week without the chaos. Get variety, balance, and no repeat fatigue."
    },
    {
      icon: "ShoppingCart",
      title: "Auto Shopping Lists",
      description: "Your meal plan builds the shopping list for you. Swipe through, uncheck what you have, and shop in minutes."
    },
    {
      icon: "Sparkles",
      title: "Smart Suggestions",
      description: "As you use it, MealClaw learns what you like. Better suggestions, less decision fatigue over time."
    },
  ],
  
  pricing: [
    {
      name: "Free",
      price: 0,
      description: "For home cooks getting started",
      features: [
        "Unlimited recipe search by ingredients",
        "Pantry tracking (up to 50 items)",
        "3 dinner wheel spins per day",
        "Basic weekly meal plan",
        "Manual shopping list"
      ],
      cta: "Start Cooking Better",
      popular: false,
    },
    {
      name: "Pro",
      price: 7,
      description: "For serious home cooks",
      features: [
        "Unlimited pantry items",
        "Unlimited dinner wheel spins",
        "Auto-generated shopping lists",
        "Unlimited meal plans",
        "Expiration alerts",
        "Priority new features"
      ],
      cta: "Go Pro — $7/month",
      popular: true,
    },
  ],
  
  cta: {
    title: "Still staring at the fridge?",
    subtitle: "Join the home cooks who stopped wasting food and agonizing over dinner. Free to start, no credit card required.",
    button: "Start Cooking Better",
  },
  
  footer: {
    tagline: "Making dinner decisions deliciously easy.",
    links: [
      { label: "How It Works", href: "#how-it-works" },
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
    social: [
      { label: "Twitter", href: "#" },
      { label: "Instagram", href: "#" },
      { label: "TikTok", href: "#" },
    ],
  }
}

export type SiteConfig = typeof siteConfig