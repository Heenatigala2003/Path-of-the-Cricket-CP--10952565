import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import "./globals.css"
import Header from "./components/Header"
import Footer from "./components/Footer"
import { createClient } from '@supabase/supabase-js'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Path of Cricket AI Assistant',
  description: 'AI-powered cricket talent assistant',
}


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-black antialiased`}>
    
        <Header />

       
        <main className="min-h-screen">{children}</main>

        <Footer />
      </body>
    </html>
  )
}
