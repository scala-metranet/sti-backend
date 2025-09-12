import { NextFunction, Request, Response } from "express";
import ScoringService from "@/services/scoring.service";

class ScoringController {
  public service = new ScoringService();

  public getMaster = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const page = _req.query.page ? _req.query.page : 1;
      const perPage = _req.query.perPage ? _req.query.perPage : 5;
      const data: any = await this.service.getMaster({
        ..._req.query,
        page: page,
        perPage: perPage,
      });

      res.status(200).json({
        data: data.results,
        pagination: {
          total: data.total,
          page: page,
          perPage: perPage,
        },
        message: "get data",
      });
    } catch (error) {
      next(error);
    }
  };

  public get = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const page = _req.query.page ? _req.query.page : 1;
      const perPage = _req.query.perPage ? _req.query.perPage : 5;
      const data: any = await this.service.get({
        ..._req.query,
        page: page,
        perPage: perPage,
      });

      // 	res.status(200).json({
      // data: data.results,
      // 		pagination: {
      // 			total: data.total,
      // 			page: page,
      // 			perPage: perPage,
      // 		},
      // message: "get data" });
      res.status(200).json({ data: data, message: "get data" });
    } catch (error) {
      next(error);
    }
  };

  public getScore = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data: any = await this.service.getScoreNew(_req);

      res.status(200).json({ data: data, message: "get data" });
    } catch (error) {
      next(error);
    }
  };

  public getHistory = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const page = _req.query.page ? _req.query.page : 1;
      const perPage = _req.query.perPage ? _req.query.perPage : 5;
      const data: any = await this.service.getHistory({
        page: page,
        perPage: perPage,
        user: _req["user"],
        type: _req.query.type,
        search: _req.query.search,
        company_id: _req.query.company_id,
      });

      res.status(200).json({
        data: data.results,
        pagination: {
          total: data.total,
          page: page,
          perPage: perPage,
        },
        message: "get data",
      });
    } catch (error) {
      next(error);
    }
  };

  public detailMaster = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data: any[] = await this.service.detailMaster(_req.params.id);

      res.status(200).json({ data: data, message: "detail data" });
    } catch (error) {
      next(error);
    }
  };

  public scoreForm = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data: any[] = await this.service.scoreForm(_req.params.id, {
        ..._req.query,
        user: _req["user"],
      });

      res.status(200).json({ data: data, message: "detail data" });
    } catch (error) {
      next(error);
    }
  };

  public detail = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data: any[] = await this.service.detail(_req.params.id);

      res.status(200).json({ data: data, message: "detail data" });
    } catch (error) {
      next(error);
    }
  };

  public detailScore = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data: any[] = await this.service.detailScore(_req.params.id);

      res.status(200).json({ data: data, message: "detail data" });
    } catch (error) {
      next(error);
    }
  };

  public create = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data: any = await this.service.create(req.body);
      res.status(201).json({ data: data, message: "Data created." });
    } catch (error) {
      next(error);
    }
  };

  public createScore = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      let param = { ...req.body, user: req["user"] };
      const data: any = await this.service.createScore(param);
      res.status(201).json({ data: data, message: "Data created." });
    } catch (error) {
      next(error);
    }
  };

  public rescore = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      let param = { ...req.body };
      const data: any = await this.service.rescore(param);
      res.status(201).json({ data: data, message: "Data created." });
    } catch (error) {
      next(error);
    }
  };

  public rescoreAll = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      let param = { ...req.body };
      const data: any = await this.service.rescoreAll(param);
      res.status(201).json({ data: data, message: "Data created." });
    } catch (error) {
      next(error);
    }
  };

  public update = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id: string = req.params.id;
      const param: any = req.body;
      const data: any = await this.service.update(id, param);

      res.status(200).json({ data: data, message: "updated" });
    } catch (error) {
      next(error);
    }
  };

  public delete = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const deleteData: any = await this.service.delete(req.params.id);

      res.status(200).json({ data: deleteData, message: "deleted" });
    } catch (error) {
      next(error);
    }
  };
}

export default ScoringController;
