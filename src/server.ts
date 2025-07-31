import App from "@/app";
import AuthRoute from "@routes/auth.route";
import IndexRoute from "@routes/index.route";
import UsersRoute from "@routes/users.route";
import RolesRoute from "@routes/roles.route";
import validateEnv from "@utils/validateEnv";
import CompanyRoute from "@routes/company.route";
import InternshipProgramRoute from "@routes/internship_program.route";
import InternshipRoute from "@routes/internship.route";
import SquadRoute from "@routes/squad.route";
import UserInternshipRoute from "@routes/user_internship.route";
import UserInternshipDocumentRoute from "@routes/user_internship_document.route";
import OkrRoute from "./routes/okr.route";
import CampusRoute from "./routes/campus.route";
import LocationRoute from "./routes/location.route";
import XlsRoute from "./routes/xls.route";
import ScheduleRoute from "./routes/schedule.route";
import DashboardRoute from "./routes/dashboard.route";
import ScoringRoute from "./routes/scoring.route";
import JoinRequestRoute from "./routes/join_request.route";
import BatchMasterRoute from "./routes/batch_master.route";
import CompanyVisitRoute from "./routes/company_visit.route";
import NewsRoute from "./routes/news.route";
import ClassesRoute from "./routes/classes.route";
import GraduationRoute from "./routes/graduation.route";
import AttendanceRoute from "./routes/attendance.route";
import MitraRoute from "./routes/mitra.route";
import ProjectRoute from "./routes/project.route";

validateEnv();

const app = new App([
  new IndexRoute(),
  new UsersRoute(),
  new AuthRoute(),
  new RolesRoute(),
  new CompanyRoute(),
  new InternshipProgramRoute(),
  new InternshipRoute(),
  new SquadRoute(),
  new UserInternshipRoute(),
  new UserInternshipDocumentRoute(),
  new OkrRoute(),
  new CampusRoute(),
  new LocationRoute(),
  new XlsRoute(),
  new ScheduleRoute(),
  new DashboardRoute(),
  new ScoringRoute(),
  new JoinRequestRoute(),
  new BatchMasterRoute(),
  new CompanyVisitRoute(),
  new NewsRoute(),
  new ClassesRoute(),
  new GraduationRoute(),
  new AttendanceRoute(),
  new MitraRoute(),
  new ProjectRoute()
]);

app.listen();
