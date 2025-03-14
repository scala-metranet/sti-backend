import { IsString, Length } from "class-validator";

export class CreateSquadDto {
  @IsString()
  @Length(3, 50)
  public name: string;

  @IsString()
  public color: string;

  @IsString()
  public internship_id: string;
}
