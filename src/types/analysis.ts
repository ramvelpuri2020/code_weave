export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface ChallengeProblem {
  title: string;
  prompt: string;
  constraints: string[];
  starterCode: string;
  tests: ChallengeTestCase[];
}

export interface ChallengeTestCase {
  name?: string;
  input: string;
  expected: string;
}

export interface AnalysisResult {
  explanation: string;
  questions: QuizQuestion[];
  challenge: ChallengeProblem;
}

export interface AnalyzeRequest {
  code: string;
}
