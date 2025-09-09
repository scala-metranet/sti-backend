import { HttpException } from "@exceptions/HttpException";
import { isEmpty } from "@utils/util";
import { generateId } from "@utils/util";
import {
  Project,
  CreateProjectDto,
  UpdateProjectDto,
} from "@/interfaces/project.interface";
import { ModelProject } from "@/models/project.model";
import { ModelProjectMentor } from "@/models/project_mentor.model";

class ProjectService {
  public async findAll(companyId: string): Promise<Project[]> {
    let data: any = await ModelProject.query()
      .select()
      .from(ModelProject.tableName)
      .where("company_id", "=", companyId)
      .withGraphFetched("[company, mentors]")
      .orderBy("created_at", "desc");
    return data;
  }

  public async findById(id: string, companyId: string): Promise<Project> {
    const data: Project = await ModelProject.query()
      .findById(id)
      .where("company_id", "=", companyId)
      .withGraphFetched("[company, mentors]");
    if (!data) throw new HttpException(409, "Project doesn't exist");
    return data;
  }

  public async create(param: CreateProjectDto): Promise<Project> {
    const projectId = generateId();
    const projectData = {
      id: projectId,
      company_id: param.company_id,
      name: param.name,
      description: param.description,
      start_date: param.start_date ? new Date(param.start_date) : null,
      end_date: param.end_date ? new Date(param.end_date) : null,
    };

    const createData: Project = await ModelProject.query()
      .insert(projectData)
      .into(ModelProject.tableName);

    // Assign mentors if provided
    if (param.mentor_ids && param.mentor_ids.length > 0) {
      const mentorAssignments = param.mentor_ids.map((mentorId) => ({
        id: generateId(),
        project_id: projectId,
        mentor_id: mentorId,
      }));

      await ModelProjectMentor.query()
        .insert(mentorAssignments)
        .into(ModelProjectMentor.tableName);
    }

    return this.findById(createData.id, param.company_id);
  }

  public async update(
    id: string,
    param: UpdateProjectDto,
    companyId: string
  ): Promise<Project> {
    if (isEmpty(param)) throw new HttpException(400, "param is empty");

    const data: Project = await ModelProject.query()
      .select()
      .from(ModelProject.tableName)
      .where("id", "=", id)
      .where("company_id", "=", companyId)
      .first();
    if (!data) throw new HttpException(409, "Project doesn't exist");

    // Prepare update data for project table (excluding mentor_ids)
    const updateData: any = { ...param };
    delete updateData.mentor_ids;
    if (param.start_date) updateData.start_date = new Date(param.start_date);
    if (param.end_date) updateData.end_date = new Date(param.end_date);

    // Update project data if there's something to update
    if (Object.keys(updateData).length > 0) {
      await ModelProject.query()
        .update(updateData)
        .where("id", "=", id)
        .where("company_id", "=", companyId)
        .into(ModelProject.tableName);
    }

    // Handle mentor assignments if provided
    if (param.mentor_ids !== undefined) {
      // Remove existing mentor assignments
      await ModelProjectMentor.query().delete().where("project_id", "=", id);

      // Add new mentor assignments
      if (param.mentor_ids.length > 0) {
        const mentorAssignments = param.mentor_ids.map((mentorId) => ({
          id: generateId(),
          project_id: id,
          mentor_id: mentorId,
        }));

        await ModelProjectMentor.query()
          .insert(mentorAssignments)
          .into(ModelProjectMentor.tableName);
      }
    }

    return this.findById(id, companyId);
  }

  public async delete(id: string, companyId: string): Promise<Project> {
    const data: Project = await ModelProject.query()
      .select()
      .from(ModelProject.tableName)
      .where("id", "=", id)
      .where("company_id", "=", companyId)
      .first();
    if (!data) throw new HttpException(409, "Project doesn't exist");

    // Delete mentor assignments first (due to foreign key constraints)
    await ModelProjectMentor.query().delete().where("project_id", "=", id);

    // Delete the project
    await ModelProject.query()
      .delete()
      .where("id", "=", id)
      .where("company_id", "=", companyId)
      .into(ModelProject.tableName);
    return data;
  }
}

export default ProjectService;
