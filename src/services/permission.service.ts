import { Permission } from "@/models/permission.model";
import { generateId } from "@utils/util";

class PermissionService {
  public async getRolePermission(id: any): Promise<any> {
    const data:any = await Permission.query()
      .where("role_id", "=", id)

    return data;
  }

  public async getUserPermission(id: any): Promise<any> {
    const data:any = await Permission.query()
      .where("user_id", "=", id)

    return data;
  }

  public async create(data: any): Promise<any> {
    const permission: any = await Permission.query()
      .insert({
        id: generateId(),
        ...data,
      })
      .into("permission");
    return permission;
  }

  public async deletePermissionRole(id: any): Promise<any> {
    await Permission.query().delete().where("role_id", "=", id).into("permission");
    return true;
  }

  public async deletePermissionUser(id: any): Promise<any> {
    await Permission.query().delete().where("user_id", "=", id).into("permission");
    return true;
  }
}

export default PermissionService;
