import { Code2, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <div className="text-center">
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5">
        <Sparkles className="h-3.5 w-3.5 text-accent" />
        <span className="text-sm text-muted-foreground">
          Understand code, don&apos;t just copy it
        </span>
      </div>

      <div className="mb-4 flex items-center justify-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-accent/20 to-accent/5 ring-1 ring-accent/20">
          <Code2 className="h-6 w-6 text-accent" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          CodeWeave
        </h1>
      </div>

      <p className="mx-auto max-w-xl text-lg text-muted-foreground text-balance">
        Learn to code without the AI crutch. Paste your code, understand what it
        does, and test your knowledge with interactive quizzes.
      </p>
    </div>
  );
}
