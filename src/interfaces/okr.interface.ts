export interface Okr {
  id: string;
  key_result: string;
  output: string;
  mentor_id: string;
  sprint_id: string;
  due_date: string;
  description: string;
}

export interface OkrMentee {
  id: string;
  okr_id: string;
  mentee_id: string;
}