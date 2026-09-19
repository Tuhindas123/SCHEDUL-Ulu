import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import AppShell from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2, FileText, Download, Trash2, Link as LinkIcon, PlusCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function Materials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sectionId, setSectionId] = useState(null);
  const { toast } = useToast();

  useEffect(() => { loadMaterials(); }, []);

  async function loadMaterials() {
    setLoading(true);
    try {
      const sections = await api.getMySections();
      if (sections.length > 0) {
        const id = sections[0].id;
        setSectionId(id);
        const data = await api.listMaterials(id);
        setMaterials(data);
      }
    } catch (e) { toast({ variant: "destructive", title: "Error", description: e.message }); }
    finally { setLoading(false); }
  }

  async function handleUpload(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await api.createMaterial({
        section_id: sectionId,
        title: formData.get("title"),
        url: formData.get("url"),
        type: formData.get("type"),
      });
      toast({ title: "Uploaded", description: "Material added successfully" });
      loadMaterials();
    } catch (e) { toast({ variant: "destructive", title: "Error", description: e.message }); }
  }

  async function handleDelete(id) {
    try {
      await api.deleteMaterial(id);
      toast({ title: "Deleted", description: "Material removed" });
      loadMaterials();
    } catch (e) { toast({ variant: "destructive", title: "Error", description: e.message }); }
  }

  if (loading) return <AppShell><div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" /></div></AppShell>;

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-foreground tracking-tight">Study Materials</h1>
            <p className="text-slate-500 dark:text-muted-foreground mt-1">Access course resources and lecture notes.</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-full gap-2 px-6">
                <PlusCircle className="w-4 h-4" /> Upload Material
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl">
              <DialogHeader><DialogTitle className="text-xl font-bold text-slate-900 dark:text-foreground">Add Resource</DialogTitle></DialogHeader>
              <form onSubmit={handleUpload} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="dark:text-foreground/80">Title</Label>
                  <Input name="title" required placeholder="e.g. Week 1 Lecture Notes" className="rounded-xl dark:border-border" />
                </div>
                <div className="space-y-2">
                  <Label className="dark:text-foreground/80">Resource URL</Label>
                  <Input name="url" required placeholder="https://..." className="rounded-xl dark:border-border" />
                </div>
                <div className="space-y-2">
                  <Label className="dark:text-foreground/80">Type</Label>
                  <select name="type" className="w-full rounded-xl border border-slate-200 dark:border-border dark:bg-background dark:text-foreground px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="pdf">PDF Document</option>
                    <option value="link">Web Link</option>
                    <option value="video">Video</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <Button type="submit" className="w-full bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-full py-6">Upload</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.length === 0 ? (
            <p className="col-span-full text-center text-slate-400 dark:text-muted-foreground italic py-20">No materials available yet.</p>
          ) : (
            materials.map(m => (
              <Card key={m.id} className="border-slate-200 dark:border-border rounded-2xl hover:shadow-md transition-all group">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      {m.type === 'pdf' ? <FileText className="w-5 h-5" /> : <LinkIcon className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-foreground truncate">{m.title}</p>
                      <p className="text-xs text-slate-500 dark:text-muted-foreground uppercase font-bold">{m.type}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a href={m.url} target="_blank" rel="noreferrer" className="p-2 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-muted-foreground hover:bg-blue-100 dark:hover:bg-blue-950 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      <Download className="w-4 h-4" />
                    </a>
                    <button onClick={() => handleDelete(m.id)} className="p-2 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-muted-foreground hover:bg-rose-100 dark:hover:bg-rose-950 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}