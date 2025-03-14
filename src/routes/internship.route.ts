import { Router } from "express";
import { Routes } from "@interfaces/routes.interface";
import { BASE_PATH } from "@config";
import authMiddleware from "@middlewares/auth.middleware";
import InternshipController from "@/controllers/internship.controller";
import multer from "multer";
import AttachmentController from "@/controllers/attachment.controller";
import Internshipv2Controller from "@/controllers/internshipv2.controller";
const upload = multer({ dest: "uploads/" });
class InternshipRoute implements Routes {
  public path = `${BASE_PATH}/internship`;
  public pathv2 = `${BASE_PATH}/internship/v2`;
  public pathRegistrant = `${BASE_PATH}/applicant`;
  public pathAttachment = `${BASE_PATH}/attachment`;
  public pathRemapping = `${BASE_PATH}/remapping`;

  public router = Router();
  public controller = new InternshipController();
  public controllerv2 = new Internshipv2Controller();
  public attachmentController = new AttachmentController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    //v2
    this.router.get(`${this.pathv2}`, authMiddleware, this.controllerv2.get);
    this.router.get(`${this.pathv2}/mentee/self_interview`, authMiddleware, this.controllerv2.getUserInterview);
    this.router.get(`${this.pathv2}/mentee/challenge`, authMiddleware, this.controllerv2.getUserChallenge);

    this.router.get(`${this.pathv2}/:id(\\w+)`, authMiddleware, this.controllerv2.detail);
    this.router.post(`${this.pathv2}/create`, authMiddleware, this.controllerv2.create);
    this.router.get(`${this.pathv2}/mentee/register`, authMiddleware, this.controllerv2.menteeRegisterList);
    this.router.post(`${this.pathv2}/mentee/register`, authMiddleware, this.controllerv2.menteeRegister);
    this.router.post(`${this.pathv2}/mentee/self_interview`, upload.any(), authMiddleware,  this.controllerv2.menteeInterview);
    this.router.post(`${this.pathv2}/mentee/challenge`, upload.any(), authMiddleware,  this.controllerv2.menteeChallenge);
    this.router.post(`${this.pathv2}/mentee/delete`, authMiddleware,  this.controllerv2.menteeDelete);

    this.router.post(`${this.pathv2}/duplicate/:id(\\w+)`, authMiddleware, this.controllerv2.duplicateInternship);

    this.router.put(`${this.pathv2}/:id(\\w+)`, authMiddleware, this.controllerv2.update);

    //endv2
    this.router.get(`${this.path}`, authMiddleware, this.controller.get);
    this.router.get(`${this.path}/public`, this.controller.getPublic);
  
    this.router.get(`${this.path}/mentor`, authMiddleware, this.controller.getByMentor);
    this.router.get(`${this.path}/registrant`, authMiddleware, this.controller.getRegistrant);
    this.router.get(`${this.path}/mitra`, authMiddleware, this.controller.getByMitra);
    this.router.get(`${this.path}/location`, authMiddleware, this.controller.getLocation);
    this.router.get(`${this.path}/:id(\\w+)`, authMiddleware, this.controller.detail);
    this.router.post(`${this.path}`, authMiddleware, this.controller.create);
    this.router.post(`${this.path}/assign`, authMiddleware, this.controller.assign);
    this.router.post(`${this.path}/unassign`, authMiddleware, this.controller.unAssign);
    this.router.post(`${this.path}/update-quota`, authMiddleware, this.controller.updateQuota);
    this.router.put(`${this.path}/:id(\\w+)`, authMiddleware, this.controller.update);
    this.router.delete(`${this.path}/:id(\\w+)`, authMiddleware, this.controller.delete);

    this.router.get(`${this.pathRegistrant}`, authMiddleware, this.controller.getRegistrant);
    this.router.get(`${this.pathRegistrant}/detail/:id(\\w+)`, authMiddleware, this.controller.getRegistrantDetail);

    this.router.get(`${this.pathRegistrant}/download`, authMiddleware, this.controller.downloadRegistrant);
    this.router.get(`${this.pathRegistrant}/filter-internship`, authMiddleware, this.controller.filterInternship);
    this.router.get(`${this.pathRegistrant}/filter-company`, authMiddleware, this.controller.filterCompany);
    this.router.get(`${this.pathRegistrant}/filter-mentor`, authMiddleware, this.controller.filterMentor);
    this.router.get(`${this.pathRegistrant}/filter-mitra`, authMiddleware, this.controller.filterMitra);

    this.router.get(`${this.pathRegistrant}/count`, authMiddleware, this.controller.getRegistrantCount);
    this.router.post(`${this.pathRegistrant}/interview`, authMiddleware, this.controller.createInterview);
    this.router.post(`${this.pathRegistrant}/interview-score/:id(\\w+)`, authMiddleware, this.controller.updateApplicantInterview);
    this.router.post(`${this.pathRegistrant}/challenge-score/:id(\\w+)`, authMiddleware, this.controller.updateApplicantChallenge);

    this.router.post(`${this.pathRegistrant}/update`, authMiddleware, this.controller.updateApplicant);
    this.router.post(`${this.pathRegistrant}/update-mou`, upload.any(), authMiddleware, this.controller.updateApplicantMou);
    this.router.post(`${this.pathRegistrant}/resend-notif`, authMiddleware, this.controller.resendNotif);
    this.router.post(`${this.pathRegistrant}/bulk-send-notif`, authMiddleware, this.controller.bulkSendNotif);
    this.router.post(`${this.pathRegistrant}/confirm_mentee`, authMiddleware, this.controller.confirmMentee);

    
    this.router.get(`${this.pathRemapping}/:id(\\w+)`, authMiddleware, this.controller.getRemapping);
    this.router.post(`${this.pathRemapping}`, authMiddleware, this.controller.remapping);

    this.router.get(`${this.pathAttachment}/template`, authMiddleware, this.attachmentController.getTemplate);
    this.router.post(`${this.pathAttachment}/template/add`, upload.any(),  authMiddleware, this.attachmentController.createTemplate);
    this.router.delete(`${this.pathAttachment}/template/delete/:id(\\w+)`, authMiddleware, this.attachmentController.delete);

    this.router.get(`${this.pathAttachment}/mentee`, authMiddleware, this.attachmentController.getMentee);
    this.router.post(`${this.pathAttachment}/mentee/add`, upload.any(), authMiddleware, this.attachmentController.createMentee);

    this.router.get(`${this.pathAttachment}/monitoring`, authMiddleware, this.attachmentController.getMonitoring);
    this.router.get(`${this.pathAttachment}/monitoring/count`, authMiddleware, this.attachmentController.countMonitoring);
    this.router.post(`${this.pathAttachment}/monitoring/update`, authMiddleware, this.attachmentController.updateMonitoring);
  }
}

export default InternshipRoute;
