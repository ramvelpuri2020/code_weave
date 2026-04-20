"use client";

import { useState } from "react";
import { Quiz } from "@/components/quiz";
import { FileText, HelpCircle } from "lucide-react";
import { CodeEditor } from "@/components/code-editor";
import { Button } from "@/components/ui/button";
import type { AnalysisResult, ChallengeTestCase } from "@/types/analysis";

interface AnalysisResultsProps {
  result: AnalysisResult;
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  return `{${keys
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(",")}}`;
}

function parseJsonValue(raw: string): unknown {
  return JSON.parse(raw);
}

export function AnalysisResults({ result }: AnalysisResultsProps) {
  const tests = result.challenge.tests ?? [];

  const [challengeUnlocked, setChallengeUnlocked] = useState(false);
  const [lastScore, setLastScore] = useState<{ score: number; total: number } | null>(
    null
  );
  const [challengeSolution, setChallengeSolution] = useState(
    result.challenge.starterCode
  );
  const [solutionSubmitted, setSolutionSubmitted] = useState(false);
  const [testResults, setTestResults] = useState<
    Array<{
      test: ChallengeTestCase;
      pass: boolean;
      got?: string;
      error?: string;
    }>
  >([]);
  const [runnerError, setRunnerError] = useState<string | null>(null);

  const handleQuizComplete = (score: number, total: number) => {
    setLastScore({ score, total });
    setChallengeUnlocked(true);
  };

  function runHiddenTests() {
    setRunnerError(null);
    setTestResults([]);

    try {
      const runner = new Function(
        "input",
        `${challengeSolution}\nreturn solve(input);`
      ) as (input: unknown) => unknown;

      const nextResults = tests.map((test) => {
        try {
          const input = parseJsonValue(test.input);
          const expected = parseJsonValue(test.expected);
          const got = runner(input);
          const pass = stableStringify(got) === stableStringify(expected);
          return {
            test,
            pass,
            got: stableStringify(got),
          };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error);
          return {
            test,
            pass: false,
            error: message,
          };
        }
      });

      setTestResults(nextResults);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setRunnerError(message);
    }
  }

  const handleSubmitSolution = () => {
    setSolutionSubmitted(true);
    runHiddenTests();
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
            <div className="flex items-center gap-2">
              <Button onClick={runHiddenTests} variant="outline" size="sm">
                Run Tests
              </Button>
              <Button onClick={handleSubmitSolution} size="sm">
                Submit My Solution
              </Button>
            </div>
          </div>

          {solutionSubmitted ? (
            <div className="rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-foreground">
              Submitted. Hidden tests were executed locally in your browser.
            </div>
          ) : null}

          {runnerError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              Could not run tests: {runnerError}
            </div>
          ) : null}

          {tests.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Hidden tests</p>
                <p className="text-xs text-muted-foreground">
                  {testResults.length > 0
                    ? `${testResults.filter((item) => item.pass).length}/${
                        testResults.length
                      } passed`
                    : "Not run yet"}
                </p>
              </div>

              {testResults.length > 0 ? (
                <div className="space-y-2">
                  {testResults.map((item, index) => (
                    <div
                      key={`${item.test.name ?? "test"}-${index}`}
                      className={`rounded-lg border px-3 py-2 text-sm ${
                        item.pass
                          ? "border-success/30 bg-success/10 text-success"
                          : "border-destructive/30 bg-destructive/10 text-destructive"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium">{item.test.name ?? `Test ${index + 1}`}</span>
                        <span className="text-xs">{item.pass ? "PASS" : "FAIL"}</span>
                      </div>
                      {item.error ? (
                        <p className="mt-1 text-xs">{item.error}</p>
                      ) : (
                        <p className="mt-1 text-xs">
                          expected {item.test.expected} · got {item.got}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Click Run Tests to validate your solution against the generated cases.
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No hidden tests were returned for this challenge yet.
            </p>
          )}
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
