import { IsString } from "class-validator";

export class CreateUserInternshipDocumentDto {
  @IsString()
  public user_internship_id: string;

  @IsString()
  public key: string;

  @IsString()
  public value: string;
}
