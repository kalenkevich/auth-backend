import {Field, ID, InputType, ObjectType} from "type-graphql";
import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import { registerEnumType } from "type-graphql";

export enum UserApplications {
  AUTH = 'AUTH',
  BLOG = 'BLOG',
  HOLIDAY = 'HOLIDAY',
}

export enum UserRoles {
  ZENVO_ADMIN = 'ZENVO_ADMIN', // admin user role across the Zenvo apps (highest role priority)
  ZENVO_MANAGER = 'ZENVO_MANAGER', // manager user role across the Zenvo apps
  ZENVO_USER = 'ZENVO_USER', // primary user role across the Zenvo apps (lowest role priority)
  ZENVO_BLOG_ADMIN = 'ZENVO_BLOG_ADMIN', // admin user role only for Zenvo.Blog
  ZENVO_BLOG_MANAGER = 'ZENVO_BLOG_MANAGER', // manager user role only for Zenvo.Blog
  ZENVO_HOLIDAY_ADMIN = 'ZENVO_HOLIDAY_ADMIN', // admin user role only for Zenvo.Holiday
  ZENVO_HOLIDAY_MANAGER = 'ZENVO_HOLIDAY_MANAGER', // manager user role only for Zenvo.Holiday
}

registerEnumType(UserRoles, {
  name: "UserRoles",
});

registerEnumType(UserApplications, {
  name: "UserApplications",
});

@InputType()
export class UserInput {
  @Field((type) => ID, {nullable: true})
  public id: number;

  @Field()
  public name: string;

  @Field()
  public email: string;

  @Field({nullable: true})
  public phone: string;

  @Field({nullable: true})
  public avatarUrl: string;
}

@Entity("users")
@ObjectType()
export class User {
  @Field((type) => ID)
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  @Field()
  public name: string;

  @Column()
  @Field()
  public email: string;

  @Column({nullable: true})
  @Field({nullable: true})
  public phone: string;

  @Column({ type: "simple-array", default: UserRoles.ZENVO_USER })
  @Field((type) => [UserRoles])
  public roles: string[];

  @Column({ type: "simple-array", default: UserApplications.AUTH })
  @Field((type) => [UserApplications])
  public applications: string[];

  @Column()
  public password: string;

  @Column({default: true})
  public active: boolean = true;

  @Column({nullable: true})
  public token: string;

  @Column({default: ""})
  @Field({defaultValue: ""})
  public avatarUrl: string;
}
