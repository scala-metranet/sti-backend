import { HttpException } from "@/exceptions/HttpException";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_API_KEY, SUPABASE_BUCKET, SUPABASE_HOST } from "@/config";
import { format } from "date-fns";
import { generateId } from "./util";
import fs from "fs";

class SupabaseProvider {
  private supabaseClient: SupabaseClient;
  private host: string = SUPABASE_HOST;
  private publicAnonKey: string = SUPABASE_API_KEY;
  private bucket: string = SUPABASE_BUCKET;

  constructor() {
    this.supabaseClient = createClient(this.host, this.publicAnonKey);
  }

  public upload = async (key: string, filepath: string, mimetype: string, filename?: string): Promise<Record<string, unknown>> => {
    let folderName: string;
    let extension: string;
    switch (mimetype) {
      case "image/png":
        folderName = "img";
        extension = "png";
        break;
      case "image/jpeg":
        folderName = "img";
        extension = "jpg";
        break;
      case "application/pdf":
        folderName = "file";
        extension = "pdf";
        break;
      case "video/webm":
        folderName = "img";
        extension = "webm";
        break;
      default:
        throw new HttpException(422, `${mimetype} is invalid mimetype uploaded file.`);
    }
    const dateName = format(new Date(), "yyyy/M/d");

    const newFilename = `${folderName}/${dateName}/${filename?filename:generateId()}.${extension}`;
    const rawData = fs.readFileSync(filepath);
    const { data, error } = await this.supabaseClient.storage.from(this.bucket).upload(newFilename, rawData, {
      cacheControl: "3600",
      upsert: true, //overwrite file
      contentType: mimetype,
    });
    const publicUrl: string = await this.getPublicUrl(newFilename);
    data["key"] = key;
    data.path = `${this.host}/${data.path}`;
    data["publicUrl"] = publicUrl;

    fs.unlink(filepath, err => {
      if (err) console.error(err);
    });

    return { data, error };
  };

  public getPublicUrl = async (filepath: string): Promise<string> => {
    const { data } = this.supabaseClient.storage.from(this.bucket).getPublicUrl(filepath);
    return data.publicUrl;
  };
}
export default SupabaseProvider;
