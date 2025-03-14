export interface Attendance {
  id: string;
  user_id: string;
  tod_id: string;
  tod: string;
  health_status: boolean;
  working_status: string;
  check_in: string;
  check_out: string;
  photo_in: string;
  photo_out: string;
  loc_in: string;
  loc_out: string;
  lng_lat_in: string;
  lng_lat_out: string;
}
