import { Get, JsonController } from "routing-controllers";
import { SystemInfo } from './model';

@JsonController()
export default class SystemController {
  @Get("/system/info")
  getSystemInfo() {
    return new SystemInfo("OK");
  }
}
