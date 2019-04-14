import * as bcrypt from "bcrypt-nodejs";
import * as jwt from "jsonwebtoken";
import {ApolloError} from "apollo-error";
import {Inject, Service} from "typedi";
import {User} from "../user/model";
import {UserService} from "../user/service";
import {UserSignInInput, UserSignUpInput} from "./model";
import EmailService from "../../service/mailService";
import SocialService from "../../service/socialService";

@Service()
export default class AuthorizationService {
  @Inject("settings")
  settings: any;

  @Inject()
  public userService: UserService;

  @Inject()
  public emailService: EmailService;

  @Inject()
  public socialService: SocialService;

  public async signUp(signUpData: UserSignUpInput) {
    const existingUser = await this.userService.getUser({
      email: signUpData.email,
    });

    if (existingUser) {
      throw new ApolloError("User with such email already exist", 401);
    }

    const chippedPassword = bcrypt.hashSync(signUpData.password);
    const user = await this.userService.createUser({
      ...signUpData,
      password: chippedPassword,
    });
    await this.sendVerificationEmail(user);

    return this.signIn(signUpData);
  }

  public async signIn({email, password}: UserSignInInput): Promise<User> {
    const user = await this.userService.getUser({email});

    if (user) {
      const isValidPassword = bcrypt.compareSync(password, user.password);

      if (!isValidPassword) {
        throw new ApolloError("Email or password is invalid", 401);
      } else {
        const token = await this.regenerateToken(user);

        return this.authenticate(token);
      }
    } else {
      throw new ApolloError("Email or password is invalid", 401);
    }
  }

  public async signInWith(provider: string, code: string): Promise<User> {
    const socialUserData = await this.socialService.signInWith(provider, code);
    const foundedUser = await this.userService.getUser({ providerUserId: socialUserData.providerUserId });

    if (foundedUser) {
      await this.userService.setToken(foundedUser.id, socialUserData.token);
    } else {
      await this.userService.createUser({
        ...socialUserData,
        provider,
      });
    }

    return this.authenticate(socialUserData.token);
  }

  public async regenerateToken(user: User): Promise<string> {
    const {id, email} = user;
    const token = await jwt.sign({id, email}, this.settings.TokenSecret);

    await this.userService.setToken(user.id, token);

    return token;
  }

  public async authenticate(token: string): Promise<User> {
    if (!token) {
      throw new ApolloError("Provided token is not defined", 401);
    }

    const user = await this.userService.getUser({token});

    if (!user) {
      throw new ApolloError("Can't authorize with provided token", 401);
    }

    return user;
  }

  public async signOut(user: User) {
    return this.userService.removeToken(user.id);
  }

  public async sendVerificationEmail(user: User) {
    const verificationToken = bcrypt.hashSync(Date.now().toString());
    const safeToken = encodeURIComponent(verificationToken);

    await this.userService.setVerificationToken(user.id, verificationToken);
    await this.emailService.sendMail({
      to: user.email,
      subject: 'Verify your email address please',
      html: `
        Dear ${user.name},
        <br/>
        Please, follow this <a href="${this.settings.AuthFrontendUrl}/verify/email/confirm?token=${safeToken}">link</a> to verify your email address.
        <br/>
        <br/>
        <br/>
        <br/>
        Best regards,
        <br/>
        Zenvo team
      `,
    });
  }

  public async sendResetPasswordEmail(user: User) {
    const verificationToken = bcrypt.hashSync(Date.now().toString());
    const safeToken = encodeURIComponent(verificationToken);
    const safeEmail = encodeURIComponent(user.email);

    await this.userService.setVerificationToken(user.id, verificationToken);
    await this.emailService.sendMail({
      to: user.email,
      subject: 'Reset your password',
      html: `
        Dear ${user.name},
        <br/>
        Please, follow this <a href="${this.settings.AuthFrontendUrl}/reset/password/confirm?email=${safeEmail}&token=${safeToken}">link</a> to reset your password.
        <br/>
        <br/>
        <br/>
        <br/>
        Best regards,
        <br/>
        Zenvo team
      `,
    });
  }

  public async verifyEmail(user: User, verificationToken: string): Promise<User | boolean> {
    const foundedUser = await this.userService.getUser(user.id);

    if (foundedUser.verificationToken === verificationToken) {
      await this.userService.removeVerificationToken(user.id);
      await this.userService.makeActive(user.id);

      return true;
    }

    return false;
  }

  public async initiateResetPassword(email: string) {
    const foundedUser = await this.userService.getUser({ email });

    if (foundedUser) {
      await this.sendResetPasswordEmail(foundedUser);

      return true;
    }

    return false;
  }

  public async confirmResetPassword(email: string, verificationToken: string, newPassword: string) {
    const foundedUser = await this.userService.getUser({ email });

    if (foundedUser.verificationToken === verificationToken) {
      const chippedPassword = bcrypt.hashSync(newPassword);

      await this.userService.removeVerificationToken(foundedUser.id);
      await this.userService.updatePassword(foundedUser.id, chippedPassword);

      return true;
    }

    return false;
  }
}
