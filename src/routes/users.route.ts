import { Router } from "express";
import UsersController from "@controllers/users.controller";
import { Routes } from "@interfaces/routes.interface";
import { BASE_PATH } from "@config";
import authMiddleware from "@middlewares/auth.middleware";
import multer from "multer";
import { adminGuardMiddleware, adminMentorGuardMiddleware, guard } from "@/middlewares/guard.middleware";
import { RoleName } from "@/dtos/roles.dto";
const upload = multer({ dest: "uploads/" });
class UsersRoute implements Routes {
  public path = `${BASE_PATH}/users`;
  public router = Router();
  public usersController = new UsersController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, authMiddleware, this.usersController.getUsers);

    this.router.get(`${this.path}/get-letter/:id`, this.usersController.getLetter);

    this.router.get(`${this.path}/mentor`, authMiddleware, this.usersController.getUsersByMentor);

    this.router.get(`${this.path}/mentee/:id(\\w+)`, authMiddleware, guard([RoleName.super_admin]), this.usersController.getMenteeDetail);

    this.router.get(`${this.path}/:id(\\w+)`, authMiddleware, guard([RoleName.super_admin]), this.usersController.getUserById);

    this.router.post(`${this.path}`, upload.any(), authMiddleware, adminGuardMiddleware, this.usersController.createUser);

    this.router.post(`${this.path}/resend-verification/:id(\\w+)`, authMiddleware, adminGuardMiddleware, this.usersController.resendVerification);

    this.router.put(
      `${this.path}/mentee/profile/:id(\\w+)`,
      upload.any(),
      authMiddleware,
      adminMentorGuardMiddleware,
      this.usersController.updateProfile,
    );

    this.router.put(
      `${this.path}/mentee/education/:id(\\w+)`,
      upload.any(),
      authMiddleware,
      adminMentorGuardMiddleware,
      this.usersController.updateEducation,
    );

    this.router.put(`${this.path}/mentee/experience/:id(\\w+)`, authMiddleware, adminMentorGuardMiddleware, this.usersController.updateExperience);

    this.router.put(
      `${this.path}/mentee/certificate/:id(\\w+)`,
      upload.any(),
      authMiddleware,
      adminMentorGuardMiddleware,
      this.usersController.updateCertificate,
    );

    this.router.put(`${this.path}/mentee/file/:id(\\w+)`, upload.any(), authMiddleware, adminMentorGuardMiddleware, this.usersController.updateFile);

    this.router.put(
      `${this.path}/mentee/preference/:id(\\w+)`,
      upload.any(),
      authMiddleware,
      adminMentorGuardMiddleware,
      this.usersController.updateProfile,
    );

    this.router.put(`${this.path}/:id(\\w+)`, upload.any(), authMiddleware, guard([RoleName.super_admin]), this.usersController.updateUser);

    this.router.delete(`${this.path}/:id(\\w+)`, authMiddleware, adminGuardMiddleware, this.usersController.deleteUser);
    this.router.post(`${this.path}/verify`, this.usersController.verifyUser);
  }
}

export default UsersRoute;
