import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import { Send, Loader2, Sparkles, Mic, Volume2, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getThreadMessages, sendMessage } from "@/lib/chat.functions";

export const Route = createFileRoute("/_authenticated/assistant/$threadId")({
  component: ChatWindow,
});

interface Msg {
  id: string;
  role: string;
  content: string;
  created_at?: string;
}

const SUGGESTIONS = [
  "What fertilizer should I use for cotton?",
  "When should I irrigate my wheat crop?",
  "My cotton leaves turned yellow — what's wrong?",
  "How do I improve black soil for vegetables?",
];

// Minimal Web Speech typings
type SpeechRecognitionInstance = {
  lang: string;
  interimResults: boolean;
  onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
  onerror: () => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
};

function ChatWindow() {
  const { threadId } = Route.useParams();
  const fetchMessages = useServerFn(getThreadMessages);
  const send = useServerFn(sendMessage);
  const queryClient = useQueryClient();

  const [input, setInput] = useState("");
  const [pending, setPending] = useState<Msg[]>([]);
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const { data: saved = [], isLoading } = useQuery({
    queryKey: ["messages", threadId],
    queryFn: () => fetchMessages({ data: { threadId } }),
  });

  const messages: Msg[] = [...saved, ...pending];

  useEffect(() => {
    setPending([]);
  }, [threadId, saved.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, sending]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [threadId]);

  async function handleSend(text: string) {
    const content = text.trim();
    if (!content || sending) return;
    setInput("");
    setSending(true);
    setPending([{ id: `tmp-${Date.now()}`, role: "user", content }]);
    try {
      const res = await send({ data: { threadId, content } });
      if ("error" in res) {
        if (res.error === "RATE_LIMIT") toast.error("Too many requests. Please wait a moment.");
        else if (res.error === "CREDITS_EXHAUSTED")
          toast.error("AI credits exhausted. Please add credits to continue.");
        else toast.error("The assistant could not reply. Try again.");
        setPending([]);
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ["messages", threadId] });
      await queryClient.invalidateQueries({ queryKey: ["threads"] });
    } catch {
      toast.error("Something went wrong. Please try again.");
      setPending([]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function toggleVoiceInput() {
    const SR =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance })
        .webkitSpeechRecognition;
    if (!SR) return toast.error("Voice input isn't supported on this browser.");
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const rec = new SR();
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput((prev) => (prev ? prev + " " : "") + transcript);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  }

  function speak(text: string) {
    if (!("speechSynthesis" in window)) return toast.error("Voice output not supported.");
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text.replace(/[#*`_>-]/g, ""));
    utter.lang = "en-IN";
    window.speechSynthesis.speak(utter);
  }

  const showEmpty = !isLoading && messages.length === 0;

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
        {isLoading && (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {showEmpty && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-hero text-primary-foreground">
              <Sparkles className="h-7 w-7" />
            </span>
            <h2 className="mt-4 text-2xl font-bold">Ask your farming question</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Get expert advice on crops, fertilizer, irrigation, pests and more.
            </p>
            <div className="mt-6 grid w-full max-w-lg gap-2 sm:grid-cols-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="rounded-2xl border border-border/60 bg-secondary/40 p-3 text-left text-sm transition-colors hover:border-primary hover:bg-secondary"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                m.role === "user"
                  ? "bg-accent/20 text-accent-foreground"
                  : "gradient-hero text-primary-foreground"
              }`}
            >
              {m.role === "user" ? "You" : <Leaf className="h-4 w-4" />}
            </span>
            <div
              className={`group max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground"
              }`}
            >
              {m.role === "user" ? (
                <p className="whitespace-pre-wrap">{m.content}</p>
              ) : (
                <>
                  <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1.5 prose-ul:my-1.5 prose-headings:mt-2">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                  </div>
                  <button
                    onClick={() => speak(m.content)}
                    className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                  >
                    <Volume2 className="h-3.5 w-3.5" /> Listen
                  </button>
                </>
              )}
            </div>
          </div>
        ))}

        {sending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg gradient-hero text-primary-foreground">
              <Leaf className="h-4 w-4" />
            </span>
            <div className="flex items-center gap-1 rounded-2xl bg-secondary px-4 py-3">
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-border/60 p-3 sm:p-4">
        <div className="flex items-end gap-2">
          <Button
            variant={listening ? "hero" : "outline"}
            size="icon"
            onClick={toggleVoiceInput}
            aria-label="Voice input"
          >
            <Mic className="h-5 w-5" />
          </Button>
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(input);
              }
            }}
            placeholder="Ask about your crop, soil, weather…"
            rows={1}
            className="max-h-32 min-h-11 flex-1 resize-none"
          />
          <Button
            variant="hero"
            size="icon"
            onClick={() => handleSend(input)}
            disabled={sending || !input.trim()}
            aria-label="Send"
          >
            {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
