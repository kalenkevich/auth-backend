import { Inject } from "typedi";
import { Get, JsonController, Param } from "routing-controllers";
import { UserService }  from "./service";
import Logger from "../../connector/logger";

@JsonController()
export default class UserController {
  @Inject()
  public logger: Logger;

  @Inject()
  public userService: UserService;

  @Get("/user/:userId")
  public async getUser(@Param("userId") userId: number) {
    try {
      return this.userService.getUser(userId);
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  @Get("/users")
  public async getAllUsers() {
    try {
      return this.userService.getAllUsers();
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }
}
