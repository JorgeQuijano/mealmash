import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "react-hot-toast";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MealClaw - Never Wonder What's for Dinner",
  description: "Spin the wheel, discover new recipes, and simplify your meal planning with MealClaw. Perfect for home cooks who want meal inspiration in seconds.",
  metadataBase: new URL('https://mealclaw.com'),
  icons: {
    icon: [
      { url: "/favicon.ico", rel: "icon", type: "image/x-icon" },
    ],
    apple: [
      { url: "/favicon.ico", rel: "apple-touch-icon" },
    ],
  },
  openGraph: {
    title: "MealClaw - Never Wonder What's for Dinner",
    description: "Spin the wheel, discover new recipes, and simplify your meal planning with MealClaw.",
    url: "https://mealclaw.com",
    siteName: "MealClaw",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://mealclaw.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "MealClaw - Meal Planning Made Easy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MealClaw - Never Wonder What's for Dinner",
    description: "Spin the wheel, discover new recipes, and simplify your meal planning.",
    images: ["https://mealclaw.com/og-image.png"],
  },
  other: {
    "fb:app_id": "1234567890",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-center" />
        </ThemeProvider>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-H2M8CTS3ZY"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-H2M8CTS3ZY');
          `}
        </Script>
      </body>
    </html>
  );
}
