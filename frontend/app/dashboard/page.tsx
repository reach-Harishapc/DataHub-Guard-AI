"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, GitPullRequest, AlertTriangle, LogOut, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<any[]>([]);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/incidents`);
        const data = await res.json();
        setIncidents(data);
      } catch (error) {
        console.error("Failed to fetch incidents", error);
      }
    };
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const activeCount = incidents.filter(i => i.status === "ACTIVE").length;
  const impactedCount = incidents.reduce((acc, curr) => acc + (curr.impacted_assets || 0), 0);
  const prCount = incidents.filter(i => i.pr_url).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      <header className="px-8 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-blue-600 dark:text-blue-500" />
          <span className="font-bold text-lg text-slate-900 dark:text-white">DataHub Guard AI</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-500">demo@datahubguard.ai</span>
          <Button variant="outline" size="sm" onClick={() => router.push("/")} className="gap-2">
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </div>
      </header>

      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-500 mt-2">Autonomous Incident Triage & Lineage Blast-Radius Engine</p>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/50 backdrop-blur-sm border-red-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Active Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{activeCount}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/50 backdrop-blur-sm shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Impacted Downstream Assets</CardTitle>
            <Activity className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{impactedCount}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/50 backdrop-blur-sm shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Active GitHub PRs</CardTitle>
            <GitPullRequest className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{prCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle>Real-Time Incident Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Dataset URN</TableHead>
                <TableHead>Pipeline ID</TableHead>
                <TableHead>Impact (Blast Radius)</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                    No active incidents. Systems operating normally.
                  </TableCell>
                </TableRow>
              ) : (
                incidents.map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell>
                      <Badge variant={incident.status === "ACTIVE" ? "destructive" : "outline"}>
                        {incident.status}
                      </Badge>
                      {incident.circuit_breaker_active && (
                        <Badge variant="outline" className="ml-2 bg-red-100 text-red-800 border-red-200">Paused</Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs max-w-[200px] truncate" title={incident.dataset_urn}>
                      {incident.dataset_urn}
                    </TableCell>
                    <TableCell>{incident.pipeline_id}</TableCell>
                    <TableCell>
                      <span className="font-bold text-amber-600">{incident.impacted_assets}</span> downstream tables
                    </TableCell>
                    <TableCell>
                      <Link href={`/incidents/${incident.id}`}>
                        <Button variant="secondary" size="sm">Triage & Fix</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
    </div>
  );
}
