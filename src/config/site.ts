export const siteConfig = {
  name: "MealMash",
  tagline: "Stop asking 'What's for dinner?'",
  description: "End meal planning stress with random meal picker, ingredient-based recipes, pantry tracking, and auto-generated shopping lists.",
  url: "https://mealmash.com",
  
  nav: {
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
    ],
    cta: { label: "Get Started", href: "#signup" },
  },
  
  hero: {
    badge: "🍳 No more dinner drama",
    title: "Finally, a meal plan\nthat works for you",
    subtitle: "Spin the wheel, find recipes by ingredients you have, track your pantry, and auto-generate shopping lists. Meal planning made deliciously simple.",
    cta: { text: "Start Free Trial", href: "#signup" },
    secondaryCta: { text: "See How It Works", href: "#features" },
  },
  
  features: [
    {
      icon: "Wheelchair",
      title: "Spin the Dinner Wheel",
      description: "Can't decide? Let fate choose! Spin our fun meal randomizer and discover new favorites instantly."
    },
    {
      icon: "Carrot",
      title: "Recipe Finder by Ingredients",
      description: "Enter what you have in your fridge, and we'll find delicious recipes you can make right now."
    },
    {
      icon: "ShoppingCart",
      title: "Auto Shopping Lists",
      description: "Your weekly meal plan automatically generates a shopping list. Just swipe, shop, and cook."
    },
    {
      icon: "Warehouse",
      title: "Pantry Inventory Tracker",
      description: "Know what you have before you buy. Track ingredients and get alerts before they go bad."
    },
    {
      icon: "CalendarDays",
      title: "Weekly Meal Plans",
      description: "Plan your week with balanced, varied meals. Save time and reduce food waste."
    },
    {
      icon: "Sparkles",
      title: "Smart Suggestions",
      description: "AI learns your preferences and suggests meals you'll love based on your history."
    },
  ],
  
  pricing: [
    {
      name: "Free",
      price: 0,
      description: "Perfect for trying things out",
      features: [
        "Spin the wheel (5x/day)",
        "Basic recipe search",
        "1 pantry list",
        "Manual shopping list"
      ],
      cta: "Start Free",
      popular: false,
    },
    {
      name: "Pro",
      price: 4,
      description: "For serious home cooks",
      features: [
        "Unlimited wheel spins",
        "Advanced recipe search",
        "Unlimited pantry lists",
        "Auto shopping lists",
        "Weekly meal plans",
        "Nutritional info"
      ],
      cta: "Go Pro",
      popular: true,
    },
    {
      name: "Family",
      price: 9,
      description: "The whole family covered",
      features: [
        "Everything in Pro",
        "Up to 5 family members",
        "Family favorites list",
        "Meal prep scheduling",
        "Priority support",
        "Custom dietary preferences"
      ],
      cta: "Get Family Plan",
      popular: false,
    },
  ],
  
  cta: {
    title: "Ready to crush dinner decision fatigue?",
    subtitle: "Join thousands of home cooks who've simplified their meal planning.",
    button: "Start Your Free Trial",
  },
  
  footer: {
    tagline: "Making dinner decisions deliciously easy.",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
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
