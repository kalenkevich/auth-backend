import {Service} from "typedi";
import ConnectorInterface from '../interface';

@Service()
export default class Logger implements ConnectorInterface {
  settings: any;

  public trace(message: string) {
    console.log(message);
  }

  public info(message: string) {
    console.log(message);
  }

  public warn(message: string) {
    console.log(message);
  }

  public error(message: string) {
    console.log(message);
  }

  connect() {
    return Promise.resolve();
  }
}
