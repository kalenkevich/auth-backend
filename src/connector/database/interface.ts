import {Connection, EntityManager} from "typeorm";
import ConnectorInterface from '../interface';

export default interface IDatabaseConnector extends ConnectorInterface {
  connection: Connection;
  entityManager: EntityManager;
}
