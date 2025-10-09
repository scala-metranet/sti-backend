import { NextFunction, Request, Response } from "express";
import UploadHelper from "@/utils/uploadHelper";

class IndexController {
  public storage = new UploadHelper();

  public index = (_req: Request, res: Response, next: NextFunction): void => {
    try {
      //const emailProvider = new NodeMailerProvier();
      // emailProvider.send();
      res.status(200).send({ data: _req["user"] });
    } catch (error) {
      next(error);
    }
  };
  public upload = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response<unknown, Record<string, unknown>>> => {
    try {
      let storage = new UploadHelper();
      let errors: unknown[] = [];
      let responseData: unknown[] = [];
      let files = Object.entries(req.files);
      for (let [key, value] of files) {
        value = value[0];
        const filepath = value.path;
        const contentType: string = value.mimetype;
        const { data, error } = await storage.upload(
          key,
          filepath,
          contentType
        );
        if (error) errors.push(error);
        else responseData.push(data);
      }
      if (errors.length) return res.status(400).send(errors);
      res.status(200).send(responseData);
    } catch (error) {
      next(error);
    }
  };
}

export default IndexController;
