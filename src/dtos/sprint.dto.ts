import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateSprintDto {
  @IsString()
  public sprint: string;

  @IsString()
  public objective: string;

  @IsUUID(4)
  public squad_leader_id: string;

  @IsUUID(4)
  public squad_id: string;

  @IsOptional()
  @IsUUID(4)
  public project_id?: string;

  @IsString()
  public start_date: string;

  @IsString()
  public end_date: string;

  @IsOptional()
  @IsString()
  public mentor_notes?: string;

  @IsOptional()
  @IsString()
  public mentor_lesson?: string;
}

export class UpdateSprintDto {
  @IsOptional()
  @IsString()
  public sprint?: string;

  @IsOptional()
  @IsString()
  public objective?: string;

  @IsOptional()
  @IsUUID(4)
  public squad_leader_id?: string;

  @IsOptional()
  @IsUUID(4)
  public squad_id?: string;

  @IsOptional()
  @IsUUID(4)
  public project_id?: string;

  @IsOptional()
  @IsString()
  public start_date?: string;

  @IsOptional()
  @IsString()
  public end_date?: string;

  @IsOptional()
  @IsString()
  public mentor_notes?: string;

  @IsOptional()
  @IsString()
  public mentor_lesson?: string;
}