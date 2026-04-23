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

type EditableTestCase = {
  id: string;
  name: string;
  input: string;
  expected: string;
};

function createId(): string {
  const cryptoObj = globalThis.crypto;
  if (cryptoObj?.randomUUID) {
    return cryptoObj.randomUUID();
  }

  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function formatJsonLabel(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
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
      label: string;
      kind: "hidden" | "custom";
      pass: boolean;
      got?: string;
      expectedRaw?: string;
      inputRaw?: string;
      error?: string;
    }>
  >([]);
  const [runnerError, setRunnerError] = useState<string | null>(null);
  const [customTests, setCustomTests] = useState<EditableTestCase[]>([
    {
      id: createId(),
      name: "My test 1",
      input: "",
      expected: "",
    },
  ]);

  const handleQuizComplete = (score: number, total: number) => {
    setLastScore({ score, total });
    setChallengeUnlocked(true);
  };

  function runChallengeTests() {
    setRunnerError(null);
    setTestResults([]);

    try {
      const runner = new Function(
        "input",
        `${challengeSolution}\nreturn solve(input);`
      ) as (input: unknown) => unknown;

      const hiddenResults = tests.map((test, index) => {
        try {
          const input = parseJsonValue(test.input);
          const expected = parseJsonValue(test.expected);
          const got = runner(input);
          const pass = stableStringify(got) === stableStringify(expected);
          return {
            label: test.name?.trim() ? test.name : `Hidden test ${index + 1}`,
            kind: "hidden" as const,
            pass,
            got: stableStringify(got),
            expectedRaw: test.expected,
            inputRaw: test.input,
          };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error);
          return {
            label: test.name?.trim() ? test.name : `Hidden test ${index + 1}`,
            kind: "hidden" as const,
            pass: false,
            error: message,
            expectedRaw: test.expected,
            inputRaw: test.input,
          };
        }
      });

      const customResults = customTests
        .map((test, index) => {
          if (!test.input.trim() || !test.expected.trim()) {
            return null;
          }

          try {
            const input = parseJsonValue(test.input);
            const expected = parseJsonValue(test.expected);
            const got = runner(input);
            const pass = stableStringify(got) === stableStringify(expected);
            return {
              label: test.name.trim() ? test.name : `Custom test ${index + 1}`,
              kind: "custom" as const,
              pass,
              got: stableStringify(got),
              expectedRaw: test.expected,
              inputRaw: test.input,
            };
          } catch (error) {
            const message =
              error instanceof Error ? error.message : String(error);
            return {
              label: test.name.trim() ? test.name : `Custom test ${index + 1}`,
              kind: "custom" as const,
              pass: false,
              error: message,
              expectedRaw: test.expected,
              inputRaw: test.input,
            };
          }
        })
        .filter(Boolean) as Array<{
        label: string;
        kind: "custom";
        pass: boolean;
        got?: string;
        expectedRaw?: string;
        inputRaw?: string;
        error?: string;
      }>;

      setTestResults([...hiddenResults, ...customResults]);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setRunnerError(message);
    }
  }

  const handleSubmitSolution = () => {
    setSolutionSubmitted(true);
    runChallengeTests();
  };

  const passedCount = testResults.filter((item) => item.pass).length;
  const totalRan = testResults.length;

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
              <Button onClick={runChallengeTests} variant="outline" size="sm">
                Run Tests
              </Button>
              <Button onClick={handleSubmitSolution} size="sm">
                Submit My Solution
              </Button>
            </div>
          </div>

          {solutionSubmitted ? (
            <div className="rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-foreground">
              Submitted. Tests were executed locally in your browser.
            </div>
          ) : null}

          {runnerError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              Could not run tests: {runnerError}
            </div>
          ) : null}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Test results</p>
              <p className="text-xs text-muted-foreground">
                {totalRan > 0 ? `${passedCount}/${totalRan} passed` : "Not run yet"}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-foreground">My tests</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCustomTests((prev) => [
                      ...prev,
                      {
                        id: createId(),
                        name: `My test ${prev.length + 1}`,
                        input: "",
                        expected: "",
                      },
                    ])
                  }
                >
                  Add row
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Use JSON strings for input and expected (examples:{" "}
                <span className="font-mono text-foreground">5</span>,{" "}
                <span className="font-mono text-foreground">&quot;hi&quot;</span>,{" "}
                <span className="font-mono text-foreground">[1,2]</span>,{" "}
                <span className="font-mono text-foreground">{`{"a":1}`}</span>).
              </p>

              <div className="space-y-3">
                {customTests.map((test) => (
                  <div
                    key={test.id}
                    className="rounded-lg border border-border bg-card p-3 space-y-2"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <label className="text-xs font-medium text-muted-foreground">
                        Name
                        <input
                          value={test.name}
                          onChange={(event) =>
                            setCustomTests((prev) =>
                              prev.map((row) =>
                                row.id === test.id
                                  ? { ...row, name: event.target.value }
                                  : row
                              )
                            )
                          }
                          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                        />
                      </label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="self-start sm:self-center"
                        onClick={() =>
                          setCustomTests((prev) =>
                            prev.length > 1
                              ? prev.filter((row) => row.id !== test.id)
                              : prev
                          )
                        }
                      >
                        Remove
                      </Button>
                    </div>

                    <label className="text-xs font-medium text-muted-foreground">
                      Input (JSON)
                      <textarea
                        value={test.input}
                        onChange={(event) =>
                          setCustomTests((prev) =>
                            prev.map((row) =>
                              row.id === test.id
                                ? { ...row, input: event.target.value }
                                : row
                            )
                          )
                        }
                        spellCheck={false}
                        rows={3}
                        className="mt-1 w-full resize-y rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground"
                        placeholder='Example: {"n": 10}'
                      />
                    </label>

                    <label className="text-xs font-medium text-muted-foreground">
                      Expected (JSON)
                      <textarea
                        value={test.expected}
                        onChange={(event) =>
                          setCustomTests((prev) =>
                            prev.map((row) =>
                              row.id === test.id
                                ? { ...row, expected: event.target.value }
                                : row
                            )
                          )
                        }
                        spellCheck={false}
                        rows={3}
                        className="mt-1 w-full resize-y rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground"
                        placeholder="Example: 55"
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {tests.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hidden tests were returned for this challenge yet. You can still use
                My tests above.
              </p>
            ) : null}

            {testResults.length > 0 ? (
              <div className="space-y-2">
                {testResults.map((item, index) => (
                  <div
                    key={`${item.label}-${index}`}
                    className={`rounded-lg border px-3 py-2 text-sm ${
                      item.pass
                        ? "border-success/30 bg-success/10 text-success"
                        : "border-destructive/30 bg-destructive/10 text-destructive"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium">{item.label}</span>
                      <span className="text-xs">
                        {item.kind === "hidden" ? "HIDDEN" : "CUSTOM"} ·{" "}
                        {item.pass ? "PASS" : "FAIL"}
                      </span>
                    </div>
                    {item.error ? (
                      <p className="mt-1 text-xs">{item.error}</p>
                    ) : (
                      <div className="mt-2 grid gap-2 md:grid-cols-2">
                        <div>
                          <p className="text-[11px] font-semibold text-muted-foreground">
                            Input
                          </p>
                          <pre className="mt-1 max-h-40 overflow-auto rounded-md border border-border bg-background p-2 text-xs text-foreground">
                            {item.inputRaw ? formatJsonLabel(item.inputRaw) : ""}
                          </pre>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-muted-foreground">
                            Expected vs got
                          </p>
                          <pre className="mt-1 max-h-40 overflow-auto rounded-md border border-border bg-background p-2 text-xs text-foreground">
                            {`EXPECTED\n${
                              item.expectedRaw ? formatJsonLabel(item.expectedRaw) : ""
                            }\n\nGOT\n${item.got ?? ""}`}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Click Run Tests to validate your solution against hidden tests and any
                filled-in custom tests.
              </p>
            )}
          </div>
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
