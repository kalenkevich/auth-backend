import { Inject } from "typedi";
import {Get, Post, Put, Delete, JsonController, Param, Body, Ctx} from "routing-controllers";
import { UserService }  from "./service";
import { checkPermissions } from './resolver';
import Logger from "../../connector/logger";
import {User, UserInput, UserRoles, UserSearchQuery} from "./model";

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

  @Post("/user/search")
  public searchUsers(@Ctx() user: User, @Body() searchQuery: UserSearchQuery) {
    try {
      return this.userService.search(searchQuery);
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  @Post("/user/:userId")
  public createUser(@Ctx() user: User, @Body() newUserData: UserInput) {
    try {
      return this.userService.createUser(newUserData);
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  @Put("user/:userId")
  public updateUser(@Ctx() user: User, @Body() userData: UserInput) {
    checkPermissions(user, userData.id);

    try {
      return this.userService.updateUser(userData);
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  @Put("user/:userId")
  public updateUserRoles(@Ctx() user: User, @Param("userId") userId: number, @Body() roles: UserRoles[]) {
    checkPermissions(user, userId);

    try {
      return this.userService.updateUserRoles(userId, roles);
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  @Delete("/user/:userId")
  public deleteUser(@Ctx() user: User, @Param("userId") userId: number) {
    checkPermissions(user, userId);

    try {
      return this.userService.deleteUser(userId);
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }
}
