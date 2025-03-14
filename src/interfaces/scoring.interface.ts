export interface Scoring {
  id: string;
  user_id: string;
  created_by: string;
  internship_id: string;
  sprint_id: string;
  score: number;
}

export interface ScoringDetail {
  id: string;
  scoring_id: string;
  scoring_question_id: string;
  score: number;
}

export interface ScoringQuestion {
  id: string;
  question: string;
  internship_program_id:string;
  role_id: string;
  question_order: number;
}
