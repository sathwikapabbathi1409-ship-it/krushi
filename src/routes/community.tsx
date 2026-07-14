import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, MessageCircle, Plus, Send, Trash2, Users } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/lib/use-auth";
import {
  addComment,
  createPost,
  deletePost,
  listComments,
  listPosts,
} from "@/lib/community.functions";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community — KRUSHI" },
      {
        name: "description",
        content:
          "A discussion forum for Indian farmers — organic farming, cotton, rice, wheat, vegetables and machinery.",
      },
      { property: "og:title", content: "Farmer Community — KRUSHI" },
      {
        property: "og:description",
        content: "Ask questions, share tips and connect with fellow farmers across India.",
      },
    ],
  }),
  component: CommunityPage,
});

interface Post {
  id: string;
  user_id: string;
  title: string;
  body: string;
  tags: string[];
  created_at: string;
}

interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  body: string;
  created_at: string;
}

function CommunityPage() {
  const { user, loading: authLoading } = useAuth();
  const fetchPosts = useServerFn(listPosts);
  const del = useServerFn(deletePost);

  const [posts, setPosts] = useState<Post[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function refresh() {
    if (!user) {
      setPosts([]);
      return;
    }
    setLoading(true);
    try {
      const rows = await fetchPosts();
      setPosts(rows as Post[]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load posts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authLoading) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.id]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this post?")) return;
    try {
      await del({ data: { id } });
      setPosts((cur) => cur?.filter((p) => p.id !== id) ?? null);
      toast.success("Post deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl gradient-hero text-primary-foreground">
              <Users className="h-6 w-6" />
            </span>
            <div>
              <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Farmer Community</h1>
              <p className="mt-1 text-muted-foreground">
                Ask questions, share what worked in your field, and learn from fellow farmers.
              </p>
            </div>
          </div>
          {user && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="hero">
                  <Plus className="mr-2 h-4 w-4" /> New post
                </Button>
              </DialogTrigger>
              <NewPostDialog
                onCreated={(p) => {
                  setPosts((cur) => [p, ...(cur ?? [])]);
                  setOpen(false);
                }}
              />
            </Dialog>
          )}
        </div>

        {authLoading || loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading posts…
          </div>
        ) : !user ? (
          <div className="rounded-2xl border bg-card p-10 text-center shadow-soft">
            <h2 className="font-display text-xl font-bold">Sign in required</h2>
            <p className="mt-2 text-muted-foreground">Please sign in to join the discussion.</p>
            <div className="mt-4 flex justify-center gap-2">
              <Button asChild><Link to="/auth">Sign in</Link></Button>
              <Button variant="outline" asChild>
                <Link to="/auth" search={{ mode: "signup" }}>Create account</Link>
              </Button>
            </div>
          </div>
        ) : (posts?.length ?? 0) === 0 ? (
          <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
            No posts yet. Start the first conversation!
          </div>
        ) : (
          <div className="space-y-4">
            {posts!.map((p) => (
              <Card key={p.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{p.title}</CardTitle>
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
                    <span>{new Date(p.created_at).toLocaleDateString()}</span>
                    {p.tags.map((t) => (
                      <Badge key={t} variant="secondary">#{t}</Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="whitespace-pre-wrap text-sm text-foreground/90">{p.body}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setExpandedId((cur) => (cur === p.id ? null : p.id))}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      {expandedId === p.id ? "Hide comments" : "Comments"}
                    </Button>
                    {p.user_id === user.id && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(p.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </Button>
                    )}
                  </div>
                  {expandedId === p.id && <CommentsThread postId={p.id} userId={user.id} />}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}

function NewPostDialog({ onCreated }: { onCreated: (p: Post) => void }) {
  const create = useServerFn(createPost);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", tags: "" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const tags = form.tags
        .split(",")
        .map((t) => t.trim().replace(/^#/, ""))
        .filter(Boolean)
        .slice(0, 6);
      const row = await create({ data: { title: form.title, body: form.body, tags } });
      toast.success("Post published");
      onCreated(row as Post);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to publish");
    } finally {
      setSaving(false);
    }
  }

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Start a new discussion</DialogTitle>
      </DialogHeader>
      <form onSubmit={submit} className="grid gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="What would you like to discuss?" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="body">Details</Label>
          <Textarea id="body" required rows={6} value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input id="tags" value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} placeholder="rice, pests, organic" />
        </div>
        <DialogFooter>
          <Button type="submit" variant="hero" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Publish
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function CommentsThread({ postId, userId }: { postId: string; userId: string }) {
  const fetchComments = useServerFn(listComments);
  const add = useServerFn(addComment);
  const [items, setItems] = useState<Comment[] | null>(null);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const rows = await fetchComments({ data: { postId } });
        setItems(rows as Comment[]);
      } catch {
        setItems([]);
      }
    })();
  }, [fetchComments, postId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setPosting(true);
    try {
      const row = await add({ data: { postId, body: text.trim() } });
      setItems((cur) => [...(cur ?? []), row as Comment]);
      setText("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to comment");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="mt-3 space-y-3 border-t pt-3">
      {items === null ? (
        <div className="text-sm text-muted-foreground">Loading comments…</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-muted-foreground">No comments yet.</div>
      ) : (
        <ul className="space-y-2">
          {items.map((c) => (
            <li key={c.id} className="rounded-lg bg-secondary/60 px-3 py-2 text-sm">
              <p className="whitespace-pre-wrap">{c.body}</p>
              <div className="mt-1 text-xs text-muted-foreground">
                {c.user_id === userId ? "You" : "Farmer"} · {new Date(c.created_at).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={submit} className="flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment…"
        />
        <Button type="submit" size="icon" disabled={posting || !text.trim()}>
          {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
}
