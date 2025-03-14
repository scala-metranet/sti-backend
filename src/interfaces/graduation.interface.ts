export interface Graduation {
  id: string;
  user_internship_id: string;
  linkedin_url: string;
  report_url: string;
  is_attend: boolean;
  reason: string;
  status: string;
  note: string;
  updated_by: string;
}

export interface GraduationEvent {
  id: string;
  company_id: string;
  batch_master_id: string;
  period_start: string;
  period_end: boolean;
  type: string;
  title: string;
  date: string;
  start_hour: string;
  end_hour: string;
  location: string;
  poster: string;
}
