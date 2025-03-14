export interface BatchMaster {
  id: string;
  name: string;
  company_id: string;
  internship_program_id: string;
  period_start: string;
  period_end: string;
}


export interface SprintMaster {
  id: string;
  batch_master_id: string;
  company_id: string;
  period_start: string;
  period_end: string;
}
