"use client";

import Link from "next/link";
import { ShieldAlert, GitBranch, ArrowRight, Activity, Cpu, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const SLIDES = [
  {
    title: "Autonomous Incident Triage & Lineage Blast-Radius Engine",
    description: "Stop pipeline failures before they spread. DataHub Guard AI automatically detects data anomalies, analyzes downstream blast radius using the metadata graph, and generates actionable GitHub PRs using advanced LLMs."
  },
  {
    title: "Self-Healing CI/CD Data Pipelines",
    description: "Our AI doesn't just guess fixes—it validates them. Using an autonomous dbt compilation loop, DataHub Guard AI writes code, tests it, and iterates until the build turns green."
  },
  {
    title: "Human-in-the-Loop Slack ChatOps",
    description: "Keep your data engineers in control. The agent streams rich blast-radius alerts directly into Slack with one-click 'Approve & Merge' or 'Reject & Re-Diagnose' buttons."
  }
];

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col font-sans">
      <header className="px-8 py-6 flex items-center justify-between border-b border-white/10 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-8 h-8 text-blue-500" />
          <span className="text-xl font-bold tracking-tight">DataHub Guard AI</span>
        </div>
        <Link href="/login">
          <Button variant="default" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20">
            Demo Sign In
          </Button>
        </Link>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-8 py-32 flex flex-col items-center text-center relative overflow-hidden min-h-[600px]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="relative w-full max-w-4xl mx-auto h-[350px] md:h-[300px] flex flex-col items-center justify-center z-10 mt-8">
            <Button variant="ghost" size="icon" onClick={prevSlide} className="absolute left-0 lg:-left-16 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 rounded-full h-12 w-12 hidden md:flex">
              <ChevronLeft className="w-8 h-8" />
            </Button>

            <div className="w-full transition-opacity duration-500 ease-in-out">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent min-h-[160px] md:min-h-[120px] flex items-center justify-center">
                {SLIDES[currentSlide].title}
              </h1>
              
              <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto min-h-[80px]">
                {SLIDES[currentSlide].description}
              </p>
            </div>

            <Button variant="ghost" size="icon" onClick={nextSlide} className="absolute right-0 lg:-right-16 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 rounded-full h-12 w-12 hidden md:flex">
              <ChevronRight className="w-8 h-8" />
            </Button>
          </div>

          <div className="flex gap-2 mb-10 mt-12 z-10">
            {SLIDES.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${idx === currentSlide ? 'w-8 bg-blue-500' : 'w-2 bg-slate-700'}`}
                onClick={() => setCurrentSlide(idx)}
              />
            ))}
          </div>
          
          <div className="flex gap-4 z-10">
            <Link href="/login">
              <Button size="lg" className="bg-white text-slate-950 hover:bg-slate-200 h-14 px-8 text-lg rounded-full shadow-xl">
                Try the Demo <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-8 bg-slate-900/50 border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Autonomous Capabilities</h2>
              <p className="text-slate-400">Everything you need to maintain pristine data reliability.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<Activity className="w-10 h-10 text-rose-500" />}
                title="Real-Time Triage"
                description="Instantly ingests alerts from Airflow, dbt, or Snowflake and correlates them with your DataHub metadata."
              />
              <FeatureCard 
                icon={<GitBranch className="w-10 h-10 text-amber-500" />}
                title="Blast Radius Engine"
                description="Traverses the DataHub lineage graph to identify exactly which downstream dashboards and ML models are impacted."
              />
              <FeatureCard 
                icon={<Cpu className="w-10 h-10 text-emerald-500" />}
                title="AI Code Fixes"
                description="Uses LLMs to analyze schema changes and failed queries, automatically generating fixing PRs via GitHub."
              />
            </div>
          </div>
        </section>
      </main>
      
      <footer className="py-8 text-center border-t border-white/10 text-slate-500 text-sm flex flex-col items-center justify-center gap-4">
        <p>Built for the DataHub Agent Hackathon.</p>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-slate-900 border border-white/5 hover:border-white/10 transition-colors">
      <div className="mb-6 p-4 rounded-full bg-slate-950 inline-block">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium border ${className}`}>
      {children}
    </span>
  );
}
