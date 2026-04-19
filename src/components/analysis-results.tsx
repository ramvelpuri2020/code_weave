"use client";

import { useState } from "react";
import { Quiz } from "@/components/quiz";
import { FileText, HelpCircle } from "lucide-react";
import { CodeEditor } from "@/components/code-editor";
import { Button } from "@/components/ui/button";
import type { AnalysisResult } from "@/types/analysis";

interface AnalysisResultsProps {
  result: AnalysisResult;
}

export function AnalysisResults({ result }: AnalysisResultsProps) {
  const [challengeUnlocked, setChallengeUnlocked] = useState(false);
  const [lastScore, setLastScore] = useState<{ score: number; total: number } | null>(
    null
  );
  const [challengeSolution, setChallengeSolution] = useState(
    result.challenge.starterCode
  );
  const [solutionSubmitted, setSolutionSubmitted] = useState(false);

  const handleQuizComplete = (score: number, total: number) => {
    setLastScore({ score, total });
    setChallengeUnlocked(true);
  };

  const handleSubmitSolution = () => {
    setSolutionSubmitted(true);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
            <FileText className="h-4 w-4 text-accent" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            What this code does
          </h3>
        </div>
        <div className="prose prose-sm prose-invert max-w-none">
          {result.explanation.split("\n\n").map((paragraph, index) => {
            if (paragraph.startsWith("**") && paragraph.includes("**")) {
              const title = paragraph.match(/\*\*(.*?)\*\*/)?.[1];
              const content = paragraph.replace(/\*\*.*?\*\*\n?/, "");
              return (
                <div key={index} className="mb-4">
                  <h4 className="mb-1 text-sm font-semibold text-foreground">
                    {title}
                  </h4>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {content}
                  </p>
                </div>
              );
            }
            return (
              <p
                key={index}
                className="mb-4 text-sm leading-relaxed text-muted-foreground"
              >
                {paragraph}
              </p>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
            <HelpCircle className="h-4 w-4 text-accent" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            Test your understanding
          </h3>
        </div>
        <Quiz questions={result.questions} onComplete={handleQuizComplete} />
      </div>
      </div>

      {challengeUnlocked ? (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              Challenge Mode: {result.challenge.title}
            </h3>
            {lastScore ? (
              <p className="text-sm text-muted-foreground">
                Quiz score: {lastScore.score}/{lastScore.total}
              </p>
            ) : null}
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">
            {result.challenge.prompt}
          </p>

          {result.challenge.constraints.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Constraints</p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {result.challenge.constraints.map((constraint, index) => (
                  <li key={`${constraint}-${index}`}>{constraint}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <CodeEditor
            value={challengeSolution}
            onChange={setChallengeSolution}
            placeholder={result.challenge.starterCode}
          />

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Write your own solution before checking external hints.
            </p>
            <Button onClick={handleSubmitSolution} size="sm">
              Submit My Solution
            </Button>
          </div>

          {solutionSubmitted ? (
            <div className="rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-foreground">
              Nice work. Your solution is saved locally in the editor. Next, test it
              with a few custom inputs in your own runtime.
            </div>
          ) : null}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            Finish the quiz to unlock a harder coding challenge and write your own
            solution.
          </p>
        </div>
      )}
    </div>
  );
}
