"use client";

import { useState } from "react";
import { Hero } from "@/components/hero";
import { CodeEditor } from "@/components/code-editor";
import { AnalysisResults } from "@/components/analysis-results";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";

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

  const handleAnalyze = async () => {
    if (!code.trim()) return;

    setIsAnalyzing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsAnalyzing(false);
    setShowResults(true);
  };

  const handleReset = () => {
    setShowResults(false);
    setCode("");
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

            <AnalysisResults />
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
