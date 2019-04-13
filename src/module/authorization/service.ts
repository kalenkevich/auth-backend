import {ApolloError} from "apollo-error";
import * as bcrypt from "bcrypt-nodejs";
import * as jwt from "jsonwebtoken";
import {Inject, Service} from "typedi";
import {User} from "../user/model";
import {UserService} from "../user/service";
import {UserSignInInput, UserSignUpInput} from "./model";
import EmailService from "../../service/mailService";

@Service()
export default class AuthorizationService {
  @Inject()
  public userService: UserService;
  @Inject()
  public emailService: EmailService;

  @Inject("settings")
  settings: any;

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
        Please, follow this <a href="http://localhost:8082/verify?token=${safeToken}">link</a> to verify your email address.
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
}
