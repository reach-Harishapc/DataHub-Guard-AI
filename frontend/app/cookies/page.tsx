import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col font-sans">
      <header className="px-8 py-6 flex items-center justify-between border-b border-white/10 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:text-blue-400 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-blue-500" />
            <span className="text-xl font-bold tracking-tight">DataHub Guard AI</span>
          </div>
        </div>
      </header>
      
      <main className="flex-1 max-w-4xl mx-auto px-8 py-16 w-full">
        <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
        <div className="space-y-6 text-slate-300">
          <p>Last updated: July 2026</p>
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-white">What Are Cookies</h2>
            <p>We use strictly necessary cookies to ensure the basic functionality of the DataHub Guard AI dashboard.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-white">How We Use Cookies</h2>
            <p>Our application uses secure, HttpOnly session cookies to authenticate you with your DataHub backend instance and to retain the state of your interactive chat sessions.</p>
          </section>
        </div>
      </main>
      
      <footer className="py-8 text-center border-t border-white/10 text-slate-500 text-sm">
        <p>Built for the DataHub Agent Hackathon.</p>
      </footer>
    </div>
  );
}
