export enum EmailType {
  verification = "verification",
  forgot_password = "forgot password",
}
export interface Email {
  type: EmailType;
}
