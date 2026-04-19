"use client";

import { Quiz } from "@/components/quiz";
import { FileText, HelpCircle } from "lucide-react";

const placeholderExplanation = `This code defines a React component that implements a user authentication form with the following key behaviors:

**Form Structure**
The component renders a controlled form with email and password input fields. Each field maintains its own state using the useState hook, allowing for real-time validation and user feedback.

**Validation Logic**
Before submission, the form validates that the email matches a standard email pattern using a regular expression. The password must be at least 8 characters and contain at least one number and one special character.

**State Management**
The component uses three separate state variables: one for form data, one for validation errors, and one for submission status. This separation allows for clean handling of different concerns.

**Event Handling**
The onSubmit handler prevents default form behavior, runs validation, and conditionally calls the authentication API. Error states are cleared on successful submission.`;

const placeholderQuestions = [
  {
    id: 1,
    question:
      "What hook is primarily used to manage form field values in this component?",
    options: ["useEffect", "useState", "useReducer", "useMemo"],
    correctAnswer: 1,
  },
  {
    id: 2,
    question:
      "What is the minimum password length required by the validation logic?",
    options: ["6 characters", "8 characters", "10 characters", "12 characters"],
    correctAnswer: 1,
  },
  {
    id: 3,
    question:
      "What does the onSubmit handler do before calling the authentication API?",
    options: [
      "Refreshes the page",
      "Clears all form fields",
      "Prevents default form behavior and runs validation",
      "Redirects to a different page",
    ],
    correctAnswer: 2,
  },
];

export function AnalysisResults() {
  return (
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
          {placeholderExplanation.split("\n\n").map((paragraph, index) => {
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
        <Quiz questions={placeholderQuestions} />
      </div>
    </div>
  );
}
