"use client";

import { useState, useRef, useCallback } from "react";
import { Sparkles, Loader2, Copy, Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

interface AiBulletRewriterProps {
  currentBullet: string;
  jobDescription?: string;
}

export function AiBulletRewriter({ currentBullet, jobDescription }: AiBulletRewriterProps) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const promptRef = useRef<HTMLTextAreaElement>(null);

  const handleRewrite = useCallback(async () => {
    if (!prompt.trim() || !currentBullet.trim()) return;

    setLoading(true);
    setError("");
    setResult("");

    try {
      const res = await fetch("/api/rewrite-bullet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bulletText: currentBullet,
          userPrompt: prompt.trim(),
          jobDescription: jobDescription || "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to rewrite");
        return;
      }

      setResult(data.rewrittenBullet);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [prompt, currentBullet, jobDescription]);

  const handleCopy = useCallback(async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result]);

  const handleReset = useCallback(() => {
    setResult("");
    setError("");
  }, []);

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setPrompt("");
      setResult("");
      setError("");
      setCopied(false);
      setLoading(false);
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleRewrite();
      }
    },
    [handleRewrite]
  );

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="mt-1 h-7 w-7 p-0 text-purple-500 hover:text-purple-700 hover:bg-purple-50"
          title="AI Rewrite"
          disabled={!currentBullet.trim()}
        >
          <Sparkles className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        className="w-80 p-3"
      >
        <div className="space-y-3">
          <p className="text-xs font-medium text-gray-700">
            How should this bullet be rewritten?
          </p>

          {!result ? (
            <>
              <Textarea
                ref={promptRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='e.g. "Make it more quantitative" or "Focus on leadership impact"'
                rows={2}
                className="text-sm resize-none"
                disabled={loading}
                autoFocus
              />

              {error && (
                <p className="text-xs text-red-600">{error}</p>
              )}

              <Button
                size="sm"
                onClick={handleRewrite}
                disabled={loading || !prompt.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Rewriting...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    Rewrite
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <div className="rounded-md border border-purple-200 bg-purple-50 p-2.5">
                <p className="text-sm text-gray-800 leading-relaxed">{result}</p>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleCopy}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 mr-1.5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 mr-1.5" />
                      Copy
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReset}
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                  Retry
                </Button>
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
