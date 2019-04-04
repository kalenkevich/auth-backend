import {Service} from "typedi";

@Service()
export default class Logger {
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
}
