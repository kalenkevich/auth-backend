import bcrypt from "bcrypt-nodejs";
import {Service} from "typedi";
import {DeleteResult, getRepository, Repository, UpdateResult, In} from "typeorm";
import {User, UserInput, UserSearchQuery} from "./model";

@Service()
export class UserService {
  private repository: Repository<User> = getRepository(User);

  public getUser(selectOptions: any): Promise<User> {
    return this.repository.findOne(selectOptions);
  }

  public getAllUsers() {
    return this.repository.find();
  }

  public async createUser(userData: any): Promise<User> {
    const createdUser = this.repository.create(userData as User);

    return await this.repository.save(createdUser);
  }

  public search(userSearchQuery: UserSearchQuery): Promise<User[]> {
    if (userSearchQuery.userIds.length > 0) {
      return this.repository.find({
        where: {
          id: In(userSearchQuery.userIds),
        }
      });
    }

    return Promise.resolve([]);
  }

  public updateUser(user: UserInput): Promise<UpdateResult> {
    return this.repository.update(user.id, {...user});
  }

  public updateUserRoles(userId: number, roles: string[]): Promise<UpdateResult> {
    return this.repository.update(userId, { roles });
  }

  public deleteUser(userId: number): Promise<DeleteResult> {
    return this.repository.delete(userId);
  }

  public setToken(userId: number, token: string) {
    return this.repository.update(userId, {token});
  }

  public setVerificationToken(userId: number, verificationToken: string): Promise<UpdateResult> {
    return this.repository.update(userId, {verificationToken});
  }

  public removeToken(userId: number): Promise<UpdateResult> {
    return this.repository.update(userId, {token: null});
  }

  public removeVerificationToken(userId: number): Promise<UpdateResult> {
    return this.repository.update(userId, {verificationToken: null});
  }

  public makeActive(userId: number): Promise<UpdateResult> {
    return this.repository.update(userId, {active: true});
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
