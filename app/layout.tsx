import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Next.js Todo (Auth)',
  description: 'Todo app with email/password auth using Next.js App Router + SQLite',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container py-8">
          <header className="mb-8 flex items-center justify-between">
            <div>
              <Link href="/"><h1 className="text-3xl font-bold">✅ Next.js Todo</h1></Link>
              <p className="text-gray-600">SQLite + API Routes + Auth</p>
            </div>
            <nav className="flex gap-3 text-sm">
              <Link className="btn-outline" href="/login">Log in</Link>
              <Link className="btn-primary" href="/signup">Sign up</Link>
            </nav>
          </header>
          {children}
          <footer className="mt-12 text-center text-sm text-gray-500">
            Built with Next.js 14, SQLite, Tailwind
          </footer>
        </div>
      </body>
    </html>
  )
}
