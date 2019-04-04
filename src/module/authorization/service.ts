import { ApolloError } from "apollo-error";
import * as bcrypt from "bcrypt-nodejs";
import * as jwt from "jsonwebtoken";
import { Inject, Service } from "typedi";
import { User } from "../user/model";
import { UserService } from "../user/service";
import { UserSignInInput, UserSignUpInput } from "./model";

@Service()
export default class AuthorizationService {
    @Inject()
    public userService: UserService;

    @Inject("settings")
    settings: any;

    public async signUp(signUpData: UserSignUpInput): Promise<User> {
        const existingUser = await this.userService.getUser({
            email: signUpData.email,
        });

        if (existingUser) {
            throw new ApolloError("User with such email already exist", 401);
        }

        const chippedPassword = bcrypt.hashSync(signUpData.password);
        await this.userService.createUser({ ...signUpData, password: chippedPassword });

        return this.signIn(signUpData);
    }

    public async signIn({ email, password }: UserSignInInput): Promise<User> {
        const user = await this.userService.getUser({ email });

        if (user) {
            const isValidPassword = bcrypt.compareSync(password, user.password);

            if (!isValidPassword) {
                throw new ApolloError("Email or password is invalid", 401);
            } else if (!user.active) {
                throw new ApolloError("Account is not yet activated. Please check your e-mail for activation link.", 401);
            } else {
                const token = await this.regenerateToken(user);

                return this.authenticate(token);
            }
        } else {
            throw new ApolloError("Email or password is invalid", 401);
        }
    }

    public async regenerateToken(user: User): Promise<string> {
        const { id, email } = user;
        const token = await jwt.sign({id, email}, this.settings.TokenSecret);

        await this.userService.setToken(user.id, token);

        return token;
    }

    public async authenticate(token: string): Promise<User> {
        if (!token) {
            throw new ApolloError("Provided token is not defined", 401);
        }

        const user = await this.userService.getUser({ token });

        if (!user) {
            throw new ApolloError("Can't authorize with provided token", 401);
        }

        return user;
    }

    public async signOut(token: string) {
        const user = await this.userService.getUser({ token });

        return this.userService.removeToken(user.id);
    }
}
