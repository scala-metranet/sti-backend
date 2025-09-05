export interface Sprint {
  id: string;
  mentor_id: string;
  sprint: string;
  objective: string;
  project_id: string;
  start_date: string;
  end_date: string;
  mentor_notes: string;
  mentor_lesson: string;
  squad_leader?: User | null; // bukan string lagi
}

export interface User {
  id: string;
  name: string;
  email?: string;
}
