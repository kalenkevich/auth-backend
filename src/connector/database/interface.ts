import { Connection, EntityManager } from "typeorm";

export default interface IDatabaseConnector {
    settings: any;
    connection: Connection;
    entityManager: EntityManager;
    connect(): Promise<any>;
}
