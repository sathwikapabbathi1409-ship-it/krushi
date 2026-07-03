import { createFileRoute, Link, Outlet, useNavigate, useParams } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, MessageSquareText, Trash2, Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createThread, deleteThread, listThreads } from "@/lib/chat.functions";

export const Route = createFileRoute("/_authenticated/assistant")({
  component: AssistantLayout;
});

function AssistantLayout() {
  const fetchThreads = useServerFn(listThreads);
  const newThread = useServerFn(createThread);
  const removeThread = useServerFn(deleteThread);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const params = useParams({ strict: false }) as { threadId?: string };

  const { data: threads = [], isLoading } = useQuery({
    queryKey: ["threads"],
    queryFn: () => fetchThreads(),
  });

  const createMut = useMutation({
    mutationFn: () => newThread(),
    onSuccess: (thread) => {
      queryClient.invalidateQueries({ queryKey: ["threads"] });
      navigate({ to: "/assistant/$threadId", params: { threadId: thread.id } });
    },
    onError: () => toast.error("Could not create a conversation."),
  });

  const deleteMut = useMutation({
    mutationFn: (threadId: string) => removeThread({ data: { threadId } }),
    onSuccess: (_res, threadId) => {
      queryClient.invalidateQueries({ queryKey: ["threads"] });
      if (params.threadId === threadId) navigate({ to: "/assistant" });
    },
    onError: () => toast.error("Could not delete conversation."),
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-4 px-4 py-6 sm:px-6">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col rounded-3xl border border-border/60 bg-card p-3 shadow-soft md:flex">
          <Button
            variant="hero"
            className="w-full"
            onClick={() => createMut.mutate()}
            disabled={createMut.isPending}
          >
            <Plus className="h-4 w-4" /> New chat
          </Button>
          <div className="mt-4 flex-1 space-y-1 overflow-y-auto">
            {isLoading && (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
            {!isLoading && threads.length === 0 && (
              <p className="px-2 py-4 text-center text-xs text-muted-foreground">
                No conversations yet.
              </p>
            )}
            {threads.map((t) => (
              <div
                key={t.id}
                className={`group flex items-center gap-1 rounded-lg pr-1 transition-colors ${
                  params.threadId === t.id ? "bg-secondary" : "hover:bg-secondary/60"
                }`}
              >
                <Link
                  to="/assistant/$threadId"
                  params={{ threadId: t.id }}
                  className="flex min-w-0 flex-1 items-center gap-2 px-2 py-2 text-sm"
                >
                  <MessageSquareText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{t.title}</span>
                </Link>
                <button
                  onClick={() => deleteMut.mutate(t.id)}
                  className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                  aria-label="Delete conversation"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </aside>

        {/* Chat area */}
        <div className="flex min-w-0 flex-1 flex-col rounded-3xl border border-border/60 bg-card shadow-soft">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
