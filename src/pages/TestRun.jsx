import React, { useState } from "react";
import { api } from "@/api/apiClient";
import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function TestRun() {
  const { toast } = useToast();
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  async function runTest(testName, fn) {
    setLoading(true);
    try {
      const result = await fn();
      setResults((prev) => {
        const newResults = { ...prev };
        newResults[testName] = { status: "success", data: result };
        return newResults;
      });
      toast({ title: "Test Passed", description: testName + " worked correctly!" });
    } catch (e) {
      setResults((prev) => {
        const newResults = { ...prev };
        newResults[testName] = { status: "error", error: e.message };
        return newResults;
      });
      toast({ variant: "destructive", title: "Test Failed", description: e.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">System Test Suite</h1>
          <p className="text-slate-500">Verify all ERP functions are connected to Supabase.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-slate-200 rounded-3xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" /> Core Infrastructure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <TestButton 
                label="Test Profile Fetch" 
                onClick={() => runTest("Profile", () => api.getMyProfile())} 
                result={results["Profile"]} 
              />
              <TestButton 
                label="Test Section Fetch" 
                onClick={() => runTest("Sections", () => api.getMySections())} 
                result={results["Sections"]} 
              />
              <TestButton 
                label="Test Notification Fetch" 
                onClick={() => runTest("Notifications", () => api.getNotifications())} 
                result={results["Notifications"]} 
              />
            </CardContent>
          </Card>

          <Card className="border-slate-200 rounded-3xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" /> Academic Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <TestButton 
                label="Test Assignment List" 
                onClick={async () => {
                  const s = await api.getMySections();
                  if (s && s.length > 0) return api.listAssignments(s[0].id);
                  throw new Error("No sections found.");
                }} 
                result={results["Assignments"]} 
              />
              <TestButton 
                label="Test Material Fetch" 
                onClick={async () => {
                  const s = await api.getMySections();
                  if (s && s.length > 0) return api.listMaterials(s[0].id);
                  throw new Error("No sections found.");
                }} 
                result={results["Materials"]} 
              />
              <TestButton 
                label="Test Leave Fetch" 
                onClick={() => runTest("Leave", () => api.getMyLeaveRequests())} 
                result={results["Leave"]} 
              />
            </CardContent>
          </Card>
        </div>

        {loading && <div className="flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>}
      </div>
    </AppShell>
  );
}

function TestButton({ label, onClick, result }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="flex items-center gap-3">
        {result && result.status === "success" && <CheckCircle2 className="w-4 h-4 text-green-500" />}
        {result && result.status === "error" && <XCircle className="w-4 h-4 text-rose-500" />}
        <Button size="sm" onClick={onClick} className="rounded-full h-8 px-3 text-xs bg-white border border-slate-200 hover:bg-slate-100">
          Run
        </Button>
      </div>
    </div>
  );
}
