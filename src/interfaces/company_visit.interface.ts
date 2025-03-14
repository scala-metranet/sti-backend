export interface CompanyVisit {
  id: string;
  campus_id: string;
  type: string;
  title: string;
  description: string;
  date: string;
  poster: string;
  start_time: string;
  end_time: string;
  key_access: string;
}

export interface CompanyVisitCampus {
  id: string;
  campus_id: string;
  company_visit_id: string;
}
