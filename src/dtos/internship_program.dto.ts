import { IsString, Length } from "class-validator";

export class CreateInternshipProgramDto {
  @IsString()
  @Length(3, 50)
  public name: string;
}
