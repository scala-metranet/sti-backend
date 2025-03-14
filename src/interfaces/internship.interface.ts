export interface Internship {
  id: string;
  name: string;
  mentor_id: string;
  description: string;
  company_id: string;
  program_id: string;
  period_start: string;
  period_end: string;
  type: string;
}

export interface InternshipRemapping {
  id: string;
  user_internship_id: string;
  old_internship_id: string;
  new_internship_id: string;
  user_id: string;
  notes: string;
}
