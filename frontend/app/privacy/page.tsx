import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
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
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <div className="space-y-6 text-slate-300">
          <p>Last updated: July 2026</p>
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-white">1. Information We Collect</h2>
            <p>We only collect metadata required to perform lineage blast-radius calculations and AI diagnostics. This includes dataset schemas, execution logs, and DataHub graph entities.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-white">2. How We Use Your Data</h2>
            <p>Your metadata is securely processed using advanced Large Language Models (LLMs) to automatically generate GitHub pull requests. We do not use your proprietary pipeline data to train our foundational models.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-white">3. Data Security</h2>
            <p>We implement strict access controls and encrypt all DataHub communications in transit.</p>
          </section>
        </div>
      </main>
      
      <footer className="py-8 text-center border-t border-white/10 text-slate-500 text-sm">
        <p>Built for the DataHub Agent Hackathon.</p>
      </footer>
    </div>
  );
}
