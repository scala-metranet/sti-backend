import { IsDate, IsEnum, IsString, Length } from "class-validator";

export enum InternType {
	wfo = "WFO",
	wfh = "WFH",
	Hybrid = "Hybrid",
}

export class CreateInternshipDto {
	@IsString()
  @Length(3, 50)
	public name: string;

	@IsString()
	public mentor_id: string;

	@IsString()
	public description: string;

	@IsString()
	public company_id: string;

	@IsString()
	public program_id: string;

	@IsDate()
	public period_start: string;

	@IsDate()
	public period_end: string;

	@IsEnum(InternType)
	public type;
}

export const InternshipProgramId = {
  dri : "ce845hyhg5t0awb32jp0",
  kpr : "ce845hyhg5t0awb32jpg",
  pkl : "ce845hyhg5t0awb32jq0",
  apprenticeship: "ce845hyhg5t0awb32jp1",
  on_job_training: "ce845hyhg5t0awb32jp2"
}