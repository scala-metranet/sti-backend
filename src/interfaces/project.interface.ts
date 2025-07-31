export interface Project {
  id: string;
  name: string;
  description?: string;
  start_date?: Date;
  end_date?: Date;
  company_id: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  mentor_ids?: string[];
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  mentor_ids?: string[];
}