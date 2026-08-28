export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer?: number;
};

export type QuizAttempt = {
  quizId: string;
  score: number;
  total: number;
};
