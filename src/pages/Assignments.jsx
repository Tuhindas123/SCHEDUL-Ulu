import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { getSession, getStoredUser } from "@/lib/supabaseAuth";
import { usePreviewRole } from "@/contexts/PreviewRoleContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2, FileText, Send, PlusCircle, Calendar, Award, Clock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import AppShell from "@/components/layout/AppShell";

export default function Assignments() {
  const { effectiveRole } = usePreviewRole();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [submissionCounts, setSubmissionCounts] = useState({}); // { [assignmentId]: count }
  const [mySectionId, setMySectionId] = useState(null);

  useEffect(() => {
    loadData();
  }, [effectiveRole]);

  async function loadData() {
    setLoading(true);
    try {
      const sections = await api.getMySections();
      if (sections.length > 0) {
        setMySectionId(sections[0].id);
        const list = await api.listAssignments(sections[0].id);
        setAssignments(list);

        // Per-assignment submission counts, only needed for teacher/admin views
        if (effectiveRole === "teacher" || effectiveRole === "admin") {
          const countEntries = await Promise.all(
            list.map(async (asn) => {
              const subs = await api.getSubmissionsForAssignment(asn.id);
              return [asn.id, subs.length];
            })
          );
          setSubmissionCounts(Object.fromEntries(countEntries));
        }
      }
      if (effectiveRole === "student") {
        const subs = await api.getMySubmissions();
        setMySubmissions(subs);
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateAssignment(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      title: formData.get("title"),
      description: formData.get("description"),
      due_date: new Date(formData.get("due_date")).toISOString(),
      max_points: Number(formData.get("max_points")),
      section_id: mySectionId,
    };
    try {
      await api.createAssignment(data);
      toast({ title: "Success", description: "Assignment created successfully" });
      loadData();
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const session = await getSession();
    const currentUser = getStoredUser(session);
    if (!currentUser?.id) {
      toast({ variant: "destructive", title: "Error", description: "Could not determine your user session. Please sign in again." });
      return;
    }
    try {
      await api.submitAssignment(
        selectedAssignment.id,
        currentUser.id,
        formData.get("url"),
        formData.get("text")
      );
      toast({ title: "Submitted", description: "Your assignment has been turned in" });
      loadData();
      setSelectedAssignment(null);
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  }

  async function handleGrade(submissionId, grade, feedback) {
    const currentUser = getStoredUser();
    if (!currentUser?.id) {
      toast({ variant: "destructive", title: "Error", description: "Could not determine your user session. Please sign in again." });
      return;
    }
    try {
      await api.gradeSubmission(submissionId, grade, feedback, currentUser.id);
      toast({ title: "Graded", description: "Submission updated successfully" });
      loadData();
      if (selectedAssignment) {
        const updated = await api.getSubmissionsForAssignment(selectedAssignment.id);
        setSubmissions(updated);
        setSubmissionCounts(prev => ({ ...prev, [selectedAssignment.id]: updated.length }));
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  }

  if (loading) return (
    <AppShell>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    </AppShell>
  );

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-foreground tracking-tight">Assignments</h1>
            <p className="text-slate-500 dark:text-muted-foreground mt-1">Manage your academic tasks and submissions.</p>
          </div>
          {(effectiveRole === "teacher" || effectiveRole === "admin") && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-full gap-2 px-6">
                  <PlusCircle className="w-4 h-4" /> Create Assignment
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-3xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-slate-900 dark:text-foreground">New Assignment</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateAssignment} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-foreground/80">Title</Label>
                    <Input name="title" required placeholder="e.g. Midterm Case Study" className="rounded-xl border-slate-200 dark:border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-foreground/80">Description</Label>
                    <Textarea name="description" placeholder="Detailed requirements..." className="rounded-xl border-slate-200 dark:border-border" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-700 dark:text-foreground/80">Due Date</Label>
                      <Input name="due_date" type="datetime-local" required className="rounded-xl border-slate-200 dark:border-border" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 dark:text-foreground/80">Max Points</Label>
                      <Input name="max_points" type="number" defaultValue="100" className="rounded-xl border-slate-200 dark:border-border" />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-full py-6">Create</Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {effectiveRole === "student" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-bold text-slate-800 dark:text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Upcoming Assignments
              </h2>
              {assignments.length === 0 && (
                <div className="bg-white dark:bg-card border border-dashed border-slate-300 dark:border-border rounded-3xl p-12 text-center">
                  <p className="text-slate-400 dark:text-muted-foreground italic">No active assignments at the moment.</p>
                </div>
              )}
              <div className="space-y-3">
                {assignments.map(asn => (
                  <Card
                    key={asn.id}
                    className="border-slate-200 dark:border-border rounded-2xl hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => setSelectedAssignment(asn)}
                  >
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-900 transition-colors">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-foreground group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">{asn.title}</p>
                          <p className="text-xs text-slate-500 dark:text-muted-foreground mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Due {new Date(asn.due_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" className="rounded-full text-blue-600 dark:text-blue-400 font-bold text-xs hover:bg-blue-50 dark:hover:bg-blue-950">
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 dark:text-foreground flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" /> My Grades
              </h2>
              {mySubmissions.length === 0 && (
                <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-3xl p-8 text-center">
                  <p className="text-slate-400 dark:text-muted-foreground text-sm">Your grades will appear here.</p>
                </div>
              )}
              <div className="space-y-3">
                {mySubmissions.map(sub => (
                  <Card key={sub.id} className="border-slate-200 dark:border-border rounded-2xl overflow-hidden">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 dark:text-foreground truncate">{sub.assignments?.title}</p>
                        <p className="text-xs text-slate-500 dark:text-muted-foreground">Submitted {new Date(sub.submitted_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{sub.grade || "—"}</p>
                        <p className="text-[10px] text-slate-400 dark:text-muted-foreground uppercase font-bold">Grade</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {assignments.length === 0 ? (
              <div className="bg-white dark:bg-card border border-dashed border-slate-300 dark:border-border rounded-3xl p-12 text-center">
                <p className="text-slate-400 dark:text-muted-foreground italic">No assignments created yet. Click "Create Assignment" to add one.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignments.map(asn => (
                  <Card
                    key={asn.id}
                    className="border-slate-200 dark:border-border rounded-2xl hover:shadow-lg transition-all cursor-pointer group overflow-hidden"
                    onClick={() => {
                      setSelectedAssignment(asn);
                      api.getSubmissionsForAssignment(asn.id).then(setSubmissions);
                    }}
                  >
                    <div className="h-2 bg-blue-600 dark:bg-blue-500 w-full group-hover:bg-blue-700 dark:group-hover:bg-blue-400 transition-colors" />
                    <CardHeader className="p-5">
                      <CardTitle className="text-lg text-slate-900 dark:text-foreground group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">{asn.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1 dark:text-muted-foreground">
                        <Clock className="w-3 h-3" /> Due {new Date(asn.due_date).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="p-5 pt-0 flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 dark:text-muted-foreground uppercase tracking-wider">
                        {submissionCounts[asn.id] ?? 0} submissions
                      </span>
                      <Button variant="ghost" size="sm" className="rounded-full text-blue-600 dark:text-blue-400 font-bold">
                        Manage
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}

            {selectedAssignment && (
              <Card className="border-blue-100 dark:border-blue-900 rounded-3xl overflow-hidden shadow-sm bg-white dark:bg-card">
                <CardHeader className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-border p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-xl font-bold text-slate-900 dark:text-foreground">Grading: {selectedAssignment.title}</CardTitle>
                      <CardDescription className="text-slate-500 dark:text-muted-foreground mt-1">Section: {selectedAssignment.section_id}</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setSelectedAssignment(null)} className="rounded-full">Close</Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-slate-50/50 dark:bg-white/5">
                      <TableRow>
                        <TableHead className="pl-6 font-bold text-slate-700 dark:text-foreground">Student</TableHead>
                        <TableHead className="font-bold text-slate-700 dark:text-foreground">Submission</TableHead>
                        <TableHead className="font-bold text-slate-700 dark:text-foreground">Grade</TableHead>
                        <TableHead className="font-bold text-slate-700 dark:text-foreground">Feedback</TableHead>
                        <TableHead className="text-right pr-6 font-bold text-slate-700 dark:text-foreground">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.map(sub => (
                        <TableRow key={sub.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                          <TableCell className="pl-6 font-medium text-slate-900 dark:text-foreground">{sub.profiles?.full_name}</TableCell>
                          <TableCell>
                            <a href={sub.content_url} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline text-xs font-medium">View File</a>
                          </TableCell>
                          <TableCell>
                            <Input
                              className="w-20 h-9 rounded-xl border-slate-200 dark:border-border focus:ring-blue-500"
                              type="number"
                              defaultValue={sub.grade}
                              id={`grade-${sub.id}`}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              className="h-9 rounded-xl border-slate-200 dark:border-border focus:ring-blue-500"
                              defaultValue={sub.feedback}
                              id={`feedback-${sub.id}`}
                            />
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <Button
                              size="sm"
                              onClick={() => {
                                const g = document.getElementById(`grade-${sub.id}`).value;
                                const f = document.getElementById(`feedback-${sub.id}`).value;
                                handleGrade(sub.id, g, f);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-full px-4"
                            >
                              Save
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {effectiveRole === "student" && selectedAssignment && (
          <Dialog open={!!selectedAssignment} onOpenChange={() => setSelectedAssignment(null)}>
            <DialogContent className="rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900 dark:text-foreground">Submit {selectedAssignment.title}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-foreground/80">Submission Link (Google Drive/Dropbox)</Label>
                  <Input name="url" required placeholder="https://..." className="rounded-xl border-slate-200 dark:border-border" />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-foreground/80">Additional Notes</Label>
                  <Textarea name="text" placeholder="Any comments for the teacher..." className="rounded-xl border-slate-200 dark:border-border" />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-full py-6 gap-2">
                  <Send className="w-4 h-4" /> Submit Assignment
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AppShell>
  );
}