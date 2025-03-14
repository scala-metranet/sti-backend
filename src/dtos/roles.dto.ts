import "reflect-metadata";
import { IsString } from "class-validator";

export enum RoleName {
  mentee = "Mentee",
  mentor = "Mentor",
  admin = "Admin",
  super_admin = "Super Admin",
  hc_com = "HC Com"
}

export class CreateRoleDto {
  @IsString()
  public name: string = undefined;
}

export class DeleteRoleDto {
  @IsString()
  public id: string = undefined;
}

export class UpdateRoleDto {
  @IsString()
  public id: string = undefined;
  @IsString()
  public name: string = undefined;
}
