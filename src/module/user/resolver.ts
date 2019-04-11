import {Arg, Ctx, Mutation, Query, Resolver} from "type-graphql";
import {Inject} from "typedi";
import Logger from "../../connector/logger";
import {User, UserInput, UserRoles} from "./model";
import {UserService} from "./service";

export const checkPermissions = (actionUser: User, userToUpdateId: number) =>  {
  if (!(
    actionUser.roles.includes(UserRoles.ZENVO_ADMIN) ||
    actionUser.roles.includes(UserRoles.ZENVO_MANAGER) ||
    actionUser.id !== userToUpdateId
  )) {
    throw new Error('Action not allowed!');
  }

  return true;
};

@Resolver(User)
export default class UserResolver {
  @Inject()
  public logger: Logger;

  @Inject()
  public userService: UserService;

  @Query((returns) => User)
  public getUser(@Arg("userId") userId: number) {
    try {
      return this.userService.getUser(userId);
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  @Mutation((returns) => [User])
  public createUser(@Ctx("user") user: User, @Arg("user") newUserData: UserInput) {
    try {
      return this.userService.createUser(newUserData);
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  @Mutation((returns) => [User])
  public updateUser(@Ctx("user") user: User, @Arg("user") userData: UserInput) {
    checkPermissions(user, userData.id);

    try {
      return this.userService.updateUser(userData);
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  @Mutation((returns) => [User])
  public updateUserRoles(@Ctx("user") user: User, @Arg("userId") userId: number, @Arg("roles", type => [UserRoles]) roles: UserRoles[]) {
    checkPermissions(user, userId);

    try {
      return this.userService.updateUserRoles(userId, roles);
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  @Mutation((returns) => [User])
  public deleteUser(@Ctx("user") user: User, @Arg("userId") userId: number) {
    checkPermissions(user, userId);

    try {
      return this.userService.deleteUser(userId);
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  @Query((returns) => [User])
  public getAllUsers(@Ctx("user") user: User) {
    try {
      return this.userService.getAllUsers();
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }
}
