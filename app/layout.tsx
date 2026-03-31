import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk, Cormorant_Garamond } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ClerkProvider } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/context/theme-context"
import { cn } from "@/lib/utils"
import { RespectNotification } from "@/components/notifications/respect-notification"
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
});

export const metadata: Metadata = {
  title: 'Mantoric - Knowledge Portal',
  description: 'Mantoric - a minimalist knowledge portal and forum',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/M.jpg',
        type: 'image/jpeg',
      },
    ],
    apple: '/M.jpg',
  },
}

export const viewport: Viewport = {
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#9333ea",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={cn(inter.variable, "min-h-screen font-sans antialiased bg-black")}>
          <ThemeProvider>
            {children}
            <RespectNotification />
            <Toaster position="top-right" richColors />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
