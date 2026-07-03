import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, MessageSquareText } from "lucide-react";
import { createThread, listThreads } from "@/lib/chat.functions";

export const Route = createFileRoute("/_authenticated/assistant/")({
  component: AssistantIndex,
});

function AssistantIndex() {
  const navigate = useNavigate();
  const fetchThreads = useServerFn(listThreads);
  const newThread = useServerFn(createThread);
  const queryClient = useQueryClient();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const threads = await fetchThreads();
      if (cancelled) return;
      if (threads.length > 0) {
        navigate({
          to: "/assistant/$threadId",
          params: { threadId: threads[0].id },
          replace: true,
        });
      } else {
        const thread = await newThread();
        queryClient.invalidateQueries({ queryKey: ["threads"] });
        if (!cancelled) {
          navigate({
            to: "/assistant/$threadId",
            params: { threadId: thread.id },
            replace: true,
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchThreads, newThread, navigate, queryClient]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-10 text-muted-foreground">
      <MessageSquareText className="h-8 w-8" />
      <Loader2 className="h-5 w-5 animate-spin" />
      <p className="text-sm">Opening your assistant…</p>
    </div>
  );
}
