"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getUser, isUserAdmin } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Carrot, Users, Settings } from "lucide-react"

import MobileNav from "@/components/mobile-nav"

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAdmin() {
      const currentUser = await getUser()
      
      if (!currentUser) {
        router.push("/login")
        return
      }
      
      setUser(currentUser)
      
      const admin = await isUserAdmin(currentUser.id)
      setIsAdmin(admin)
      
      if (!admin) {
        router.push("/dashboard")
        return
      }
      
      setLoading(false)
    }
    
    checkAdmin()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const adminTools = [
    {
      title: "Recipes",
      description: "View and manage all recipes in the system",
      icon: BookOpen,
      href: "/admin/recipes",
      color: "bg-orange-500",
    },
    {
      title: "Ingredients",
      description: "Manage the global ingredient library",
      icon: Carrot,
      href: "/admin/ingredients",
      color: "bg-green-500",
    },
  ]

  return (
    <div className="min-h-screen bg-background pb-safe">
      
      <MobileNav />

      <main className="container mx-auto px-4 py-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Admin Dashboard</h2>
          <p className="text-muted-foreground">Manage your MealMash content</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {adminTools.map((tool) => (
            <Card 
              key={tool.href} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(tool.href)}
            >
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className={`p-3 rounded-lg ${tool.color}`}>
                  <tool.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">{tool.title}</CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Manage {tool.title} →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
