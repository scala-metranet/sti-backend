import { IsString, IsOptional, IsDateString, IsUUID, IsArray } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  public name: string;

  @IsOptional()
  @IsString()
  public description?: string;

  @IsOptional()
  @IsDateString()
  public start_date?: string;

  @IsOptional()
  @IsDateString()
  public end_date?: string;

  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  public mentor_ids?: string[];
}

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  public name?: string;

  @IsOptional()
  @IsString()
  public description?: string;

  @IsOptional()
  @IsDateString()
  public start_date?: string;

  @IsOptional()
  @IsDateString()
  public end_date?: string;

  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  public mentor_ids?: string[];
}