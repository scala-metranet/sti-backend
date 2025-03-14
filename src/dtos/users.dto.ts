import { IsEmail, IsEnum, IsString, Length, MinLength, IsMobilePhone, MaxLength } from "class-validator";
import { RoleName } from "./roles.dto";
export enum UserProvider {
  email = "email",
  google = "google",
}

export enum UserStatus {
  unverified = "unverified",
  active = "active",
  blocked = "blocked",
  graduate = "graduate",
  resign = "resign",
}

export enum UserInternshipStatus {
  unverified = "unverified",
  interview = "interview",
  interview_done = "interview_done",
  active = "active",
  graduate = "graduate",
  reject = "reject"
}

export enum UserInternshipDocumentStatus {
  unverified = "unverified",
  accept = "accept",
  decline = "decline"
}

export enum PartnerType {
  universitas = "universitas",
  smk = "smk",
}

export enum UserGender {
  male = "male",
  female = "female",
}

export enum QuestionType {
  score_question = "score_question",
  open_ended_question = "open_ended_question"
}

export enum StatusJoinRequest {
  not_contacted = "not_contacted",
  in_progress = "in_progress",
  success = "success",
  rejected = "rejected"
}

export class CreateUserDto {
  @IsEmail()
  public email: string;

  @IsString()
  @Length(3, 50)
  public name: string;

  @IsString()
  @MinLength(6)
  @MaxLength(64)
  public password: string;

  @IsEnum(RoleName)
  public role_id;

  @IsEnum(UserProvider)
  public provider;

  @IsMobilePhone("id-ID")
  public no_hp: string;

  @IsString()
  public campus_id;
}

export class LoginUserDto {
  @IsEmail()
  public email: string;

  @IsString()
  public password: string;

}
