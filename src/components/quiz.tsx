"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizProps {
  questions: Question[];
}

export function Quiz({ questions }: QuizProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number>
  >({});
  const [showResults, setShowResults] = useState(false);

  const handleSelectAnswer = (questionId: number, optionIndex: number) => {
    if (showResults) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleCheckAnswers = () => {
    setShowResults(true);
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setShowResults(false);
  };

  const getScore = () => {
    return questions.filter(
      (q) => selectedAnswers[q.id] === q.correctAnswer
    ).length;
  };

  const optionLabels = ["A", "B", "C", "D"];

  return (
    <div className="space-y-6">
      {questions.map((question, qIndex) => (
        <div key={question.id} className="space-y-3">
          <h4 className="font-medium text-foreground">
            <span className="text-muted-foreground">{qIndex + 1}.</span>{" "}
            {question.question}
          </h4>
          <div className="space-y-2">
            {question.options.map((option, optionIndex) => {
              const isSelected = selectedAnswers[question.id] === optionIndex;
              const isCorrect = question.correctAnswer === optionIndex;
              const showCorrect = showResults && isCorrect;
              const showIncorrect = showResults && isSelected && !isCorrect;

              return (
                <button
                  key={optionIndex}
                  onClick={() => handleSelectAnswer(question.id, optionIndex)}
                  disabled={showResults}
                  className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-all ${
                    showCorrect
                      ? "border-success bg-success/10 text-success"
                      : showIncorrect
                        ? "border-destructive bg-destructive/10 text-destructive"
                        : isSelected
                          ? "border-accent bg-accent/10 text-foreground"
                          : "border-border bg-secondary/50 text-foreground hover:border-muted-foreground/50 hover:bg-secondary"
                  } ${showResults ? "cursor-default" : "cursor-pointer"}`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold ${
                      showCorrect
                        ? "bg-success text-success-foreground"
                        : showIncorrect
                          ? "bg-destructive text-destructive-foreground"
                          : isSelected
                            ? "bg-accent text-accent-foreground"
                            : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {showCorrect ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : showIncorrect ? (
                      <X className="h-3.5 w-3.5" />
                    ) : (
                      optionLabels[optionIndex]
                    )}
                  </span>
                  <span>{option}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex items-center justify-between border-t border-border pt-4">
        {showResults ? (
          <>
            <div className="text-sm">
              <span className="text-muted-foreground">Score: </span>
              <span className="font-semibold text-foreground">
                {getScore()} / {questions.length}
              </span>
            </div>
            <Button onClick={handleReset} variant="outline" size="sm">
              Try Again
            </Button>
          </>
        ) : (
          <>
            <div className="text-sm text-muted-foreground">
              {Object.keys(selectedAnswers).length} / {questions.length}{" "}
              answered
            </div>
            <Button
              onClick={handleCheckAnswers}
              disabled={Object.keys(selectedAnswers).length !== questions.length}
              size="sm"
            >
              Check Answers
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
