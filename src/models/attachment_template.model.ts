import { Model, ModelObject } from "objection";
import { AttachmentTemplate } from "@/interfaces/user_internship_document.interface";

export class ModelAttachmentTemplate extends Model implements AttachmentTemplate {
  id!: string;
  user_id!: string;
  name!: string;
  value!: string;

  static tableName = "attachment_template"; // database table name
  static idColumn = "id"; // id column name
}

export type AttachmentTemplateShape = ModelObject<ModelAttachmentTemplate>;
