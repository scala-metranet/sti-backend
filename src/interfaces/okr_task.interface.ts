export interface OkrTask {
  id: string;
  title: string;
  result: string;
  attachment: string;
  mentee_id: string;
  okr_id: string;
  sprint_id: string;
  due_date: string;
  status: string;
}

export interface OkrTaskMentee {
  id: string;
  okr_task_id: string;
  mentee_id: string;
}

export interface OkrTaskResult {
  id: string;
  okr_task_id: string;
  user_id: string;
  message: string;
  attachment: string;
}