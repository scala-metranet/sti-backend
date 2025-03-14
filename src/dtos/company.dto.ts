import { IsString, Length } from "class-validator";

export class CreateCompanyDto {
  @IsString()
  @Length(3, 50)
  public name: string;

  @IsString()
  @Length(3, 50)
  public cfu: string;

  @IsString()
  @Length(3, 50)
  public department: string;

  @IsString()
  @Length(3, 50)
  public unit: string;

  @IsString()
  @Length(3, 50)
  public description: string;

  @IsString()
  @Length(3, 50)
  public logo: string;

  @IsString()
  @Length(3, 50)
  public type: string;

  @IsString()
  @Length(3, 50)
  public address: string;
}
