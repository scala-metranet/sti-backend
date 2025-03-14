import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";
import { Model } from "objection";
import { NODE_ENV, PORT, LOG_FORMAT } from "@config";
import knex from "@databases";
import { Routes } from "@interfaces/routes.interface";
import errorMiddleware from "@middlewares/error.middleware";
import { logger, stream } from "@utils/logger";

//import { join } from "path";
//import formidableMiddleware from "express-formidable-typescript";
//import { responseHelper } from '@utils/responseHelper';

class App {
  public app: express.Application;
  public env: string;
  public port: string | number;

  constructor(routes: Routes[]) {
    this.app = express();
    this.env = NODE_ENV || "development";
    this.port = PORT || 3000;

    this.connectToDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeErrorHandling();
  }

  public listen() {
    try {
      // const keyPath = join(__dirname, "../keys/cloudflare-key.pem");
      // const certPath = join(__dirname, "../keys/cloudflare-cert.pem");
      // const caPath = join(__dirname, "../keys/cloudflare-ca.pem");
      // const server = https.createServer(
      //   {
      //     key: fs.readFileSync(keyPath),
      //     cert: fs.readFileSync(certPath),
      //     ca: fs.readFileSync(caPath),
      //   },
      //   this.app,
      // );
      const server = this.app;
      server.listen(this.port, () => {
        logger.info("=================================");
        logger.info(`======= ENV: ${this.env} =======`);
        logger.info(`🚀 App listening on the port ${this.port}`);
        logger.info("=================================");
      });
    } catch (error) {
      console.log(error);
    }
  }

  public getServer() {
    return this.app;
  }

  private connectToDatabase() {
    Model.knex(knex);
  }

  private initializeMiddlewares() {
    const corsOptions = {
      origin: "*",
    };

    //this.app.use(limiter);

    this.app.use(morgan(LOG_FORMAT, { stream }));
    //this.app.use(cors({ origin: ORIGIN, credentials: CREDENTIALS }));
    this.app.use(cors(corsOptions));
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json({ limit: "100mb" }));
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
    // this.app.use(
    // 	formidableMiddleware({
    // 		multiples: true, // req.files to be arrays of files
    // 		keepExtensions: true,
    // 		//uploadDir: __dirname,
    // 	}),
    // );

    //this.app.use(responseHelper);
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach(route => {
      this.app.use("/", route.router);
    });
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }
}

export default App;
