import {Arg, Ctx, Query, Resolver} from "type-graphql";
import {Inject} from "typedi";
import Logger from "../../connector/logger";
import {User} from "./model";
import {UserService} from "./service";

@Resolver(User)
export default class UserResolver {
  @Inject()
  public logger: Logger;

  @Inject()
  public userService: UserService;

  @Query((returns) => User)
  public async getUser(@Arg("userId") userId: number) {
    try {
      const result = await this.userService.getUser(userId);

      this.logger.info(`Successfully fetched user ${result.name}`);

      return result;
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  @Query((returns) => [User])
  public async getAllUsers(@Ctx("user") user: User) {
    try {
      const result = await this.userService.getAllUsers();

      this.logger.info(`Successfully fetched all users for user ${user}`);

      return result;
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }
}
