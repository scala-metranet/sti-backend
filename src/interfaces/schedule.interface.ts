export interface Schedule {
  id: string;
  date: string;
}

export interface ScheduleSession {
  id: string;
  schedule_id: string;
  time_start: string;
  time_end: string;
  zoom_link: string;
}
