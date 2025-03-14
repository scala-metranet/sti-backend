export interface JoinRequest {
  id: string;
  join_type: string;
  name: string;
  profession: string;
  institute: string;
  address: string;
  email: string;
  phone: string;
  purpose: string;
  info_source: string;
  status: string;
  feedback: string;
  feedback_added: string;
  feedback_user_id: string;
}

export interface JoinRequestFeedback {
  id: string;
  join_request_id: string;
  feedback: string;
  user_id: string;
}
