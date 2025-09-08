import { HttpException } from "@/exceptions/HttpException";
import { format } from "date-fns";
import { generateId } from "./util";
import fs from "fs";
import path from "path";

class UploadHelper {
  private publicRoot: string;

  constructor(publicRootDir: string = path.join(process.cwd(), "public")) {
    this.publicRoot = publicRootDir;
  }

  public upload = async (
    key: string,
    filepath: string,
    mimetype: string,
    filename?: string
  ): Promise<Record<string, unknown>> => {
    let folderName: string;
    let extension: string;
    switch (mimetype) {
      case "image/png":
        folderName = "img";
        extension = "png";
        break;
      case "image/jpeg":
      case "image/jpg":
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
        throw new HttpException(
          422,
          `${mimetype} is invalid mimetype uploaded file.`
        );
    }

    const dateName = format(new Date(), "yyyy/M/d");
    const newFilename = `${folderName}/${dateName}/${
      filename ? filename : generateId()
    }.${extension}`;
    const destPath = path.join(this.publicRoot, newFilename);

    fs.mkdirSync(path.dirname(destPath), { recursive: true });

    const sourcePath = path.isAbsolute(filepath)
      ? filepath
      : path.join(process.cwd(), filepath);
    fs.copyFileSync(sourcePath, destPath);

    fs.unlink(sourcePath, (err) => {
      if (err) console.error(err);
    });

    const data: any = {
      key,
      path: destPath,
      publicUrl: `/public/${newFilename}`,
    };

    return { data, error: undefined };
  };
}

export default UploadHelper;
