import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import AppShell from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2, ClipboardList, Send, CheckCircle, XCircle, Clock, PlusCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function Leave() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => { loadRequests(); }, []);

  async function loadRequests() {
    setLoading(true);
    try {
      const data = await api.getMyLeaveRequests();
      setRequests(data);
    } catch (e) { toast({ variant: "destructive", title: "Error", description: e.message }); }
    finally { setLoading(false); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await api.createLeaveRequest({
        start_date: formData.get("start"),
        end_date: formData.get("end"),
        reason: formData.get("reason"),
      });
      toast({ title: "Requested", description: "Your leave request has been sent." });
      loadRequests();
    } catch (e) { toast({ variant: "destructive", title: "Error", description: e.message }); }
  }

  if (loading) return <AppShell><div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" /></div></AppShell>;

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-foreground tracking-tight">Leave Requests</h1>
            <p className="text-slate-500 dark:text-muted-foreground mt-1">Submit and track your absence requests.</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-full gap-2 px-6">
                <PlusCircle className="w-4 h-4" /> Request Leave
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl">
              <DialogHeader><DialogTitle className="text-xl font-bold text-slate-900 dark:text-foreground">New Leave Request</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="dark:text-foreground/80">Start Date</Label>
                    <Input name="start" type="date" required className="rounded-xl dark:border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label className="dark:text-foreground/80">End Date</Label>
                    <Input name="end" type="date" required className="rounded-xl dark:border-border" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="dark:text-foreground/80">Reason</Label>
                  <Textarea name="reason" required placeholder="Please provide a reason for your leave..." className="rounded-xl dark:border-border" />
                </div>
                <Button type="submit" className="w-full bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-full py-6 gap-2">
                  <Send className="w-4 h-4" /> Submit Request
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {requests.length === 0 ? (
            <p className="col-span-full text-center text-slate-400 dark:text-muted-foreground italic py-20">No leave requests found.</p>
          ) : (
            requests.map(req => (
              <Card key={req.id} className="border-slate-200 dark:border-border rounded-2xl overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      {req.status === 'approved' && <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />}
                      {req.status === 'rejected' && <XCircle className="w-4 h-4 text-rose-500 dark:text-rose-400" />}
                      {req.status === 'pending' && <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" />}
                      <span className={`text-xs font-bold uppercase ${
                        req.status === 'approved' ? 'text-green-600 dark:text-green-400' :
                        req.status === 'rejected' ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-muted-foreground">{req.created_at?.split('T')[0]}</span>
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-foreground mb-1">{req.reason}</p>
                  <p className="text-xs text-slate-500 dark:text-muted-foreground">
                    {req.start_date} to {req.end_date}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}