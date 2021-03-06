import {ApolloError} from "apollo-error";
import {Arg, Ctx, Mutation, Query, Resolver} from "type-graphql";
import {Inject} from "typedi";
import {Request, Response} from "express";
import {SocialProvider, User} from "../user/model";
import {SocialUserData, UserSignInInput, UserSignUpInput} from "./model";
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
  public async signInWith(@Arg("provider") provider: SocialProvider, @Arg("code") code: string, @Ctx("response") res: Response) {
    try {
      const user = await this.authorizationService.signInWith(provider, code);

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
  public async authorize(@Ctx("request") req: Request, @Ctx("response") res: Response) {
    try {
      const token = req.get('Authorization') || (req.cookies && req.cookies.token);

      if (token) {
        return this.authorizationService.authenticate(token);
      }

      throw new Error('Authorization token is not provided');
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  @Query((returns) => Boolean)
  public async signOut(@Ctx("user") user: User, @Ctx("response") res: Response) {
    try {
      await this.authorizationService.signOut(user);

      res.clearCookie("token");
      res.removeHeader('Authorization');

      return true;
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  @Query((returns) => Boolean)
  public async resendVerificationEmail(@Ctx("user") user: User) {
    try {
      await this.authorizationService.sendVerificationEmail(user);

      return true;
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  @Query((returns) => Boolean)
  public async verifyEmail(@Ctx("user") user: User, @Arg("verificationToken") verificationToken: string) {
    try {
      const result = await this.authorizationService.verifyEmail(user, verificationToken);

      if (result) {
        return true;
      }

      throw new Error('Email verification token is not valid');
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  @Query((returns) => Boolean)
  public async initiateResetPassword(@Arg("email") email: string) {
    try {
      return this.authorizationService.initiateResetPassword(email);
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  @Query((returns) => Boolean)
  public async confirmResetPassword(@Arg("email") email: string, @Arg("verificationToken") verificationToken: string, @Arg("newPassword") newPassword:string) {
    try {
      return this.authorizationService.confirmResetPassword(email, verificationToken, newPassword);
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }
}
