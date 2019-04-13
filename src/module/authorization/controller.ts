import {Inject} from "typedi";
import {Request, Response} from "express";
import {Body, Ctx, Get, JsonController, Post, Req, Res} from "routing-controllers";
import {UserSignInInput, UserSignUpInput} from "./model";
import Logger from "../../connector/logger";
import AuthorizationService from "./service";
import {User} from "../user/model";

@JsonController()
export default class AuthorizationController {
  @Inject()
  public authorizationService: AuthorizationService;

  @Inject()
  public logger: Logger;

  @Post("/sign-in")
  async signIn(@Body() signInData: UserSignInInput, @Res() res: Response) {
    try {
      const user = await this.authorizationService.signIn(signInData);

      res.cookie("token", user.token);

      return user;
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  @Post("/sign-up")
  async signUp(@Body() signUpData: UserSignUpInput, @Res() res: Response) {
    try {
      const user = await this.authorizationService.signUp(signUpData);

      res.cookie("token", user.token);

      return user;
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  @Get("/authorize")
  async authorize(@Req() req: Request) {
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

  @Get("/sign-out")
  async signOut(@Req() req: Request, @Res() res: Response, @Ctx() user: User) {
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
}
