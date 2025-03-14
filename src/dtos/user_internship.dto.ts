import { IsArray, IsString } from "class-validator";

export class CreateUserInternshipDto {
  @IsString()
  public mentee_id: string;

  @IsString()
  public internship_id: string;

  @IsArray()
  public soft_skill: string[];

  @IsArray()
  public hard_skill: string[];

  @IsString()
  public strength: string;

  @IsString()
  public weakness: string;

  @IsString()
  public review: string;

  @IsString()
  public information_source: string;
}
