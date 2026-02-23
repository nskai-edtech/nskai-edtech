export interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  position: number;
}

export interface QuizQuestionWithAnswer extends QuizQuestion {
  correctOption: number;
}
