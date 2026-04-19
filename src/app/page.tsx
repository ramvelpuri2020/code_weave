"use client";

import { useEffect, useState } from "react";
import { Hero } from "@/components/hero";
import { CodeEditor } from "@/components/code-editor";
import { AnalysisResults } from "@/components/analysis-results";
import { AnalysisHistory, type HistoryItem } from "@/components/analysis-history";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import type { AnalysisResult } from "@/types/analysis";

const placeholderCode = `// Paste your code here to analyze it
function authenticateUser(email, password) {
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }
  
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }
  
  // Simulate authentication
  return {
    success: true,
    user: { email, id: crypto.randomUUID() }
  };
}`;

export default function Home() {
  const [code, setCode] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const raw = localStorage.getItem("analysis-history");
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as Array<
        Partial<HistoryItem> & { snippet?: string }
      >;
      return parsed
        .map((item) => ({
          id: item.id ?? crypto.randomUUID(),
          createdAt: item.createdAt ?? new Date().toISOString(),
          code: item.code ?? item.snippet ?? "",
          result: item.result as AnalysisResult,
        }))
        .filter((item) => item.code.trim().length > 0 && item.result);
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("analysis-history", JSON.stringify(history));
  }, [history]);

  const handleAnalyze = async () => {
    if (!code.trim()) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze code.");
      }

      const data = (await response.json()) as AnalysisResult;
      setAnalysisResult(data);
      setShowResults(true);

      const nextItem: HistoryItem = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        code,
        result: data,
      };

      setHistory((prev) => [nextItem, ...prev].slice(0, 10));
    } catch {
      setError("Could not analyze your code right now. Please try again.");
      setShowResults(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setShowResults(false);
    setCode("");
    setAnalysisResult(null);
    setError(null);
  };

  const handleLoadFromHistory = (item: HistoryItem) => {
    setCode(item.code);
    setAnalysisResult(item.result);
    setShowResults(true);
    setError(null);
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent" />

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12">
          <Hero />
        </div>

        {!showResults ? (
          <div className="mx-auto max-w-4xl space-y-6">
            <CodeEditor
              value={code}
              onChange={setCode}
              placeholder={placeholderCode}
            />

            <div className="flex justify-center">
              <Button
                onClick={handleAnalyze}
                disabled={!code.trim() || isAnalyzing}
                size="lg"
                className="group gap-2 px-8"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Analyze Code
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Paste any code snippet to get a plain-English explanation and test
              your understanding
            </p>

            {error ? (
              <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-center text-sm text-destructive">
                {error}
              </p>
            ) : null}

            <AnalysisHistory
              items={history}
              onLoad={handleLoadFromHistory}
              onClear={handleClearHistory}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Analysis Results
                </h2>
                <p className="text-sm text-muted-foreground">
                  Review the explanation and test your understanding
                </p>
              </div>
              <Button onClick={handleReset} variant="outline" size="sm">
                Analyze New Code
              </Button>
            </div>

            {analysisResult ? <AnalysisResults result={analysisResult} /> : null}
          </div>
        )}
      </div>

      <footer className="border-t border-border bg-card/50">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              Built for developers who want to truly understand their code
            </p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>Made with</span>
              <span className="text-accent">♥</span>
              <span>by CodeWeave</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
