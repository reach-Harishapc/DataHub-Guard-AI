"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, GitPullRequest, CheckCircle, Send, Hash, MessageSquare, X } from "lucide-react";
import LineageGraph from "@/components/LineageGraph";
import CodeDiff from "@/components/CodeDiff";
import { LogOut, ShieldAlert, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function IncidentDetail() {
  const router = useRouter();
  const { id } = useParams();
  const [incident, setIncident] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [diagnosing, setDiagnosing] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const fetchIncident = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/incidents/${id}`);
      if (res.ok) {
        const data = await res.json();
        setIncident(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncident();
  }, [id]);

  const handleDiagnose = async () => {
    setDiagnosing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/incidents/${id}/diagnose`, {
        method: "POST"
      });
      if (res.ok) {
        await fetchIncident();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setDiagnosing(false);
    }
  };

  const handleResolve = async () => {
    setResolving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/incidents/${id}/resolve`, {
        method: "POST"
      });
      if (res.ok) {
        await fetchIncident();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setResolving(false);
    }
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    setIsChatting(true);
    const newMessage = { role: "user", content: chatInput };
    setIncident((prev: any) => ({
      ...prev,
      chat_history: [...(prev.chat_history || []), newMessage]
    }));
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/incidents/${id}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: chatInput })
      });
      if (res.ok) {
        const data = await res.json();
        setIncident((prev: any) => ({
          ...prev,
          chat_history: data.history
        }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setChatInput("");
      setIsChatting(false);
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-slate-500" /></div>;
  }

  if (!incident) {
    return <div className="p-8 text-center text-slate-500">Incident not found</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      <header className="px-8 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")} className="text-slate-500 hover:text-slate-900">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2 border-l pl-4 border-slate-200">
            <ShieldAlert className="w-6 h-6 text-blue-600 dark:text-blue-500" />
            <span className="font-bold text-lg text-slate-900 dark:text-white">DataHub Guard AI</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-500">demo@datahubguard.ai</span>
          <Button variant="outline" size="sm" onClick={() => router.push("/")} className="gap-2">
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </div>
      </header>

      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        {incident.circuit_breaker_active && (
          <div className="bg-red-500 text-white p-4 rounded-lg shadow-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
            <ShieldAlert className="w-6 h-6 mt-0.5" />
            <div>
              <h3 className="font-bold text-lg">Circuit Breaker Triggered</h3>
              <p className="opacity-90 text-sm">Blast radius risk is extremely high ({incident.diagnosis?.blast_radius_risk_score}/10). All downstream Airflow and dbt jobs have been automatically paused to prevent data contamination.</p>
            </div>
          </div>
        )}

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              Incident {incident.id}
              <Badge variant={incident.status === "ACTIVE" ? "destructive" : "default"}>
                {incident.status}
              </Badge>
            </h1>
            <p className="text-slate-500 mt-2 font-mono text-sm">{incident.dataset_urn}</p>
          </div>
        <div className="flex gap-3">
          {!incident.pr_url && (
            <Button onClick={handleDiagnose} disabled={diagnosing || incident.status !== "ACTIVE"}>
              {diagnosing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GitPullRequest className="mr-2 h-4 w-4" />}
              Diagnose & Generate PR
            </Button>
          )}
          {incident.pr_url && incident.status === "ACTIVE" && (
            <Button onClick={handleResolve} variant="outline" disabled={resolving} className="bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100">
              {resolving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
              Sync & Resolve Incident
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lineage & Blast Radius</CardTitle>
              <CardDescription>Impacted downstream datasets based on real-time DataHub lineage.</CardDescription>
            </CardHeader>
            <CardContent>
              <LineageGraph 
                datasetUrn={incident.dataset_urn} 
                upstream={incident.upstream || []} 
                downstream={incident.downstream || []} 
              />
            </CardContent>
          </Card>

          {incident.diagnosis && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Diagnostic & Code Fix</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-slate-100 p-4 rounded-md text-sm text-slate-800">
                    <h4 className="font-semibold mb-2">Root Cause Analysis</h4>
                    <p>{incident.diagnosis.root_cause_analysis}</p>
                    {incident.diagnosis.self_healing_attempts && (
                      <div className="mt-3 text-sm font-medium bg-emerald-100 text-emerald-800 p-3 rounded-md flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Self-Healing CI Loop: Validated and fixed after {incident.diagnosis.self_healing_attempts} simulated dbt test attempts.
                      </div>
                    )}
                  </div>
                  <CodeDiff newCode={incident.diagnosis.code_fix || "No fix generated"} />
                {incident.pr_url && (
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-sm font-medium">Pull Request Created:</span>
                    <a href={incident.pr_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-sm font-mono">
                      {incident.pr_url}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="border-blue-200">
              <CardHeader className="bg-slate-50 border-b pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-slate-700">
                  <Hash className="w-4 h-4 text-pink-600" />
                  #data-eng-alerts (Slack Preview)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 bg-white text-sm space-y-3">
                <p>🚨 <strong>Critical Pipeline Incident</strong></p>
                <p><strong>Pipeline:</strong> {incident.pipeline_id}</p>
                <p><strong>Impact:</strong> {incident.diagnosis.blast_radius_risk_score}/10 Risk Score. {incident.impacted_assets} downstream tables affected.</p>
                <div className="border-l-4 border-red-500 pl-3 italic text-slate-600">
                  {incident.diagnosis.root_cause_analysis}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" onClick={handleResolve} disabled={resolving} className="bg-slate-100 h-7 text-xs">
                    {resolving ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
                    Approve & Merge PR
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleDiagnose} disabled={diagnosing} className="bg-slate-100 h-7 text-xs text-red-600 hover:text-red-700">
                    {diagnosing ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
                    Reject & Re-Diagnose
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          )}
          <Card>
            <CardHeader>
              <CardTitle>Error Context</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-red-50 text-red-800 p-3 rounded-md font-mono text-xs overflow-x-auto">
                {incident.error_message}
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Pipeline</span>
                  <span className="font-medium">{incident.pipeline_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Impact Score</span>
                  <span className="font-medium text-amber-600">{incident.diagnosis?.blast_radius_risk_score || "Pending"} / 10</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {incident.schema && incident.schema.fields && (
             <Card>
             <CardHeader>
               <CardTitle>Dataset Schema</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="space-y-2">
                 {incident.schema.fields.map((field: any, idx: number) => (
                   <div key={idx} className="flex justify-between text-xs p-2 bg-slate-50 rounded border border-slate-100">
                     <span className="font-mono">{field.fieldPath}</span>
                     <span className="text-slate-500">{field.type}</span>
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>
           )}
        </div>

        {/* Right Column: Agent Chat */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="flex flex-col h-[600px] shadow-sm sticky top-24">
            <CardHeader className="pb-3 border-b bg-blue-50/50">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                DataHub Guard AI
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {(!incident.chat_history || incident.chat_history.length === 0) ? (
                <div className="text-center text-slate-400 text-sm mt-10">
                  Ask me anything about this incident! Try: "Who owns the impacted dashboards?"
                </div>
              ) : (
                incident.chat_history.map((msg: any, i: number) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-3 rounded-lg max-w-[90%] text-sm shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
            <div className="p-3 border-t bg-white rounded-b-xl">
              <form onSubmit={handleChat} className="flex gap-2">
                <Input 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-1 text-sm h-9 bg-slate-50 focus-visible:ring-blue-500"
                  disabled={isChatting}
                />
                <Button type="submit" size="icon" className="h-9 w-9 bg-blue-600 hover:bg-blue-700 rounded-md" disabled={isChatting || !chatInput.trim()}>
                  {isChatting ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Send className="w-4 h-4 text-white" />}
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
    </div>
  );
};
