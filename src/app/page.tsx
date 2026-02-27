"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  ChefHat, 
  Carrot, 
  ShoppingCart, 
  Warehouse, 
  CalendarDays, 
  Sparkles,
  ArrowRight,
  Check,
  Menu,
  X,
  Twitter,
  Instagram,
  Facebook
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { siteConfig } from "@/config/site"

// Feature icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Wheelchair: ChefHat,
  Carrot: Carrot,
  ShoppingCart: ShoppingCart,
  Warehouse: Warehouse,
  CalendarDays: CalendarDays,
  Sparkles: Sparkles,
}

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-transparent"}`}>
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-400 rounded-xl flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">MealMash</span>
          </Link>
          
          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {siteConfig.nav.links.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className="text-stone-600 hover:text-orange-600 font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/login">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6">
                {siteConfig.nav.cta.label}
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden py-4 border-t border-stone-200 mt-4"
          >
            <div className="flex flex-col gap-4">
              {siteConfig.nav.links.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className="text-stone-600 hover:text-orange-600 font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link href="/login">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full">
                  {siteConfig.nav.cta.label}
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-dots opacity-50" />
      <div className="absolute top-20 right-0 w-96 h-96 bg-orange-200 rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-20 left-0 w-96 h-96 bg-green-200 rounded-full blur-3xl opacity-20" />
      
      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 mb-6 px-4 py-1.5 text-sm font-medium">
              {siteConfig.hero.badge}
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              <span className="gradient-text">{siteConfig.hero.title}</span>
            </h1>
            
            <p className="text-xl text-stone-600 mb-8 leading-relaxed">
              {siteConfig.hero.subtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8 py-6 text-lg animate-pulse-glow">
                  {siteConfig.hero.cta.text}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-orange-300 text-stone-700 hover:bg-orange-50 rounded-full px-8 py-6 text-lg">
                  {siteConfig.hero.secondaryCta.text}
                </Button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-12 flex items-center gap-6 text-sm text-stone-500">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Free 14-day trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>No credit card</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </motion.div>

          {/* Right visual */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            {/* Animated wheel */}
            <div className="relative w-96 h-96 mx-auto">
              <motion.div 
                className="absolute inset-0 rounded-full border-8 border-orange-200"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              <motion.div 
                className="absolute inset-4 rounded-full border-4 border-amber-300 bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center"
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              >
                <div className="text-center">
                  <div className="text-6xl mb-2">🍕</div>
                  <div className="text-2xl font-bold text-stone-700">Tacos!</div>
                </div>
              </motion.div>
              
              {/* Center button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.button 
                  className="w-24 h-24 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full shadow-xl flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Sparkles className="w-10 h-10 text-white" />
                </motion.button>
              </div>

              {/* Floating food emojis */}
              <motion.div 
                className="absolute -top-4 -right-4 text-4xl"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🥗
              </motion.div>
              <motion.div 
                className="absolute top-1/4 -left-8 text-3xl"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
              >
                🍔
              </motion.div>
              <motion.div 
                className="absolute -bottom-4 left-1/4 text-3xl"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, delay: 1 }}
              >
                🍜
              </motion.div>
              <motion.div 
                className="absolute bottom-8 -right-6 text-3xl"
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2.8, repeat: Infinity, delay: 1.5 }}
              >
                🥘
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="bg-green-100 text-green-700 hover:bg-green-200 mb-4 px-4 py-1.5 text-sm font-medium">
            Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-stone-800">
            Everything you need to plan meals
          </h2>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto">
            From spontaneous dinner decisions to organized weekly planning, we've got you covered.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {siteConfig.features.map((feature, index) => {
            const Icon = iconMap[feature.icon] || ChefHat
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full border-2 border-stone-100 hover:border-orange-200 hover:shadow-lg transition-all duration-300 bg-white">
                  <CardHeader>
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center mb-4">
                      <Icon className="w-7 h-7 text-orange-600" />
                    </div>
                    <CardTitle className="text-xl font-bold text-stone-800">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-stone-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-stone-50">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 mb-4 px-4 py-1.5 text-sm font-medium">
            Pricing
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-stone-800">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto">
            Start free and upgrade when you're ready. No hidden fees.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {siteConfig.pricing.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`h-full border-2 ${plan.popular ? 'border-orange-400 shadow-xl shadow-orange-100' : 'border-stone-200'} bg-white relative overflow-hidden`}>
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    POPULAR
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold text-stone-800">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-stone-500">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-stone-800">${plan.price}</span>
                    {plan.price > 0 && <span className="text-stone-500">/month</span>}
                  </div>
                  <ul className="space-y-3 text-left">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-stone-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className={`w-full rounded-full py-6 text-lg ${plan.popular ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-stone-800 hover:bg-stone-900 text-white'}`}
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FAQ() {
  const faqs = [
    {
      q: "How does the meal randomizer work?",
      a: "Our spin-the-wheel feature randomly selects from hundreds of recipes. You can customize categories (cuisine type, cooking time, difficulty) to narrow down choices."
    },
    {
      q: "Can I use my own recipes?",
      a: "Absolutely! You can add your family favorites to your personal recipe collection and include them in meal plans and the randomizer."
    },
    {
      q: "Does it work with dietary restrictions?",
      a: "Yes! You can set preferences for vegetarian, vegan, gluten-free, dairy-free, and many other dietary needs. We'll only show recipes that match."
    },
    {
      q: "Can I cancel anytime?",
      a: "Yes, you can cancel your subscription at any time. Your data will be saved for 30 days in case you decide to come back."
    },
  ]

  return (
    <section id="faq" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 mb-4 px-4 py-1.5 text-sm font-medium">
            FAQ
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-stone-800">
            Frequently asked questions
          </h2>
        </motion.div>

        <div className="max-w-2xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.q}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="border-2 border-stone-100 rounded-xl overflow-hidden"
            >
              <details className="group">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <span className="font-semibold text-stone-800 text-lg">{faq.q}</span>
                  <span className="ml-4 flex-shrink-0 transition-transform group-open:rotate-180">
                    <svg className="w-5 h-5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-stone-600 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTA() {
  return (
    <section className="py-24 bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      </div>
      
      <div className="container mx-auto px-4 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            {siteConfig.cta.title}
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            {siteConfig.cta.subtitle}
          </p>
          <Button size="lg" className="bg-white text-orange-600 hover:bg-stone-100 rounded-full px-10 py-6 text-xl font-semibold shadow-lg">
            {siteConfig.cta.button}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-400 rounded-xl flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">MealMash</span>
            </Link>
            <p className="text-stone-400 mb-6 max-w-sm">
              {siteConfig.footer.tagline}
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-3">
              {siteConfig.footer.links.slice(0, 3).map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="hover:text-orange-400 transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-3">
              {siteConfig.footer.links.slice(3).map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="hover:text-orange-400 transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-800 mt-12 pt-8 text-center text-stone-500 text-sm">
          © {new Date().getFullYear()} MealMash. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      <Hero />
      <Features />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  )
}
