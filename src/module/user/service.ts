import bcrypt from "bcrypt-nodejs";
import {Service} from "typedi";
import {getRepository, Repository, UpdateResult} from "typeorm";
import {User, UserInput} from "./model";

@Service()
export class UserService {
  private repository: Repository<User> = getRepository(User);

  public async getUser(selectOptions: any): Promise<User> {
    return this.repository.findOne(selectOptions);
  }

  public getAllUsers() {
    return this.repository.find();
  }

  public async createUser(userData: any): Promise<User> {
    const createdUser = this.repository.create(userData);
    const result = await this.repository.save(createdUser);

    return result[0];
  }

  public updateUser(user: UserInput): Promise<UpdateResult> {
    return this.repository.update(user.id, {...user});
  }

  public setToken(userId: number, token: string) {
    return this.repository.update(userId, {token});
  }

  public removeToken(userId: number): Promise<UpdateResult> {
    return this.repository.update(userId, {token: null});
  }

  public async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<UpdateResult | boolean> {
    const user = await this.getUser({id: userId});
    const isValidPassword = bcrypt.compareSync(oldPassword, user.password);

    if (isValidPassword) {
      return this.repository.update(userId, {password: newPassword});
    }

    return false;
  }

  public changePhone(userId: number, phone: string): Promise<UpdateResult> {
    return this.repository.update(userId, {phone});
  }
}
