import cors from "cors";
import express, {Application} from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import {Container, Inject, Service} from "typedi";
import {buildSchema} from "type-graphql";
import {ApolloServer} from "apollo-server-express";
import {PostgressConnector} from "./connector/database";
import {resolvers} from "./graphql";
import {User} from "./module/user/model";
import {UserRole} from "./module/user/role";
import Logger from "./connector/logger";

@Service()
export default class ApplicationServer {
  private settings: any;

  @Inject()
  private logger: Logger;

  @Inject()
  private dbConnector: PostgressConnector;

  private server: ApolloServer;

  private readonly app: Application;

  private readonly port: number;

  private get userRepository() {
    return this.dbConnector.connection.getRepository(User);
  }

  public constructor(@Inject("settings") settings: any) {
    this.settings = settings;
    this.port = process.env.PORT || settings.Port;
    this.app = express();

    this.registerBodyParsers(settings);
    this.configureHeaders(settings);
  }

  private registerBodyParsers(settings: any) {
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({extended: false}));
    this.app.use(cookieParser(settings.TokenSecret));
  }

  private configureHeaders(settings: any) {
    this.app.use(cors((req, callback) => {
      const currentClientOrigin = req.header("origin");
      const origin = (settings.AllowedClientOrigins || []).find((allowedOrigin: string) => allowedOrigin === currentClientOrigin);

      callback(null, {origin, credentials: true});
    }));
  }

  private async initServer() {
    this.app.set("port", this.port);

    const schema = await buildSchema({
      resolvers,
      authChecker: ({root, args, context, info}, roles: UserRole[]) => {
        const {user} = context;

        return roles.indexOf(user.role) !== -1;
      },
    });

    this.server = new ApolloServer({
      schema,
      context: async ({req, res}) => {
        const {token} = req.cookies;
        const user = await this.userRepository.findOne({token}) || {};

        return {user, token, request: req, response: res};
      },
    });

    this.server.applyMiddleware({
      app: this.app,
      cors: false,
    });

    return this.app;
  }

  private async initDatabase() {
    await this.dbConnector.connect();

    Container.set("EntityManager", this.dbConnector.entityManager);
  }

  private async init() {
    try {
      await this.initDatabase();
      this.logger.info(`Successfully connected to the database: ${this.settings.Database.host}.${this.settings.Database.database}`);
    } catch (error) {
      this.logger.error(`Error while connecting to the database: ${error.message}`);
    }

    try {
      await this.initServer();
    } catch (error) {
      this.logger.error(`Error while init server: ${error.message}`);
    }

    return this;
  }

  public async run() {
    try {
      this.logger.info(`Running server...`);

      await this.init();

      this.app.listen(this.port, () => this.logger.info(`Server running on port: ${this.port}`));
    } catch (error) {
      this.logger.error(`Error while starting server: ${error.message}`);
    }
  }
}
