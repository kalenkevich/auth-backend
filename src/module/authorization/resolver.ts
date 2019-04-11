import {ApolloError} from "apollo-error";
import {Arg, Ctx, Mutation, Query, Resolver} from "type-graphql";
import {Inject} from "typedi";
import {Request, Response} from "express";
import {User} from "../user/model";
import {UserSignInInput, UserSignUpInput} from "./model";
import Logger from "../../connector/logger";
import AuthorizationService from "./service";

@Resolver(User)
export default class AuthorizationResolver {
  @Inject()
  public authorizationService: AuthorizationService;

  @Inject()
  public logger: Logger;

  @Mutation((returns) => User)
  public async signIn(@Arg("signInData") signInData: UserSignInInput, @Ctx("response") res: Response) {
    try {
      const user = await this.authorizationService.signIn(signInData);

      res.cookie("token", user.token);

      return user;
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  @Mutation((returns) => User)
  public async signUp(@Arg("signUpData") signUpData: UserSignUpInput, @Ctx("response") res: Response) {
    try {
      const user = await this.authorizationService.signUp(signUpData);

      res.cookie("token", user.token);

      return user;
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  @Query((returns) => User)
  public async authorize(@Ctx("request") req: Request) {
    try {
      const {token} = req.cookies;
      return this.authorizationService.authenticate(token);
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  @Query((returns) => Boolean)
  public async signOut(@Ctx("request") req: Request, @Ctx("response") res: Response) {
    try {
      const {token} = req.cookies;

      await this.authorizationService.signOut(token);

      res.clearCookie("token");

      return true;
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }
}
