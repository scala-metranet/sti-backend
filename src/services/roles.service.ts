import { CreateRoleDto, RoleName } from "@dtos/roles.dto";
import { HttpException } from "@exceptions/HttpException";
import { Role } from "@interfaces/roles.interface";
import { Roles } from "@models/roles.model";
import { isEmpty, generateId } from "@utils/util";

class RoleService {
  public async findAll(): Promise<Role[]> {
    const roles: Role[] = await Roles.query().select().from("role");
    return roles;
  }

  public async create(roleData: CreateRoleDto): Promise<Role> {
    const role: Role = await Roles.query()
      .insert({
        id: generateId(),
        ...roleData,
      })
      .into("role");
    return role;
  }

  public async getSuperAdmin(): Promise<Role> {
    const role: Role = await Roles.query().findOne({ name: RoleName.super_admin }).from("role").first();
    return role;
  }

  public async updateRole(roleId: string, roleData: Role): Promise<Role> {
    if (isEmpty(roleData)) throw new HttpException(400, "Data is empty");

    const findRole: Role[] = await Roles.query().select().from("role").where("id", "=", roleId);
    if (!findRole) throw new HttpException(409, "Role doesn't exist");

    const updateRoleData: Role = await Roles.query()
      .where("id", "=", roleId)
      .update({ ...roleData })
      .into("role")
      .returning("*")
      .first();

    //const updateRoleData: Role = await Roles.query().select().from('role').where('id', '=', roleId).first();
    return updateRoleData;
  }

  public async deleteById(roleId: string): Promise<Role> {
    const role: Role = await Roles.query().select().from("role").where("id", "=", roleId).first();
    if (!role) throw new HttpException(409, "Role doesn't exist");

    await Roles.query().delete().where("id", "=", roleId).into("role");
    return role;
  }
}

export default RoleService;
