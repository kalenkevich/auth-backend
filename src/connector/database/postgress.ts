import {Inject, Service} from "typedi";
import {Connection, createConnection, EntityManager} from "typeorm";
import DatabaseConnectorInterface from "./interface";
import entities from './entities';

@Service()
export default class PostgresDBConnector implements DatabaseConnectorInterface {
  @Inject("settings")
  settings: any;
  connection: Connection;
  entityManager: EntityManager;

  public async connect() {
    const config = this.settings;

    this.connection = await createConnection({
      type: "postgres",
      host: config.Database.host,
      port: config.Database.port,
      username: config.Database.username,
      password: config.Database.password,
      database: config.Database.database,
      entities,
      extra: {
        ssl: process.env.NODE_ENV !== "local",
        timezone: "utc",
      },
      synchronize: true,
    });

    this.entityManager = new EntityManager(this.connection);

    return this.connection;
  }
}
