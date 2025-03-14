import { Router } from "express";
import { Routes } from "@interfaces/routes.interface";
import { BASE_PATH } from "@config";
import LocationController from "@/controllers/location.controller";

class LocationRoute implements Routes {
  public path = `${BASE_PATH}/location`;
  public router = Router();
  public controller = new LocationController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/city`, this.controller.getCity);
    this.router.get(`${this.path}/province`, this.controller.getProvince);
  }
}

export default LocationRoute;
