import {Field, ID, InputType, ObjectType} from "type-graphql";
import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {UserRole} from './role';

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

  @Column(type => UserRole)
  @Field((type) => [UserRole])
  public roles: UserRole[];

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
